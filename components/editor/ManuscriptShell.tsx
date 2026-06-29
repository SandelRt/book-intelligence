'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Manuscript, Chapter, StoryBeat } from '@/types'
import ChapterSidebar from './ChapterSidebar'
import WritingEditor from './WritingEditor'
import DirectionPanel from '@/components/direction/DirectionPanel'
import { createClient } from '@/lib/supabase/client'

type Mode = 'focus' | 'orient' | 'direction'

interface Props {
  manuscript: Manuscript
  initialChapters: Chapter[]
  userId: string
}

export default function ManuscriptShell({ manuscript, initialChapters, userId }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    initialChapters[0]?.id ?? null
  )
  const [mode, setMode] = useState<Mode>('focus')
  const [beatsMap, setBeatsMap] = useState<Record<string, StoryBeat>>({})
  const supabase = createClient()

  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? null

  // Load existing beats for all chapters
  useEffect(() => {
    const chapterIds = initialChapters.map((c) => c.id)
    if (chapterIds.length === 0) return
    supabase
      .from('story_beats')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, StoryBeat> = {}
        for (const beat of data) {
          if (!map[beat.chapter_id]) map[beat.chapter_id] = beat as StoryBeat
        }
        setBeatsMap(map)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBeatDetected = useCallback((chapterId: string, beat: StoryBeat) => {
    setBeatsMap((prev) => ({ ...prev, [chapterId]: beat }))
  }, [])

  // Keyboard: Esc toggles orient ↔ focus, or closes direction
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode((prev) => {
          if (prev === 'direction') return 'focus'
          if (prev === 'orient') return 'focus'
          return 'orient'
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const updateChapterLocal = useCallback((chapterId: string, updates: Partial<Chapter>) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, ...updates } : c))
    )
  }, [])

  const addChapter = useCallback(async () => {
    const nextIdx = chapters.length
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        manuscript_id: manuscript.id,
        order_idx: nextIdx,
        title: `Chapter ${nextIdx + 1}`,
        content: '',
      })
      .select()
      .single()

    if (!error && data) {
      setChapters((prev) => [...prev, data as Chapter])
      setActiveChapterId(data.id)
      setMode('focus')
    }
  }, [chapters.length, manuscript.id, supabase])

  const selectChapter = useCallback((id: string) => {
    setActiveChapterId(id)
    setMode('focus')
  }, [])

  return (
    <div className="h-full flex relative overflow-hidden" style={{ background: 'var(--prose-bg)' }}>

      {/* ── ORIENT: Chapter sidebar (slides in from left) ── */}
      <div className={`panel-left absolute left-0 top-0 h-full z-30 ${mode === 'orient' ? 'open' : ''}`}
           style={{ width: '220px' }}>
        <ChapterSidebar
          manuscript={manuscript}
          chapters={chapters}
          activeChapterId={activeChapterId}
          beatsMap={beatsMap}
          onSelectChapter={selectChapter}
          onAddChapter={addChapter}
          onClose={() => setMode('focus')}
        />
      </div>

      {/* ── Backdrop: click to return to FOCUS from ORIENT ── */}
      {mode === 'orient' && (
        <div
          className="absolute inset-0 z-20"
          style={{ background: 'rgba(15,13,11,0.5)' }}
          onClick={() => setMode('focus')}
        />
      )}

      {/* ── FOCUS: Writing canvas ── */}
      <div className="flex-1 flex flex-col relative">
        <div className="writing-vignette" />
        {activeChapter ? (
          <WritingEditor
            key={activeChapter.id}
            chapter={activeChapter}
            userId={userId}
            allChapters={chapters}
            manuscript={manuscript}
            onUpdate={updateChapterLocal}
            onStuck={() => setMode('direction')}
            onOrient={() => setMode(mode === 'orient' ? 'focus' : 'orient')}
            isFocused={mode === 'focus'}
            onBeatDetected={handleBeatDetected}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-prose)', fontStyle: 'italic' }}>
            Select a chapter to begin.
          </div>
        )}
      </div>

      {/* ── DIRECTION: Panel (slides in from right) ── */}
      <div className={`panel-right absolute right-0 top-0 h-full z-30 ${mode === 'direction' ? 'open' : ''}`}
           style={{ width: '320px' }}>
        {mode === 'direction' && activeChapter && (
          <DirectionPanel
            chapter={activeChapter}
            manuscript={manuscript}
            userId={userId}
            onClose={() => setMode('focus')}
          />
        )}
      </div>

      {/* Canvas dim when direction panel open */}
      {mode === 'direction' && (
        <div
          className="absolute inset-0 z-20"
          style={{ background: 'rgba(15,13,11,0.35)', pointerEvents: 'none' }}
        />
      )}
    </div>
  )
}
