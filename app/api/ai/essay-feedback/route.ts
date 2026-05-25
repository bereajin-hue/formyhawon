import { getAnthropicClient } from '@/lib/claude'
import { ESSAY_FEEDBACK_SYSTEM, essayFeedbackPrompt } from '@/lib/prompts'

export async function POST(request: Request) {
  try {
    const { essay, prompt, bookTitle, grade } = await request.json()
    const anthropic = getAnthropicClient()

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: ESSAY_FEEDBACK_SYSTEM,
      messages: [{ role: 'user', content: essayFeedbackPrompt(essay, prompt, bookTitle, grade) }],
    })

    return new Response(stream.toReadableStream())
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'AI 오류' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
