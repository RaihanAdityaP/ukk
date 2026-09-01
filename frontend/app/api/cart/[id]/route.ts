import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { CartService } from '@/lib/services/CartService'

// PUT /api/cart/:id → update quantity item di keranjang
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const { quantity } = await request.json()
  const service = new CartService(supabase)

  try {
    const data = await service.updateQuantity(user.id, id, quantity)
    return NextResponse.json(data)
  } catch (e) {
    const err = e as Error & { status?: number }
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 })
  }
}

// DELETE /api/cart/:id → hapus item dari keranjang
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const service = new CartService(supabase)

  try {
    await service.removeItem(user.id, id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
