import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { CartService } from '@/lib/services/CartService'

// GET /api/cart → tampil isi keranjang milik user yang sedang login
export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })
  }

  const service = new CartService(supabase)

  try {
    const data = await service.listByUser(user.id)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// POST /api/cart → tambah produk ke keranjang
export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })
  }

  const { product_id, quantity = 1 } = await request.json()
  if (!product_id) {
    return NextResponse.json({ error: 'product_id wajib diisi' }, { status: 400 })
  }

  const service = new CartService(supabase)

  try {
    const data = await service.addItem(user.id, product_id, quantity)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 })
  }
}
