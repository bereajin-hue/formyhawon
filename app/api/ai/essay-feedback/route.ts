import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { ESSAY_FEEDBACK_SYSTEM, essayFeedbackPrompt } from '@/lib/prompts'
import { NextResponse } from 'next/server'
import type { EssayFeedback } from '@/types'

async function fetchWikipediaContext(bookTitle: string): Promise<string> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bookTitle)}`,
      { headers: { 'User-Agent': 'ScholarQuest/1.0 (educational app)' } }
    )
    if (!res.ok) return ''
    const data = await res.json()
    return data.extract ?? ''
  } catch {
    return ''
  }
}

export async function POST(request: Request) {
  try {
    const { essay, prompt, bookTitle, grade } = await request.json()
    const anthropic = getAnthropicClient()

    const bookContext = bookTitle ? await fetchWikipediaContext(bookTitle) : ''

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      system: [
        {
          type: 'text',
          text: ESSAY_FEEDBACK_SYSTEM,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: essayFeedbackPrompt(essay, prompt, bookTitle, grade, bookContext) }],
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
