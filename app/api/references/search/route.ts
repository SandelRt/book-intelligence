import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

interface ReferenceRow {
  id: string
  title: string
  author_director: string
  genre_tags: string[]
  structure_meta: Record<string, unknown>
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { chapterContent, chapterTitle, manuscriptTitle, genre } = await req.json()

  const { data: refs } = await supabase
    .from('media_references')
    .select('id, title, author_director, genre_tags, structure_meta')
    .eq('type', 'book')
    .limit(25)

  if (!refs || refs.length === 0) return Response.json({ references: [] })

  const books = refs as ReferenceRow[]

  const cleanText = String(chapterContent ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 800)

  // Use numeric index refs — avoids Claude hallucinating UUIDs
  const catalogue = books.map((r, i) => {
    const m = r.structure_meta
    return `[${i}] "${r.title}" by ${r.author_director} (${(r.genre_tags ?? []).join(', ')})
  Tone: ${m.tone ?? ''}
  Themes: ${Array.isArray(m.themes) ? (m.themes as string[]).join(', ') : ''}
  Structure: ${m.act_structure ?? ''}
  Notable for: ${m.notable_for ?? ''}`
  }).join('\n\n')

  let matches: Array<{ idx: number; relevance: string }> = []

  try {
    const msg = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Book: "${manuscriptTitle}"${genre ? ` (${genre})` : ''}
Chapter: "${chapterTitle}"

Excerpt:
${cleanText}

Reference library:
${catalogue}

Find the 1–2 most relevant references.`,
      config: {
        systemInstruction: `You are a literary analyst. Identify the 1–2 reference books most structurally or tonally relevant to the chapter excerpt. Focus on how the reference handles a similar moment, beat, or challenge — not just genre match.
Return ONLY valid JSON: {"matches": [{"idx": 0, "relevance": "<one sentence: how this book handled a similar challenge>"}]}`,
        responseMimeType: "application/json"
      }
    })
    const raw = msg.text?.trim() || ''
    const parsed = JSON.parse(raw)
    matches = (parsed.matches ?? []).filter(
      (m: unknown): m is { idx: number; relevance: string } =>
        typeof (m as { idx: unknown }).idx === 'number' &&
        typeof (m as { relevance: unknown }).relevance === 'string'
    )
  } catch { /* return empty */ }

  const enriched = matches
    .slice(0, 2)
    .map((m) => {
      const ref = books[m.idx]
      if (!ref) return null
      return {
        id: ref.id,
        title: ref.title,
        author_director: ref.author_director,
        genre_tags: ref.genre_tags,
        relevance: m.relevance,
      }
    })
    .filter(Boolean)

  return Response.json({ references: enriched })
}
