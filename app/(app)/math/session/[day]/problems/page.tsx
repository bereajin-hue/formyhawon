import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTopics } from '@/lib/math/topics'
import ProblemsClient from './ProblemsClient'

interface Props {
  params: Promise<{ day: string }>
}

export default async function ProblemsPage({ params }: Props) {
  const { day } = await params
  const dayNumber = parseInt(day, 10)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const grade = (profile.grade === 10 ? 10 : 8) as 8 | 10
  const topic = getTopics(grade).find((t) => t.day === dayNumber)
  if (!topic) redirect('/dashboard')

  const { data: session } = await supabase
    .from('math_sessions')
    .select('*')
    .eq('student_id', profile.id)
    .eq('day_number', dayNumber)
    .maybeSingle()

  if (!session) redirect(`/math/session/${dayNumber}`)

  const { data: existingProblems } = await supabase
    .from('math_problems')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })

  return (
    <ProblemsClient
      profile={profile}
      dayNumber={dayNumber}
      topic={topic}
      session={session}
      existingProblems={existingProblems ?? []}
    />
  )
}
