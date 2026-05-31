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

  const today = new Date().toISOString().split('T')[0]
  const { data: session } = await supabase
    .from('vocab_sessions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('session_date', today)
    .maybeSingle()

  return NextResponse.json({ session })
}

type VocabWordRaw = { word: string; definition: string; usage: string }
type VocabWordOut = { word: string; definition: string; example: string }

function pickRoundRobin(queues: VocabWordOut[][], total: number): VocabWordOut[] {
  const result: VocabWordOut[] = []
  let i = 0
  while (result.length < total) {
    const queue = queues[i % queues.length]
    if (queue.length > 0) result.push(queue.shift()!)
    i++
    if (queues.every((q) => q.length === 0)) break
  }
  return result
}

export async function POST(request: Request) {
  const { bookId, mix } = await request.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id, grade').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const grade = profile.grade ?? 10
  const today = new Date().toISOString().split('T')[0]

  if (mix) {
    const { data: essayRows } = await supabase
      .from('essays')
      .select('book_id')
      .eq('user_id', profile.id)
      .not('book_id', 'is', null)

    const bookIds = [...new Set(essayRows?.map((e) => e.book_id).filter(Boolean) ?? [])]
    if (bookIds.length === 0) {
      return NextResponse.json({ error: '에세이를 쓴 책이 없어요.' }, { status: 404 })
    }

    const { data: bookRows } = await supabase
      .from('books').select('title, author').in('id', bookIds).eq('status', 'reading')

    const queues: VocabWordOut[][] = []
    for (const book of bookRows ?? []) {
      const { data: quest } = await supabase
        .from('book_quests')
        .select('content')
        .eq('book_title', book.title)
        .eq('book_author', book.author)
        .eq('grade_level', grade)
        .maybeSingle()

      if (quest?.content?.vocab_spotlight?.length) {
        const shuffled = [...quest.content.vocab_spotlight as VocabWordRaw[]]
          .sort(() => Math.random() - 0.5)
          .map((w) => ({ word: w.word, definition: w.definition, example: w.usage }))
        queues.push(shuffled)
      }
    }

    if (queues.length === 0) {
      return NextResponse.json({ error: '단어 데이터가 없어요. 책 학습 자료를 먼저 생성해주세요.' }, { status: 404 })
    }

    const words = pickRoundRobin(queues, 5)
    const { data: session, error } = await supabase
      .from('vocab_sessions')
      .insert({ user_id: profile.id, session_date: today, language: 'EN', words, completed: false })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ session, words })
  }

  const { data: book } = await supabase
    .from('books').select('title, author').eq('id', bookId).single()
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

  const { data: quest } = await supabase
    .from('book_quests')
    .select('content')
    .eq('book_title', book.title)
    .eq('book_author', book.author)
    .eq('grade_level', grade)
    .maybeSingle()

  if (!quest?.content?.vocab_spotlight?.length) {
    return NextResponse.json(
      { error: '단어 데이터가 없어요. 책 학습 자료를 먼저 생성해주세요.' },
      { status: 404 }
    )
  }

  const all = [...quest.content.vocab_spotlight as VocabWordRaw[]].sort(() => Math.random() - 0.5)
  const words = all.slice(0, 5).map((w) => ({ word: w.word, definition: w.definition, example: w.usage }))

  const { data: session, error } = await supabase
    .from('vocab_sessions')
    .insert({ user_id: profile.id, session_date: today, language: 'EN', words, completed: false })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session, words })
}

export async function PATCH(request: Request) {
  const { sentences, corrections } = await request.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id, xp_total').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  // 오늘 세션을 user_id + date로 찾아 업데이트
  await supabase
    .from('vocab_sessions')
    .update({ sentences, ai_corrections: corrections, completed: true })
    .eq('user_id', profile.id)
    .eq('session_date', today)

  // 어휘 세션 XP + 미션 자동 완료 XP
  const sessionXp = 10
  const { xpEarned: missionXp } = await autoCompleteMission(supabase, profile.id, 'vocab')
  const totalXp = sessionXp + missionXp

  await supabase.from('profiles').update({ xp_total: profile.xp_total + totalXp }).eq('id', profile.id)
  await supabase.from('xp_log').insert({ user_id: profile.id, amount: totalXp, reason: '어휘 세션 완료' })

  return NextResponse.json({ xpEarned: totalXp, missionXp })
}
