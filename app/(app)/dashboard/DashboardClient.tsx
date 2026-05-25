'use client'

import { useState, useEffect } from 'react'
import MissionCard from '@/components/gamification/MissionCard'
import Calendar30 from '@/components/gamification/Calendar30'
import XPBar from '@/components/gamification/XPBar'
import type { Profile, DailyMission, Mission } from '@/types'

interface Props {
  profile: Profile
  dailyMission: DailyMission | null
  completedDays: number[]
  startDate: string
  currentDay: number
}

export default function DashboardClient({ profile, dailyMission, completedDays, startDate, currentDay }: Props) {
  const [missions, setMissions] = useState<Mission[]>(dailyMission?.missions ?? [])
  const [xp, setXp] = useState(profile.xp_total)
  const [checkedIn, setCheckedIn] = useState(false)
  const [xpPopup, setXpPopup] = useState<number | null>(null)

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
          setXp((prev) => prev + d.xp)
          setCheckedIn(true)
          showXpPopup(d.xp)
        }
      })
  }, [])

  function showXpPopup(amount: number) {
    setXpPopup(amount)
    setTimeout(() => setXpPopup(null), 2500)
  }

  async function handleMissionComplete(missionId: string) {
    const res = await fetch('/api/missions/today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId }),
    })
    const data = await res.json()
    if (data.success) {
      setMissions((prev) => prev.map((m) => m.id === missionId ? { ...m, completed: true } : m))
      setXp((prev) => prev + data.xpEarned)
      showXpPopup(data.xpEarned)
    }
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

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, {profile.name}님! 👋
          </h1>
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
              <MissionCard
                key={mission.id}
                mission={mission}
                onComplete={handleMissionComplete}
              />
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
          {[
            { day: 10, xp: 500, label: '소보상' },
            { day: 20, xp: 900, label: '중간보상' },
            { day: 30, xp: 1500, label: '대보상 🎁' },
          ].map((m) => (
            <div key={m.day} className={`rounded-xl p-3 text-center border ${xp >= m.xp ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
              <p className="text-xs text-gray-500">Day {m.day}</p>
              <p className="font-bold text-sm text-gray-700 mt-0.5">{m.xp} XP</p>
              <p className="text-xs text-gray-400">{m.label}</p>
              {xp >= m.xp && <p className="text-xs text-green-500 mt-1 font-medium">달성! ✓</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <Calendar30
          completedDays={completedDays}
          startDate={startDate}
          currentDay={currentDay}
        />
      </div>
    </div>
  )
}
