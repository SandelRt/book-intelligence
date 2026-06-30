import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { joinSessionAndSetGoal, startLiveSession } from '@/app/actions/loopcore'
import type { Session, Goal } from '@/types'
import { Clock, Users } from 'lucide-react'
import GoalFidget from '@/components/GoalFidget'
import { TactileButton } from '@/components/Tactile'

export default async function SessionSetupPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: sessionData } = await supabase.from('sessions').select('*').eq('id', resolvedParams.sessionId).single()
  if (!sessionData) return notFound()
  const session = sessionData as Session

  if (session.status === 'completed') {
    redirect(`/sessions/${session.id}/summary`)
  }

  // Check if user already set goal (meaning they already joined)
  const { data: goal } = await supabase.from('goals').select('*').eq('session_id', session.id).eq('user_id', user.id).single()
  if (goal) {
    redirect(`/sessions/${session.id}/live`)
  }

  const isHost = session.host_user_id === user.id

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{session.title}</h1>
        <div className="flex items-center justify-center gap-6 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-2"><Clock size={16}/> {session.duration_minutes} Minutes</span>
          <span className="flex items-center gap-2"><Users size={16}/> {session.session_type.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="p-8 rounded-[32px] depth-out" style={{ background: 'var(--surface)' }}>
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>Dial in your goal</h2>
        <form action={joinSessionAndSetGoal.bind(null, session.id)}>
          <GoalFidget />
        </form>
      </div>

      {isHost && session.status === 'scheduled' && (
        <div className="pt-6">
          <form action={startLiveSession.bind(null, session.id)}>
            <TactileButton type="submit" className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-background" style={{ background: 'var(--success)' }}>
              Start Session (Host only)
            </TactileButton>
          </form>
        </div>
      )}
    </div>
  )
}

