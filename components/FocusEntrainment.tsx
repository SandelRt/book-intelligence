'use client'

import React, { useEffect, useState } from 'react'

export default function FocusEntrainment() {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    // 5Hz (Theta) Sine-Wave Pulsing for Flow State
    // 200ms per cycle
    const interval = setInterval(() => {
      setPulse(p => !p)
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-1] transition-opacity duration-200"
      style={{
        background: 'var(--accent-primary)',
        opacity: pulse ? 0.02 : 0.00, // Very subtle to prevent distraction/epilepsy, just enough for entrainment
      }}
    />
  )
}
