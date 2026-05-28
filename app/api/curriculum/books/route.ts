import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const grade = parseInt(searchParams.get('grade') ?? '10')
  const coreOnly = searchParams.get('core_only') === 'true'

  if (![8, 9, 10, 11].includes(grade)) {
    return Response.json({ error: 'Grade must be 8, 9, 10, or 11' }, { status: 400 })
  }

  const supabase = await createClient()

  let query = supabase
    .from('curriculum_books')
    .select('id, grade, title, author, published_year, difficulty, curriculum_type, is_core, themes, essay_themes, description')
    .eq('grade', grade)
    .order('sort_order')

  if (coreOnly) {
    query = query.eq('is_core', true)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ books: data, grade, total: data?.length ?? 0 })
}
