import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LoopLang',
    short_name: 'LoopLang',
    description: 'The AI-powered gamified writing studio.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F4F1EA',
    theme_color: '#F4F1EA',
    icons: [
      {
        src: '/icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      }
    ],
  }
}
