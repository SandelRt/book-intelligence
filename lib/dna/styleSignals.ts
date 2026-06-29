import type { StyleSignals } from '@/types'

// Strip HTML tags and normalize whitespace
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function sentences(text: string): string[] {
  return text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0)
}

function words(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter((w) => w.length > 0)
}

export function computeStyleSignals(html: string): StyleSignals {
  const text = stripHtml(html)
  const sents = sentences(text)
  const wordList = words(text)

  // Average sentence length in words
  const sentLengths = sents.map((s) => s.split(/\s+/).filter(Boolean).length)
  const avg_sentence_len = sentLengths.length > 0
    ? sentLengths.reduce((a, b) => a + b, 0) / sentLengths.length
    : 0

  // Vocabulary richness (type-token ratio, capped at 1)
  const uniqueWords = new Set(wordList)
  const vocab_richness = wordList.length > 0
    ? Math.min(1, uniqueWords.size / wordList.length)
    : 0

  // Rhythm score — variance in sentence length (lower variance = more rhythmic monotony, higher = varied)
  const mean = avg_sentence_len
  const variance = sentLengths.length > 1
    ? sentLengths.reduce((acc, l) => acc + Math.pow(l - mean, 2), 0) / sentLengths.length
    : 0
  const rhythm_score = Math.min(1, variance / 100) // normalize to 0-1

  // Tone markers: count signal words
  const toneMap: Record<string, string[]> = {
    dark: ['death', 'blood', 'shadow', 'dark', 'fear', 'pain', 'dread', 'cold'],
    lyrical: ['breath', 'light', 'golden', 'soft', 'whisper', 'dream', 'silence'],
    tense: ['suddenly', 'ran', 'grabbed', 'slammed', 'burst', 'screamed', 'exploded'],
    introspective: ['thought', 'wondered', 'remembered', 'felt', 'realized', 'understood'],
  }

  const tone_markers: Record<string, number> = {}
  for (const [tone, signals] of Object.entries(toneMap)) {
    const count = wordList.filter((w) => signals.includes(w)).length
    tone_markers[tone] = wordList.length > 0 ? count / wordList.length : 0
  }

  return { avg_sentence_len, vocab_richness, rhythm_score, tone_markers }
}

// Compare a chapter's style to the writer's baseline profile
export function computeVoiceDrift(
  chapterSignals: StyleSignals,
  baselineSignals: StyleSignals
): number {
  const sentDiff = Math.abs(chapterSignals.avg_sentence_len - baselineSignals.avg_sentence_len)
  const vocabDiff = Math.abs(chapterSignals.vocab_richness - baselineSignals.vocab_richness)
  const rhythmDiff = Math.abs(chapterSignals.rhythm_score - baselineSignals.rhythm_score)

  // Weighted distance — sentence length variance matters most
  const drift = (sentDiff / 20) * 0.5 + vocabDiff * 0.25 + rhythmDiff * 0.25
  return Math.min(1, drift)
}
