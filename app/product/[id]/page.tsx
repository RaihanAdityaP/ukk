'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Product, Review } from '@/lib/types'
import AddToCartButton from '@/components/AddToCartButton'
import StarRating from '@/components/StarRating'
import ReviewForm from '@/components/ReviewForm'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()

  const [product, setProduct] = useState<(Product & { categories?: { name: string } }) | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)

    const { data: productData } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single()
    setProduct(productData)

    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*, customer:profiles(full_name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
    setReviews(reviewData ?? [])

    if (reviewData && reviewData.length > 0) {
      const avg = reviewData.reduce((sum, r) => sum + r.rating, 0) / reviewData.length
      setAvgRating(avg)
    } else {
      setAvgRating(0)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return <main className="max-w-4xl mx-auto px-4 py-16 text-center text-ink/40">Memuat produk...</main>
  }

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-ink/40 mb-4">Produk tidak ditemukan.</p>
        <Link href="/" className="text-brick font-semibold hover:underline">← Kembali ke katalog</Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-ink/50 hover:text-navy mb-6 inline-block">← Kembali ke katalog</Link>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="aspect-square bg-stone/40 overflow-hidden flex items-center justify-center border-2 border-ink">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-serif text-6xl text-navy/20">{product.name.charAt(0)}</span>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">{product.categories?.name}</p>
          <h1 className="font-serif text-3xl font-bold text-navy mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-sm text-ink/50">
              {avgRating > 0 ? `${avgRating.toFixed(1)} (${reviews.length} ulasan)` : 'Belum ada ulasan'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="font-serif text-2xl font-bold text-ink">Rp {product.price.toLocaleString('id-ID')}</span>
            <span className="text-xs text-ink/40">{product.stock > 0 ? `Stok: ${product.stock}` : 'Stok habis'}</span>
          </div>

          {product.description && (
            <p className="text-ink/70 leading-relaxed mb-6">{product.description}</p>
          )}

          <AddToCartButton productId={product.id} productName={product.name} price={product.price} imageUrl={product.image_url} maxStock={product.stock} disabled={product.stock === 0} />
        </div>
      </div>

      <div className="border-t-2 border-ink pt-6">
        <h2 className="font-serif text-2xl font-bold text-navy mb-5">Ulasan Pembeli</h2>

        <ReviewForm productId={product.id} onSubmitted={loadData} />

        {reviews.length === 0 ? (
          <p className="text-ink/40 text-sm">Belum ada ulasan untuk produk ini. Jadi yang pertama!</p>
        ) : (
          <div className="divide-y-2 divide-stone">
            {reviews.map((r) => (
              <div key={r.id} className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{r.customer?.full_name || 'Pembeli'}</span>
                  <span className="text-xs text-ink/40">{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <StarRating value={r.rating} size="sm" />
                {r.comment && <p className="text-sm text-ink/70 mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}