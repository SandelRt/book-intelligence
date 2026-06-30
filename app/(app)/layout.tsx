import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions'
import Link from 'next/link'
import { BookOpen, LogOut } from 'lucide-react'
import RippleCanvas from '@/components/RippleCanvas'
import QuickIdeaButton from '@/components/QuickIdeaButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--background)' }}>
      <RippleCanvas>
        <header className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} />
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Book Intelligence
              </span>
            </Link>
            <Link href="/rooms" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
              Rooms
            </Link>
          </div>
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
        <QuickIdeaButton />
      </RippleCanvas>
    </div>
  )
}

