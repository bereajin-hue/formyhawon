import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 임시 어드민 엔드포인트 — 자신의 수학 데이터 전체 리셋
// 사용: POST /api/admin/reset-math  (로그인 상태 필요)
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // j@agentt.kr 테스트 계정만 허용
  if (user.email !== 'j@agentt.kr') {
    return NextResponse.json({ error: 'Forbidden — test account only' }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const pid = profile.id

  // 수학 관련 테이블 순서대로 삭제 (FK 의존성 고려)
  const steps: string[] = []

  const { error: e1 } = await supabase.from('math_review_queue').delete().eq('student_id', pid)
  steps.push(e1 ? `review_queue error: ${e1.message}` : 'math_review_queue ✓')

  const { error: e2 } = await supabase.from('math_problems').delete().eq('student_id', pid)
  steps.push(e2 ? `math_problems error: ${e2.message}` : 'math_problems ✓')

  const { error: e3 } = await supabase.from('math_daily_reports').delete().eq('student_id', pid)
  steps.push(e3 ? `daily_reports error: ${e3.message}` : 'math_daily_reports ✓')

  const { error: e4 } = await supabase.from('math_sessions').delete().eq('student_id', pid)
  steps.push(e4 ? `math_sessions error: ${e4.message}` : 'math_sessions ✓')

  return NextResponse.json({ success: true, steps })
}
