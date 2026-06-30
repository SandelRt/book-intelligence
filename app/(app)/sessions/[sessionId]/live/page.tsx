import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { checkInSession } from '@/app/actions/loopcore'
import type { Session, Goal } from '@/types'
import { Timer, Flag } from 'lucide-react'
import FocusEntrainment from '@/components/FocusEntrainment'
import SessionCheckInForm from '@/components/SessionCheckInForm'
import SprintTimer from '@/components/SprintTimer'

export default async function LiveSessionPage({ params }: { params: { sessionId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: sessionData } = await supabase.from('sessions').select('*').eq('id', params.sessionId).single()
  if (!sessionData) return notFound()
  const session = sessionData as Session

  if (session.status === 'completed') {
    redirect(`/sessions/${session.id}/summary`)
  }

  const { data: goalData } = await supabase.from('goals').select('*').eq('session_id', session.id).eq('user_id', user.id).single()
  if (!goalData) {
    redirect(`/sessions/${session.id}`)
  }
  const goal = goalData as Goal

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 h-full flex flex-col space-y-8 relative">
      <FocusEntrainment />
      
      <div className="flex items-center justify-between p-6 rounded-[32px] depth-out" style={{ background: 'var(--surface)' }}>
        <div>
          <h1 className="font-bold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>{session.title}</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Status: {session.status === 'live' ? <span style={{ color: 'var(--accent-primary)' }}>LIVE</span> : 'Waiting for host to start'}</p>
        </div>
        <div>
          <SprintTimer initialMinutes={session.duration_minutes || 25} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {/* Goal Card */}
        <div className="p-8 rounded-[32px] space-y-4 depth-out flex flex-col items-center justify-center text-center" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Flag size={18} style={{ color: 'var(--accent-primary)' }} /> Your Target
          </div>
          <div className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {goal.target_amount}
          </div>
          <div className="text-lg font-bold uppercase tracking-widest" style={{ color: 'var(--accent-primary)' }}>
            {goal.goal_type}
          </div>
        </div>

        {/* Check In Panel */}
        <div className="p-8 rounded-[32px] space-y-6 depth-out" style={{ background: 'var(--surface)' }}>
          <h2 className="font-bold text-xl text-center" style={{ color: 'var(--text-primary)' }}>Session Check-In</h2>
          <SessionCheckInForm 
            sessionId={session.id}
            targetAmount={goal.target_amount}
            goalType={goal.goal_type}
            checkInAction={checkInSession.bind(null, session.id)}
          />
        </div>
      </div>
    </div>
  )
}

