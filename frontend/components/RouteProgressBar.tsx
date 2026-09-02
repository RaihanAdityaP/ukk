'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function RouteProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // When path or query params change, finish progress
    if (loading) {
      setProgress(100)
      const timer = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external links, mailto, hashes, target="_blank", or download
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('#') ||
        target.getAttribute('target') === '_blank' ||
        target.hasAttribute('download')
      ) {
        return
      }

      // Check if it's the exact same url (ignore full reload if identical)
      const currentUrl = window.location.pathname + window.location.search
      if (href === currentUrl) return

      // Start loading bar
      setLoading(true)
      setProgress(30)

      setTimeout(() => {
        setProgress((prev) => (prev >= 30 && prev < 80 ? 75 : prev))
      }, 150)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!loading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-1 bg-transparent overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-brick via-accent to-navy transition-all duration-300 ease-out shadow-[0_0_8px_rgba(242,169,59,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? 'width 0.2s ease-out, opacity 0.3s ease-out 0.1s' : 'width 0.3s ease-out',
        }}
      />
    </div>
  )
}
