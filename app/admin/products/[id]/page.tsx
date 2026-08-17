'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ImageUpload from '@/components/ImageUpload'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [form, setForm] = useState({ name: '', price: '', stock: '', image_url: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      const res = await fetch(`/api/products/${id}`)
      const data = await res.json()
      if (res.ok) {
        setForm({
          name: data.name,
          price: String(data.price),
          stock: String(data.stock),
          image_url: data.image_url ?? '',
          description: data.description ?? '',
        })
      }
      setLoading(false)
    }
    loadProduct()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        image_url: form.image_url,
        description: form.description,
      }),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Gagal menyimpan perubahan.')
      return
    }

    router.push('/admin/products')
  }

  if (loading) {
    return <main className="max-w-lg mx-auto px-4 py-16 text-center text-ink/40">Memuat produk...</main>
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Admin</p>
      <h1 className="font-serif text-3xl font-bold text-navy border-b-2 border-ink pb-3 mb-8">Edit Produk</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Nama Produk</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-2 border-stone px-3 py-2.5 bg-white focus:outline-none focus:border-navy"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Harga (Rp)</label>
            <input
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border-2 border-stone px-3 py-2.5 bg-white focus:outline-none focus:border-navy"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Stok</label>
            <input
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border-2 border-stone px-3 py-2.5 bg-white focus:outline-none focus:border-navy"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Deskripsi (opsional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border-2 border-stone px-3 py-2.5 bg-white focus:outline-none focus:border-navy"
            rows={3}
          />
        </div>

        {error && <p className="text-brick text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-navy font-bold uppercase tracking-wide text-sm px-6 py-2.5 hover:bg-brick hover:text-white disabled:opacity-50 transition"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="border-2 border-stone px-6 py-2.5 text-ink/60 hover:border-ink transition"
          >
            Batal
          </button>
        </div>
      </form>
    </main>
  )
}
