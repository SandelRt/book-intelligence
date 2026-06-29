'use client'

import { playThock } from '@/lib/audio'
import { useRouter } from 'next/navigation'
import React from 'react'

export function TactileButton({ 
  children, 
  onClick, 
  className = '', 
  style = {},
  type = 'button'
}: { 
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  type?: 'button' | 'submit'
}) {
  const handleClick = (e: React.MouseEvent) => {
    playThock()
    if (onClick) onClick()
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`depth-out interactive-fidget ${className}`}
      style={style}
    >
      {children}
    </button>
  )
}

export function TactileCardLink({ 
  href, 
  children, 
  className = '', 
  style = {} 
}: { 
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const router = useRouter()
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    playThock()
    // Small delay to allow thock sound to register before navigation
    setTimeout(() => {
      router.push(href)
    }, 100)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`block depth-out interactive-fidget ${className}`}
      style={style}
    >
      {children}
    </a>
  )
}
