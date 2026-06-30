import { saveWriterDNA } from '@/app/actions/loopcore'
import { TactileButton } from '@/components/Tactile'
import Link from 'next/link'

export default function OnboardingPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Configure Your AI Coach</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Establish your &apos;Writer DNA&apos; so the AI learns your voice from day one.
        </p>
      </div>

      <form action={saveWriterDNA} className="space-y-8">
        
        {/* Tone */}
        <div className="space-y-3 p-6 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <label className="block text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            1. Your Ideal Tone
          </label>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            What 3 adjectives best describe the style of this project? (e.g., Gritty, Lyrical, Fast-paced, Conversational)
          </p>
          <input 
            type="text" 
            name="tone" 
            placeholder="e.g. Sharp, darkly comedic, fast-paced" 
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" 
            style={{ background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none' }} 
            required 
          />
        </div>

        {/* Influences */}
        <div className="space-y-3 p-6 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <label className="block text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            2. Author Influences
          </label>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Who are the biggest author influences for this specific manuscript?
          </p>
          <input 
            type="text" 
            name="influences" 
            placeholder="e.g. Stephen King, Gillian Flynn" 
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" 
            style={{ background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none' }} 
            required 
          />
        </div>

        {/* Goals */}
        <div className="space-y-3 p-6 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <label className="block text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            3. Project Goal
          </label>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            What is your main goal for this manuscript? What are you struggling with most?
          </p>
          <textarea 
            name="goals" 
            rows={3}
            placeholder="e.g. I want to finish the first draft by November but I keep getting stuck on pacing." 
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" 
            style={{ background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none' }} 
            required 
          />
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <TactileButton type="submit" className="w-full py-4 text-sm font-bold tracking-wider" style={{ background: 'var(--accent-primary)', color: 'var(--background)' }}>
            Save Writer DNA & Continue
          </TactileButton>
          <Link href="/dashboard" className="text-center text-xs font-semibold py-2 transition opacity-70 hover:opacity-100" style={{ color: 'var(--text-muted)' }}>
            Skip for now
          </Link>
        </div>

      </form>
    </div>
  )
}
