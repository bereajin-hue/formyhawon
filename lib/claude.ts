import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY

export function getAnthropicClient() {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다.')
  }
  return new Anthropic({ apiKey })
}

export function parseClaudeJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  return JSON.parse(cleaned) as T
}
