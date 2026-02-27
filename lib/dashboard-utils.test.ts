import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatCurrency,
  formatDate,
  getTimeElapsed,
  getUrgencyLevel,
  getUrgencyBadgeColor,
  getRowUrgencyColor,
  getTimeElapsedColor,
  getStatusBadgeClass,
  getQuoteStatusBadgeClass,
} from './dashboard-utils'

describe('formatCurrency', () => {
  it('formats a round number in EUR', () => {
    const result = formatCurrency(1500)
    // Intl may use narrow no-break space – normalize whitespace
    expect(result.replace(/\s/g, ' ')).toContain('1 500')
    expect(result).toContain('€')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('truncates decimals', () => {
    const result = formatCurrency(1234.56)
    // minimumFractionDigits: 0, maximumFractionDigits: 0 → rounds
    expect(result.replace(/\s/g, ' ')).toContain('1 235')
  })
})

describe('formatDate', () => {
  it('formats a date string in FR short format', () => {
    const result = formatDate('2025-06-15T14:30:00Z')
    // Should contain day/month/year and hour:minute
    expect(result).toMatch(/15\/06\/25/)
  })
})

describe('getTimeElapsed', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns minutes for very recent dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T12:30:00Z'))
    const result = getTimeElapsed('2025-01-01T12:10:00Z')
    expect(result).toEqual({ value: 20, unit: 'min' })
  })

  it('returns at least 1 minute', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T12:00:30Z'))
    const result = getTimeElapsed('2025-01-01T12:00:00Z')
    expect(result).toEqual({ value: 1, unit: 'min' })
  })

  it('returns hours when >= 1 hour', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T15:00:00Z'))
    const result = getTimeElapsed('2025-01-01T12:00:00Z')
    expect(result).toEqual({ value: 3, unit: 'h' })
  })

  it('returns days when >= 1 day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-03T12:00:00Z'))
    const result = getTimeElapsed('2025-01-01T12:00:00Z')
    expect(result).toEqual({ value: 2, unit: 'j' })
  })
})

describe('getUrgencyLevel', () => {
  it('returns critical for >= 3 days', () => {
    expect(getUrgencyLevel({ value: 3, unit: 'j' })).toBe('critical')
    expect(getUrgencyLevel({ value: 5, unit: 'j' })).toBe('critical')
  })

  it('returns high for >= 1 day but < 3 days', () => {
    expect(getUrgencyLevel({ value: 1, unit: 'j' })).toBe('high')
    expect(getUrgencyLevel({ value: 2, unit: 'j' })).toBe('high')
  })

  it('returns medium for >= 4 hours', () => {
    expect(getUrgencyLevel({ value: 4, unit: 'h' })).toBe('medium')
    expect(getUrgencyLevel({ value: 10, unit: 'h' })).toBe('medium')
  })

  it('returns low for < 4 hours', () => {
    expect(getUrgencyLevel({ value: 3, unit: 'h' })).toBe('low')
    expect(getUrgencyLevel({ value: 30, unit: 'min' })).toBe('low')
  })

  it('converts minutes to hours correctly', () => {
    // 240 min = 4 hours → medium
    expect(getUrgencyLevel({ value: 240, unit: 'min' })).toBe('medium')
    // 239 min < 4 hours → low
    expect(getUrgencyLevel({ value: 239, unit: 'min' })).toBe('low')
  })
})

describe('getUrgencyBadgeColor', () => {
  it('returns red for critical', () => {
    expect(getUrgencyBadgeColor('critical')).toContain('red')
  })
  it('returns orange for high', () => {
    expect(getUrgencyBadgeColor('high')).toContain('orange')
  })
  it('returns yellow for medium', () => {
    expect(getUrgencyBadgeColor('medium')).toContain('yellow')
  })
  it('returns green for low', () => {
    expect(getUrgencyBadgeColor('low')).toContain('green')
  })
})

describe('getRowUrgencyColor', () => {
  it('returns red bg for critical', () => {
    expect(getRowUrgencyColor('critical')).toContain('red')
  })
  it('returns orange bg for high', () => {
    expect(getRowUrgencyColor('high')).toContain('orange')
  })
  it('returns yellow bg for medium', () => {
    expect(getRowUrgencyColor('medium')).toContain('yellow')
  })
  it('returns neutral bg for low', () => {
    expect(getRowUrgencyColor('low')).toContain('muted')
  })
})

describe('getTimeElapsedColor', () => {
  it('delegates to getUrgencyBadgeColor via getUrgencyLevel', () => {
    const result = getTimeElapsedColor({ value: 5, unit: 'j' })
    expect(result).toBe(getUrgencyBadgeColor('critical'))
  })
})

describe('getStatusBadgeClass', () => {
  it('returns yellow for pending', () => {
    expect(getStatusBadgeClass('pending')).toContain('yellow')
  })
  it('returns blue for in_review', () => {
    expect(getStatusBadgeClass('in_review')).toContain('blue')
  })
  it('returns purple for active', () => {
    expect(getStatusBadgeClass('active')).toContain('purple')
  })
  it('returns green for won', () => {
    expect(getStatusBadgeClass('won')).toContain('green')
  })
  it('returns red for lost', () => {
    expect(getStatusBadgeClass('lost')).toContain('red')
  })
  it('returns orange for cancelled', () => {
    expect(getStatusBadgeClass('cancelled')).toContain('orange')
  })
  it('returns muted for closed', () => {
    expect(getStatusBadgeClass('closed')).toContain('muted')
  })
  it('returns muted for unknown status', () => {
    expect(getStatusBadgeClass('unknown')).toContain('muted')
  })
})

describe('getQuoteStatusBadgeClass', () => {
  it('returns muted for draft', () => {
    expect(getQuoteStatusBadgeClass('draft')).toContain('muted')
  })
  it('returns blue for sent', () => {
    expect(getQuoteStatusBadgeClass('sent')).toContain('blue')
  })
  it('returns green for accepted', () => {
    expect(getQuoteStatusBadgeClass('accepted')).toContain('green')
  })
  it('returns red for rejected', () => {
    expect(getQuoteStatusBadgeClass('rejected')).toContain('red')
  })
  it('returns orange for expired', () => {
    expect(getQuoteStatusBadgeClass('expired')).toContain('orange')
  })
  it('returns muted for unknown status', () => {
    expect(getQuoteStatusBadgeClass('other')).toContain('muted')
  })
})
