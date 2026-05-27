import type { SupabaseClient } from '@supabase/supabase-js'

const DEFAULT_MISSIONS = [
  { id: 'vocab', title: '어휘 세션 완료 (EN 단어 + 문장 쓰기)', type: 'vocab', xp: 10, completed: false },
  { id: 'reading', title: '독서 30분 + 챕터 질문 답변', type: 'reading', xp: 10, completed: false },
  { id: 'essay', title: '에세이 문단 쓰기 또는 어휘 복습', type: 'essay', xp: 10, completed: false },
]

// 실제 활동 완료 시 해당 타입의 미션을 자동 완료 처리
export async function autoCompleteMission(
  supabase: SupabaseClient,
  profileId: string,
  type: 'vocab' | 'essay' | 'reading',
): Promise<{ xpEarned: number }> {
  const today = new Date().toISOString().split('T')[0]

  // 오늘 미션 조회 (없으면 생성)
  let { data: dm } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', profileId)
    .eq('mission_date', today)
    .maybeSingle()

  if (!dm) {
    const { data: created } = await supabase
      .from('daily_missions')
      .insert({
        user_id: profileId,
        mission_date: today,
        missions: DEFAULT_MISSIONS,
        completed_count: 0,
        all_done: false,
        xp_earned: 0,
      })
      .select()
      .single()
    dm = created
  }

  if (!dm) return { xpEarned: 0 }

  const missions: Array<{ id: string; type: string; xp: number; completed: boolean }> = dm.missions
  const target = missions.find((m) => m.type === type)

  if (!target || target.completed) return { xpEarned: 0 }

  const updated = missions.map((m) => m.type === type ? { ...m, completed: true } : m)
  const completedCount = updated.filter((m) => m.completed).length

  await supabase.from('daily_missions').update({
    missions: updated,
    completed_count: completedCount,
    all_done: completedCount === updated.length,
    xp_earned: (dm.xp_earned ?? 0) + target.xp,
  }).eq('id', dm.id)

  return { xpEarned: target.xp }
}
