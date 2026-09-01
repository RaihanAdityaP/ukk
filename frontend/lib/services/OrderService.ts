import { BaseService } from './BaseService'
import { ValidationError } from '@/lib/errors'

export class OrderService extends BaseService {
  async listAll() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  }

  async checkout(input: {
    customer_name: string
    customer_phone: string
    customer_address: string
    payment_method: string
  }) {
    const { customer_name, customer_phone, customer_address, payment_method } = input

    if (!customer_name || !customer_phone || !customer_address || !payment_method) {
      throw new ValidationError('Semua field wajib diisi.')
    }

    const { data, error } = await this.supabase.rpc('checkout_cart', {
      p_customer_name: customer_name,
      p_customer_phone: customer_phone,
      p_customer_address: customer_address,
      p_payment_method: payment_method,
    })

    if (error) throw new ValidationError(error.message)

    const result = Array.isArray(data) ? data[0] : data
    return { id: result.order_id, order_code: result.order_code }
  }
}
