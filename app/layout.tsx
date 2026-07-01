import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-prose',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LoopLang',
  description: 'Your writing, amplified by AI that learns you.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LoopLang',
  },
}

export const viewport = {
  themeColor: '#F4F1EA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${lora.variable}`}>
      <body className="h-full">{children}</body>
    </html>
  )
}
