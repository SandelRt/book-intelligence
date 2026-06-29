'use client'

import { useEffect, useState } from 'react'
import type { Chapter, Manuscript } from '@/types'

interface RefResult {
  id: string
  title: string
  author_director: string
  genre_tags: string[]
  relevance: string
}

interface Props {
  chapter: Chapter
  manuscript: Manuscript
}

export default function ReferenceSpark({ chapter, manuscript }: Props) {
  const [refs, setRefs] = useState<RefResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if ((chapter.word_count ?? 0) < 200) {
      setLoading(false)
      return
    }

    fetch('/api/references/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterContent: chapter.content,
        chapterTitle: chapter.title,
        manuscriptTitle: manuscript.title,
        genre: manuscript.genre,
      }),
    })
      .then((r) => r.ok ? r.json() : { references: [] })
      .then((data) => setRefs(data.references ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div
        className="px-5 py-4 space-y-2"
        style={{ borderTop: '1px solid var(--direction-border)' }}
      >
        <div className="h-2 rounded animate-pulse" style={{ background: 'var(--surface-3)', width: '40%' }} />
        <div className="h-2 rounded animate-pulse" style={{ background: 'var(--surface-3)', width: '65%', animationDelay: '120ms' }} />
        <div className="h-2 rounded animate-pulse" style={{ background: 'var(--surface-3)', width: '50%', animationDelay: '240ms' }} />
      </div>
    )
  }

  if (refs.length === 0) return null

  return (
    <div
      className="px-5 py-4"
      style={{ borderTop: '1px solid var(--direction-border)' }}
    >
      <p
        className="text-xs mb-3"
        style={{
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-ui)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          fontSize: 10,
        }}
      >
        Reference spark
      </p>
      <div className="space-y-2.5">
        {refs.map((ref) => (
          <div
            key={ref.id}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 12px',
            }}
          >
            <p
              className="text-xs font-medium leading-snug"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-prose)', fontStyle: 'italic' }}
            >
              {ref.title}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-ui)' }}
            >
              {ref.author_director}
            </p>
            <p
              className="text-xs mt-2 leading-relaxed"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-prose)' }}
            >
              {ref.relevance}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
