import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')
  if (profile.role === 'parent') redirect('/parent')

  const today = new Date().toISOString().split('T')[0]

  // 오늘의 미션 조회
  const { data: dailyMission } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('mission_date', today)
    .single()

  // 완료된 날 목록 (30일 캘린더용)
  const { data: allMissions } = await supabase
    .from('daily_missions')
    .select('mission_date, all_done')
    .eq('user_id', profile.id)
    .order('mission_date', { ascending: true })

  // 챌린지 시작일 계산 (첫 미션 날짜 또는 오늘)
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

  return (
    <DashboardClient
      profile={profile}
      dailyMission={dailyMission}
      completedDays={completedDays}
      startDate={startDate}
      currentDay={currentDay}
    />
  )
}
