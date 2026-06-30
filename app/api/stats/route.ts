import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1. Total Sessions (from session_participants where completed_session = true)
  const { count: totalSessions } = await supabase
    .from('session_participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed_session', true)

  // 2. Goals from the last 30 days for Heatmap and Streak
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: goals } = await supabase
    .from('goals')
    .select('actual_amount, created_at, completed')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  const validGoals = goals ?? []

  // Calculate Heatmap & Weekly Words
  let weeklyWords = 0
  const heatmapMap: Record<string, number> = {}
  
  // Initialize the last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    heatmapMap[dateStr] = 0
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  for (const g of validGoals) {
    if (!g.actual_amount) continue
    const d = new Date(g.created_at)
    const dateStr = d.toISOString().split('T')[0]
    
    // Add to heatmap
    if (heatmapMap[dateStr] !== undefined) {
      heatmapMap[dateStr] += g.actual_amount
    }

    // Add to weekly words
    if (d >= sevenDaysAgo) {
      weeklyWords += g.actual_amount
    }
  }

  const heatmap = Object.entries(heatmapMap)
    .map(([date, words]) => ({ date, words }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Calculate Streak (consecutive days with > 0 words, starting from today or yesterday)
  let currentStreak = 0
  const todayStr = new Date().toISOString().split('T')[0]
  
  // Check if they wrote today
  let wroteToday = heatmapMap[todayStr] > 0
  
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    
    if (heatmapMap[dateStr] > 0) {
      currentStreak++
    } else {
      // If it's today and they haven't written yet, we don't break the streak from yesterday
      if (i === 0 && !wroteToday) continue
      // Otherwise, missing a day breaks the streak
      break
    }
  }

  return NextResponse.json({
    currentStreak,
    weeklyWords,
    totalSessions: totalSessions ?? 0,
    heatmap
  })
}
