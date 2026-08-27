'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Category = { id: string; name: string }

export default function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') ?? ''
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') ?? '')
    setMaxPrice(searchParams.get('maxPrice') ?? '')
  }, [searchParams])

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.replace(`/?${params.toString()}`)
  }

  function handleCategoryClick(slug: string) {
    updateParams({ category: slug === activeCategory ? '' : slug })
  }

  function handlePriceChange(type: 'minPrice' | 'maxPrice', value: string) {
    const digits = value.replace(/[^0-9]/g, '')
    if (type === 'minPrice') setMinPrice(digits)
    else setMaxPrice(digits)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParams({ [type]: digits })
    }, 500)
  }

  const hasActiveFilters = activeCategory || minPrice || maxPrice

  function clearFilters() {
    updateParams({ category: '', minPrice: '', maxPrice: '' })
  }

  return (
    <div className="mb-6">
      {/* Kategori */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => updateParams({ category: '' })}
          className={`text-xs font-medium uppercase tracking-wide px-3 py-1.5 border-2 transition ${
            !activeCategory ? 'bg-navy text-white border-navy' : 'border-stone text-ink/60 hover:border-navy'
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => {
          const slug = cat.name.toLowerCase()
          const isActive = activeCategory === slug
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(slug)}
              className={`text-xs font-medium uppercase tracking-wide px-3 py-1.5 border-2 transition ${
                isActive ? 'bg-navy text-white border-navy' : 'border-stone text-ink/60 hover:border-navy'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Rentang harga */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-ink/50">Harga:</span>
        <input
          type="text"
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => handlePriceChange('minPrice', e.target.value)}
          placeholder="Min"
          className="w-24 border-2 border-stone px-2 py-1 text-sm bg-white focus:outline-none focus:border-navy"
        />
        <span className="text-ink/30">—</span>
        <input
          type="text"
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
          placeholder="Max"
          className="w-24 border-2 border-stone px-2 py-1 text-sm bg-white focus:outline-none focus:border-navy"
        />

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-brick font-medium hover:underline ml-2">
            Hapus semua filter
          </button>
        )}
      </div>
    </div>
  )
}