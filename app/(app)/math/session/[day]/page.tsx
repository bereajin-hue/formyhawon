import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTopics } from '@/lib/math/topics'
import MathSessionStart from './MathSessionStart'

interface Props {
  params: Promise<{ day: string }>
}

export default async function MathSessionPage({ params }: Props) {
  const { day } = await params
  const dayNumber = parseInt(day, 10)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const grade = ([8, 9, 10, 11].includes(profile.grade ?? 10) ? (profile.grade ?? 10) : 10) as 8 | 9 | 10 | 11
  const topics = getTopics(grade)
  const topic = topics.find((t) => t.day === dayNumber)
  if (!topic) redirect('/math/review')

  const { data: session } = await supabase
    .from('math_sessions')
    .select('*')
    .eq('student_id', profile.id)
    .eq('day_number', dayNumber)
    .maybeSingle()

  return (
    <MathSessionStart
      profile={profile}
      dayNumber={dayNumber}
      topic={topic}
      existingSession={session}
    />
  )
}
