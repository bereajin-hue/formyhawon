'use client'

import { useState } from 'react'
import type { Profile, Milestone } from '@/types'

interface Mission { completed_count: number; all_done: boolean }
interface Essay { id: string; prompt_text: string; submitted_at: string; ai_feedback?: { scores?: { thesis_clarity?: { score: number } } } }
interface VocabSession { session_date: string; completed: boolean }

interface StudentData extends Profile {
  mission: Mission | null
  milestones: Milestone[]
  essays: Essay[]
  vocabSessions: VocabSession[]
}

interface Props {
  parentProfile: Profile
  students: StudentData[]
}

const MILESTONE_META: Record<number, { label: string; emoji: string; reward: string }> = {
  10: { label: '소보상 (500 XP)', emoji: '🎀', reward: '작은 선물' },
  20: { label: '중간보상 (900 XP)', emoji: '🏆', reward: '특별 외출' },
  30: { label: '대보상 (1500 XP)', emoji: '🎁', reward: '큰 보상' },
}

const GRADE_COLORS: Record<number, string> = {
  8: 'from-pink-400 to-rose-500',
  10: 'from-indigo-500 to-purple-600',
}

export default function ParentDashboard({ parentProfile, students }: Props) {
  const [approving, setApproving] = useState<string | null>(null)
  const [rewardInput, setRewardInput] = useState('')
  const [approvedIds, setApprovedIds] = useState<Set<string>>(
    new Set(students.flatMap((s) => s.milestones.filter((m) => m.parent_approved_at).map((m) => m.id))
    )
  )
  const [milestoneMap, setMilestoneMap] = useState<Record<string, Milestone[]>>(
    Object.fromEntries(students.map((s) => [s.id, s.milestones]))
  )

  async function handleApprove(milestoneId: string) {
    const res = await fetch('/api/milestones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId, rewardDescription: rewardInput }),
    })
    if (res.ok) {
      setApprovedIds((prev) => new Set([...prev, milestoneId]))
      setMilestoneMap((prev) => {
        const updated = { ...prev }
        for (const key of Object.keys(updated)) {
          updated[key] = updated[key].map((m) =>
            m.id === milestoneId ? { ...m, parent_approved_at: new Date().toISOString(), reward_description: rewardInput } : m
          )
        }
        return updated
      })
      setApproving(null)
      setRewardInput('')
    }
  }

  const pendingMilestones = students.flatMap((s) =>
    (milestoneMap[s.id] ?? [])
      .filter((m) => m.achieved_at && !approvedIds.has(m.id))
      .map((m) => ({ ...m, studentName: s.name, studentGrade: s.grade }))
  )

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">👨‍👩‍👧 부모 대시보드</h1>
        <p className="text-sm text-gray-400 mt-0.5">자녀들의 30일 챔린지 진행 현황</p>
      </div>

      {pendingMilestones.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <p className="font-bold text-yellow-800 mb-3">🏆 승인 대기 중인 마일스톤 {pendingMilestones.length}개</p>
          <div className="space-y-3">
            {pendingMilestones.map((m) => {
              const meta = MILESTONE_META[m.day_number as keyof typeof MILESTONE_META]
              return (
                <div key={m.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta?.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{m.studentName}</p>
                      <p className="text-xs text-gray-500">Day {m.day_number} {meta?.label} 달성!</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        달성일: {new Date(m.achieved_at!).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  {approving === m.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rewardInput}
                        onChange={(e) => setRewardInput(e.target.value)}
                        placeholder={`보상 내용 (예: ${meta?.reward})`}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <button
                        onClick={() => handleApprove(m.id)}
                        className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-lg transition-all"
                      >
                        확인
                      </button>
                      <button onClick={() => setApproving(null)} className="text-gray-400 hover:text-gray-600 text-sm">취소</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setApproving(m.id); setRewardInput('') }}
                      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-xl transition-all"
                    >
                      승인하기 ✓
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {students.map((student) => {
          const grade = student.grade ?? 10
          const gradientColor = GRADE_COLORS[grade] ?? 'from-indigo-500 to-purple-600'
          const studentMilestones = milestoneMap[student.id] ?? []
          const xp = student.xp_total
          const nextTarget = [500, 900, 1500].find((t) => xp < t) ?? 1500
          const pct = Math.min(100, Math.round((xp / nextTarget) * 100))

          return (
            <div key={student.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className={`bg-gradient-to-r ${gradientColor} p-5 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{student.name}</p>
                      <p className="text-sm text-white/70">Grade {grade} · {xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl">🔥</p>
                    <p className="text-sm font-medium">{student.streak_days}일 연속</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>다음 마일스톤까지</span>
                    <span>{xp} / {nextTarget} XP</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full">
                    <div className="h-2 bg-white rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">오늘 미션</span>
                  {student.mission ? (
                    student.mission.all_done ? (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">✅ 모두 완료</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{student.mission.completed_count} / 3 완료</span>
                    )
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">아직 시작 안 함</span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">마일스톤</p>
                  <div className="flex gap-2">
                    {[10, 20, 30].map((day) => {
                      const m = studentMilestones.find((ms) => ms.day_number === day)
                      const meta = MILESTONE_META[day]
                      return (
                        <div key={day} className={`flex-1 rounded-lg p-2 text-center text-xs ${
                          approvedIds.has(m?.id ?? '') || m?.parent_approved_at ? 'bg-green-50 text-green-600' :
                          m?.achieved_at ? 'bg-yellow-50 text-yellow-600' :
                          'bg-gray-50 text-gray-400'
                        }`}>
                          <p className="text-base">{meta.emoji}</p>
                          <p className="font-medium">Day {day}</p>
                          <p>{approvedIds.has(m?.id ?? '') || m?.parent_approved_at ? '승인됨' : m?.achieved_at ? '대기 중' : '미달성'}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {student.essays.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">최근 에세이</p>
                    <div className="space-y-1.5">
                      {student.essays.slice(0, 2).map((essay) => (
                        <div key={essay.id} className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-700 truncate">{essay.prompt_text || '(제목 없음)'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(essay.submitted_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {student.vocabSessions.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">최근 어휘 세션</span>
                    <span className="text-indigo-500 font-medium">
                      {student.vocabSessions.filter((v) => v.completed).length}회 완료
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {students.length === 0 && (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">👧</p>
          <p className="text-gray-500 font-medium">등록된 학생이 없어요</p>
          <p className="text-xs text-gray-400 mt-1">자녀가 Scholar Quest에 가입하면 여기에 표시됩니다</p>
        </div>
      )}
    </div>
  )
}
