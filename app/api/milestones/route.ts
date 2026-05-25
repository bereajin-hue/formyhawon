import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const THRESHOLDS = [
  { day_number: 10, xp_required: 500 },
  { day_number: 20, xp_required: 900 },
  { day_number: 30, xp_required: 1500 },
]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const { data: milestones } = await supabase
    .from('milestones').select('*').eq('user_id', profile.id)
    .order('day_number', { ascending: true })

  return NextResponse.json({ milestones: milestones ?? [] })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id, xp_total').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const { data: existing } = await supabase
    .from('milestones').select('day_number').eq('user_id', profile.id)

  const existingDays = new Set(existing?.map((m) => m.day_number) ?? [])
  const toInsert = THRESHOLDS.filter(
    (t) => profile.xp_total >= t.xp_required && !existingDays.has(t.day_number)
  ).map((t) => ({
    user_id: profile.id,
    day_number: t.day_number,
    xp_required: t.xp_required,
    achieved_at: new Date().toISOString(),
  }))

  if (toInsert.length > 0) {
    await supabase.from('milestones').insert(toInsert)
  }

  const { data: milestones } = await supabase
    .from('milestones').select('*').eq('user_id', profile.id)
    .order('day_number', { ascending: true })

  return NextResponse.json({ milestones: milestones ?? [], newCount: toInsert.length })
}

export async function PATCH(request: Request) {
  const { milestoneId, rewardDescription } = await request.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('user_id', user.id).single()
  if (!profile || profile.role !== 'parent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await supabase.from('milestones').update({
    parent_approved_at: new Date().toISOString(),
    reward_description: rewardDescription ?? '',
  }).eq('id', milestoneId)

  return NextResponse.json({ success: true })
}
