'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAdd() {
    setLoading(true)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    })

    setLoading(false)

    if (res.status === 401) {
      router.push('/login?redirect=/')
      return
    }

    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || loading}
      className="bg-navy text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 disabled:opacity-30 hover:bg-brick transition whitespace-nowrap"
    >
      {added ? 'Ditambahkan ✓' : disabled ? 'Stok Habis' : 'Tambah'}
    </button>
  )
}
