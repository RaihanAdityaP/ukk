import AddToCartButton from '@/components/AddToCartButton'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import Link from 'next/link'
import { getImageUrl } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function getProducts(search?: string, categoryId?: string) {
  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId && categoryId !== 'All') params.set('category', categoryId)
    const qs = params.toString()
    const url = `${API_URL}/products${qs ? `?${qs}` : ''}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="m12 2.5 2.94 5.95 6.56.95-4.75 4.63 1.12 6.54L12 17.48l-5.87 3.09 1.12-6.54L2.5 9.4l6.56-.95L12 2.5Z" />
    </svg>
  )
}

function ImageIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  )
}

function calculateProductScore(p: any): number {
  if (p.popularity_score != null && typeof p.popularity_score === 'number') {
    return p.popularity_score
  }

  const sold = Number(p.total_sold ?? 0)
  const rating = Number(
    p.average_rating ??
      p.reviews_avg_rating ??
      (p.reviews?.length ? p.reviews.reduce((s: number, r: any) => s + Number(r.rating || 0), 0) / p.reviews.length : 0)
  )
  const reviewCount = Number(p.total_reviews ?? p.reviews_count ?? p.reviews?.length ?? 0)
  const orderCount = Number(p.total_orders ?? 0)

  // 1. Total Unit Terjual (Bobot 45%)
  const salesFactor = Math.min(sold * 12, 100)
  // 2. Kualitas Rating Ulasan (Bobot 35%)
  const ratingFactor = rating > 0 ? (rating / 5) * 100 : 0
  // 3. Jumlah Ulasan / Social Proof (Bobot 15%)
  const reviewFactor = Math.min(reviewCount * 15, 100)
  // 4. Frekuensi Transaksi Pesanan (Bobot 5%)
  const orderFactor = Math.min(orderCount * 10, 100)

  return (salesFactor * 0.45) + (ratingFactor * 0.35) + (reviewFactor * 0.15) + (orderFactor * 0.05)
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }>
}) {
  const { search, category, minPrice, maxPrice } = await searchParams

  const categories = await getCategories()

  let selectedCatId: string | undefined = undefined
  if (category) {
    const matched = categories.find(
      (c: any) => c.name?.toLowerCase() === category.toLowerCase() || String(c.id) === category
    )
    if (matched) {
      selectedCatId = String(matched.id)
    }
  }

  let products: any[] = await getProducts(search, selectedCatId)

  // Filter Harga di Memory
  if (minPrice) {
    products = products.filter((p: any) => p.price >= Number(minPrice))
  }
  if (maxPrice) {
    products = products.filter((p: any) => p.price <= Number(maxPrice))
  }

  const isFiltering = Boolean(search || category || minPrice || maxPrice)

  // Penentuan Produk Terlaris & Paling Diminati (Peringkat #1 berdasarkan data riil penjualan, ulasan & rating)
  let hero: any = null
  let rest: any[] = products

  if (!isFiltering && products.length > 0) {
    const scoredProducts = [...products].sort((a, b) => {
      const scoreA = calculateProductScore(a)
      const scoreB = calculateProductScore(b)
      if (scoreB !== scoreA) {
        return scoreB - scoreA
      }
      const soldA = a.total_sold ?? 0
      const soldB = b.total_sold ?? 0
      if (soldB !== soldA) {
        return soldB - soldA
      }
      const ratingA = a.average_rating ?? 0
      const ratingB = b.average_rating ?? 0
      return ratingB - ratingA
    })

    hero = scoredProducts[0]
    rest = products.filter((p: any) => p.id !== hero?.id)
  }

  const heroRating = hero?.average_rating ?? hero?.reviews_avg_rating ?? null
  const heroReviewCount = hero?.total_reviews ?? hero?.reviews?.length ?? 0
  const heroTotalSold = hero?.total_sold ?? 0

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Katalog Produk</h1>
        <span className="text-sm text-ink/50 tracking-wide">{products?.length ?? 0} barang</span>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <SearchBar />
        <FilterBar categories={categories ?? []} />
      </div>

      {hero && (
        <section className="mb-12 bg-white rounded-2xl p-5 sm:p-7 border border-stone/50 hover:border-stone transition-all duration-300 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Link
              href={`/product/${hero.id}`}
              className="aspect-square rounded-xl bg-stone/40 overflow-hidden relative group block"
            >
              {hero.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(hero.image_url)}
                  alt={hero.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-navy/20">
                  <ImageIcon className="w-16 h-16 stroke-1" />
                </div>
              )}
            </Link>

            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brick bg-brick/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>★</span> Terlaris & Paling Diminati
                </span>
                {heroTotalSold > 0 && (
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    🔥 {heroTotalSold} Terjual
                  </span>
                )}
                {hero.categories && (
                  <span className="text-xs text-ink/50 font-medium">
                    {hero.categories.name}
                  </span>
                )}
              </div>

              <Link href={`/product/${hero.id}`} className="group">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy group-hover:text-brick transition-colors leading-tight mb-2">
                  {hero.name}
                </h2>
              </Link>

              {heroRating !== null && heroRating > 0 ? (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-ink">{heroRating.toFixed(1)}</span>
                  <span className="text-xs text-ink/40">({heroReviewCount} ulasan pembeli)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-3 text-xs text-ink/50">
                  <span>Belum ada ulasan</span>
                </div>
              )}

              <p className="text-sm text-ink/70 line-clamp-3 mb-6 leading-relaxed">
                {hero.description || 'Tidak ada deskripsi produk.'}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone/30">
                <div>
                  <span className="text-xs text-ink/40 block mb-0.5">Harga Terbaik</span>
                  <span className="text-2xl font-bold text-navy">
                    Rp {hero.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-full sm:w-auto">
                  <AddToCartButton productId={hero.id} stock={hero.stock} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone">
          <p className="font-serif text-xl font-bold text-navy mb-1">Produk Tidak Ditemukan</p>
          <p className="text-sm text-ink/50">Coba ubah kata kunci atau reset filter pencarian kamu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {rest.map((product: any) => {
            const avgRating =
              product.average_rating != null && product.average_rating > 0
                ? Number(Number(product.average_rating).toFixed(1))
                : product.reviews_avg_rating != null && product.reviews_avg_rating > 0
                ? Number(Number(product.reviews_avg_rating).toFixed(1))
                : null
            const revCount = product.total_reviews ?? product.reviews?.length ?? 0
            const soldCount = product.total_sold ?? 0
            const categoryName = product.category?.name || product.categories?.name

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden border border-stone/50 hover:border-stone hover:shadow-sm transition-all duration-300 flex flex-col group"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="aspect-square bg-stone/30 overflow-hidden relative block"
                >
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-navy/20">
                      <ImageIcon className="w-10 h-10 stroke-1" />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-paper/80 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brick bg-white px-2 py-1 rounded shadow-sm">
                        Stok Habis
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {categoryName ? (
                        <span className="text-[11px] text-ink/50 font-medium">
                          {categoryName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-ink/40">Produk</span>
                      )}

                      {/* Stock Indicator Badge */}
                      {product.stock > 10 ? (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                          Stok: {product.stock}
                        </span>
                      ) : product.stock > 0 ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Sisa {product.stock}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Habis
                        </span>
                      )}
                    </div>

                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-serif font-bold text-navy group-hover:text-brick transition-colors line-clamp-2 text-base leading-snug mb-1">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating & Sales Indicator */}
                    <div className="flex items-center justify-between gap-1 my-1.5 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className={`w-3.5 h-3.5 ${avgRating !== null ? 'fill-current text-amber-500' : 'text-stone/60 stroke-[1.5]'}`} />
                        {avgRating !== null ? (
                          <span className="font-bold text-ink">{avgRating.toFixed(1)}</span>
                        ) : (
                          <span className="text-[10px] text-ink/40 font-normal">Baru</span>
                        )}
                        {revCount > 0 && (
                          <span className="text-[10px] text-ink/40 font-normal">({revCount})</span>
                        )}
                      </div>
                      {soldCount > 0 && (
                        <span className="text-[10px] text-ink/60 bg-stone/30 px-1.5 py-0.5 rounded font-medium">
                          {soldCount} terjual
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone/20 flex flex-wrap items-center justify-between gap-2 mt-auto">
                    <span className="font-bold text-navy text-sm sm:text-base">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <AddToCartButton productId={product.id} stock={product.stock} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}