import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EssayEditorClient from './EssayEditorClient'

export default async function EssayPage({ params }: { params: Promise<{ essayId: string }> }) {
  const { essayId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const { data: essay } = await supabase
    .from('essays')
    .select('*, books(title)')
    .eq('id', essayId)
    .single()
  if (!essay) notFound()

  return (
    <EssayEditorClient
      profile={profile}
      essayId={essay.id}
      initialContent={essay.content}
      promptText={essay.prompt_text}
      bookId={essay.book_id}
      bookTitle={(essay.books as { title: string } | null)?.title ?? ''}
      existingFeedback={essay.ai_feedback}
    />
  )
}
