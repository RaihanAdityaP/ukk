const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function setAuthSession(user: any, token?: string) {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem('auth_token', token)
  }
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }
  window.dispatchEvent(new Event('auth-state-changed'))
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
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

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_URL}${cleanEndpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type')
  let data: any = null
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
    }
    const message =
      data?.message ||
      (typeof data === 'object' && data?.errors
        ? Object.values(data.errors).flat().join(' ')
        : typeof data === 'string'
        ? data
        : 'Terjadi kesalahan pada server.')
    throw new Error(message)
  }

  return data
}

// --- API Service Methods (Directly Connected to Laravel REST API with OOP Backend) ---

export const api = {
  // Auth
  auth: {
    async register(data: { name: string; email: string; password: string; phone?: string; address?: string }) {
      const res = await request('/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (res.user && res.token) {
        setAuthSession(res.user, res.token)
      }
      return { user: res.user, token: res.token, message: res.message || 'Registrasi berhasil.' }
    },

    async login(data: { email: string; password: string }) {
      const res = await request('/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (res.user && res.token) {
        setAuthSession(res.user, res.token)
      }
      return { user: res.user, token: res.token, message: res.message || 'Login berhasil.' }
    },

    async me() {
      const stored = getStoredUser()
      const token = getToken()
      if (!token) return stored

      try {
        const res = await request('/me')
        if (res.user) {
          setAuthSession(res.user)
          return res.user
        }
        return stored
      } catch {
        return stored
      }
    },

    async logout() {
      try {
        await request('/logout', { method: 'POST' })
      } catch {
        // ignore error on network drop
      } finally {
        clearAuthSession()
      }
    },

    async updateProfile(data: { name?: string; phone?: string; address?: string; avatar_url?: string }) {
      const res = await request('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (res.user) {
        setAuthSession(res.user)
      }
      return { user: res.user, message: res.message || 'Profil berhasil diperbarui.' }
    },
  },

  // Products
  products: {
    async list(params?: { search?: string; category?: string }) {
      const queryParams = new URLSearchParams()
      if (params?.search) queryParams.set('search', params.search)
      if (params?.category && params.category !== 'All') queryParams.set('category', params.category)
      const qs = queryParams.toString()
      return request(qs ? `/products?${qs}` : '/products')
    },

    async getById(id: string | number) {
      return request(`/products/${id}`)
    },

    async create(data: any) {
      return request('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async update(id: string | number, data: any) {
      return request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    async delete(id: string | number) {
      return request(`/products/${id}`, {
        method: 'DELETE',
      })
    },
  },

  // Categories
  categories: {
    async list() {
      return request('/categories')
    },

    async create(data: { name: string }) {
      return request('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async delete(id: string | number) {
      return request(`/categories/${id}`, {
        method: 'DELETE',
      })
    },
  },

  // Cart
  cart: {
    async list() {
      return request('/cart')
    },

    async add(productId: string | number, quantity = 1) {
      return request('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: Number(productId), quantity }),
      })
    },

    async update(id: string | number, quantity: number) {
      return request(`/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      })
    },

    async remove(id: string | number) {
      return request(`/cart/${id}`, {
        method: 'DELETE',
      })
    },

    async clear() {
      return request('/cart', {
        method: 'DELETE',
      })
    },
  },

  // Orders
  orders: {
    async list() {
      return request('/orders')
    },

    async getByCode(code: string) {
      return request(`/orders/${code}`)
    },

    async checkout(data: {
      customer_name: string
      customer_phone: string
      customer_address: string
      payment_method: string
    }) {
      return request('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async updateStatus(id: string | number, status: string) {
      return request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    },
  },

  // Payment
  payment: {
    async createSnapToken(orderCode: string) {
      return request('/payment/create-transaction', {
        method: 'POST',
        body: JSON.stringify({ order_code: orderCode }),
      })
    },
  },

  // Reviews
  reviews: {
    async list(productId: string | number) {
      return request(`/products/${productId}/reviews`)
    },

    async add(productId: string | number, data: { rating: number; comment?: string }) {
      return request(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async delete(id: string | number) {
      return request(`/reviews/${id}`, {
        method: 'DELETE',
      })
    },
  },

  // Activity Logs
  logs: {
    async list(limit = 50) {
      return request(`/admin/logs?limit=${limit}`)
    },

    async record(action: string, description: string) {
      // Backend automatically logs actions inside its OOP service layer
      return { success: true }
    },
  },

  // File Upload (Images & Avatars)
  upload: {
    async file(file: File, folder: 'products' | 'avatars' = 'products') {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      return request('/upload', {
        method: 'POST',
        body: formData,
      })
    },
  },
}
