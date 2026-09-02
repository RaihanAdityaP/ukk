'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { api, getToken } from '@/lib/api'
import StarRating from './StarRating'

export default function ReviewForm({ productId, onReviewAdded }: { productId: string | number; onReviewAdded?: () => void }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!getToken()) {
      router.push(`/login?redirect=/product/${productId}`)
      return
    }

    if (rating === 0) {
      setError('Pilih rating bintang dulu.')
      return
    }

    setSubmitting(true)

    try {
      await api.reviews.add(productId, { rating, comment })
      setRating(0)
      setComment('')
      if (onReviewAdded) {
        onReviewAdded()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulasan. Coba lagi.')
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
        className="w-full rounded-lg border border-stone px-3 py-2 bg-white focus:outline-none focus:border-navy text-sm mb-3 text-ink"
      />
      {error && <p className="text-brick text-sm mb-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brick disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{submitting ? 'Mengirim Ulasan...' : 'Kirim Ulasan'}</span>
      </button>
    </form>
  )
}
