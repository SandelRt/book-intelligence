import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Session, Goal } from '@/types'
import { ArrowRight } from 'lucide-react'
import SocialShareCard from '@/components/SocialShareCard'

export default async function SessionSummaryPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: sessionData } = await supabase.from('sessions').select('*').eq('id', resolvedParams.sessionId).single()
  if (!sessionData) return notFound()
  const session = sessionData as Session

  const { data: goalData } = await supabase.from('goals').select('*').eq('session_id', session.id).eq('user_id', user.id).single()
  const goal = goalData as Goal | null

  const { data: profile } = await supabase.from('writer_profiles').select('display_name').eq('user_id', user.id).single()
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Writer'

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-8">
      {goal && (
        <SocialShareCard 
          displayName={displayName}
          actualAmount={goal.actual_amount ?? 0}
          targetAmount={goal.target_amount}
          goalType={goal.goal_type}
        />
      )}

      <div className="pt-8">
        <Link href={`/rooms/${session.room_id}`} className="inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
          Return to Room <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
