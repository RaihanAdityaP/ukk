import { BaseService } from './BaseService'
import { NotFoundError, ValidationError } from '@/lib/errors'
import type { Product } from '@/lib/types'

// "extends BaseService" artinya ProductService MEWARISI BaseService.
// Otomatis dapat this.supabase tanpa perlu tulis ulang.
export class ProductService extends BaseService {
  async list(search?: string, category?: string) {
    let query = this.supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (search) query = query.ilike('name', `%${search}%`)
    if (category && category !== 'All') query = query.eq('category_id', category)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.from('products').select('*').eq('id', id).single()
    if (error || !data) throw new NotFoundError('Produk tidak ditemukan.')
    return data
  }

  async create(input: Partial<Product>) {
    this.validate(input)

    if (input.is_featured) {
      await this.supabase.from('products').update({ is_featured: false }).eq('is_featured', true)
    }

    const { data, error } = await this.supabase.from('products').insert(input).select().single()
    if (error) throw new Error(error.message)
    return data
  }

  async update(id: string, input: Partial<Product>) {
    this.validate(input)

    if (input.is_featured) {
      await this.supabase.from('products').update({ is_featured: false }).eq('is_featured', true).neq('id', id)
    }

    const { data, error } = await this.supabase
      .from('products')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async delete(id: string) {
    const { error } = await this.supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  // "private" artinya cuma bisa dipanggil dari DALAM class ini sendiri.
  // Kode di route.ts gak bisa manggil productService.validate(...) langsung.
  private validate(input: Partial<Product>) {
    if (!input.name?.trim() || input.price == null || input.stock == null) {
      throw new ValidationError('Nama, harga, dan stok wajib diisi.')
    }
    if ((input.price ?? 0) < 0 || (input.stock ?? 0) < 0) {
      throw new ValidationError('Harga dan stok tidak boleh negatif.')
    }
  }
}
