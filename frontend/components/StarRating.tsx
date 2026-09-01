'use client'

import { Star } from 'lucide-react'

export default function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const interactive = !!onChange
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-7 h-7' : 'w-4.5 h-4.5'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="p-1.5 -m-1.5 touch-manipulation"
            aria-label={`Beri rating ${star} bintang`}
          >
            <Star
              className={`${iconSize} ${star <= value ? 'text-accent' : 'text-stone'}`}
              fill={star <= value ? 'currentColor' : 'none'}
              stroke="currentColor"
            />
          </button>
        ) : (
          <Star
            key={star}
            className={`${iconSize} ${star <= value ? 'text-accent' : 'text-stone'}`}
            fill={star <= value ? 'currentColor' : 'none'}
            stroke="currentColor"
          />
        )
      )}
    </div>
  )
}