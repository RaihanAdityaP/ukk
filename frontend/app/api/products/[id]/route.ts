import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { ProductService } from '@/lib/services/ProductService'

// GET /api/products/:id → detail 1 produk
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const service = new ProductService(supabase)

  try {
    const data = await service.getById(id)
    return NextResponse.json(data)
  } catch (e) {
    const err = e as Error & { status?: number }
    return NextResponse.json({ error: err.message }, { status: err.status ?? 404 })
  }
}

// PUT /api/products/:id → edit produk (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const service = new ProductService(supabase)

  try {
    const data = await service.update(id, body)
    return NextResponse.json(data)
  } catch (e) {
    const err = e as Error & { status?: number }
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 })
  }
}

// DELETE /api/products/:id → hapus produk (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = new ProductService(supabase)

  try {
    await service.delete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
