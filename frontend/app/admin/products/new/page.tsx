'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, getToken, getStoredUser } from '@/lib/api'
import ImageUpload from '@/components/ImageUpload'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    image_url: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      router.push('/login?redirect=/admin/products/new')
      return
    }
    const user = getStoredUser()
    if (user && user.role !== 'admin') {
      router.push('/')
      return
    }

    api.categories.list().then(setCategories).catch(console.error)
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    const payload = {
      name: form.name,
      category_id: form.category_id || null,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url || null,
      description: form.description || null,
    }

    try {
      await api.products.create(payload)
      await api.logs.record('CREATE_PRODUCT', `Admin menambahkan produk baru: "${form.name}" (Rp ${Number(form.price).toLocaleString('id-ID')})`)
      setSuccess('Produk baru berhasil ditambahkan!')
      setTimeout(() => {
        router.push('/admin/products')
      }, 700)
    } catch (err: any) {
      setSaving(false)
      setError(err.message || 'Gagal menyimpan produk.')
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-navy mb-4 transition">
        <ArrowLeft className="w-4 h-4" />
        Kelola Produk
      </Link>
      <h1 className="font-serif text-3xl font-bold text-navy mb-6">Tambah Produk</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 space-y-4">
        <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />

        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Nama Produk</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy text-ink"
            placeholder="Contoh: Meja Belajar Minimalis"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Kategori</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full rounded-lg border border-stone px-3 py-2.5 bg-white focus:outline-none focus:border-navy text-ink"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-ink/50 mb-1.5">Harga (Rp)</label>
            <input
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy text-ink"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-ink/50 mb-1.5">Stok</label>
            <input
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy text-ink"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Deskripsi (opsional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy text-ink"
            rows={3}
          />
        </div>

        <div className="p-3 bg-stone/20 rounded-lg text-xs text-ink/60">
          💡 <strong>Produk Unggulan (Hero Banner)</strong> ditentukan 100% otomatis oleh sistem berdasarkan penjualan terbanyak dan rating ulasan tertinggi.
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !!success}
          className="w-full bg-accent text-navy font-semibold py-3 rounded-lg hover:bg-brick hover:text-white disabled:opacity-50 transition"
        >
          {saving ? 'Menyimpan...' : success ? 'Berhasil Ditambahkan...' : 'Simpan Produk'}
        </button>
      </form>
    </main>
  )
}
