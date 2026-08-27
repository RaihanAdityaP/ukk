'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
    <div className="relative mb-6">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Cari produk..."
        className="w-full border-2 border-stone px-4 py-2.5 pl-10 bg-white focus:outline-none focus:border-navy text-sm"
      />
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30">⌕</span>
      {value && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-brick text-sm"
        >
          ✕
        </button>
      )}
    </div>
  )
}