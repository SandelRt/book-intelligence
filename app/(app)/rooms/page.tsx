import { createClient } from '@/lib/supabase/server'
import { Users, Plus } from 'lucide-react'
import { createRoom } from '@/app/actions/loopcore'
import type { Room } from '@/types'
import { TactileButton, TactileCardLink } from '@/components/Tactile'

export default async function RoomsPage() {
  const supabase = await createClient()
  
  // Fetch all public rooms
  const { data: publicRooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  const rooms = (publicRooms ?? []) as Room[]

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Community Rooms</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Join a live room to read, write, and stay accountable.
          </p>
        </div>

        <form action={createRoom} className="flex gap-2 items-center">
          <input type="text" name="name" placeholder="Room name" className="px-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:border-[var(--accent-primary)]" required style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} />
          <TactileButton
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
            style={{ background: 'var(--accent-primary)' }}
          >
            <Plus size={16} />
            Create Room
          </TactileButton>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <TactileCardLink
            key={room.id}
            href={`/rooms/${room.id}`}
            className="group p-5 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <Users size={20} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  {room.room_type.replace('_', ' ')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {room.name}
                </h3>
                {room.description && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{room.description}</p>
                )}
              </div>
            </div>
          </TactileCardLink>
        ))}
      </div>
    </div>
  )
}

