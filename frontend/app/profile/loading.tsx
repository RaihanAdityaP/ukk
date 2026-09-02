import { Loader2 } from 'lucide-react'

export default function ProfileLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8 animate-pulse">
      <h1 className="font-serif text-3xl font-bold text-navy mb-6">Profil Saya</h1>

      <div className="bg-white rounded-xl p-6 border border-stone/30 space-y-5">
        {/* Avatar skeleton */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-28 h-28 rounded-full bg-stone/30 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-navy/30" />
          </div>
          <div className="h-5 w-20 bg-stone/20 rounded-full" />
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-4">
          <div>
            <div className="h-3 w-16 bg-stone/30 rounded mb-1.5" />
            <div className="h-10 w-full bg-stone/20 rounded-lg" />
          </div>
          <div>
            <div className="h-3 w-20 bg-stone/30 rounded mb-1.5" />
            <div className="h-10 w-full bg-stone/20 rounded-lg" />
          </div>
          <div>
            <div className="h-3 w-24 bg-stone/30 rounded mb-1.5" />
            <div className="h-10 w-full bg-stone/20 rounded-lg" />
          </div>
          <div>
            <div className="h-3 w-28 bg-stone/30 rounded mb-1.5" />
            <div className="h-20 w-full bg-stone/20 rounded-lg" />
          </div>

          <div className="h-11 w-full bg-accent/30 rounded-lg" />
        </div>
      </div>
    </main>
  )
}
