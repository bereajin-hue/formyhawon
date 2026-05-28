import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VocabClient from './VocabClient'

export default async function VocabPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: books }, { data: todaySession }] = await Promise.all([
    supabase.from('books').select('*')
      .eq('user_id', profile.id).eq('status', 'reading')
      .order('created_at', { ascending: false }),
    supabase.from('vocab_sessions').select('*')
      .eq('user_id', profile.id).eq('session_date', today).maybeSingle(),
  ])

  return (
    <VocabClient
      readingBooks={books ?? []}
      todaySession={todaySession ?? null}
    />
  )
}
