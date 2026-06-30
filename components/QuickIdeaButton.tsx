'use client'

import { useState, useRef, useEffect } from 'react'
import { Lightbulb, X, Save, Archive, Trash2 } from 'lucide-react'
import { playThock, playZip } from '@/lib/audio'

type Idea = {
  id: number
  text: string
  date: string
}

export default function QuickIdeaButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [idea, setIdea] = useState('')
  const [saved, setSaved] = useState(false)
  const [viewingVault, setViewingVault] = useState(false)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && !viewingVault) {
      textareaRef.current?.focus()
    }
  }, [isOpen, viewingVault])

  const loadIdeas = () => {
    const existing = JSON.parse(localStorage.getItem('loopreads_ideas') || '[]')
    setIdeas(existing.reverse())
  }

  const toggleOpen = () => {
    if (!isOpen) {
      playZip()
      setSaved(false)
      setIdea('')
      setViewingVault(false)
    } else {
      playThock()
    }
    setIsOpen(!isOpen)
  }

  const handleSave = () => {
    if (!idea.trim()) return
    playZip()
    
    const existing = JSON.parse(localStorage.getItem('loopreads_ideas') || '[]')
    existing.push({ id: Date.now(), text: idea, date: new Date().toISOString() })
    localStorage.setItem('loopreads_ideas', JSON.stringify(existing))
    
    setSaved(true)
    setTimeout(() => {
      setIsOpen(false)
      setIdea('')
    }, 1000)
  }

  const handleDelete = (id: number) => {
    playZip()
    const updated = ideas.filter(i => i.id !== id)
    localStorage.setItem('loopreads_ideas', JSON.stringify(updated.reverse()))
    setIdeas(updated)
  }

  const openVault = () => {
    playThock()
    loadIdeas()
    setViewingVault(true)
    setSaved(false)
  }

  return (
    <>
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center group"
        style={{ background: 'var(--accent)', color: 'white' }}
        title="Quick Idea"
      >
        <Lightbulb size={24} className="group-hover:animate-pulse" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 sm:items-center sm:justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/40 pointer-events-auto backdrop-blur-sm" onClick={toggleOpen} />
          
          <div 
            className="pointer-events-auto relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-200"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <div className="flex items-center gap-2">
                <Lightbulb size={16} style={{ color: 'var(--accent)' }} />
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {viewingVault ? 'Ideas Vault' : 'Jot an idea'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!viewingVault && (
                  <button onClick={openVault} className="p-1.5 rounded-md transition-colors hover:bg-black/10" style={{ color: 'var(--text-muted)' }} title="View Vault">
                    <Archive size={14} />
                  </button>
                )}
                <button onClick={toggleOpen} className="p-1 rounded-md transition-colors hover:bg-black/10" style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {viewingVault ? (
                <div className="space-y-4">
                  {ideas.length === 0 ? (
                    <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                      No ideas saved yet.
                    </div>
                  ) : (
                    ideas.map((item) => (
                      <div key={item.id} className="p-3 rounded-lg relative group" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <p className="text-sm whitespace-pre-wrap pr-6" style={{ color: 'var(--text-primary)' }}>{item.text}</p>
                        <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                          {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-red-500"
                          title="Delete Idea"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                  <button
                    onClick={() => { playThock(); setViewingVault(false) }}
                    className="w-full py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 mt-2"
                    style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                  >
                    Back to writing
                  </button>
                </div>
              ) : saved ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    <Save size={24} />
                  </div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Saved!</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Stored in your local vault.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    ref={textareaRef}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="What's on your mind? Don't lose it..."
                    className="w-full h-32 p-3 text-sm rounded-lg resize-none outline-none transition-colors focus:ring-1 focus:ring-accent/50"
                    style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Press ⌘+Enter to save</span>
                    <button
                      onClick={handleSave}
                      disabled={!idea.trim()}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                      style={{ background: 'var(--accent)' }}
                    >
                      Save Idea
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
