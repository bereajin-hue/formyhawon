import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTopics } from '@/lib/math/topics'
import MathProgressClient from './MathProgressClient'

export default async function MathProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const grade = ([8, 9, 10, 11].includes(profile.grade ?? 10) ? (profile.grade ?? 10) : 10) as 8 | 9 | 10 | 11
  const topics = getTopics(grade)

  const [{ data: sessions }, { data: reports }, { data: reviewQueue }] = await Promise.all([
    supabase.from('math_sessions').select('*')
      .eq('student_id', profile.id).order('day_number', { ascending: true }),
    supabase.from('math_daily_reports').select('*')
      .eq('student_id', profile.id).order('day_number', { ascending: true }),
    supabase.from('math_review_queue').select('scheduled_date')
      .eq('student_id', profile.id).eq('completed', false),
  ])

  const completedSessions = (sessions ?? []).filter(s => s.status === 'completed')
  const totalXp = completedSessions.reduce((sum, s) => sum + (s.xp_earned ?? 0), 0)
  const level = Math.floor(totalXp / 500) + 1

  const areaStats = topics.reduce((acc, topic) => {
    const session = (sessions ?? []).find(s => s.day_number === topic.day)
    const report = (reports ?? []).find(r => r.day_number === topic.day)
    if (!acc[topic.area]) acc[topic.area] = { correct: 0, total: 0 }
    if (report) {
      acc[topic.area].correct += report.correct_count ?? 0
      acc[topic.area].total += report.total_problems ?? 0
    }
    return acc
  }, {} as Record<string, { correct: number; total: number }>)

  const reviewByDate = (reviewQueue ?? []).reduce((acc, item) => {
    acc[item.scheduled_date] = (acc[item.scheduled_date] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <MathProgressClient
      profile={profile}
      sessions={sessions ?? []}
      reports={reports ?? []}
      topics={topics}
      completedCount={completedSessions.length}
      totalXp={totalXp}
      level={level}
      areaStats={areaStats}
      reviewByDate={reviewByDate}
    />
  )
}
