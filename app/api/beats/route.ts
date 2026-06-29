import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

// Acceptable manuscript position range per beat type [min, max]
const BEAT_RANGES: Record<string, [number, number]> = {
  hook:           [0.00, 0.15],
  rising_action:  [0.05, 0.70],
  midpoint:       [0.35, 0.65],
  all_is_lost:    [0.60, 0.85],
  climax:         [0.75, 0.97],
  falling_action: [0.82, 1.00],
  resolution:     [0.85, 1.00],
  character_beat: [0.00, 1.00],
  world_building: [0.00, 0.40],
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { chapterId, chapterContent, chapterTitle, manuscriptTitle, positionPct } = await req.json()

  const cleanText = String(chapterContent ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)

  const posLabel = positionPct <= 0.15 ? 'early (opening)'
    : positionPct <= 0.40 ? 'first half'
    : positionPct <= 0.60 ? 'near midpoint'
    : positionPct <= 0.80 ? 'second half'
    : 'late (final act)'

  let beatType = 'rising_action'

  try {
    const msg = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Book: "${manuscriptTitle}"
Chapter: "${chapterTitle}" — at ${Math.round(positionPct * 100)}% through the manuscript (${posLabel})

Excerpt:
${cleanText}`,
      config: {
        systemInstruction: `You are a story structure analyst. Identify the primary narrative beat in the chapter excerpt.
Return ONLY valid JSON: {"beat_type": "<type>"}
Beat types: hook, rising_action, midpoint, all_is_lost, climax, falling_action, resolution, character_beat, world_building`,
        responseMimeType: "application/json"
      }
    })

    const raw = msg.text?.trim() || ''
    const parsed = JSON.parse(raw)
    if (typeof parsed.beat_type === 'string' && parsed.beat_type in BEAT_RANGES) {
      beatType = parsed.beat_type
    }
  } catch { /* keep default */ }

  const [lo, hi] = BEAT_RANGES[beatType]
  const spacingFlag = positionPct < lo || positionPct > hi

  // One beat per chapter — replace on re-analysis
  await supabase.from('story_beats').delete().eq('chapter_id', chapterId)
  const { data: beat } = await supabase
    .from('story_beats')
    .insert({ chapter_id: chapterId, beat_type: beatType, position_pct: positionPct, spacing_flag: spacingFlag })
    .select('id')
    .single()

  return Response.json({
    id: beat?.id ?? '',
    beat_type: beatType,
    spacing_flag: spacingFlag,
    position_pct: positionPct,
  })
}
