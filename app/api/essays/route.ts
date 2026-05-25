import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { autoCompleteMission } from '@/lib/missions'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const { data: essays } = await supabase
    .from('essays')
    .select('*, books(title, author)')
    .eq('user_id', profile.id)
    .order('submitted_at', { ascending: false })

  return NextResponse.json(essays ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookId, promptText, content } = await request.json()

  const { data: profile } = await supabase
    .from('profiles').select('id, xp_total').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const { data: essay, error } = await supabase
    .from('essays')
    .insert({
      user_id: profile.id,
      book_id: bookId || null,
      prompt_text: promptText,
      content,
      word_count: wordCount,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(essay)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { essayId, content, aiFeedback, xpBonus, isRevision } = await request.json()

  const { data: profile } = await supabase
    .from('profiles').select('id, xp_total').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const wordCount = content?.trim().split(/\s+/).filter(Boolean).length
  const { data: existing } = await supabase
    .from('essays').select('revision_count').eq('id', essayId).single()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (content) { updates.content = content; updates.word_count = wordCount }
  if (aiFeedback) updates.ai_feedback = aiFeedback
  if (isRevision) updates.revision_count = (existing?.revision_count ?? 0) + 1

  await supabase.from('essays').update(updates).eq('id', essayId)

  if (aiFeedback) {
    const baseXP = isRevision ? 10 : 20
    const totalXP = baseXP + (xpBonus ?? 0)

    // 첫 제출 시에만 에세이 미션 자동 완료
    let missionXp = 0
    if (!isRevision) {
      const result = await autoCompleteMission(supabase, profile.id, 'essay')
      missionXp = result.xpEarned
    }

    const grandTotal = totalXP + missionXp
    await supabase.from('profiles').update({ xp_total: profile.xp_total + grandTotal }).eq('id', profile.id)
    await supabase.from('xp_log').insert({
      user_id: profile.id,
      amount: grandTotal,
      reason: isRevision ? 'essay_revised' : 'essay_submitted',
    })
    return NextResponse.json({ success: true, xpEarned: grandTotal, missionXp })
  }

  return NextResponse.json({ success: true, xpEarned: 0 })
}
