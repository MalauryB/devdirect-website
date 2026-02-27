export function isValidSupabaseStorageUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return false
    const supabaseHost = new URL(supabaseUrl).host
    return parsed.host === supabaseHost || parsed.host.endsWith('.supabase.co')
  } catch {
    return false
  }
}
