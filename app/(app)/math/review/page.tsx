import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MathReviewClient from './MathReviewClient'

export default async function MathReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const today = new Date().toISOString().split('T')[0]

  const { data: reviewItems } = await supabase
    .from('math_review_queue')
    .select(`
      *,
      problem:math_problems (*)
    `)
    .eq('student_id', profile.id)
    .lte('scheduled_date', today)
    .eq('completed', false)
    .order('scheduled_date', { ascending: true })

  return (
    <MathReviewClient
      profile={profile}
      reviewItems={reviewItems ?? []}
    />
  )
}
