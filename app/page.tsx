import { createServerSupabase } from '@/lib/supabase-server'
import AddToCartButton from '@/components/AddToCartButton'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import Link from 'next/link'
import { Product } from '@/lib/types'

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

  const isFiltering = Boolean(search || category || minPrice || maxPrice)

  // Hero (Terlaris Minggu Ini) cuma ditampilin kalau lagi gak nyari/filter apa-apa
  let hero: ProductWithCategory | null | undefined = null
  let rest: ProductWithCategory[] = products ?? []

  if (!isFiltering) {
    const { data: featuredId } = await supabase.rpc('get_featured_product_id')
    hero = products?.find((p) => p.id === featuredId) ?? products?.[0]
    rest = products?.filter((p) => p.id !== hero?.id) ?? []
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-3 mb-6">
        <h1 className="font-serif text-4xl font-bold text-navy">Katalog Produk</h1>
        <span className="text-sm text-ink/50 tracking-wide">{products?.length ?? 0} barang tersedia</span>
      </div>

      <SearchBar />
      <FilterBar categories={categories ?? []} />

      {search && (
        <p className="text-sm text-ink/50 mb-6">
          Menampilkan hasil untuk <span className="font-semibold text-ink">&quot;{search}&quot;</span>
        </p>
      )}

      {hero && (
        <div className="grid md:grid-cols-2 gap-0 border-2 border-ink mb-10">
          <Link href={`/product/${hero.id}`} className="aspect-[4/3] md:aspect-auto bg-stone/40 overflow-hidden flex items-center justify-center">
            {hero.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.image_url} alt={hero.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-6xl text-navy/20">{hero.name.charAt(0)}</span>
            )}
          </Link>
          <div className="p-8 flex flex-col justify-center bg-white">
            <span className="inline-block w-fit bg-brick text-white text-[11px] tracking-widest uppercase px-2.5 py-1 mb-4">
              Terlaris Minggu Ini
            </span>
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">{hero.categories?.name}</p>
            <Link href={`/product/${hero.id}`}>
              <h2 className="font-serif text-3xl font-bold text-navy mb-3 leading-tight hover:text-brick transition">{hero.name}</h2>
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-serif text-2xl font-bold text-ink">Rp {hero.price.toLocaleString('id-ID')}</span>
              <span className="text-xs text-ink/40">{hero.stock > 0 ? `Stok: ${hero.stock}` : 'Stok habis'}</span>
            </div>
            <div className="w-fit">
              <AddToCartButton productId={hero.id} productName={hero.name} price={hero.price} imageUrl={hero.image_url} maxStock={hero.stock} disabled={hero.stock === 0} />
            </div>
          </div>
        </div>
      )}

      <div className="divide-y-2 divide-stone">
        {rest.map((p) => (
          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 py-5">
            <Link href={`/product/${p.id}`} className="w-20 h-20 flex-shrink-0 bg-stone/40 overflow-hidden flex items-center justify-center">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-2xl text-navy/20">{p.name.charAt(0)}</span>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-ink/40 mb-0.5">
                {p.categories?.name} · {p.stock > 0 ? `Stok ${p.stock}` : 'Habis'}
              </p>
              <div className="flex items-baseline flex-wrap gap-x-2">
                <Link href={`/product/${p.id}`}>
                  <h3 className="font-serif font-semibold text-lg text-ink hover:text-brick transition">{p.name}</h3>
                </Link>
                <span className="leader-line hidden sm:block" />
                <span className="font-serif font-bold text-navy whitespace-nowrap">Rp {p.price.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="sm:flex-shrink-0">
              <AddToCartButton productId={p.id} productName={p.name} price={p.price} imageUrl={p.image_url} maxStock={p.stock} disabled={p.stock === 0} />
            </div>
          </div>
        ))}
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