import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const grade = parseInt(searchParams.get('grade') ?? '10')
  const difficulty = searchParams.get('difficulty')

  if (![8, 9, 10, 11].includes(grade)) {
    return Response.json({ error: 'Grade must be 8, 9, 10, or 11' }, { status: 400 })
  }

  const supabase = await createClient()

  let query = supabase
    .from('curriculum_math_topics')
    .select('id, grade, unit_number, unit_name, topic_number, topic_name, curriculum_type, difficulty, igcse_syllabus_ref, key_skills, prerequisites')
    .eq('grade', grade)
    .order('sort_order')

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const grouped = (data ?? []).reduce((acc: Record<string, typeof data>, topic) => {
    const key = `${topic.unit_number}. ${topic.unit_name}`
    if (!acc[key]) acc[key] = []
    acc[key].push(topic)
    return acc
  }, {})

  return Response.json({ topics: data, grouped, grade, total: data?.length ?? 0 })
}
