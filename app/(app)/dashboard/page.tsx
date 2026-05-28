import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

const THRESHOLDS = [
  { day_number: 10, xp_required: 500 },
  { day_number: 20, xp_required: 900 },
  { day_number: 30, xp_required: 1500 },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')
  if (profile.role === 'parent') redirect('/parent')

  const today = new Date().toISOString().split('T')[0]

  const [
    { data: dailyMission },
    { data: allMissions },
    { data: existingMilestones },
  ] = await Promise.all([
    supabase.from('daily_missions').select('*')
      .eq('user_id', profile.id).eq('mission_date', today).single(),
    supabase.from('daily_missions').select('mission_date, all_done')
      .eq('user_id', profile.id).order('mission_date', { ascending: true }),
    supabase.from('milestones').select('*').eq('user_id', profile.id)
      .order('day_number', { ascending: true }),
  ])

  const startDate = allMissions?.[0]?.mission_date ?? today
  const start = new Date(startDate)
  const todayDate = new Date(today)
  const currentDay = Math.min(30, Math.floor((todayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

  const completedDays = (allMissions ?? [])
    .filter((m) => m.all_done)
    .map((m) => {
      const d = new Date(m.mission_date)
      return Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    })

  const existingDays = new Set(existingMilestones?.map((m: { day_number: number }) => m.day_number) ?? [])
  const toInsert = THRESHOLDS.filter(
    (t) => profile.xp_total >= t.xp_required && !existingDays.has(t.day_number)
  ).map((t) => ({
    user_id: profile.id,
    day_number: t.day_number,
    xp_required: t.xp_required,
    achieved_at: new Date().toISOString(),
  }))

  let milestones = existingMilestones ?? []
  if (toInsert.length > 0) {
    const { data: inserted } = await supabase.from('milestones').insert(toInsert).select()
    milestones = [...milestones, ...(inserted ?? [])].sort((a, b) => a.day_number - b.day_number)
  }

  return (
    <DashboardClient
      profile={profile}
      dailyMission={dailyMission}
      completedDays={completedDays}
      startDate={startDate}
      currentDay={currentDay}
      milestones={milestones}
    />
  )
}
