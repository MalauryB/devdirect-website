import { ProjectContract, Project, Profile, Quote } from './types'

export interface ContractPdfData {
  contract: ProjectContract
  project?: Project | null
  client?: Profile | null
  quote?: Quote | null
  provider?: {
    name: string
    address: string
    siret: string
    email: string
    phone: string
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyWords(amount: number): string {
  // Simple conversion for common amounts
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']

  if (amount === 0) return 'zéro euro'

  const euros = Math.floor(amount)
  const cents = Math.round((amount - euros) * 100)

  let result = ''

  // Simplified: just return the numeric representation for large amounts
  if (euros >= 1000) {
    result = `${euros.toLocaleString('fr-FR')} euros`
  } else if (euros >= 100) {
    const hundreds = Math.floor(euros / 100)
    const remainder = euros % 100
    result = (hundreds === 1 ? 'cent' : units[hundreds] + ' cent') + (remainder > 0 ? ' ' + formatSmallNumber(remainder) : '') + ' euros'
  } else {
    result = formatSmallNumber(euros) + ' euros'
  }

  if (cents > 0) {
    result += ` et ${cents} centimes`
  }

  return result

  function formatSmallNumber(n: number): string {
    if (n < 10) return units[n]
    if (n < 20) return teens[n - 10]
    if (n < 70) {
      const t = Math.floor(n / 10)
      const u = n % 10
      return tens[t] + (u > 0 ? (u === 1 && t > 1 ? '-et-un' : '-' + units[u]) : '')
    }
    if (n < 80) {
      return 'soixante-' + teens[n - 70]
    }
    if (n < 100) {
      const u = n - 80
      if (u === 0) return 'quatre-vingts'
      if (u < 10) return 'quatre-vingt-' + units[u]
      return 'quatre-vingt-' + teens[u - 10]
    }
    return String(n)
  }
}
