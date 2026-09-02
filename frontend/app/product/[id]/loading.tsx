import { Loader2, ArrowLeft } from 'lucide-react'

export default function ProductDetailLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      {/* Back button placeholder */}
      <div className="flex items-center gap-1.5 text-sm text-ink/40 mb-5">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke katalog</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Product image placeholder */}
        <div className="aspect-square rounded-xl bg-stone/40 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-navy/30" />
        </div>

        {/* Product detail placeholder */}
        <div className="bg-white rounded-xl p-6 border border-stone/30 space-y-4 flex flex-col justify-between">
          <div>
            <div className="h-4 w-24 bg-stone/30 rounded mb-2" />
            <div className="h-8 w-3/4 bg-stone/40 rounded-lg mb-3" />
            <div className="h-5 w-32 bg-stone/20 rounded mb-4" />
            <div className="h-8 w-40 bg-stone/40 rounded-lg mb-6" />

            <div className="space-y-2 mb-6">
              <div className="h-3.5 w-full bg-stone/20 rounded" />
              <div className="h-3.5 w-5/6 bg-stone/20 rounded" />
              <div className="h-3.5 w-4/6 bg-stone/20 rounded" />
            </div>
          </div>

          <div className="pt-4 border-t border-stone/30">
            <div className="h-11 w-full bg-accent/30 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Reviews skeleton */}
      <div className="bg-white rounded-xl p-6 border border-stone/30 space-y-4">
        <div className="h-6 w-36 bg-stone/40 rounded" />
        <div className="h-20 w-full bg-stone/20 rounded-lg" />
        <div className="space-y-3">
          <div className="h-16 w-full bg-stone/20 rounded-lg" />
          <div className="h-16 w-full bg-stone/20 rounded-lg" />
        </div>
      </div>
    </main>
  )
}
