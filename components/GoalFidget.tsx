'use client'

import React, { useState, useEffect } from 'react'
import { playZip } from '@/lib/audio'
import { TactileButton } from '@/components/Tactile'

export default function GoalFidget() {
  const [targetAmount, setTargetAmount] = useState(500)
  const [goalType, setGoalType] = useState('words')

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    const diff = Math.abs(val - targetAmount)
    
    // Only play sound if dragging fast enough (or just play quietly)
    if (diff > 0) {
      playZip(diff > 50 ? 0.8 : 0.3)
    }
    setTargetAmount(val)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Goal Type</label>
          <select 
            name="goal_type" 
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none depth-in font-bold" 
            style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: 'none' }}
          >
            <option value="words">Words written</option>
            <option value="pages">Pages read</option>
            <option value="chapters">Chapters edited</option>
            <option value="minutes">Minutes focused</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Target Amount</label>
          <div className="w-full px-4 py-3 rounded-xl text-sm depth-in font-bold text-center text-xl" style={{ background: 'var(--surface-2)', color: 'var(--accent-primary)' }}>
            {targetAmount}
            <input type="hidden" name="target_amount" value={targetAmount} />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <input 
          type="range" 
          min={10} 
          max={goalType === 'words' ? 3000 : 100} 
          step={goalType === 'words' ? 50 : 1}
          value={targetAmount}
          onChange={handleSliderChange}
          className="w-full interactive-fidget accent-[var(--accent-primary)] cursor-ew-resize h-4 bg-[var(--surface-3)] rounded-full appearance-none outline-none"
        />
        <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          <span>Light work</span>
          <span>Deep focus</span>
        </div>
      </div>

      <input type="hidden" name="target_unit" value="units" />
      
      <TactileButton type="submit" className="w-full py-4 rounded-xl text-background font-bold text-lg transition-all mt-4" style={{ background: 'var(--accent-primary)' }}>
        Set Goal & Join
      </TactileButton>
    </div>
  )
}
