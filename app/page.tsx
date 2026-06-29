import Link from 'next/link'

export default function LandingPage() {
  return (
    <div
      className="min-h-full flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-xl w-full text-center space-y-10">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
          style={{
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
          }}
        >
          Early access
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1
            className="text-5xl font-normal leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-prose)', color: 'var(--text-primary)' }}
          >
            Write until you disappear<br />
            <em style={{ color: 'var(--text-secondary)' }}>into the story.</em>
          </h1>
          <p
            className="text-base leading-relaxed max-w-sm mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            An AI writing partner that learns your voice over time — catches what&apos;s
            generic, finds direction when you&apos;re stuck, and stays out of the way
            when you&apos;re not.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 text-left text-sm">
          {[
            { label: 'Writer DNA', desc: 'Learns your taste. Filters everything through it.' },
            { label: 'Structural lens', desc: 'Spots when a chapter doesn\'t sound like you.' },
            { label: 'Direction engine', desc: 'Gets you moving. Disappears when you are.' },
          ].map((f) => (
            <div
              key={f.label}
              className="p-4 rounded-xl"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="font-medium text-xs mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {f.label}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium text-white transition-all hover:opacity-85"
          style={{ background: 'var(--accent)' }}
        >
          Start writing
        </Link>
      </div>
    </div>
  )
}
