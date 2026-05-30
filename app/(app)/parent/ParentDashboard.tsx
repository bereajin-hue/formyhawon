'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
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

const GRADE_COLORS: Record<number, string> = {
  8: 'from-pink-400 to-rose-500',
  10: 'from-indigo-500 to-purple-600',
}

export default function ParentDashboard({ parentProfile, students }: Props) {
  const { t, lang } = useT()
  const [approving, setApproving] = useState<string | null>(null)
  const [rewardInput, setRewardInput] = useState('')
  const [approvedIds, setApprovedIds] = useState<Set<string>>(
    new Set(students.flatMap((s) => s.milestones.filter((m) => m.parent_approved_at).map((m) => m.id)))
  )
  const [milestoneMap, setMilestoneMap] = useState<Record<string, Milestone[]>>(
    Object.fromEntries(students.map((s) => [s.id, s.milestones]))
  )

  const MILESTONE_META: Record<number, { label: string; emoji: string; reward: string }> = {
    10: { label: t(T.parent.milestoneLabel[10]), emoji: '🎀', reward: t(T.parent.milestoneReward[10]) },
    20: { label: t(T.parent.milestoneLabel[20]), emoji: '🏆', reward: t(T.parent.milestoneReward[20]) },
    30: { label: t(T.parent.milestoneLabel[30]), emoji: '🎁', reward: t(T.parent.milestoneReward[30]) },
  }

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
        <h1 className="text-xl font-bold text-gray-900">{t(T.parent.title)}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t(T.parent.subtitle)}</p>
      </div>

      {pendingMilestones.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <p className="font-bold text-yellow-800 mb-3">{T.parent.pendingMilestones(pendingMilestones.length, lang)}</p>
          <div className="space-y-3">
            {pendingMilestones.map((m) => {
              const meta = MILESTONE_META[m.day_number as keyof typeof MILESTONE_META]
              return (
                <div key={m.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta?.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{m.studentName}</p>
                      <p className="text-xs text-gray-500">Day {m.day_number} {meta?.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t(T.parent.achievedOn)} {new Date(m.achieved_at!).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  {approving === m.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rewardInput}
                        onChange={(e) => setRewardInput(e.target.value)}
                        placeholder={T.parent.rewardPlaceholder(meta?.reward ?? '', lang)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <button
                        onClick={() => handleApprove(m.id)}
                        className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-lg transition-all"
                      >
                        {t(T.parent.confirm)}
                      </button>
                      <button onClick={() => setApproving(null)} className="text-gray-400 hover:text-gray-600 text-sm">{t(T.common.cancel)}</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setApproving(m.id); setRewardInput('') }}
                      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-xl transition-all"
                    >
                      {t(T.parent.approve)}
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
          const nextTarget = [900, 1900, 3200].find((t) => xp < t) ?? 3200
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
                    <p className="text-sm font-medium">{T.parent.streakDays(student.streak_days, lang)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>{t(T.parent.nextMilestone)}</span>
                    <span>{xp} / {nextTarget} XP</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full">
                    <div className="h-2 bg-white rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t(T.parent.todayMission)}</span>
                  {student.mission ? (
                    student.mission.all_done ? (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">{t(T.parent.allDone)}</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{T.parent.missionsPartial(student.mission.completed_count, lang)}</span>
                    )
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">{t(T.parent.noProgress)}</span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{t(T.parent.milestones)}</p>
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
                          <p>{
                            approvedIds.has(m?.id ?? '') || m?.parent_approved_at
                              ? t(T.parent.achievedApproved)
                              : m?.achieved_at
                              ? t(T.parent.achievedPending)
                              : t(T.parent.notAchieved)
                          }</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {student.essays.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{t(T.parent.recentEssays)}</p>
                    <div className="space-y-1.5">
                      {student.essays.slice(0, 2).map((essay) => (
                        <div key={essay.id} className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-700 truncate">{essay.prompt_text || t(T.common.noTitle)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(essay.submitted_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {student.vocabSessions.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t(T.parent.recentVocab)}</span>
                    <span className="text-indigo-500 font-medium">
                      {T.parent.vocabComplete(student.vocabSessions.filter((v) => v.completed).length, lang)}
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
          <p className="text-gray-500 font-medium">{t(T.parent.noStudents)}</p>
          <p className="text-xs text-gray-400 mt-1">{t(T.parent.noStudentsDesc)}</p>
        </div>
      )}
    </div>
  )
}
