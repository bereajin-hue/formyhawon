import { createClient } from '@/lib/supabase/server'
import { autoCompleteMission } from '@/lib/missions'
import { NextResponse } from 'next/server'

// 챕터 질문 탭 접근 시 호출 — 책이 등록된 경우에만 reading 미션 자동 완료
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  // 등록된 책이 1권 이상 있는지 확인
  const { count } = await supabase
    .from('books')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  if (!count || count === 0) {
    return NextResponse.json({ xpEarned: 0, reason: 'no_books' })
  }

  const { xpEarned } = await autoCompleteMission(supabase, profile.id, 'reading')
  return NextResponse.json({ xpEarned })
}
