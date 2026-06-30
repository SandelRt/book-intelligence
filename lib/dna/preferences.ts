import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PreferenceEvent } from '@/types'

export async function recordPreference(
  event: Omit<PreferenceEvent, 'id' | 'created_at'>
) {
  const supabase = createClient()
  await supabase.from('preference_events').insert(event)
}

export async function recordAnnotation(opts: {
  userId: string
  chapterId: string
  label: 'liked' | 'did_not_work' | 'neutral'
  selectionText?: string
  note?: string
}) {
  const supabase = createClient()
  await supabase.from('explicit_annotations').insert({
    user_id: opts.userId,
    chapter_id: opts.chapterId,
    label: opts.label,
    selection_text: opts.selectionText,
    note: opts.note,
  })
}

// Fetch writer's preference summary for DNA context.
// Accepts the caller's supabase client so this works in both server and client contexts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getWriterDNASummary(userId: string, supabase: SupabaseClient<any>) {

  const [prefResult, annotResult, signalResult, profileResult] = await Promise.all([
    supabase
      .from('preference_events')
      .select('action')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('explicit_annotations')
      .select('label, note, selection_text')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('style_signals')
      .select('avg_sentence_len, vocab_richness, rhythm_score, tone_markers')
      .eq('user_id', userId)
      .order('computed_at', { ascending: false })
      .limit(10),
    supabase
      .from('writer_profiles')
      .select('writer_dna')
      .eq('user_id', userId)
      .single()
  ])

  const events = prefResult.data ?? []
  const accepts = events.filter((e) => e.action === 'accept').length
  const rejects = events.filter((e) => e.action === 'reject').length

  // Average style across recent sessions
  const signals = signalResult.data ?? []
  const avgStyle = signals.length > 0 ? {
    avg_sentence_len: signals.reduce((a, s) => a + (s.avg_sentence_len ?? 0), 0) / signals.length,
    vocab_richness: signals.reduce((a, s) => a + (s.vocab_richness ?? 0), 0) / signals.length,
    rhythm_score: signals.reduce((a, s) => a + (s.rhythm_score ?? 0), 0) / signals.length,
    tone_markers: signals[0]?.tone_markers ?? {},
  } : null

  return {
    totalAccepts: accepts,
    totalRejects: rejects,
    acceptRate: events.length > 0 ? accepts / events.length : 0,
    recentAnnotations: annotResult.data ?? [],
    style: avgStyle,
    explicitDNA: profileResult?.data?.writer_dna || {}
  }
}
