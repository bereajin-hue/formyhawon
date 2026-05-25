import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import BookDetailClient from './BookDetailClient'

export default async function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const { data: book } = await supabase
    .from('books').select('*').eq('id', bookId).single()
  if (!book) notFound()

  // 캐시된 학습 자료 조회
  const { data: quest } = await supabase
    .from('book_quests')
    .select('content')
    .eq('book_title', book.title)
    .eq('book_author', book.author)
    .eq('grade_level', book.grade_level ?? profile.grade ?? 10)
    .single()

  return (
    <BookDetailClient
      book={book}
      profile={profile}
      initialContent={quest?.content ?? null}
    />
  )
}
