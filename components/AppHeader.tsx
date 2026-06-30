'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, LogOut, Users } from 'lucide-react'
import { useEffect } from 'react'

import { signOut } from '@/app/actions'

export default function AppHeader() {
  const pathname = usePathname()
  const isCommunity = pathname?.startsWith('/rooms') || pathname?.startsWith('/sessions')

  useEffect(() => {
    const root = document.documentElement
    if (isCommunity) {
      root.style.setProperty('--accent', 'var(--accent-loopreads)')
      root.style.setProperty('--accent-dim', 'var(--accent-loopreads-dim)')
      root.style.setProperty('--accent-border', 'var(--accent-loopreads-border)')
    } else {
      root.style.setProperty('--accent', 'var(--accent-studio)')
      root.style.setProperty('--accent-dim', 'var(--accent-studio-dim)')
      root.style.setProperty('--accent-border', 'var(--accent-studio-border)')
    }
  }, [isCommunity])

  return (
    <header className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Brand */}
      <div className="w-1/3 flex items-center gap-6">
        <Link href={isCommunity ? "/rooms" : "/dashboard"} className="flex items-center gap-2 transition-opacity hover:opacity-80">
          {isCommunity ? (
            <Users size={18} style={{ color: 'var(--accent)' }} />
          ) : (
            <BookOpen size={18} style={{ color: 'var(--accent)' }} />
          )}
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {isCommunity ? 'LoopReads' : 'Studio'}
          </span>
        </Link>
        {!isCommunity && (
          <Link href="/ideas" className="text-xs font-medium transition-colors hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
            Ideas Vault
          </Link>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="w-1/3 flex justify-center">
        <div className="flex items-center p-1 rounded-full depth-in" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
          <Link 
            href="/dashboard"
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all relative"
            style={{ 
              color: !isCommunity ? 'var(--background)' : 'var(--text-secondary)',
            }}
          >
            {!isCommunity && (
              <span className="absolute inset-0 rounded-full shadow-sm" style={{ background: 'var(--accent-studio)' }} />
            )}
            <span className="relative z-10">Studio</span>
          </Link>
          
          <Link 
            href="/rooms"
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all relative"
            style={{ 
              color: isCommunity ? 'var(--background)' : 'var(--text-secondary)',
            }}
          >
            {isCommunity && (
              <span className="absolute inset-0 rounded-full shadow-sm" style={{ background: 'var(--accent-loopreads)' }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              Community
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            </span>
          </Link>
        </div>
      </div>

      {/* Profile/Actions */}
      <div className="w-1/3 flex items-center justify-end">
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            <LogOut size={14} />
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
