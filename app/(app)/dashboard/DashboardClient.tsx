'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MissionCard from '@/components/gamification/MissionCard'
import Calendar30 from '@/components/gamification/Calendar30'
import XPBar from '@/components/gamification/XPBar'
import type { Profile, DailyMission, Mission, Milestone } from '@/types'

const MILESTONE_META = [
  { day: 10, xp: 500, label: '소보상', emoji: '🎀' },
  { day: 20, xp: 900, label: '중간보상', emoji: '🏆' },
  { day: 30, xp: 1500, label: '대보상', emoji: '🎁' },
]

interface Props {
  profile: Profile
  dailyMission: DailyMission | null
  completedDays: number[]
  startDate: string
  currentDay: number
  milestones: Milestone[]
}

export default function DashboardClient({ profile, dailyMission, completedDays, startDate, currentDay, milestones: initialMilestones }: Props) {
  const [missions, setMissions] = useState<Mission[]>(dailyMission?.missions ?? [])
  const [xp, setXp] = useState(profile.xp_total)
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
  const [checkedIn, setCheckedIn] = useState(false)
  const [xpPopup, setXpPopup] = useState<number | null>(null)
  const [milestonePopup, setMilestonePopup] = useState<number | null>(null)

  useEffect(() => {
    if (!dailyMission) {
      fetch('/api/missions/today')
        .then((r) => r.json())
        .then((d) => setMissions(d.missions ?? []))
    }
    fetch('/api/xp/checkin', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const newXp = profile.xp_total + d.xp
          setXp(newXp)
          setCheckedIn(true)
          showXpPopup(d.xp)
          checkMilestones(newXp)
        }
      })
  }, [])

  function showXpPopup(amount: number) {
    setXpPopup(amount)
    setTimeout(() => setXpPopup(null), 2500)
  }

  async function checkMilestones(_newXp: number) {
    const res = await fetch('/api/milestones', { method: 'POST' })
    const data = await res.json()
    if (data.milestones) {
      setMilestones(data.milestones)
      if (data.newCount > 0) {
        setMilestonePopup(data.newCount)
        setTimeout(() => setMilestonePopup(null), 4000)
      }
    }
  }

  async function handleMissionComplete(missionId: string) {
    const res = await fetch('/api/missions/today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId }),
    })
    const data = await res.json()
    if (data.success) {
      const newXp = xp + data.xpEarned
      setMissions((prev) => prev.map((m) => m.id === missionId ? { ...m, completed: true } : m))
      setXp(newXp)
      showXpPopup(data.xpEarned)
      checkMilestones(newXp)
    }
  }

  function getMilestoneStatus(dayNumber: number) {
    const m = milestones.find((m) => m.day_number === dayNumber)
    if (!m) return 'locked'
    if (m.parent_approved_at) return 'approved'
    return 'pending'
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
  const completedCount = missions.filter((m) => m.completed).length
  const allDone = completedCount === missions.length && missions.length > 0

  return (
    <div className="max-w-4xl relative">
      {xpPopup !== null && (
        <div className="fixed top-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg animate-bounce font-bold text-lg">
          +{xpPopup} XP! ✨
        </div>
      )}
      {milestonePopup !== null && (
        <div className="fixed top-24 right-8 z-50 bg-yellow-400 text-yellow-900 px-5 py-3 rounded-2xl shadow-lg font-bold text-base">
          🏆 마일스톤 달성! 부모님 승인을 기다려요
        </div>
      )}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {profile.name}님! 👋</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {dateStr} · <span className="font-semibold text-indigo-600">Day {currentDay} / 30</span>
          </p>
        </div>
        {checkedIn && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-600 font-medium">
            ✅ 오늘 체크인 +5 XP
          </div>
        )}
      </div>

      {allDone && (
        <div className="mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-5 text-white shadow-md">
          <p className="font-bold text-lg">🎉 오늘 미션 모두 완료!</p>
          <p className="text-sm opacity-90 mt-1">훌륭해요! 내일도 이 기세로 달려봐요.</p>
        </div>
      )}

      {currentDay >= 20 && (
        <Link href="/certificate" className="block mb-6">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.01]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">🎓 수료증 보기</p>
                <p className="text-sm opacity-90 mt-1">지금까지의 학습 성과를 확인하고 인쇄해보세요!</p>
              </div>
              <span className="text-3xl">→</span>
            </div>
          </div>
        </Link>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">오늘의 미션</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {completedCount} / {missions.length} 완료
          </span>
        </div>
        {missions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} onComplete={handleMissionComplete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">미션 불러오는 중...</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">XP 현황</h2>
          <span className="text-2xl font-bold text-indigo-600">{xp.toLocaleString()} XP</span>
        </div>
        <XPBar current={xp} />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {MILESTONE_META.map((m) => {
            const status = getMilestoneStatus(m.day)
            return (
              <div key={m.day} className={`rounded-xl p-3 text-center border transition-all ${
                status === 'approved' ? 'border-green-300 bg-green-50' :
                status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
                xp >= m.xp ? 'border-indigo-200 bg-indigo-50' :
                'border-gray-100 bg-gray-50'
              }`}>
                <p className="text-lg mb-0.5">{m.emoji}</p>
                <p className="text-xs text-gray-500">Day {m.day}</p>
                <p className="font-bold text-sm text-gray-700">{m.xp} XP</p>
                <p className="text-xs text-gray-400">{m.label}</p>
                {status === 'approved' && (
                  <p className="text-xs text-green-600 mt-1 font-medium">달성! ✓ 승인됨</p>
                )}
                {status === 'pending' && (
                  <p className="text-xs text-yellow-600 mt-1 font-medium">달성! 승인 대기 중</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <Calendar30 completedDays={completedDays} startDate={startDate} currentDay={currentDay} />
      </div>
    </div>
  )
}
