import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WritingListClient from './WritingListClient'

export default async function WritingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const { data: essays } = await supabase
    .from('essays')
    .select('*, books(title)')
    .eq('user_id', profile.id)
    .order('submitted_at', { ascending: false })

  return <WritingListClient essays={essays ?? []} />
}
