import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { ESSAY_QUESTION_SYSTEM, essayQuestionPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { bookTitle, bookAuthor, bookId } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('grade').eq('user_id', user.id).single()

    // bookId로 책 정보 보완
    let title = bookTitle
    let author = bookAuthor
    if (bookId && (!title || !author)) {
      const { data: book } = await supabase
        .from('books').select('title, author').eq('id', bookId).single()
      title = book?.title ?? title
      author = book?.author ?? author
    }

    const grade = profile?.grade ?? 10
    const anthropic = getAnthropicClient()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: ESSAY_QUESTION_SYSTEM,
      messages: [{ role: 'user', content: essayQuestionPrompt(title, author, grade) }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const result = parseClaudeJSON<{
      question: string
      type: string
      difficulty: string
      hint: string
    }>(rawText)

    return NextResponse.json(result)
  } catch (error) {
    console.error('essay-question error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 오류' },
      { status: 500 }
    )
  }
}
