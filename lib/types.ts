export type Profile = {
  id: string
  full_name: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export type Product = {
  id: string
  name: string
  price: number
  stock: number
  category_id: string | null
  image_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
}

export type Order = {
  id: string
  order_code: string
  customer_id: string | null
  customer_name: string
  customer_phone: string
  customer_address: string
  payment_method: 'cod' | 'transfer'
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'done'
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
}
