import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/products?search=...&category=...  → tampil & cari produk
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const category = searchParams.get('category')

  let query = supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  if (category && category !== 'All') {
    query = query.eq('category_id', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// POST /api/products → tambah produk baru (admin only, dicek via RLS + session)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Silakan login sebagai admin.' }, { status: 401 })
  }

  const body = await request.json()
  const { name, price, stock, category_id, image_url, description, is_featured } = body

  if (!name || price == null || stock == null) {
    return NextResponse.json({ error: 'Nama, harga, dan stok wajib diisi.' }, { status: 400 })
  }

  // Kalau produk ini di-set featured, matiin featured di produk lain dulu (cuma boleh 1 featured aktif)
  if (is_featured) {
    await supabase.from('products').update({ is_featured: false }).eq('is_featured', true)
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ name, price, stock, category_id, image_url, description, is_featured: !!is_featured })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
