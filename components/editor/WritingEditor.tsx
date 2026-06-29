'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import type { Chapter, Manuscript, StoryBeat, StyleSignals } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { computeStyleSignals, computeVoiceDrift } from '@/lib/dna/styleSignals'
import { recordAnnotation } from '@/lib/dna/preferences'
import { AlignJustify } from 'lucide-react'

interface Props {
  chapter: Chapter
  userId: string
  allChapters: Chapter[]
  manuscript: Manuscript
  onUpdate: (chapterId: string, updates: Partial<Chapter>) => void
  onStuck: () => void
  onOrient: () => void
  isFocused: boolean
  onBeatDetected?: (chapterId: string, beat: StoryBeat) => void
}

const AUTOSAVE_DELAY   = 1800   // ms after stop typing before save
const WORDCOUNT_DELAY  = 1200   // ms before word count fades in
const IDLE_SOFT        = 22000  // ms → show "···" nudge
const IDLE_HARD        = 45000  // ms → auto-open direction engine

export default function WritingEditor({
  chapter, userId, allChapters, manuscript, onUpdate, onStuck, onOrient, isFocused, onBeatDetected,
}: Props) {
  const supabase = createClient()

  // Timers
  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wcTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleSoft     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleHard     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deleteCount  = useRef(0)
  const deleteTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionId    = useRef(crypto.randomUUID())
  const baselineRef  = useRef<StyleSignals | null>(null)
  const lastBeatAt      = useRef<number>(0)
  const lastBeatWc      = useRef<number>(0)
  const lastGenericAt   = useRef<number>(0)
  const lastGenericWc   = useRef<number>(0)

  // UI state
  const [wordCount, setWordCount]       = useState(chapter.word_count ?? 0)
  const [wcVisible, setWcVisible]       = useState(false)
  const [idleDotVisible, setIdleDotVisible] = useState(false)
  const [saving, setSaving]             = useState(false)
  const [sessionWords, setSessionWords] = useState(0)
  const [annotationFlash, setAnnotationFlash] = useState<'liked' | 'did_not_work' | null>(null)
  const sessionStartWc = useRef(chapter.word_count ?? 0)

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = useCallback(async (content: string, wc: number) => {
    setSaving(true)
    const pacingScore = Math.min(1, wc / 2500)

    let voiceDriftScore: number | undefined

    if (wc > 80 && content !== chapter.content) {
      const signals = computeStyleSignals(content)
      await supabase.from('style_signals').insert({
        user_id: userId,
        session_id: sessionId.current,
        ...signals,
      })
      if (baselineRef.current) {
        voiceDriftScore = computeVoiceDrift(signals, baselineRef.current)
      }
    }

    const chapterUpdates = {
      content,
      word_count: wc,
      pacing_score: pacingScore,
      last_saved_at: new Date().toISOString(),
      ...(voiceDriftScore !== undefined && { voice_drift_score: voiceDriftScore }),
    }

    await supabase.from('chapters').update(chapterUpdates).eq('id', chapter.id)
    onUpdate(chapter.id, {
      content,
      word_count: wc,
      pacing_score: pacingScore,
      ...(voiceDriftScore !== undefined && { voice_drift_score: voiceDriftScore }),
    })

    setTimeout(() => setSaving(false), 800)

    // Beat detection — throttled: min 2 min apart OR word count shifted ≥50
    if (wc >= 300) {
      const now = Date.now()
      if (now - lastBeatAt.current >= 120_000 || Math.abs(wc - lastBeatWc.current) >= 50) {
        lastBeatAt.current = now
        lastBeatWc.current = wc
        const positionPct = allChapters.length > 1
          ? chapter.order_idx / (allChapters.length - 1)
          : 0
        fetch('/api/beats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId: chapter.id,
            chapterContent: content,
            chapterTitle: chapter.title,
            manuscriptTitle: manuscript.title,
            positionPct,
          }),
        })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data && onBeatDetected) {
              onBeatDetected(chapter.id, {
                id: data.id,
                chapter_id: chapter.id,
                beat_type: data.beat_type,
                position_pct: data.position_pct,
                spacing_flag: data.spacing_flag,
              })
            }
          })
          .catch(() => {})
      }
    }

    // Generic detection — throttled: 5 min apart OR 100-word shift
    if (wc >= 300) {
      const now = Date.now()
      if (now - lastGenericAt.current >= 300_000 || Math.abs(wc - lastGenericWc.current) >= 100) {
        lastGenericAt.current = now
        lastGenericWc.current = wc
        fetch('/api/generic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId: chapter.id,
            chapterContent: content,
            chapterTitle: chapter.title,
          }),
        })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data?.genericness_score !== undefined) {
              onUpdate(chapter.id, { genericness_score: data.genericness_score })
            }
          })
          .catch(() => {})
      }
    }
  }, [chapter.id, chapter.content, chapter.order_idx, chapter.title, userId, supabase, onUpdate, allChapters, manuscript.title, onBeatDetected])

  // ── Idle timers ───────────────────────────────────────────────────────────
  const resetIdleTimers = useCallback(() => {
    setIdleDotVisible(false)
    if (idleSoft.current) clearTimeout(idleSoft.current)
    if (idleHard.current) clearTimeout(idleHard.current)

    idleSoft.current = setTimeout(() => setIdleDotVisible(true), IDLE_SOFT)
    idleHard.current = setTimeout(async () => {
      await supabase.from('frustration_events').insert({
        user_id: userId,
        type: 'idle',
        chapter_id: chapter.id,
      })
      onStuck()
    }, IDLE_HARD)
  }, [userId, chapter.id, supabase, onStuck])

  // ── Delete-loop detection ─────────────────────────────────────────────────
  const handleDeleteLoop = useCallback(async () => {
    deleteCount.current++
    if (deleteTimer.current) clearTimeout(deleteTimer.current)
    deleteTimer.current = setTimeout(() => { deleteCount.current = 0 }, 9000)

    if (deleteCount.current >= 18) {
      deleteCount.current = 0
      await supabase.from('frustration_events').insert({
        user_id: userId, type: 'delete_loop', chapter_id: chapter.id,
      })
      onStuck()
    }
  }, [userId, chapter.id, supabase, onStuck])

  // ── Word count ambient visibility ─────────────────────────────────────────
  const handleTyping = useCallback(() => {
    setWcVisible(false)
    if (wcTimer.current) clearTimeout(wcTimer.current)
    wcTimer.current = setTimeout(() => setWcVisible(true), WORDCOUNT_DELAY)
  }, [])

  // ── TipTap editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'What happens next?',
      }),
      CharacterCount,
      Typography,
    ],
    content: chapter.content || '',
    editorProps: {
      attributes: { class: 'tiptap' },
    },
    onTransaction: ({ transaction }) => {
      if (transaction.docChanged) {
        const isDelete = transaction.steps.some((step) => {
          const j = step.toJSON()
          return j.stepType === 'replace' && (!j.slice || j.slice.content?.length === 0)
        })
        if (isDelete) handleDeleteLoop()
      }
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const wc = editor.storage.characterCount.words() as number
      setWordCount(wc)
      setSessionWords(Math.max(0, wc - sessionStartWc.current))

      handleTyping()
      resetIdleTimers()

      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => save(content, wc), AUTOSAVE_DELAY)
    },
  })

  // ── Annotation capture ───────────────────────────────────────────────────
  const annotate = useCallback(async (label: 'liked' | 'did_not_work') => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectionText = editor.state.doc.textBetween(from, to, ' ').slice(0, 500)

    setAnnotationFlash(label)
    setTimeout(() => setAnnotationFlash(null), 1600)

    await recordAnnotation({ userId, chapterId: chapter.id, label, selectionText })
  }, [editor, userId, chapter.id])

  // Start timers on mount
  useEffect(() => {
    resetIdleTimers()
    return () => {
      if (saveTimer.current)   clearTimeout(saveTimer.current)
      if (wcTimer.current)     clearTimeout(wcTimer.current)
      if (idleSoft.current)    clearTimeout(idleSoft.current)
      if (idleHard.current)    clearTimeout(idleHard.current)
      if (deleteTimer.current) clearTimeout(deleteTimer.current)
    }
  }, [resetIdleTimers])

  // Focus editor when entering focus mode
  useEffect(() => {
    if (isFocused && editor) {
      setTimeout(() => editor.commands.focus('end'), 50)
    }
  }, [isFocused, editor])

  // Load voice drift baseline from recent style signals
  useEffect(() => {
    const loadBaseline = async () => {
      const { data } = await supabase
        .from('style_signals')
        .select('avg_sentence_len, vocab_richness, rhythm_score, tone_markers')
        .eq('user_id', userId)
        .order('computed_at', { ascending: false })
        .limit(15)
      if (!data || data.length < 3) return
      const n = data.length
      baselineRef.current = {
        avg_sentence_len: data.reduce((a, s) => a + (s.avg_sentence_len ?? 0), 0) / n,
        vocab_richness:   data.reduce((a, s) => a + (s.vocab_richness ?? 0), 0) / n,
        rhythm_score:     data.reduce((a, s) => a + (s.rhythm_score ?? 0), 0) / n,
        tone_markers:     (data[0]?.tone_markers as Record<string, number>) ?? {},
      }
    }
    loadBaseline()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 flex flex-col h-full relative z-10">

      {/* ── Minimal top bar: orient toggle + chapter title ── */}
      <div
        className="flex items-center gap-3 px-8 pt-8 pb-0 shrink-0 transition-opacity duration-300"
        style={{ opacity: isFocused ? 0.4 : 1 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = isFocused ? '0.4' : '1')}
      >
        {/* Orient toggle */}
        <button
          onClick={onOrient}
          className="transition-opacity hover:opacity-80 shrink-0"
          style={{ color: 'var(--text-muted)' }}
          title="Chapters (Esc)"
        >
          <AlignJustify size={16} />
        </button>

        {/* Inline chapter title */}
        <input
          type="text"
          defaultValue={chapter.title}
          placeholder="Chapter title"
          onBlur={async (e) => {
            await supabase.from('chapters').update({ title: e.target.value }).eq('id', chapter.id)
            onUpdate(chapter.id, { title: e.target.value })
          }}
          className="bg-transparent border-none outline-none text-sm font-medium flex-1"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-prose)', fontStyle: 'italic' }}
        />

        {/* Manuscript breadcrumb */}
        <span className="text-xs shrink-0" style={{ color: 'var(--text-faint)' }}>
          {manuscript.title}
        </span>
      </div>

      {/* ── Writing surface ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="prose-editor mx-auto px-8 py-12 pb-32">

          {editor && (
            <BubbleMenu
              editor={editor}
              shouldShow={({ from, to }) => from !== to}
            >
              {annotationFlash ? (
                <div style={{
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border-warm)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  color: annotationFlash === 'liked' ? 'var(--success)' : 'var(--warning)',
                  fontFamily: 'var(--font-ui)',
                  whiteSpace: 'nowrap',
                }}>
                  {annotationFlash === 'liked' ? 'Noted ♥' : 'Got it'}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border-warm)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  fontSize: 12,
                  fontFamily: 'var(--font-ui)',
                }}>
                  <button
                    onClick={() => annotate('liked')}
                    style={{
                      padding: '6px 12px',
                      color: 'var(--success)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRight: '1px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(134,185,122,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    ♥ Liked this
                  </button>
                  <button
                    onClick={() => annotate('did_not_work')}
                    style={{
                      padding: '6px 12px',
                      color: 'var(--warning)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,165,90,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    ✗ Didn't work
                  </button>
                </div>
              )}
            </BubbleMenu>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ── Bottom ambient layer: word count + session + autosave ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-8 pb-6 pointer-events-none"
        style={{ zIndex: 20 }}
      >
        {/* Idle "···" affordance — bottom left, barely visible */}
        <button
          onClick={onStuck}
          className={`idle-dot pointer-events-auto text-xs tracking-widest transition-colors${idleDotVisible ? ' visible' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
          title="Find direction"
        >
          · · ·
        </button>

        {/* Word count — fades in when paused */}
        <div className="flex items-center gap-4">
          {sessionWords > 0 && (
            <span
              className={`wordcount-ambient text-xs${wcVisible ? ' visible' : ''}`}
              style={{ color: 'var(--success)', opacity: wcVisible ? 0.6 : 0 }}
            >
              +{sessionWords.toLocaleString()} today
            </span>
          )}
          <span
            className={`wordcount-ambient text-xs${wcVisible ? ' visible' : ''}`}
            style={{ color: 'var(--text-muted)' }}
          >
            {wordCount.toLocaleString()} words
          </span>

          {/* Autosave dot */}
          <span
            className={`inline-block rounded-full${saving ? ' saving' : ''}`}
            style={{
              width: 5, height: 5,
              background: saving ? 'var(--accent)' : 'var(--text-faint)',
              transition: 'background 400ms ease',
            }}
            title="Autosaved"
          />
        </div>
      </div>
    </div>
  )
}
