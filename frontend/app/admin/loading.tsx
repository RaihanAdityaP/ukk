import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-6 w-36 bg-brick/20 rounded-full mb-2" />
          <div className="h-9 w-64 bg-navy/20 rounded-lg mb-2" />
          <div className="h-4 w-80 bg-stone/40 rounded" />
        </div>
        <div className="h-10 w-36 bg-navy/20 rounded-xl" />
      </div>

      {/* Loading banner */}
      <div className="flex items-center justify-center gap-2 py-3 mb-6 text-navy/60">
        <Loader2 className="w-5 h-5 animate-spin text-brick" />
        <span className="text-xs font-semibold uppercase tracking-wider text-navy/70">
          Memuat Ruang Kerja Admin...
        </span>
      </div>

      {/* Stats Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-stone/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-stone/30 rounded" />
              <div className="w-8 h-8 rounded-lg bg-stone/20" />
            </div>
            <div className="h-8 w-24 bg-stone/40 rounded-lg" />
            <div className="h-3 w-32 bg-stone/20 rounded" />
          </div>
        ))}
      </div>

      {/* Table / content skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-stone/40 space-y-4">
        <div className="h-6 w-48 bg-stone/40 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-stone/20 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
