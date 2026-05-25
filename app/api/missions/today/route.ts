import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DEFAULT_MISSIONS = [
  { id: 'vocab', title: '어휘 세션 완료 (EN 단어 + 문장 쓰기)', type: 'vocab', xp: 10, completed: false },
  { id: 'reading', title: '독서 30분 + 챕터 질문 답변', type: 'reading', xp: 10, completed: false },
  { id: 'essay', title: '에세이 문단 쓰기 또는 어휘 복습', type: 'essay', xp: 10, completed: false },
]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('mission_date', today)
    .single()

  if (existing) return NextResponse.json(existing)

  const { data: newMission, error } = await supabase
    .from('daily_missions')
    .insert({
      user_id: profile.id,
      mission_date: today,
      missions: DEFAULT_MISSIONS,
      completed_count: 0,
      all_done: false,
      xp_earned: 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(newMission)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { missionId } = await request.json()

  const { data: profile } = await supabase
    .from('profiles').select('id, xp_total').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  const { data: dm } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('mission_date', today)
    .single()

  if (!dm) return NextResponse.json({ error: 'No missions for today' }, { status: 404 })

  const missions = dm.missions.map((m: { id: string; xp: number; completed: boolean }) =>
    m.id === missionId ? { ...m, completed: true } : m
  )
  const completed = missions.filter((m: { completed: boolean }) => m.completed)
  const xpEarned = completed.reduce((sum: number, m: { xp: number }) => sum + m.xp, 0)
  const missionXP = missions.find((m: { id: string; xp: number }) => m.id === missionId)?.xp ?? 0

  await supabase.from('daily_missions').update({
    missions,
    completed_count: completed.length,
    all_done: completed.length === missions.length,
    xp_earned: xpEarned,
  }).eq('id', dm.id)

  await supabase.from('profiles').update({
    xp_total: profile.xp_total + missionXP,
  }).eq('id', profile.id)

  await supabase.from('xp_log').insert({
    user_id: profile.id,
    amount: missionXP,
    reason: `mission_${missionId}`,
  })

  return NextResponse.json({ success: true, xpEarned: missionXP })
}
