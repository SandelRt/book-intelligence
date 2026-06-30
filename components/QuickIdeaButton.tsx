'use client'

import { useState, useRef, useEffect } from 'react'
import { Lightbulb, X, Save } from 'lucide-react'
import { playClick, playZip } from '@/lib/fidget'

export default function QuickIdeaButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [idea, setIdea] = useState('')
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus()
    }
  }, [isOpen])

  const toggleOpen = () => {
    if (!isOpen) {
      playZip()
      setSaved(false)
      setIdea('')
    } else {
      playClick()
    }
    setIsOpen(!isOpen)
  }

  const handleSave = () => {
    if (!idea.trim()) return
    playZip()
    
    // Save to LocalStorage for now
    const existing = JSON.parse(localStorage.getItem('loopreads_ideas') || '[]')
    existing.push({ id: Date.now(), text: idea, date: new Date().toISOString() })
    localStorage.setItem('loopreads_ideas', JSON.stringify(existing))
    
    setSaved(true)
    setTimeout(() => {
      setIsOpen(false)
      setIdea('')
    }, 1000)
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
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Jot an idea</span>
              </div>
              <button onClick={toggleOpen} className="p-1 rounded-md transition-colors hover:bg-black/10" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4">
              {saved ? (
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
