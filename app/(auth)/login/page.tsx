import { signInWithMagicLink } from '@/app/actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const { message, error } = await searchParams

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter your email to receive a magic link
          </p>
        </div>

        <form action={signInWithMagicLink} className="space-y-4">
          <div>
            <input
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Send magic link
          </button>
        </form>

        {message && (
          <p className="text-center text-sm" style={{ color: 'var(--success)' }}>{message}</p>
        )}
        {error && (
          <p className="text-center text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
        )}
      </div>
    </div>
  )
}
