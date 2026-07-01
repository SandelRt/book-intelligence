import Link from 'next/link'
import { TactileButton } from '@/components/Tactile'

export default function LandingPage() {
  return (
    <div className="min-h-full flex flex-col px-6 pb-20 pt-10" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))' }}>
            📖
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>LoopLang</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>The gym for reading & writing</p>
          </div>
        </div>
        <Link href="/login" className="text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
            Live Accountability
          </div>
          <h2 className="text-5xl font-medium leading-tight" style={{ fontFamily: 'var(--font-prose)', color: 'var(--text-primary)' }}>
            You don&apos;t lack discipline.<br />
            <em style={{ color: 'var(--text-secondary)' }}>You lack a room.</em>
          </h2>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
            Join a live session, set one clear goal, and finish it together. 
            An AI coach learns what keeps you consistent and steps in when you&apos;re stuck.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <TactileButton className="px-8 py-3.5 text-sm">
                Start A Live Session
              </TactileButton>
            </Link>
          </div>
        </div>

        {/* Test-before-you-buy Demo (Static Preview) */}
        <div className="rounded-2xl p-6 shadow-2xl relative overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--accent), transparent 50%)' }} />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Live Demo</span>
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> 14 writers here
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Step 1: Pick a room</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl shadow-inner border-2 cursor-not-allowed opacity-80" style={{ background: 'var(--surface-2)', borderColor: 'var(--accent)' }}>
                  <div className="text-xl mb-1">✍️</div>
                  <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Writing Sprint</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Focus on word count</div>
                </div>
                <div className="p-3 rounded-xl border border-transparent cursor-not-allowed opacity-50" style={{ background: 'var(--surface-2)' }}>
                  <div className="text-xl mb-1">📖</div>
                  <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Reading Sprint</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Focus on pages</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Step 2: The Sprint</h3>
              <div className="flex flex-col items-center justify-center p-6 rounded-xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                <div className="text-4xl font-black tabular-nums tracking-tighter mb-2" style={{ color: 'var(--accent)' }}>24:59</div>
                <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Deep Work</div>
              </div>
            </div>
            
            <Link href="/login" className="block mt-4">
              <button className="w-full py-3 rounded-xl text-xs font-bold transition-opacity hover:opacity-80" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                Start A Live Session →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto w-full mt-24 space-y-8">
        <h3 className="text-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>Frequently Asked Questions</h3>
        
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>I don&apos;t want AI writing my book for me.</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              The AI coach doesn&apos;t write for you; it analyzes your &apos;Writer DNA&apos; to offer stylistic feedback and directional prompts that keep you in the driver&apos;s seat.
            </p>
          </div>

          <div className="p-6 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>I&apos;ll just get distracted by chatting with other writers.</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              The Cheer Box is strictly ephemeral and designed for pre/post sprint hype, not mid-sprint procrastination. When the timer runs, you write.
            </p>
          </div>

          <div className="p-6 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>I don&apos;t write linearly, so word counts don&apos;t work for me.</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Live sessions allow you to set flexible target goals—track words, chapters edited, or time spent focused. Word count is just one of many ways to measure progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
