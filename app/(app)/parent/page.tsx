import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ParentDashboard from './ParentDashboard'

export default async function ParentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')
  if (profile.role !== 'parent') redirect('/dashboard')

  const { data: students } = await supabase
    .from('profiles').select('*').eq('role', 'student')
    .order('created_at', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

  const studentsWithData = await Promise.all(
    (students ?? []).map(async (student) => {
      const { data: mission } = await supabase
        .from('daily_missions').select('completed_count, all_done')
        .eq('user_id', student.id).eq('mission_date', today).maybeSingle()

      const { data: milestones } = await supabase
        .from('milestones').select('*').eq('user_id', student.id)
        .order('day_number', { ascending: true })

      const { data: essays } = await supabase
        .from('essays').select('id, prompt_text, submitted_at, ai_feedback')
        .eq('user_id', student.id)
        .order('submitted_at', { ascending: false }).limit(3)

      const { data: vocabSessions } = await supabase
        .from('vocab_sessions').select('session_date, completed')
        .eq('user_id', student.id)
        .order('session_date', { ascending: false }).limit(10)

      return {
        ...student,
        mission: mission ?? null,
        milestones: milestones ?? [],
        essays: essays ?? [],
        vocabSessions: vocabSessions ?? [],
      }
    })
  )

  return <ParentDashboard parentProfile={profile} students={studentsWithData} />
}
