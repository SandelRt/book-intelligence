import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { joinRoom, scheduleSession } from '@/app/actions/loopcore'
import type { Room, Session } from '@/types'
import { CalendarPlus, Play, CheckCircle } from 'lucide-react'
import { TactileButton, TactileCardLink } from '@/components/Tactile'

export default async function RoomDetailPage({ params }: { params: { roomId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: roomData } = await supabase.from('rooms').select('*').eq('id', params.roomId).single()
  if (!roomData) return notFound()
  const room = roomData as Room

  // Check if member
  const { data: member } = await supabase.from('room_members').select('*').eq('room_id', room.id).eq('user_id', user.id).single()

  // Fetch upcoming sessions
  const { data: sessionsData } = await supabase
    .from('sessions')
    .select('*')
    .eq('room_id', room.id)
    .order('created_at', { ascending: false })
  
  const sessions = (sessionsData ?? []) as Session[]

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 h-full overflow-y-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{room.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{room.description || 'A community space for accountability.'}</p>
        
        {!member ? (
          <form action={joinRoom.bind(null, room.id)}>
            <TactileButton type="submit" className="px-6 py-2 rounded-xl text-background font-bold" style={{ background: 'var(--accent-primary)' }}>
              Join Room
            </TactileButton>
          </form>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
            <CheckCircle size={14} style={{ color: 'var(--accent-primary)' }} /> Member
          </div>
        )}
      </div>

      <hr style={{ borderColor: 'var(--border)' }} />

      {member && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Sessions</h2>
            <form action={scheduleSession.bind(null, room.id)} className="flex items-center gap-2">
              <input type="text" name="title" placeholder="Session Title" className="px-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:border-[var(--accent-primary)]" required style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} />
              <input type="number" name="duration_minutes" placeholder="Mins" defaultValue="25" className="px-3 py-1.5 text-sm rounded-lg border w-20 focus:outline-none focus:border-[var(--accent-primary)]" required style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} />
              <TactileButton type="submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 transition hover:opacity-80">
                <CalendarPlus size={16} /> Schedule
              </TactileButton>
            </form>
          </div>

          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="p-4 rounded-xl flex items-center justify-between depth-out" style={{ background: 'var(--surface)' }}>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.title}</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {s.duration_minutes} minutes • Status: <span style={{ color: s.status === 'live' ? 'var(--accent-primary)' : 'inherit' }}>{s.status}</span>
                  </p>
                </div>
                <TactileCardLink href={`/sessions/${s.id}`} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-background font-bold" style={{ background: 'var(--accent-primary)' }}>
                  <Play size={14} /> Join
                </TactileCardLink>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No sessions scheduled yet.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

