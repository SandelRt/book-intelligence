import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

function describeVoice(signals: {
  avg_sentence_len: number
  vocab_richness: number
  rhythm_score: number
  tone_markers: Record<string, number>
} | null): string {
  if (!signals) return 'a distinctive personal voice (style not yet established)'

  const parts: string[] = []

  parts.push(
    signals.avg_sentence_len < 12 ? 'short punchy sentences'
    : signals.avg_sentence_len > 22 ? 'long flowing sentences'
    : 'medium-length sentences'
  )

  if (signals.vocab_richness > 0.68) parts.push('rich varied vocabulary')
  else if (signals.vocab_richness < 0.45) parts.push('simple direct vocabulary')

  if (signals.rhythm_score > 0.55) parts.push('varied sentence rhythm')
  else if (signals.rhythm_score < 0.2) parts.push('controlled even rhythm')

  const topTones = Object.entries(signals.tone_markers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .filter(([, v]) => v > 0.001)
    .map(([k]) => k)

  if (topTones.length > 0) parts.push(`${topTones.join(' and ')} tone`)

  return parts.join(', ') || 'a distinctive voice'
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { chapterId, chapterContent, chapterTitle } = await req.json()

  // Load writer's voice baseline
  const { data: signalRows } = await supabase
    .from('style_signals')
    .select('avg_sentence_len, vocab_richness, rhythm_score, tone_markers')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: false })
    .limit(10)

  const hasBaseline = signalRows && signalRows.length >= 3
  const baseline = hasBaseline ? {
    avg_sentence_len: signalRows.reduce((a, s) => a + (s.avg_sentence_len ?? 0), 0) / signalRows.length,
    vocab_richness:   signalRows.reduce((a, s) => a + (s.vocab_richness ?? 0), 0) / signalRows.length,
    rhythm_score:     signalRows.reduce((a, s) => a + (s.rhythm_score ?? 0), 0) / signalRows.length,
    tone_markers:     (signalRows[0]?.tone_markers ?? {}) as Record<string, number>,
  } : null

  const voiceDesc = describeVoice(baseline)

  const cleanText = String(chapterContent ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1500)

  // Default: neutral (0.5) when no baseline; slightly below threshold so we don't false-positive
  let genericnessScore = hasBaseline ? 0.4 : 0.35

  const geminiKey = process.env.GEMINI_API_KEY

  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey })
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Writer's established voice: ${voiceDesc}\n\nChapter: "${chapterTitle}"\nExcerpt:\n${cleanText}\n\nRate genericness 0.0–1.0.`,
        config: {
          systemInstruction: `You are a writing coach measuring voice distinctiveness.
Compare a chapter excerpt to the writer's established voice and rate how flat or generic it sounds.
0.0 = unmistakably this writer's distinctive voice. 1.0 = could have been written by anyone — flat, voiceless.
Return ONLY valid JSON: {"score": 0.0}`,
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })

      const raw = res.text || ''
      const parsed = JSON.parse(raw)
      const s = Number(parsed.score)
      if (!isNaN(s) && s >= 0 && s <= 1) {
        // Cap score at 0.65 when we have no baseline — avoid false positives on new writers
        genericnessScore = hasBaseline ? s : Math.min(s, 0.65)
      }
    } catch (e) { 
      console.error('Gemini genericness error:', e) 
    }
  }

  await supabase
    .from('chapters')
    .update({ genericness_score: genericnessScore })
    .eq('id', chapterId)

  return Response.json({ genericness_score: genericnessScore })
}
