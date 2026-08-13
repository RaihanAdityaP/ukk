import { createServerSupabase } from '@/lib/supabase-server'
import AddToCartButton from '@/components/AddToCartButton'

export default async function ShopPage() {
  const supabase = await createServerSupabase()
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  // Cari produk yang ditandai admin sebagai featured. Kalau belum ada yang di-set, fallback ke produk terbaru.
  const featured = products?.find((p) => p.is_featured)
  const hero = featured ?? products?.[0]
  const rest = products?.filter((p) => p.id !== hero?.id) ?? []

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-3 mb-8">
        <h1 className="font-serif text-4xl font-bold text-navy">Katalog Produk</h1>
        <span className="text-sm text-ink/50 tracking-wide">{products?.length ?? 0} barang tersedia</span>
      </div>

      {hero && (
        <div className="grid md:grid-cols-2 gap-0 border-2 border-ink mb-10">
          <div className="aspect-[4/3] md:aspect-auto bg-stone/40 overflow-hidden flex items-center justify-center">
            {hero.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.image_url} alt={hero.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-6xl text-navy/20">{hero.name.charAt(0)}</span>
            )}
          </div>
          <div className="p-8 flex flex-col justify-center bg-white">
            <span className="inline-block w-fit bg-brick text-white text-[11px] tracking-widest uppercase px-2.5 py-1 mb-4">
              Pilihan Minggu Ini
            </span>
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">{hero.categories?.name}</p>
            <h2 className="font-serif text-3xl font-bold text-navy mb-3 leading-tight">{hero.name}</h2>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-serif text-2xl font-bold text-ink">Rp {hero.price.toLocaleString('id-ID')}</span>
              <span className="text-xs text-ink/40">{hero.stock > 0 ? `Stok: ${hero.stock}` : 'Stok habis'}</span>
            </div>
            <div className="w-fit">
              <AddToCartButton productId={hero.id} disabled={hero.stock === 0} />
            </div>
          </div>
        </div>
      )}

      <div className="divide-y-2 divide-stone">
        {rest.map((p) => (
          <div key={p.id} className="flex items-center gap-5 py-5">
            <div className="w-20 h-20 flex-shrink-0 bg-stone/40 overflow-hidden flex items-center justify-center">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-2xl text-navy/20">{p.name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-ink/40 mb-0.5">
                {p.categories?.name} · {p.stock > 0 ? `Stok ${p.stock}` : 'Habis'}
              </p>
              <div className="flex items-baseline">
                <h3 className="font-serif font-semibold text-lg text-ink whitespace-nowrap">{p.name}</h3>
                <span className="leader-line" />
                <span className="font-serif font-bold text-navy whitespace-nowrap">Rp {p.price.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <AddToCartButton productId={p.id} disabled={p.stock === 0} />
          </div>
        ))}
      </div>

      {(!products || products.length === 0) && (
        <p className="text-center text-ink/40 py-16">Belum ada produk. Admin bisa tambahkan lewat halaman Admin.</p>
      )}
    </main>
  )
}
