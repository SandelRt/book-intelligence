import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions'
import Link from 'next/link'
import { BookOpen, LogOut } from 'lucide-react'
import RippleCanvas from '@/components/RippleCanvas'
import QuickIdeaButton from '@/components/QuickIdeaButton'
import AppHeader from '@/components/AppHeader'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--background)' }}>
      <RippleCanvas>
        <AppHeader />
        <main className="flex-1 overflow-hidden">{children}</main>
        <QuickIdeaButton />
      </RippleCanvas>
    </div>
  )
}

