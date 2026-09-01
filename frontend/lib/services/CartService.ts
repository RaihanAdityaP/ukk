import { BaseService } from './BaseService'
import { NotFoundError, ValidationError } from '@/lib/errors'

export class CartService extends BaseService {
  async listByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
    return data
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const { data: product } = await this.supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    if (!product) throw new NotFoundError('Produk tidak ditemukan.')

    const { data: existing } = await this.supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    const totalAfterAdd = (existing?.quantity ?? 0) + quantity
    if (totalAfterAdd > product.stock) {
      const sisa = product.stock - (existing?.quantity ?? 0)
      throw new ValidationError(
        sisa > 0
          ? `Stok tidak cukup. Kamu sudah punya ${existing?.quantity} di keranjang, sisa stok cuma ${sisa} lagi.`
          : 'Stok produk ini di keranjangmu sudah mencapai batas maksimal.'
      )
    }

    if (existing) {
      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ quantity: totalAfterAdd })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    }

    const { data, error } = await this.supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async updateQuantity(userId: string, cartItemId: string, quantity: number) {
    if (quantity < 1) throw new ValidationError('Jumlah tidak valid.')

    const { data: cartItem } = await this.supabase
      .from('cart_items')
      .select('*, product:products(stock)')
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .single()

    if (!cartItem) throw new NotFoundError('Item tidak ditemukan.')
    if (cartItem.product && quantity > cartItem.product.stock) {
      throw new ValidationError(`Stok tidak cukup. Tersisa ${cartItem.product.stock}.`)
    }

    const { data, error } = await this.supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async removeItem(userId: string, cartItemId: string) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  }
}
