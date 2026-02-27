import { describe, it, expect } from 'vitest'
import { escapeHtml } from './sanitize'

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('foo & bar')).toBe('foo &amp; bar')
  })

  it('escapes less-than signs', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b')
  })

  it('escapes greater-than signs', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b')
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s')
  })

  it('returns empty string unchanged', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('neutralizes a realistic XSS payload', () => {
    const payload = '<script>alert("xss")</script>'
    const result = escapeHtml(payload)
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('does not double-escape already escaped content', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;')
  })
})
