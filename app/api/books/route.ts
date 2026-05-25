import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(books ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, author } = await request.json()

  const { data: profile } = await supabase
    .from('profiles').select('id, grade').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const { data: book, error } = await supabase
    .from('books')
    .insert({
      user_id: profile.id,
      title: title.trim(),
      author: author.trim(),
      grade_level: profile.grade,
      status: 'reading',
      started_at: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(book)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookId, status } = await request.json()

  const updates: Record<string, string> = { status }
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString().split('T')[0]
  }

  const { error } = await supabase.from('books').update(updates).eq('id', bookId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 완독 시 XP +100
  if (status === 'completed') {
    const { data: profile } = await supabase
      .from('profiles').select('id, xp_total').eq('user_id', user.id).single()
    if (profile) {
      await supabase.from('profiles').update({ xp_total: profile.xp_total + 100 }).eq('id', profile.id)
      await supabase.from('xp_log').insert({ user_id: profile.id, amount: 100, reason: 'book_completed' })
    }
  }

  return NextResponse.json({ success: true })
}
