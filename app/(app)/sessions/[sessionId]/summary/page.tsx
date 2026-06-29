import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Session, Goal } from '@/types'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default async function SessionSummaryPage({ params }: { params: { sessionId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: sessionData } = await supabase.from('sessions').select('*').eq('id', params.sessionId).single()
  if (!sessionData) return notFound()
  const session = sessionData as Session

  const { data: goalData } = await supabase.from('goals').select('*').eq('session_id', session.id).eq('user_id', user.id).single()
  const goal = goalData as Goal | null

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-500 mb-4">
        <CheckCircle2 size={40} />
      </div>
      
      <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Session Complete!</h1>
      
      {goal && (
        <div className="p-6 rounded-2xl mx-auto max-w-md text-left space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Target</p>
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{goal.target_amount} {goal.goal_type}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actual</p>
            <p className="text-2xl font-bold" style={{ color: goal.completed ? 'var(--accent)' : 'var(--text-primary)' }}>
              {goal.actual_amount} {goal.goal_type}
            </p>
          </div>
        </div>
      )}

      <div className="pt-8">
        <Link href={`/rooms/${session.room_id}`} className="inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
          Return to Room <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
