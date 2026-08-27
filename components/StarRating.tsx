'use client'

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
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'

  return (
    <div className={`flex gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange?.(star)}
          className={`${interactive ? 'cursor-pointer' : ''} ${star <= value ? 'text-accent' : 'text-stone'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}
