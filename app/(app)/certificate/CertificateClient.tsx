'use client'

import { useRef } from 'react'
import type { Profile, Milestone } from '@/types'

interface Props {
  profile: Profile
  startDate: string
  currentDay: number
  completedDays: number
  essayCount: number
  vocabCount: number
  approvedMilestones: Milestone[]
}

const MILESTONE_META: Record<number, { label: string; emoji: string }> = {
  10: { label: '소보상', emoji: '🎀' },
  20: { label: '중간보상', emoji: '🏆' },
  30: { label: '대보상', emoji: '🎁' },
}

export default function CertificateClient({
  profile,
  startDate,
  currentDay,
  completedDays,
  essayCount,
  vocabCount,
  approvedMilestones,
}: Props) {
  const certRef = useRef<HTMLDivElement>(null)

  const isComplete = completedDays >= 25 || currentDay >= 30
  const completionRate = Math.round((completedDays / 30) * 100)

  const startFmt = new Date(startDate).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  function handlePrint() {
    window.print()
  }

  return (
    <div className="max-w-3xl">
      {/* 화면 전용 헤더 */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🎓 30일 챌린지 수료증</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isComplete
              ? '축하해요! 챌린지를 훌륭하게 완료했어요.'
              : `현재 Day ${currentDay} 진행 중 · 완료 시 수료증이 발급됩니다.`}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          🖨️ 인쇄하기
        </button>
      </div>

      {/* 수료증 본체 */}
      <div
        ref={certRef}
        className="certificate-card bg-white relative overflow-hidden"
        style={{
          border: '8px solid transparent',
          borderImage: 'linear-gradient(135deg, #6366f1, #a855f7, #6366f1) 1',
          padding: '48px 56px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          borderRadius: '0',
        }}
      >
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-full -translate-y-32 translate-x-32 opacity-60" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-50 to-transparent rounded-full translate-y-32 -translate-x-32 opacity-60" />
        </div>

        <div className="relative">
          {/* 상단 로고 영역 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-2xl shadow-md mb-4">
              <span className="text-xl">📚</span>
              <span className="font-bold text-base tracking-wide">Scholar Quest</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">30-Day English Challenge</p>
          </div>

          {/* 수료증 타이틀 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 mb-1 tracking-tight">수 료 증</h2>
            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-300" />
              <span className="text-indigo-400 text-sm">Certificate of Achievement</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-300" />
            </div>
          </div>

          {/* 이름 + 본문 */}
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm mb-2">이 증서는</p>
            <p className="text-4xl font-black text-indigo-700 mb-2 tracking-tight">{profile.name}</p>
            {profile.grade && (
              <p className="text-gray-400 text-sm mb-4">({profile.grade}학년)</p>
            )}
            <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
              Scholar Quest <span className="font-semibold text-gray-800">30일 영어 학습 챌린지</span>에
              성실히 참여하여 탁월한 학습 성과를 이루었음을 증명합니다.
            </p>
          </div>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: '총 획득 XP', value: `${profile.xp_total.toLocaleString()}`, unit: 'XP', color: 'indigo' },
              { label: '완료한 날', value: `${completedDays}`, unit: '일 / 30일', color: 'green' },
              { label: '에세이 제출', value: `${essayCount}`, unit: '편', color: 'purple' },
              { label: '어휘 세션', value: `${vocabCount}`, unit: '회', color: 'orange' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
              >
                <p className={`text-2xl font-black ${
                  stat.color === 'indigo' ? 'text-indigo-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-orange-500'
                }`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.unit}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 완료율 바 */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>챌린지 완료율</span>
              <span className="font-semibold text-indigo-600">{completionRate}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* 승인된 마일스톤 */}
          {approvedMilestones.length > 0 && (
            <div className="mb-8">
              <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-widest">달성 마일스톤</p>
              <div className="flex justify-center gap-4">
                {approvedMilestones.map((m) => {
                  const meta = MILESTONE_META[m.day_number]
                  return (
                    <div key={m.id} className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-full flex items-center justify-center text-xl mb-1 mx-auto shadow-sm">
                        {meta?.emoji}
                      </div>
                      <p className="text-xs font-semibold text-gray-700">Day {m.day_number}</p>
                      <p className="text-xs text-gray-400">{meta?.label}</p>
                      {m.reward_description && (
                        <p className="text-xs text-amber-600 mt-0.5 italic">"{m.reward_description}"</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 날짜 + 서명 */}
          <div className="flex items-end justify-between pt-6 border-t border-gray-100">
            <div className="text-xs text-gray-400 space-y-0.5">
              <p>챌린지 시작일: <span className="text-gray-600 font-medium">{startFmt}</span></p>
              <p>발급일: <span className="text-gray-600 font-medium">{today}</span></p>
            </div>
            <div className="text-center">
              <div className="w-24 border-b border-gray-300 mb-1" />
              <p className="text-xs text-gray-400">부모님 서명</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5">
                <span className="text-indigo-500">✓</span>
                <span className="text-xs font-semibold text-indigo-700">Scholar Quest</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 진행 중 안내 메시지 */}
      {!isComplete && (
        <div className="print:hidden mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
          <p className="font-semibold mb-1">📌 아직 진행 중이에요</p>
          <p className="text-indigo-500 text-xs">
            30일 중 {completedDays}일 완료했어요. 25일 이상 완료하면 수료증이 확정됩니다.
            지금도 미리 인쇄해볼 수 있어요!
          </p>
        </div>
      )}

      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .certificate-card, .certificate-card * { visibility: visible !important; }
          .certificate-card {
            position: fixed !important;
            top: 20mm !important;
            left: 15mm !important;
            right: 15mm !important;
            width: auto !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
