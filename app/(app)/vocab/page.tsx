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
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'reading')
    .order('created_at', { ascending: false })

  const { data: essayRows } = await supabase
    .from('essays')
    .select('book_id')
    .eq('user_id', profile.id)
    .not('book_id', 'is', null)

  const essayBookIds = new Set(essayRows?.map((e) => e.book_id).filter(Boolean) ?? [])
  const booksWithEssays = (books ?? []).filter((b) => essayBookIds.has(b.id))

  const today = new Date().toISOString().split('T')[0]
  const { data: todaySession } = await supabase
    .from('vocab_sessions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('session_date', today)
    .maybeSingle()

  return (
    <VocabClient
      readingBooks={books ?? []}
      booksWithEssays={booksWithEssays}
      todaySession={todaySession ?? null}
    />
  )
}
