import { NextRequest, NextResponse } from 'next/server'
import { validateRedirectUrl } from '@/lib/validate-redirect'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = validateRedirectUrl(searchParams.get('next'))

  // Redirect to a client-side page that will handle the verification
  if (token_hash && type) {
    const redirectUrl = new URL('/auth/confirm', origin)
    redirectUrl.searchParams.set('token_hash', token_hash)
    redirectUrl.searchParams.set('type', type)
    redirectUrl.searchParams.set('next', next)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.redirect(new URL('/auth/error', origin))
}
