'use client'

import React from 'react'
import { playDopamineChime, playThock } from '@/lib/audio'
import { TactileButton } from '@/components/Tactile'
import { CheckCircle } from 'lucide-react'

export default function SessionCheckInForm({ 
  sessionId, 
  targetAmount, 
  goalType,
  checkInAction
}: { 
  sessionId: string
  targetAmount: number
  goalType: string
  checkInAction: (formData: FormData) => void
}) {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    playDopamineChime()
    // Let the form submit natively to trigger the server action
  }

  return (
    <form action={checkInAction} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actual {goalType} completed</label>
        <input type="number" name="actual_amount" defaultValue={targetAmount} required className="w-full px-4 py-3 rounded-xl font-bold depth-in text-lg focus:outline-none" style={{ background: 'var(--surface-3)', color: 'var(--accent-primary)', border: 'none' }} />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Focus Rating (1-5)</label>
        <input 
          type="range" 
          name="focus_rating" 
          min="1" max="5" 
          defaultValue="4" 
          className="w-full interactive-fidget accent-[var(--accent-primary)] h-3 bg-[var(--surface-3)] rounded-full appearance-none outline-none"
          onChange={() => playThock()}
        />
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)' }}>
          <span>Distracted</span><span>Laser Focused</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Reflection (Optional)</label>
        <textarea name="reflection" rows={2} className="w-full px-4 py-3 rounded-xl text-sm depth-in focus:outline-none" style={{ background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none' }} placeholder="How did it go?"></textarea>
      </div>
      
      <TactileButton type="submit" className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-background flex items-center justify-center gap-2 mt-4" style={{ background: 'var(--accent-primary)' }}>
        <CheckCircle size={18} /> Complete Session
      </TactileButton>
    </form>
  )
}
