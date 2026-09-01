'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(searchParams.get('search') ?? '')
  }, [searchParams])

  function handleChange(newValue: string) {
    setValue(newValue)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (newValue.trim()) {
        params.set('search', newValue.trim())
      } else {
        params.delete('search')
      }
      router.replace(`/?${params.toString()}`)
    }, 400)
  }

  return (
    <div className="relative mb-3">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Cari produk"
        className="w-full rounded-lg border border-stone px-4 py-2.5 pl-10 bg-white focus:outline-none focus:border-navy text-sm"
      />
      {value && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-ink/35 hover:bg-stone/40 hover:text-brick transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
