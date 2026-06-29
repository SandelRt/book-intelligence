'use client'

import { useEffect, useRef } from 'react'
import { playPop } from '@/lib/audio'

export default function RippleCanvas({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Play soft pop on any empty background click
      // We don't want to double trigger if clicking a button (handled elsewhere)
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() !== 'button' && target.tagName.toLowerCase() !== 'a' && target.tagName.toLowerCase() !== 'input') {
        playPop(Math.random(), 0.02);
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full relative">
      {children}
    </div>
  )
}
