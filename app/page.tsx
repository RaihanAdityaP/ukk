import { createServerSupabase } from '@/lib/supabase-server'
import AddToCartButton from '@/components/AddToCartButton'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import Link from 'next/link'
import { Product } from '@/lib/types'
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

type ProductWithCategory = Product & { categories?: { name: string } }

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }>
}) {
  const { search, category, minPrice, maxPrice } = await searchParams
  const supabase = await createServerSupabase()

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  let query = supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  if (category) {
    const matchedCategory = categories?.find((c) => c.name.toLowerCase() === category.toLowerCase())
    if (matchedCategory) {
      query = query.eq('category_id', matchedCategory.id)
    }
  }
  if (minPrice) {
    query = query.gte('price', Number(minPrice))
  }
  if (maxPrice) {
    query = query.lte('price', Number(maxPrice))
  }

  const { data: products } = await query

  // Ambil semua rating sekaligus, terus dirata-ratain per produk di JS
  // (lebih efisien daripada query terpisah per produk)
  const { data: allReviews } = await supabase.from('reviews').select('product_id, rating')
  const ratingMap = new Map<string, { avg: number; count: number }>()
  allReviews?.forEach((r) => {
    const existing = ratingMap.get(r.product_id) ?? { avg: 0, count: 0 }
    const newCount = existing.count + 1
    const newAvg = (existing.avg * existing.count + r.rating) / newCount
    ratingMap.set(r.product_id, { avg: newAvg, count: newCount })
  })

  const isFiltering = Boolean(search || category || minPrice || maxPrice)

  let hero: ProductWithCategory | null | undefined = null
  let rest: ProductWithCategory[] = products ?? []

  if (!isFiltering) {
    const { data: featuredId } = await supabase.rpc('get_featured_product_id')
    hero = products?.find((p) => p.id === featuredId) ?? products?.[0]
    rest = products?.filter((p) => p.id !== hero?.id) ?? []
  }

  const heroRating = hero ? ratingMap.get(hero.id) : undefined

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Katalog Produk</h1>
        <span className="text-sm text-ink/50 tracking-wide">{products?.length ?? 0} barang</span>
      </div>

      <SearchBar />
      <FilterBar categories={categories ?? []} />

      {search && (
        <p className="text-sm text-ink/50 mb-5">
          Hasil untuk <span className="font-semibold text-ink">&quot;{search}&quot;</span>
        </p>
      )}

      {hero && (
        <div className="bg-white rounded-xl overflow-hidden mb-6">
          <Link href={`/product/${hero.id}`} className="relative aspect-[16/9] bg-stone/40 flex items-center justify-center">
            {hero.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.image_url} alt={hero.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-10 h-10 text-navy/20" />
            )}
            <span className="absolute top-3 left-3 bg-brick text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
              Terlaris
            </span>
          </Link>
          <div className="p-4">
            <p className="text-[11px] uppercase tracking-wide text-ink/40 mb-1">{hero.categories?.name}</p>
            <Link href={`/product/${hero.id}`}>
              <h2 className="font-serif text-xl font-bold text-navy mb-1.5 hover:text-brick transition">{hero.name}</h2>
            </Link>
            <div className="flex items-center gap-1.5 mb-3">
              {heroRating && (
                <>
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="text-xs text-ink/50">{heroRating.avg.toFixed(1)} · {heroRating.count} ulasan</span>
                  <span className="text-xs text-ink/30">·</span>
                </>
              )}
              <span className="text-xs text-ink/50">{hero.stock > 0 ? `Stok ${hero.stock}` : 'Habis'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-ink">Rp {hero.price.toLocaleString('id-ID')}</span>
              <AddToCartButton productId={hero.id} productName={hero.name} price={hero.price} imageUrl={hero.image_url} maxStock={hero.stock} disabled={hero.stock === 0} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {rest.map((p) => {
          const rating = ratingMap.get(p.id)
          return (
            <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-2.5">
              <Link href={`/product/${p.id}`} className="w-14 h-14 rounded-lg flex-shrink-0 bg-stone/40 overflow-hidden flex items-center justify-center">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-navy/20" />
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/product/${p.id}`}>
                  <p className="font-medium text-sm text-ink truncate hover:text-brick transition">{p.name}</p>
                </Link>
                <div className="flex items-center gap-1.5">
                  {rating ? (
                    <>
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-[11px] text-ink/45">{rating.avg.toFixed(1)} · {p.stock > 0 ? `stok ${p.stock}` : 'habis'}</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-ink/45">{p.stock > 0 ? `Stok ${p.stock}` : 'Habis'}</span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-medium text-sm text-navy mb-1">Rp {p.price.toLocaleString('id-ID')}</p>
                <AddToCartButton productId={p.id} productName={p.name} price={p.price} imageUrl={p.image_url} maxStock={p.stock} disabled={p.stock === 0} compact />
              </div>
            </div>
          )
        })}
      </div>

      {products && products.length === 0 && isFiltering && (
        <p className="text-center text-ink/40 py-16">Tidak ada produk yang cocok dengan filter ini.</p>
      )}

      {(!products || products.length === 0) && !isFiltering && (
        <p className="text-center text-ink/40 py-16">Belum ada produk. Admin bisa tambahkan lewat halaman Admin.</p>
      )}
    </main>
  )
}