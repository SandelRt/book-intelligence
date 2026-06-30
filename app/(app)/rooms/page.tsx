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
          <select name="visibility" className="px-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:border-[var(--accent-primary)]" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <TactileButton
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
            style={{ background: 'var(--accent-primary)' }}
          >
            <Plus size={16} />
            Create
          </TactileButton>
        </form>
      </div>
      <div className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Instant Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "ADHD Hyperfocus Sprint", desc: "For when you need immediate dopamine and a ticking clock.", icon: "⚡" },
            { name: "Silent Reading Hour", desc: "Zero pressure. Just read your research or fellow writers' work.", icon: "📖" },
            { name: "NaNoWriMo 2k Push", desc: "High stakes. High word count. Get it done.", icon: "🔥" }
          ].map((template) => (
            <form key={template.name} action={createRoom}>
              <input type="hidden" name="name" value={template.name} />
              <input type="hidden" name="description" value={template.desc} />
              <button type="submit" className="w-full h-full text-left p-4 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="text-2xl mb-2">{template.icon}</div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{template.name}</h3>
                <p className="text-xs mt-1 leading-snug opacity-80" style={{ color: 'var(--text-secondary)' }}>{template.desc}</p>
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}></div>

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

