'use client'

import { useState, useEffect, useRef } from 'react'
import type { Chapter, Manuscript } from '@/types'
import { X, RefreshCw } from 'lucide-react'
import { recordPreference } from '@/lib/dna/preferences'
import ReferenceSpark from './ReferenceSpark'

interface Props {
  chapter: Chapter
  manuscript: Manuscript
  userId: string
  onClose: () => void
}

export default function DirectionPanel({ chapter, manuscript, userId, onClose }: Props) {
  const [streaming, setStreaming]   = useState(false)
  const [response, setResponse]     = useState('')
  const [feedbackGiven, setFeedback] = useState<'helped' | 'not-quite' | null>(null)
  const suggestionRef = useRef('')
  const abortRef      = useRef<AbortController | null>(null)

  const fetchDirection = async (trigger = 'manual') => {
    abortRef.current?.abort()
    setResponse('')
    setFeedback(null)
    setStreaming(true)
    suggestionRef.current = ''
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterContent:  chapter.content,
          chapterTitle:    chapter.title,
          manuscriptTitle: manuscript.title,
          genre:           manuscript.genre,
          trigger,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) { setStreaming(false); return }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        suggestionRef.current += chunk
        setResponse(suggestionRef.current)
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return
      setResponse('Something went sideways. Try again.')
    } finally {
      setStreaming(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchDirection('manual')
    }, 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFeedback = async (type: 'helped' | 'not-quite') => {
    setFeedback(type)
    await recordPreference({
      user_id: userId,
      suggestion_id: crypto.randomUUID(),
      action: type === 'helped' ? 'accept' : 'reject',
      original_text: suggestionRef.current,
      delta_text: null,
      context_chapter_id: chapter.id,
    })
  }

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        background: 'var(--direction-bg)',
        borderLeft: '1px solid var(--direction-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--direction-border)' }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Finding your way
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {chapter.title || 'This chapter'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}
          title="Back to writing (Esc)"
        >
          <X size={15} />
        </button>
      </div>

      {/* Streaming content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {streaming && !response && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-3 rounded animate-pulse"
                style={{
                  background: 'var(--surface-3)',
                  width: `${70 + i * 10}%`,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        )}

        {response && (
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-prose)',
              fontSize: '15px',
              lineHeight: '1.75',
            }}
          >
            {response}
            {streaming && (
              <span
                className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
                style={{ background: 'var(--warning)', borderRadius: 1 }}
              />
            )}
          </div>
        )}
      </div>

      {/* Feedback + actions */}
      {response && !streaming && (
        <div className="px-5 py-4 space-y-3 shrink-0" style={{ borderTop: '1px solid var(--direction-border)' }}>
          {feedbackGiven ? (
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              {feedbackGiven === 'helped'
                ? 'Good to know. Keep going.'
                : 'Got it — I\'ll remember that.'}
            </p>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleFeedback('helped')}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent)',
                }}
              >
                This helped
              </button>
              <button
                onClick={() => handleFeedback('not-quite')}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Not quite
              </button>
            </div>
          )}

          <button
            onClick={() => fetchDirection('manual')}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw size={11} />
            Different direction
          </button>
        </div>
      )}

      {/* Reference spark — only mounts after direction content is ready */}
      {response && !streaming && <ReferenceSpark chapter={chapter} manuscript={manuscript} />}

      {/* AI Disclaimer */}
      <div className="px-5 pb-5 text-[10px] leading-tight opacity-50" style={{ color: 'var(--text-muted)' }}>
        <strong>Note:</strong> The AI coach doesn&apos;t write for you; it analyzes your &apos;Writer DNA&apos; to offer stylistic feedback and directional prompts that keep you in the driver&apos;s seat.
      </div>
    </div>
  )
}
