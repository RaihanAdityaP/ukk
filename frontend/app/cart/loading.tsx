import { Loader2 } from 'lucide-react'

export default function CartLoading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <h1 className="font-serif text-3xl font-bold text-navy mb-5">Keranjang Belanja</h1>

      <div className="bg-white rounded-xl p-12 border border-stone/30 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy mb-3" />
        <p className="text-sm font-medium text-ink/60">Memuat keranjang belanja...</p>
      </div>

      <div className="mt-6 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-stone/30 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-stone/30 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-stone/40 rounded" />
              <div className="h-3.5 w-1/4 bg-stone/30 rounded" />
            </div>
            <div className="w-24 h-8 bg-stone/20 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  )
}
