import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EssayEditorClient from '../[essayId]/EssayEditorClient'

export default async function NewEssayPage({
  searchParams,
}: {
  searchParams: Promise<{ bookId?: string; prompt?: string }>
}) {
  const { bookId, prompt } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  let bookTitle = ''
  if (bookId) {
    const { data: book } = await supabase
      .from('books').select('title').eq('id', bookId).single()
    bookTitle = book?.title ?? ''
  }

  return (
    <EssayEditorClient
      profile={profile}
      essayId={null}
      initialContent=""
      promptText={prompt ? decodeURIComponent(prompt) : ''}
      bookId={bookId ?? null}
      bookTitle={bookTitle}
      existingFeedback={null}
    />
  )
}
