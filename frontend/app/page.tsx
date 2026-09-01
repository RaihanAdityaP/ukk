import AddToCartButton from '@/components/AddToCartButton'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import Link from 'next/link'
import { getImageUrl } from '@/lib/utils'
import { createServerSupabase } from '@/lib/supabase-server'
import { ProductService } from '@/lib/services/ProductService'

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

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }>
}) {
  const { search, category, minPrice, maxPrice } = await searchParams
  const supabase = await createServerSupabase()
  const productService = new ProductService(supabase)

  // 1. Ambil Kategori & Review secara Paralel (Promise.all)
  const [categoriesRes, reviewsRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('reviews').select('product_id, rating'),
  ])

  const categories = categoriesRes.data ?? []
  const allReviews = reviewsRes.data ?? []

  let selectedCatId: string | undefined = undefined
  if (category) {
    const matched = categories.find((c: any) => c.name.toLowerCase() === category.toLowerCase())
    if (matched) {
      selectedCatId = String(matched.id)
    }
  }

  // 2. Ambil Produk dari Supabase via OOP ProductService
  let products: any[] = await productService.list(search, selectedCatId)

  const ratingMap = new Map<string, { total: number; count: number }>()
  allReviews.forEach((r: any) => {
    const current = ratingMap.get(r.product_id) ?? { total: 0, count: 0 }
    ratingMap.set(r.product_id, {
      total: current.total + r.rating,
      count: current.count + 1,
    })
  })

  // Filter Harga di Memory
  if (minPrice) {
    products = products.filter((p: any) => p.price >= Number(minPrice))
  }
  if (maxPrice) {
    products = products.filter((p: any) => p.price <= Number(maxPrice))
  }

  const isFiltering = Boolean(search || category || minPrice || maxPrice)

  // 4. PENENTUAN PRODUK UNGGULAN SECARA 100% OTOMATIS (Best Seller & Highest Rating)
  let hero: any = null
  let rest: any[] = products

  if (!isFiltering && products.length > 0) {
    hero = await productService.getAutomaticFeaturedProduct(products, allReviews)
    rest = products.filter((p: any) => p.id !== hero?.id)
  }

  const heroRatingData = hero ? ratingMap.get(hero.id) : null
  const heroRating = heroRatingData ? Number((heroRatingData.total / heroRatingData.count).toFixed(1)) : null
  const heroReviewCount = heroRatingData?.count ?? 0

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
        <section className="mb-12 bg-white rounded-2xl p-5 sm:p-7 border border-stone/50 hover:border-stone transition-all duration-300">
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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brick bg-brick/10 px-2.5 py-1 rounded-full">
                  ★ Terlaris & Paling Diminati
                </span>
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

              {heroRating !== null && (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-ink">{heroRating.toFixed(1)}</span>
                  <span className="text-xs text-ink/40">({heroReviewCount} ulasan)</span>
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
            const rData = ratingMap.get(product.id)
            const avgRating = rData ? Number((rData.total / rData.count).toFixed(1)) : null
            const revCount = rData?.count ?? 0

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
                      {product.categories ? (
                        <span className="text-[11px] text-ink/50 font-medium">
                          {product.categories.name}
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

                    {/* Rating Indicator */}
                    <div className="flex items-center gap-1.5 my-1.5">
                      <Star className={`w-3.5 h-3.5 ${avgRating !== null ? 'fill-current text-amber-500' : 'text-stone/60 stroke-[1.5]'}`} />
                      {avgRating !== null ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-ink">{avgRating.toFixed(1)}</span>
                          <span className="text-[10px] text-ink/40 font-normal">({revCount} ulasan)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-ink/40 font-normal">Belum ada ulasan</span>
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