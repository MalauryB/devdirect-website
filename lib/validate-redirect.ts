export function validateRedirectUrl(url: string | null, fallback = '/dashboard'): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return fallback
  return url
}
