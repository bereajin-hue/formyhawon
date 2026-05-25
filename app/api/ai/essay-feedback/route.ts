import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { ESSAY_FEEDBACK_SYSTEM, essayFeedbackPrompt } from '@/lib/prompts'
import { NextResponse } from 'next/server'
import type { EssayFeedback } from '@/types'

export async function POST(request: Request) {
  try {
    const { essay, prompt, bookTitle, grade } = await request.json()
    const anthropic = getAnthropicClient()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: ESSAY_FEEDBACK_SYSTEM,
      messages: [{ role: 'user', content: essayFeedbackPrompt(essay, prompt, bookTitle, grade) }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const feedback = parseClaudeJSON<EssayFeedback>(rawText)

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('essay-feedback error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 오류' },
      { status: 500 }
    )
  }
}
