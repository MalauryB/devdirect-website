import { NextRequest, NextResponse } from 'next/server'
import { validateRedirectUrl } from '@/lib/validate-redirect'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  const next = validateRedirectUrl(searchParams.get('next'))

  // Case 1: Token hash present — redirect to client-side confirm page for OTP verification
  if (token_hash && type) {
    const redirectUrl = new URL('/auth/confirm', origin)
    redirectUrl.searchParams.set('token_hash', token_hash)
    redirectUrl.searchParams.set('type', type)
    redirectUrl.searchParams.set('next', next)
    return NextResponse.redirect(redirectUrl)
  }

  // Case 2: PKCE code present — redirect to confirm page to exchange the code
  if (code) {
    const redirectUrl = new URL('/auth/confirm', origin)
    redirectUrl.searchParams.set('code', code)
    redirectUrl.searchParams.set('next', next)
    return NextResponse.redirect(redirectUrl)
  }

  // Case 3: No token/code but has a next destination — Supabase already verified,
  // session will be established client-side via hash fragments
  return NextResponse.redirect(new URL(next, origin))
}
