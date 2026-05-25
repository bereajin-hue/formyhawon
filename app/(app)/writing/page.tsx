import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WritingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  const { data: essays } = await supabase
    .from('essays')
    .select('*, books(title)')
    .eq('user_id', profile.id)
    .order('submitted_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">✍️ 에세이</h1>
          <p className="text-gray-500 text-sm mt-1">작성한 에세이 {essays?.length ?? 0}편</p>
        </div>
        <Link
          href="/writing/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          + 새 에세이
        </Link>
      </div>

      {essays && essays.length > 0 ? (
        <div className="space-y-3">
          {essays.map((essay) => {
            const avg = essay.ai_feedback
              ? Object.values(essay.ai_feedback.scores as Record<string, { score: number }>)
                  .reduce((s, v) => s + v.score, 0) / 5
              : null
            return (
              <Link key={essay.id} href={`/writing/${essay.id}`}>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 line-clamp-2">{essay.prompt_text}</p>
                      {essay.books && (
                        <p className="text-xs text-indigo-500 mt-1">📚 {(essay.books as { title: string }).title}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{essay.word_count ?? 0}단어</span>
                        {essay.revision_count > 0 && <span>수정 {essay.revision_count}회</span>}
                        <span>{new Date(essay.submitted_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {avg !== null ? (
                        <span className="text-sm font-bold text-indigo-600">{avg.toFixed(1)}/4.0</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">첨삭 전</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">✍️</p>
          <p className="font-medium text-gray-600">아직 작성한 에세이가 없어요</p>
          <p className="text-sm mt-1">책 라이브러리에서 에세이 질문을 선택하거나 직접 작성해보세요</p>
          <Link href="/writing/new" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
            첫 에세이 쓰기
          </Link>
        </div>
      )}
    </div>
  )
}
