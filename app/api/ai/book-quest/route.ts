import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { createClient } from '@/lib/supabase/server'
import { BOOK_QUEST_SYSTEM, bookQuestPrompt } from '@/lib/prompts'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { title, author, grade, bookId } = await request.json()
    const supabase = await createClient()

    // 1. 캐시 확인
    const { data: cached } = await supabase
      .from('book_quests')
      .select('content')
      .eq('book_title', title)
      .eq('book_author', author)
      .eq('grade_level', grade)
      .single()

    if (cached) {
      return NextResponse.json({ content: cached.content, fromCache: true })
    }

    // 2. curriculum_books에서 사전 데이터 조회 (있으면 프롬프트 강화)
    const { data: curriculumBook } = await supabase
      .from('curriculum_books')
      .select('themes, essay_themes, difficulty, description')
      .eq('title', title)
      .eq('grade', grade)
      .single()

    // 3. Claude API 호출 (curriculum 데이터 주입)
    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: BOOK_QUEST_SYSTEM,
      messages: [{
        role: 'user',
        content: bookQuestPrompt(title, author, grade, curriculumBook ?? undefined),
      }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const content = parseClaudeJSON(rawText)

    // 4. 캐시 저장
    await supabase.from('book_quests').insert({
      book_title: title,
      book_author: author,
      grade_level: grade,
      content,
    })

    return NextResponse.json({ content, fromCache: false })
  } catch (error) {
    console.error('book-quest error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 생성 오류' },
      { status: 500 }
    )
  }
}
