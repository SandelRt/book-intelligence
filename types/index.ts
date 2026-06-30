export interface WriterProfile {
  id: string
  user_id: string
  display_name: string | null
  genre_prefs: string[]
  created_at: string
}

export interface Manuscript {
  id: string
  user_id: string
  title: string
  genre: string | null
  status: 'drafting' | 'revising' | 'complete'
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  manuscript_id: string
  order_idx: number
  title: string
  content: string
  word_count: number
  pacing_score: number | null
  voice_drift_score: number | null
  genericness_score: number | null
  last_saved_at: string
  created_at: string
}

export interface PreferenceEvent {
  id: string
  user_id: string
  suggestion_id: string | null
  action: 'accept' | 'reject' | 'modify'
  original_text: string | null
  delta_text: string | null
  context_chapter_id: string | null
  created_at: string
}

export interface StyleSignals {
  avg_sentence_len: number
  vocab_richness: number
  rhythm_score: number
  tone_markers: Record<string, number>
}

export interface AiSuggestion {
  id: string
  user_id: string
  chapter_id: string | null
  type: 'continuation' | 'rewrite' | 'direction' | 'beat_feedback'
  prompt_context: string | null
  suggestion_text: string
  model: string | null
  created_at: string
}

export interface ExplicitAnnotation {
  id: string
  user_id: string
  chapter_id: string | null
  label: 'liked' | 'did_not_work' | 'neutral'
  note: string | null
  selection_text: string | null
  created_at: string
}

export interface StoryBeat {
  id: string
  chapter_id: string
  beat_type: string
  position_pct: number
  spacing_flag: boolean
  created_at?: string
}

export interface PlotThread {
  id: string
  manuscript_id: string
  label: string
  introduced_chapter_id: string | null
  resolved_chapter_id: string | null
  status: 'open' | 'resolved' | 'dropped'
}

export interface WriterDNAProfile {
  style: StyleSignals | null
  recentAnnotations: ExplicitAnnotation[]
  frustrationCount: number
  totalAccepts: number
  totalRejects: number
}

// LoopCore Phase 1 Types
export interface Room {
  id: string
  name: string
  description: string | null
  room_type: string
  host_user_id: string
  visibility: 'public' | 'private'
  invite_code?: string | null
  ai_host_enabled: boolean
  created_at: string
}

export interface Session {
  id: string
  room_id: string
  host_user_id: string
  title: string
  session_type: string
  start_time: string | null
  end_time: string | null
  duration_minutes: number | null
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  ai_summary: string | null
  created_at: string
}

export interface Goal {
  id: string
  session_id: string
  user_id: string
  goal_type: string
  target_amount: number
  target_unit: string
  actual_amount: number | null
  completed: boolean
  created_at: string
}
