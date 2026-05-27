import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTopics } from '@/lib/math/topics'
import MathDashboardClient from './MathDashboardClient'

export default async function MathDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')
  if (profile.role === 'parent') redirect('/parent')

  const rawGrade = profile.grade ?? 10
  const grade = ([8, 9, 10, 11].includes(rawGrade) ? rawGrade : 10) as 8 | 9 | 10 | 11
  const topics = getTopics(grade)

  const { data: sessions } = await supabase
    .from('math_sessions')
    .select('*')
    .eq('student_id', profile.id)
    .order('day_number', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

  const { data: reviewItems } = await supabase
    .from('math_review_queue')
    .select('id')
    .eq('student_id', profile.id)
    .lte('scheduled_date', today)
    .eq('completed', false)

  const completedDays = (sessions ?? [])
    .filter(s => s.status === 'completed')
    .map(s => s.day_number)

  const sessionMap = Object.fromEntries(
    (sessions ?? []).map(s => [s.day_number, s])
  )

  const latestCompleted = Math.max(0, ...completedDays)
  const currentDay = Math.min(30, latestCompleted + 1)

  return (
    <MathDashboardClient
      profile={profile}
      topics={topics}
      sessionMap={sessionMap}
      currentDay={currentDay}
      completedDays={completedDays}
      reviewCount={reviewItems?.length ?? 0}
    />
  )
}
