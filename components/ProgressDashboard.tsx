'use client'

import { useEffect, useState } from 'react'
import { Flame, PenTool, Timer } from 'lucide-react'

type HeatmapDay = { date: string, words: number }
type StatsData = {
  currentStreak: number
  weeklyWords: number
  totalSessions: number
  heatmap: HeatmapDay[]
}

export default function ProgressDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-32 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading stats...</p>
      </div>
    )
  }

  if (!stats) return null

  // Function to get color based on word count
  const getHeatmapColor = (words: number) => {
    if (words === 0) return 'var(--surface-3)'
    if (words < 500) return 'var(--accent-loopreads-dim)'
    if (words < 1500) return 'var(--accent-loopreads-border)'
    return 'var(--accent-loopreads)'
  }

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl flex flex-col justify-between" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <div className="p-1.5 rounded-md" style={{ background: 'var(--accent-studio-dim)', color: 'var(--accent-studio)' }}>
              <Flame size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Streak</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.currentStreak}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>days</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl flex flex-col justify-between" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <div className="p-1.5 rounded-md" style={{ background: 'var(--accent-loopreads-dim)', color: 'var(--accent-loopreads)' }}>
              <PenTool size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>This Week</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.weeklyWords.toLocaleString()}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>words</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl flex flex-col justify-between" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <div className="p-1.5 rounded-md" style={{ background: 'rgba(100, 100, 100, 0.1)', color: 'var(--text-secondary)' }}>
              <Timer size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Sessions</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalSessions}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>total</span>
          </div>
        </div>

      </div>

      {/* Heatmap */}
      <div className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>30-Day Activity</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {stats.heatmap.map((day, idx) => (
            <div 
              key={idx}
              title={`${day.date}: ${day.words} words`}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-colors"
              style={{ background: getHeatmapColor(day.words) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
