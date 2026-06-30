'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { playZip, playThock } from '@/lib/audio'

type Idea = {
  id: number
  text: string
  date: string
}

export default function IdeasVaultPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setMounted(true)
      const existing = JSON.parse(localStorage.getItem('loopreads_ideas') || '[]')
      setIdeas(existing.reverse())
    }, 0)
  }, [])

  const handleDelete = (id: number) => {
    playZip()
    const updated = ideas.filter(i => i.id !== id)
    // Reverse it back to chronological for storage
    localStorage.setItem('loopreads_ideas', JSON.stringify([...updated].reverse()))
    setIdeas(updated)
  }

  if (!mounted) return null

  return (
    <div className="h-full flex flex-col p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/dashboard"
            onClick={() => playThock()}
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} /> Back to Studio
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Lightbulb className="w-8 h-8" style={{ color: 'var(--accent)' }} />
            Ideas Vault
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your personal scratchpad. Quick thoughts, fragments, and midnight realizations live here.
          </p>
        </div>
        <div className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
          {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} saved
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-4 pb-20">
        {ideas.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center rounded-2xl border-dashed border-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <Lightbulb className="w-12 h-12 mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Your vault is empty.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Use the floating button in the corner to jot something down.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((item) => (
              <div 
                key={item.id} 
                className="p-5 rounded-2xl relative group transition-all hover:scale-[1.02]" 
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <p className="text-base whitespace-pre-wrap leading-relaxed pr-6" style={{ color: 'var(--text-primary)' }}>
                  {item.text}
                </p>
                <div className="mt-4 pt-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-red-500"
                    title="Delete Idea"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
