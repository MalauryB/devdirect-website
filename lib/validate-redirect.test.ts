import { describe, it, expect } from 'vitest'
import { validateRedirectUrl } from './validate-redirect'

describe('validateRedirectUrl', () => {
  it('accepts a valid relative path', () => {
    expect(validateRedirectUrl('/dashboard')).toBe('/dashboard')
  })

  it('accepts a nested relative path', () => {
    expect(validateRedirectUrl('/dashboard/projects/123')).toBe('/dashboard/projects/123')
  })

  it('accepts root path', () => {
    expect(validateRedirectUrl('/')).toBe('/')
  })

  it('rejects absolute URLs', () => {
    expect(validateRedirectUrl('https://evil.com')).toBe('/dashboard')
  })

  it('rejects protocol-relative URLs', () => {
    expect(validateRedirectUrl('//evil.com')).toBe('/dashboard')
  })

  it('rejects javascript: URLs', () => {
    expect(validateRedirectUrl('javascript:alert(1)')).toBe('/dashboard')
  })

  it('returns fallback for null', () => {
    expect(validateRedirectUrl(null)).toBe('/dashboard')
  })

  it('returns fallback for empty string', () => {
    expect(validateRedirectUrl('')).toBe('/dashboard')
  })

  it('uses custom fallback when provided', () => {
    expect(validateRedirectUrl(null, '/custom')).toBe('/custom')
  })
})
