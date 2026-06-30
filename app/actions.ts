'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                process.env.VERCEL_PROJECT_PRODUCTION_URL || 
                process.env.VERCEL_URL || 
                'http://localhost:3000'
                
  siteUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error('[magic-link error]', error.message, error.status)
    return redirect('/login?error=Could+not+send+magic+link')
  }

  return redirect('/login?message=Check+your+email+for+a+magic+link')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createManuscript(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = (formData.get('title') as string) || 'Untitled'
  const genre = formData.get('genre') as string | null

  const { data: manuscript, error } = await supabase
    .from('manuscripts')
    .insert({ user_id: user.id, title, genre })
    .select()
    .single()

  if (error) throw error

  // Create first chapter
  await supabase.from('chapters').insert({
    manuscript_id: manuscript.id,
    order_idx: 0,
    title: 'Chapter 1',
    content: '',
  })

  redirect(`/manuscript/${manuscript.id}`)
}
