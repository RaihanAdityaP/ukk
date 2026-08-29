'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import StarRating from './StarRating'

export default function ReviewForm({ productId }: { productId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Pilih rating bintang dulu.')
      return
    }

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/login?redirect=/product/${productId}`)
        return
      }

      const { error: submitError } = await supabase
        .from('reviews')
        .upsert({ product_id: productId, customer_id: user.id, rating, comment }, { onConflict: 'product_id,customer_id' })

      if (submitError) {
        setError('Gagal mengirim ulasan. Coba lagi.')
        return
      }

      setRating(0)
      setComment('')
      router.refresh() // reload data dari server, biar ulasan baru langsung kelihatan
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 mb-5">
      <p className="text-sm font-semibold text-ink mb-2.5">Beri ulasan produk ini</p>
      <div className="mb-3">
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Bagikan pendapat kamu tentang produk ini (opsional)"
        rows={3}
        className="w-full rounded-lg border border-stone px-3 py-2 bg-white focus:outline-none focus:border-navy text-sm mb-3"
      />
      {error && <p className="text-brick text-sm mb-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brick disabled:opacity-50 transition"
      >
        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  )
}
