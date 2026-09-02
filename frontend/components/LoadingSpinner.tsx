import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'navy' | 'accent' | 'brick' | 'white' | 'stone'
  text?: string
  className?: string
  inline?: boolean
}

const sizeMap = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const colorMap = {
  navy: 'text-navy',
  accent: 'text-accent',
  brick: 'text-brick',
  white: 'text-white',
  stone: 'text-stone',
}

export default function LoadingSpinner({
  size = 'md',
  color = 'navy',
  text,
  className = '',
  inline = false,
}: LoadingSpinnerProps) {
  const spinnerClass = `${sizeMap[size]} ${colorMap[color]} animate-spin ${className}`

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        <Loader2 className={spinnerClass} />
        {text && <span>{text}</span>}
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <div className="relative flex items-center justify-center">
        <Loader2 className={spinnerClass} />
      </div>
      {text && (
        <p className="text-xs font-medium text-ink/60 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}
