import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LibraryClient from './LibraryClient'

export default async function LibraryPage() {
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
    .order('created_at', { ascending: false })

  return <LibraryClient initialBooks={books ?? []} profile={profile} />
}
