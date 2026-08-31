import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // RLS를 우회해서 모든 학생 프로필 조회 (서버사이드 전용)
  const admin = createAdminClient()

  const { data: students } = await admin
    .from('profiles').select('*').eq('role', 'student')
    .order('created_at', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

  const studentsWithData = await Promise.all(
    (students ?? []).map(async (student) => {
      const [
        { data: mission },
        { data: milestones },
        { data: essays },
        { data: vocabSessions },
      ] = await Promise.all([
        admin.from('daily_missions').select('completed_count, all_done').eq('user_id', student.id).eq('mission_date', today).maybeSingle(),
        admin.from('milestones').select('*').eq('user_id', student.id).order('day_number', { ascending: true }),
        admin.from('essays').select('id, prompt_text, submitted_at, ai_feedback').eq('user_id', student.id).order('submitted_at', { ascending: false }).limit(3),
        admin.from('vocab_sessions').select('session_date, completed').eq('user_id', student.id).order('session_date', { ascending: false }).limit(10),
      ])

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
