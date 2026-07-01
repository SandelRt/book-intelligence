'use client'

import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { Download, MessageCircle, CheckCircle2 } from 'lucide-react'
import { TactileButton } from './Tactile'

interface SocialShareCardProps {
  displayName: string
  actualAmount: number
  targetAmount: number
  goalType: string
  roomId?: string
}

export default function SocialShareCard({
  displayName,
  actualAmount,
  targetAmount,
  goalType
}: SocialShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const completed = actualAmount >= targetAmount

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = 'looplang-sprint.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate image', err)
    }
  }

  const shareText = `Just crushed ${actualAmount} ${goalType} in my writing sprint! ✍️🔥\n\nLeveling up my Writer DNA on LoopLang.`
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      
      {/* The exportable card */}
      <div 
        ref={cardRef} 
        className="w-full aspect-square rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden"
        style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}
      >
        {/* Decorative background gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[80px]" style={{ background: 'var(--accent-loopreads)', opacity: 0.15 }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[80px]" style={{ background: 'var(--accent-studio)', opacity: 0.15 }} />
        
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-left" style={{ color: 'var(--text-primary)' }}>LoopLang</span>
            <span className="text-xs tracking-widest uppercase font-bold text-left" style={{ color: 'var(--text-muted)' }}>Session Complete</span>
          </div>
          {completed && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--success)', color: 'white' }}>
              <CheckCircle2 size={24} />
            </div>
          )}
        </div>

        {/* Center Stats */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2 flex-grow mt-8">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {displayName || 'Writer'} just wrote
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-7xl font-black tracking-tighter" style={{ color: 'var(--accent-primary)' }}>
              {actualAmount}
            </h2>
          </div>
          <p className="text-lg font-bold tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
            {goalType}
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 border-t pt-4 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Goal: {targetAmount}</p>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>build your streak</p>
        </div>
      </div>

      {/* Action Buttons (Not included in the image) */}
      <div className="flex items-center gap-4 w-full">
        <TactileButton 
          onClick={handleDownload}
          className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold"
          style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}
        >
          <Download size={16} />
          Save Image
        </TactileButton>
        
        <a 
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <TactileButton 
            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#1DA1F2' }}
          >
            <MessageCircle size={16} />
            Share
          </TactileButton>
        </a>
      </div>
      
    </div>
  )
}
