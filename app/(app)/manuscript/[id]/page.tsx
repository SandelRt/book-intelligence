import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ManuscriptShell from '@/components/editor/ManuscriptShell'
import type { Chapter, Manuscript } from '@/types'

export default async function ManuscriptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('user_id', user.id)
    .single()

  if (!manuscript) notFound()

  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('manuscript_id', resolvedParams.id)
    .order('order_idx')

  return (
    <ManuscriptShell
      manuscript={manuscript as Manuscript}
      initialChapters={(chapters ?? []) as Chapter[]}
      userId={user.id}
    />
  )
}
