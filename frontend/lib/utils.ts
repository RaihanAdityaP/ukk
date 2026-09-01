export function getImageUrl(url?: string | null): string {
  if (!url) return '/placeholder.png'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return url
  return `/${url}`
}
