'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'

type Category = { id: string; name: string }

export default function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') ?? ''
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const [priceOpen, setPriceOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') ?? '')
    setMaxPrice(searchParams.get('maxPrice') ?? '')
  }, [searchParams])

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
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
    debounceRef.current = setTimeout(() => updateParams({ [type]: digits }), 500)
  }

  const hasPriceFilter = minPrice || maxPrice
  const hasActiveFilters = activeCategory || hasPriceFilter

  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => updateParams({ category: '' })}
          className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition ${
            !activeCategory ? 'bg-navy text-white' : 'bg-white text-ink/60 hover:bg-stone/30'
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
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition ${
                isActive ? 'bg-navy text-white' : 'bg-white text-ink/60 hover:bg-stone/30'
              }`}
            >
              {cat.name}
            </button>
          )
        })}

        <button
          onClick={() => setPriceOpen((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full transition ${
            hasPriceFilter || priceOpen ? 'bg-navy text-white' : 'bg-white text-ink/60 hover:bg-stone/30'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Harga
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => {
              updateParams({ category: '', minPrice: '', maxPrice: '' })
              setPriceOpen(false)
            }}
            className="text-xs text-brick font-medium hover:underline"
          >
            Hapus filter
          </button>
        )}
      </div>

      {priceOpen && (
        <div className="flex items-center gap-2 mt-2.5 bg-white rounded-lg p-3 w-fit">
          <input
            type="text"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            placeholder="Min"
            className="w-24 rounded-md border border-stone px-2.5 py-1.5 text-sm focus:outline-none focus:border-navy"
          />
          <span className="text-ink/30 text-sm">—</span>
          <input
            type="text"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            placeholder="Max"
            className="w-24 rounded-md border border-stone px-2.5 py-1.5 text-sm focus:outline-none focus:border-navy"
          />
        </div>
      )}
    </div>
  )
}
