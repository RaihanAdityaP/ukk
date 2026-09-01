import { createClient } from './supabase'
import { ProductService } from './services/ProductService'
import { CartService } from './services/CartService'
import { OrderService } from './services/OrderService'
import { ActivityLogService } from './services/ActivityLogService'

export function getSupabase() {
  return createClient()
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('auth_user')
  return userStr ? 'active_session' : null
}

export function setAuthSession(user: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_user', JSON.stringify(user))
  window.dispatchEvent(new Event('auth-state-changed'))
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_user')
  window.dispatchEvent(new Event('auth-state-changed'))
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('auth_user')
  try {
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

// --- API Service Methods (Directly Connected to Supabase Cloud via OOP Service Layer) ---

export const api = {
  // Auth
  auth: {
    async register(data: { name: string; email: string; password: string; phone?: string; address?: string }) {
      const supabase = getSupabase()
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone,
            address: data.address,
            role: 'customer',
          },
        },
      })

      if (error) throw new Error(error.message)
      if (!authData.user) throw new Error('Registrasi gagal.')

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: data.name,
        role: 'customer',
      })

      const user = {
        id: authData.user.id,
        name: data.name,
        email: data.email,
        role: 'customer',
        phone: data.phone,
        address: data.address,
      }

      setAuthSession(user)
      return { user, message: 'Registrasi berhasil.' }
    },

    async login(data: { email: string; password: string }) {
      const supabase = getSupabase()
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw new Error(error.message)
      if (!authData.user) throw new Error('Login gagal.')

      // Fetch profile role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle()

      const role = profile?.role ?? (authData.user.email?.includes('admin') ? 'admin' : 'customer')
      const name = profile?.full_name ?? authData.user.user_metadata?.full_name ?? authData.user.email?.split('@')[0]

      const user = {
        id: authData.user.id,
        name: name,
        email: authData.user.email,
        role: role,
        avatar_url: profile?.avatar_url,
      }

      setAuthSession(user)
      return { user, message: 'Login berhasil.' }
    },

    async me() {
      const stored = getStoredUser()
      const supabase = getSupabase()

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          // If Supabase session is genuinely expired and no stored session
          if (!stored) clearAuthSession()
          return stored
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        const userData = {
          id: user.id,
          name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0],
          email: user.email,
          phone: profile?.phone ?? user.user_metadata?.phone ?? '',
          address: profile?.address ?? user.user_metadata?.address ?? '',
          role: profile?.role ?? (user.email?.includes('admin') ? 'admin' : 'customer'),
          avatar_url: profile?.avatar_url,
        }

        setAuthSession(userData)
        return userData
      } catch {
        return stored
      }
    },

    async logout() {
      const supabase = getSupabase()
      try {
        await supabase.auth.signOut()
      } catch {
        // ignore
      }
      clearAuthSession()
    },

    async updateProfile(data: { name?: string; phone?: string; address?: string; avatar_url?: string }) {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User belum login.')

      const updates: any = {}
      if (data.name) updates.full_name = data.name
      if (data.avatar_url) updates.avatar_url = data.avatar_url

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('id', user.id)
      }

      const updatedUser = await this.me()
      return { user: updatedUser, message: 'Profil berhasil diperbarui.' }
    },
  },

  // Products (OOP ProductService)
  products: {
    async list(params?: { search?: string; category?: string }) {
      const supabase = getSupabase()
      const service = new ProductService(supabase)
      return service.list(params?.search, params?.category)
    },

    async getById(id: string | number) {
      const supabase = getSupabase()
      const service = new ProductService(supabase)
      return service.getById(id)
    },

    async getAutomaticFeatured(products: any[]) {
      const supabase = getSupabase()
      const service = new ProductService(supabase)
      return service.getAutomaticFeaturedProduct(products)
    },

    async create(data: any) {
      const supabase = getSupabase()
      const service = new ProductService(supabase)
      return service.create(data)
    },

    async update(id: string | number, data: any) {
      const supabase = getSupabase()
      const service = new ProductService(supabase)
      return service.update(id, data)
    },

    async delete(id: string | number) {
      const supabase = getSupabase()
      const service = new ProductService(supabase)
      return service.delete(id)
    },
  },

  // Categories
  categories: {
    async list() {
      const supabase = getSupabase()
      const { data, error } = await supabase.from('categories').select('*').order('name')
      if (error) throw new Error(error.message)
      return data
    },
  },

  // Cart (OOP CartService)
  cart: {
    async list() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const service = new CartService(supabase)
      return service.listByUser(user.id)
    },

    async add(productId: string | number, quantity = 1) {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Silakan login terlebih dahulu untuk menambah keranjang.')
      const service = new CartService(supabase)
      return service.addItem(user.id, productId, quantity)
    },

    async update(cartItemId: string | number, quantity: number) {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Silakan login terlebih dahulu.')
      const service = new CartService(supabase)
      return service.updateQuantity(user.id, cartItemId, quantity)
    },

    async remove(cartItemId: string | number) {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Silakan login terlebih dahulu.')
      const service = new CartService(supabase)
      return service.removeItem(user.id, cartItemId)
    },

    async clear() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    },
  },

  // Orders (OOP OrderService)
  orders: {
    async list() {
      const supabase = getSupabase()
      const service = new OrderService(supabase)
      return service.listAll()
    },

    async getByCode(code: string) {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_code', code)
        .single()
      if (error) throw new Error(error.message)
      return data
    },

    async checkout(data: {
      customer_name: string
      customer_phone: string
      customer_address: string
      payment_method: string
    }) {
      const supabase = getSupabase()
      const service = new OrderService(supabase)
      return service.checkout(data)
    },

    async updateStatus(orderId: string, status: string) {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },
  },

  // Reviews
  reviews: {
    async list(productId: string | number) {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles:customer_id(full_name, avatar_url)')
        .eq('product_id', String(productId))
        .order('created_at', { ascending: false })

      if (error) return []
      return data.map((r: any) => ({
        ...r,
        user: {
          name: r.profiles?.full_name || 'Pembeli',
        }
      }))
    },

    async add(productId: string | number, data: { rating: number; comment?: string }) {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Silakan login untuk memberikan ulasan.')

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          product_id: String(productId),
          customer_id: user.id,
          rating: data.rating,
          comment: data.comment,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return review
    },
  },

  // Payment (Midtrans)
  payment: {
    async createSnapToken(order_code: string) {
      const res = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_code }),
      })
      if (!res.ok) throw new Error('Gagal membuat transaksi Midtrans.')
      return res.json()
    },
  },

  // Logs (ActivityLogService)
  logs: {
    async list(limit = 50) {
      const supabase = getSupabase()
      const service = new ActivityLogService(supabase)
      return service.list(limit)
    },

    async record(action: string, description: string, userId?: string) {
      const supabase = getSupabase()
      const service = new ActivityLogService(supabase)
      return service.record(action, description, userId)
    },
  },
}
