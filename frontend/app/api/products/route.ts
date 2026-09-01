import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { ProductService } from '@/lib/services/ProductService'
import { UnauthorizedError, ValidationError } from '@/lib/errors'

// GET /api/products?search=...&category=...  → tampil & cari produk
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { searchParams } = new URL(request.url)
  const service = new ProductService(supabase)

  try {
    const data = await service.list(searchParams.get('search') ?? undefined, searchParams.get('category') ?? undefined)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// POST /api/products → tambah produk baru (admin only, dicek via RLS + session)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Silakan login sebagai admin.' }, { status: 401 })
  }

  const body = await request.json()
  const service = new ProductService(supabase)

  try {
    const data = await service.create(body)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 })
  }
}
