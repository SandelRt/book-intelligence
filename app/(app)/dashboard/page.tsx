import { createClient } from '@/lib/supabase/server'
import { createManuscript } from '@/app/actions'
import Link from 'next/link'
import { Plus, BookOpen, Clock } from 'lucide-react'
import { TactileButton, TactileCardLink } from '@/components/Tactile'
import type { Manuscript } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: manuscripts } = await supabase
    .from('manuscripts')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  const mss = (manuscripts ?? []) as Manuscript[]

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Your manuscripts</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {mss.length === 0 ? 'Start your first book.' : `${mss.length} book${mss.length === 1 ? '' : 's'} in progress.`}
          </p>
        </div>

        <form action={createManuscript}>
          <input type="hidden" name="title" value="Untitled" />
          <TactileButton
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
            style={{ background: 'var(--accent-primary)' }}
          >
            <Plus size={16} />
            New book
          </TactileButton>
        </form>
      </div>

      {mss.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 rounded-2xl" style={{ border: '1px dashed var(--border)' }}>
          <BookOpen size={40} style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No books yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mss.map((ms) => (
            <TactileCardLink
              key={ms.id}
              href={`/manuscript/${ms.id}`}
              className="group p-5 rounded-2xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <BookOpen size={20} style={{ color: 'var(--accent-primary)' }} />
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    {ms.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {ms.title}
                  </h3>
                  {ms.genre && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ms.genre}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={11} />
                  {new Date(ms.updated_at).toLocaleDateString()}
                </div>
              </div>
            </TactileCardLink>
          ))}
        </div>
      )}

      {/* Rooms Section */}
      <div className="pt-8 mt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Community</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Join writing sprints and reading rooms.
            </p>
          </div>
          <Link href="/rooms" className="text-sm font-medium transition hover:opacity-70" style={{ color: 'var(--accent)' }}>
            Browse Rooms &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
