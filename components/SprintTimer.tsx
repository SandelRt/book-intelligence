'use client'

import { useState, useEffect } from 'react'
import { playZip } from '@/lib/audio'

export default function SprintTimer({ initialMinutes }: { initialMinutes: number }) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playZip() // Sound on finish
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, timeLeft])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const isUrgent = timeLeft < 60 && timeLeft > 0 // Last minute turns red/urgent
  const isDone = timeLeft === 0

  return (
    <div className="flex flex-col items-center justify-center py-6 px-12 rounded-2xl shadow-inner cursor-pointer transition-all hover:scale-[1.02]" 
      onClick={() => setIsRunning(!isRunning)}
      style={{ background: 'var(--background)', border: `2px solid ${isUrgent ? 'var(--danger)' : isDone ? 'var(--success)' : 'var(--border)'}` }}
    >
      <div 
        className={`text-6xl md:text-7xl font-black tabular-nums tracking-tighter mb-2 transition-colors duration-500`} 
        style={{ color: isUrgent ? 'var(--danger)' : isDone ? 'var(--success)' : 'var(--accent)' }}
      >
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
        {isDone ? 'Sprint Complete' : isRunning ? 'Deep Work (Click to pause)' : 'Paused (Click to resume)'}
      </div>
    </div>
  )
}
