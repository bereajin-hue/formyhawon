import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CertificateClient from './CertificateClient'

export default async function CertificatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')
  if (profile.role === 'parent') redirect('/parent')

  const today = new Date().toISOString().split('T')[0]

  const { data: allMissions } = await supabase
    .from('daily_missions').select('mission_date, all_done')
    .eq('user_id', profile.id).order('mission_date', { ascending: true })

  const startDate = allMissions?.[0]?.mission_date ?? today
  const start = new Date(startDate)
  const todayDate = new Date(today)
  const currentDay = Math.min(30, Math.floor((todayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const completedDays = (allMissions ?? []).filter((m) => m.all_done).length

  const { data: essays } = await supabase
    .from('essays').select('id').eq('user_id', profile.id)
  const { data: vocabSessions } = await supabase
    .from('vocab_sessions').select('id').eq('user_id', profile.id).eq('completed', true)
  const { data: milestones } = await supabase
    .from('milestones').select('*').eq('user_id', profile.id).order('day_number', { ascending: true })

  const approvedMilestones = (milestones ?? []).filter((m) => m.parent_approved_at)

  return (
    <CertificateClient
      profile={profile}
      startDate={startDate}
      currentDay={currentDay}
      completedDays={completedDays}
      essayCount={essays?.length ?? 0}
      vocabCount={vocabSessions?.length ?? 0}
      approvedMilestones={approvedMilestones}
    />
  )
}
