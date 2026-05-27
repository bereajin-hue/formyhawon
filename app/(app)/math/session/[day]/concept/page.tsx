import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTopics } from '@/lib/math/topics'
import ConceptView from './ConceptView'
import type { MathConceptSummary } from '@/types'

interface Props {
  params: Promise<{ day: string }>
}

export default async function ConceptPage({ params }: Props) {
  const { day } = await params
  const dayNumber = parseInt(day, 10)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const grade = ([8, 9, 10, 11].includes(profile.grade ?? 10) ? (profile.grade ?? 10) : 10) as 8 | 9 | 10 | 11
  const topic = getTopics(grade).find((t) => t.day === dayNumber)
  if (!topic) redirect('/dashboard')

  const { data: session } = await supabase
    .from('math_sessions')
    .select('*')
    .eq('student_id', profile.id)
    .eq('day_number', dayNumber)
    .maybeSingle()

  if (!session) redirect(`/math/session/${dayNumber}`)

  const summary: MathConceptSummary | null = session.concept_summary ?? null

  return (
    <ConceptView
      dayNumber={dayNumber}
      topic={topic}
      summary={summary}
      sessionId={session.id}
      grade={profile.grade ?? 8}
      profile={profile}
    />
  )
}
