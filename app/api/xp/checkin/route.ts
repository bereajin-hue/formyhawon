import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  if (profile.last_active === today) {
    return NextResponse.json({ alreadyCheckedIn: true, xp: 0 })
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const newStreak = profile.last_active === yesterdayStr ? profile.streak_days + 1 : 1

  await supabase.from('profiles').update({
    xp_total: profile.xp_total + 5,
    streak_days: newStreak,
    last_active: today,
  }).eq('id', profile.id)

  await supabase.from('xp_log').insert({
    user_id: profile.id,
    amount: 5,
    reason: 'daily_checkin',
  })

  return NextResponse.json({ success: true, xp: 5, streak: newStreak })
}
