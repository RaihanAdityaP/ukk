export function getImageUrl(url?: string | null): string {
  if (!url) return '/placeholder.png'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  if (url.startsWith('/storage/')) {
    return `${backendUrl}${url}`
  }
  if (url.startsWith('/')) return url
  return `/${url}`
}
