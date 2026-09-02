import { Loader2 } from 'lucide-react'

export default function RootLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-baseline justify-between mb-5">
        <div className="h-9 w-48 bg-stone/40 rounded-lg" />
        <div className="h-4 w-20 bg-stone/30 rounded" />
      </div>

      {/* Search & Filter Skeleton */}
      <div className="space-y-3 mb-8">
        <div className="h-11 w-full bg-white rounded-lg border border-stone/40" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[80, 100, 120, 90, 110].map((w, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-white border border-stone/40 shrink-0"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
      </div>

      {/* Spinner Banner */}
      <div className="flex items-center justify-center gap-2 py-4 mb-6 text-navy/60">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-navy/70">
          Memuat Katalog Produk...
        </span>
      </div>

      {/* Hero Banner Skeleton */}
      <div className="mb-12 bg-white rounded-2xl p-6 border border-stone/40 grid md:grid-cols-2 gap-8 items-center">
        <div className="aspect-square rounded-xl bg-stone/30" />
        <div className="space-y-4">
          <div className="h-6 w-32 bg-stone/30 rounded-full" />
          <div className="h-8 w-3/4 bg-stone/40 rounded-lg" />
          <div className="h-4 w-1/3 bg-stone/20 rounded" />
          <div className="h-16 w-full bg-stone/20 rounded" />
          <div className="h-8 w-40 bg-stone/40 rounded-lg" />
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-3.5 border border-stone/30 flex flex-col justify-between">
            <div>
              <div className="aspect-square rounded-lg bg-stone/30 mb-3" />
              <div className="h-4 w-3/4 bg-stone/40 rounded mb-2" />
              <div className="h-3 w-1/2 bg-stone/20 rounded mb-3" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone/20">
              <div className="h-5 w-20 bg-stone/40 rounded" />
              <div className="h-8 w-8 rounded-lg bg-stone/30" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
