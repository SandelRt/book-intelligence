'use client'

import type { Manuscript, Chapter, StoryBeat } from '@/types'
import { Plus, FileText, X, BookOpen } from 'lucide-react'
import Link from 'next/link'

const BEAT_LABEL: Record<string, string> = {
  hook:           'Hook',
  rising_action:  'Rising',
  midpoint:       'Midpoint',
  all_is_lost:    'Dark night',
  climax:         'Climax',
  falling_action: 'Falling',
  resolution:     'Resolution',
  character_beat: 'Character',
  world_building: 'Setup',
}

interface Props {
  manuscript: Manuscript
  chapters: Chapter[]
  activeChapterId: string | null
  beatsMap?: Record<string, StoryBeat>
  onSelectChapter: (id: string) => void
  onAddChapter: () => void
  onClose: () => void
}

export default function ChapterSidebar({
  manuscript,
  chapters,
  activeChapterId,
  beatsMap = {},
  onSelectChapter,
  onAddChapter,
  onClose,
}: Props) {
  const totalWords = chapters.reduce((sum, c) => sum + (c.word_count ?? 0), 0)

  return (
    <aside
      className="w-full h-full flex flex-col"
      style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <BookOpen size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div className="min-w-0">
            <p
              className="text-sm font-medium truncate leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-prose)', fontStyle: 'italic' }}
            >
              {manuscript.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {totalWords.toLocaleString()} words total
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
          title="Back to writing (Esc)"
        >
          <X size={15} />
        </button>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        <p
          className="text-xs font-medium uppercase tracking-wider px-2 mb-2"
          style={{ color: 'var(--text-faint)' }}
        >
          Chapters
        </p>
        <ul className="space-y-0.5">
          {chapters.map((ch, i) => {
            const isActive = ch.id === activeChapterId
            const beat = beatsMap[ch.id]
            return (
              <li key={ch.id}>
                <button
                  onClick={() => onSelectChapter(ch.id)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all"
                  style={{
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                  }}
                >
                  <FileText
                    size={13}
                    className="shrink-0 mt-0.5"
                    style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs leading-snug truncate"
                      style={{
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-prose)',
                      }}
                    >
                      {ch.title || `Chapter ${i + 1}`}
                    </p>
                    {(ch.word_count ?? 0) > 0 && (
                      <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
                        {(ch.word_count ?? 0).toLocaleString()}w
                        {(ch.voice_drift_score ?? 0) >= 0.25 && (
                          <span
                            title={`Voice drift: ${((ch.voice_drift_score ?? 0) * 100).toFixed(0)}%`}
                            style={{
                              display: 'inline-block',
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: (ch.voice_drift_score ?? 0) >= 0.5
                                ? 'var(--warning)'
                                : 'var(--accent)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </p>
                    )}
                    {(beat || (ch.genericness_score ?? 0) >= 0.65) && (
                      <p className="mt-1 flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                        {beat && (
                          <span
                            title={beat.spacing_flag ? 'Beat may be misplaced in the arc' : undefined}
                            style={{
                              display: 'inline-block',
                              fontSize: 10,
                              lineHeight: 1,
                              padding: '2px 5px',
                              borderRadius: 4,
                              background: beat.spacing_flag ? 'rgba(201,165,90,0.15)' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${beat.spacing_flag ? 'var(--warning)' : 'var(--border)'}`,
                              color: beat.spacing_flag ? 'var(--warning)' : 'var(--text-faint)',
                              fontFamily: 'var(--font-ui)',
                            }}
                          >
                            {BEAT_LABEL[beat.beat_type] ?? beat.beat_type}
                            {beat.spacing_flag && ' ⚠'}
                          </span>
                        )}
                        {(ch.genericness_score ?? 0) >= 0.65 && (
                          <span
                            title={`Voice flatness: ${((ch.genericness_score ?? 0) * 100).toFixed(0)}% — this chapter may feel generic compared to your voice`}
                            style={{
                              display: 'inline-block',
                              fontSize: 10,
                              lineHeight: 1,
                              padding: '2px 5px',
                              borderRadius: 4,
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-faint)',
                              fontFamily: 'var(--font-ui)',
                              fontStyle: 'italic',
                            }}
                          >
                            flat
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onAddChapter}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <Plus size={13} />
          New chapter
        </button>
        <Link
          href="/dashboard"
          className="block text-center text-xs transition-opacity hover:opacity-70 py-1"
          style={{ color: 'var(--text-faint)' }}
        >
          ← All books
        </Link>
      </div>
    </aside>
  )
}
