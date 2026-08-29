import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import AddToCartButton from '@/components/AddToCartButton'
import StarRating from '@/components/StarRating'
import ReviewForm from '@/components/ReviewForm'
import ReviewDeleteButton from '@/components/ReviewDeleteButton'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .single()

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-ink/40 mb-4">Produk tidak ditemukan.</p>
        <Link href="/" className="text-brick font-semibold hover:underline">← Kembali ke katalog</Link>
      </main>
    )
  }

  // Ambil review dulu (query polos, gak pakai join langsung ke profiles —
  // soalnya gak ada relasi langsung reviews->profiles di database, keduanya
  // cuma nempel ke auth.users masing-masing. Kalau dipaksa join, query-nya
  // gagal diam-diam dan hasilnya kelihatan kosong padahal datanya ada)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: false })

  // Baru ambil nama-nama customer yang review, dicocokin manual di JS
  const customerIds = [...new Set((reviews ?? []).map((r) => r.customer_id))]
  const { data: profiles } = customerIds.length > 0
    ? await supabase.from('profiles').select('id, full_name').in('id', customerIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]))
  const reviewsWithNames = (reviews ?? []).map((r) => ({
    ...r,
    customerName: profileMap.get(r.customer_id) || 'Pembeli',
  }))

  const avgRating = reviewsWithNames.length > 0
    ? reviewsWithNames.reduce((sum, r) => sum + r.rating, 0) / reviewsWithNames.length
    : 0

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-navy mb-5 transition">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke katalog
      </Link>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="aspect-square rounded-xl bg-stone/40 overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-14 h-14 text-navy/20" />
          )}
        </div>

        <div className="bg-white rounded-xl p-5">
          <p className="text-xs font-medium text-ink/40 mb-2">{product.categories?.name}</p>
          <h1 className="font-serif text-2xl font-bold text-navy mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-sm text-ink/50">
              {avgRating > 0 ? `${avgRating.toFixed(1)} (${reviewsWithNames.length} ulasan)` : 'Belum ada ulasan'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="font-semibold text-2xl text-ink">Rp {product.price.toLocaleString('id-ID')}</span>
            <span className="text-xs text-ink/40">{product.stock > 0 ? `Stok: ${product.stock}` : 'Stok habis'}</span>
          </div>

          {product.description && (
            <p className="text-ink/70 leading-relaxed mb-6 text-sm">{product.description}</p>
          )}

          <AddToCartButton productId={product.id} productName={product.name} price={product.price} imageUrl={product.image_url} maxStock={product.stock} disabled={product.stock === 0} />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-2xl font-bold text-navy mb-4">Ulasan Pembeli</h2>

        <ReviewForm productId={product.id} />

        {reviewsWithNames.length === 0 ? (
          <p className="text-ink/40 text-sm">Belum ada ulasan untuk produk ini. Jadi yang pertama!</p>
        ) : (
          <div className="space-y-2.5">
            {reviewsWithNames.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm">{r.customerName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink/40">{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                    {user?.id === r.customer_id && <ReviewDeleteButton reviewId={r.id} />}
                  </div>
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
