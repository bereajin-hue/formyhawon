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

  // 책 목록도 함께 불러오기 (책 선택 드롭다운용)
  const { data: books } = await supabase
    .from('books')
    .select('id, title, author')
    .eq('user_id', profile.id)
    .eq('status', 'reading')
    .order('created_at', { ascending: false })

  let bookTitle = ''
  let bookAuthor = ''
  if (bookId) {
    const found = books?.find((b) => b.id === bookId)
    bookTitle = found?.title ?? ''
    bookAuthor = found?.author ?? ''
  }

  return (
    <EssayEditorClient
      profile={profile}
      essayId={null}
      initialContent=""
      promptText={prompt ? decodeURIComponent(prompt) : ''}
      bookId={bookId ?? null}
      bookTitle={bookTitle}
      bookAuthor={bookAuthor}
      existingFeedback={null}
      availableBooks={books ?? []}
    />
  )
}
