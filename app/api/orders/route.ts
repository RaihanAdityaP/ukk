import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { OrderService } from '@/lib/services/OrderService'

// GET /api/orders → list order (admin lihat semua, customer lihat punya sendiri via RLS)
export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const service = new OrderService(supabase)

  try {
    const data = await service.listAll()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// POST /api/orders → checkout. Semua logic (cek stok, kurangin stok, buat order)
// dijalankan atomik lewat function database checkout_cart, biar aman dari race condition
// kalau ada 2 orang checkout barang yang sama bersamaan pas stok tipis.
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const body = await request.json()
  const service = new OrderService(supabase)

  try {
    const data = await service.checkout(body)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    return NextResponse.json({ error: err.message }, { status: err.status ?? 400 })
  }
}
