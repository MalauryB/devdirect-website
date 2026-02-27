// Format currency helper
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format date helper (short format)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Calculate time elapsed since a date (for processing time display)
export const getTimeElapsed = (dateString: string): { value: number; unit: 'min' | 'h' | 'j' } => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays >= 1) {
    return { value: diffDays, unit: 'j' }
  } else if (diffHours >= 1) {
    return { value: diffHours, unit: 'h' }
  } else {
    return { value: Math.max(1, diffMinutes), unit: 'min' }
  }
}

// Urgency levels based on processing time
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low'

export const getUrgencyLevel = (elapsed: { value: number; unit: 'min' | 'h' | 'j' }): UrgencyLevel => {
  const totalHours = elapsed.unit === 'j' ? elapsed.value * 24 : elapsed.unit === 'h' ? elapsed.value : elapsed.value / 60

  if (totalHours >= 72) return 'critical'  // >= 3 days
  if (totalHours >= 24) return 'high'      // >= 1 day
  if (totalHours >= 4) return 'medium'     // >= 4 hours
  return 'low'                              // < 4 hours
}

// Get color class for urgency badge
export const getUrgencyBadgeColor = (urgency: UrgencyLevel): string => {
  switch (urgency) {
    case 'critical': return 'text-red-700 bg-red-100 border-red-200'
    case 'high': return 'text-orange-700 bg-orange-100 border-orange-200'
    case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
    case 'low': return 'text-green-700 bg-green-100 border-green-200'
  }
}

// Get row background color based on urgency
export const getRowUrgencyColor = (urgency: UrgencyLevel): string => {
  switch (urgency) {
    case 'critical': return 'bg-red-50/50 hover:bg-red-50'
    case 'high': return 'bg-orange-50/50 hover:bg-orange-50'
    case 'medium': return 'bg-yellow-50/30 hover:bg-yellow-50/50'
    case 'low': return 'hover:bg-muted/50'
  }
}

// Get color class based on processing time urgency (for time badge)
export const getTimeElapsedColor = (elapsed: { value: number; unit: 'min' | 'h' | 'j' }): string => {
  const urgency = getUrgencyLevel(elapsed)
  return getUrgencyBadgeColor(urgency)
}

// Status badge styling helper
export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'in_review': return 'bg-blue-100 text-blue-800'
    case 'active': return 'bg-purple-100 text-purple-800'
    case 'won': return 'bg-green-100 text-green-800'
    case 'lost': return 'bg-red-100 text-red-800'
    case 'cancelled': return 'bg-orange-100 text-orange-800'
    case 'closed': return 'bg-muted text-foreground'
    default: return 'bg-muted text-foreground'
  }
}

// Quote status badge styling helper
export const getQuoteStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-muted text-foreground'
    case 'sent': return 'bg-blue-100 text-blue-800'
    case 'accepted': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'expired': return 'bg-orange-100 text-orange-800'
    default: return 'bg-muted text-foreground'
  }
}
