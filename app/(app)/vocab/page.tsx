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

  const { data: books } = await supabase
    .from('books')
    .select('id, title, author')
    .eq('user_id', profile.id)
    .eq('status', 'reading')
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]
  const { data: todaySession } = await supabase
    .from('vocab_sessions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('session_date', today)
    .maybeSingle()

  return (
    <VocabClient
      profile={profile}
      books={books ?? []}
      todaySession={todaySession ?? null}
    />
  )
}
