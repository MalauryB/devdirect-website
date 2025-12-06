import * as XLSX from 'xlsx'
import { Quote, QuoteAbaque, ComplexityLevel } from './types'

const VAT_RATE = 0.20 // 20% TVA

interface CalculatedQuoteData {
  totalDays: number
  totalHT: number
  totalTVA: number
  totalTTC: number
  costingDetails: {
    category: string
    activity: string
    component: string
    complexity: string
    coefficient: number
    days: number
    dailyRate: number
    amount: number
  }[]
  transverseDetails: {
    level: number
    activity: string
    profile: string
    type: string
    value: number
    days: number
    dailyRate: number
    amount: number
  }[]
  profileSummary: {
    profile: string
    totalDays: number
    dailyRate: number
    amount: number
  }[]
  // Aggregated by category
  categorySummary: {
    category: string
    totalDays: number
    totalAmount: number
  }[]
}

// Get days from abaque based on complexity
function getDaysFromAbaque(abaque: QuoteAbaque, complexity: ComplexityLevel): number {
  switch (complexity) {
    case 'ts': return abaque.days_ts
    case 's': return abaque.days_s
    case 'm': return abaque.days_m
    case 'c': return abaque.days_c
    case 'tc': return abaque.days_tc
    default: return 0
  }
}

// Get complexity label
function getComplexityLabel(complexity: ComplexityLevel): string {
  const labels: Record<ComplexityLevel, string> = {
    ts: 'Très Simple',
    s: 'Simple',
    m: 'Moyen',
    c: 'Complexe',
    tc: 'Très Complexe'
  }
  return labels[complexity] || complexity
}

// Calculate all quote data
export function calculateQuoteData(quote: Quote): CalculatedQuoteData {
  const costingDetails: CalculatedQuoteData['costingDetails'] = []
  const transverseDetails: CalculatedQuoteData['transverseDetails'] = []
  const profileTotals: Record<string, { days: number; rate: number }> = {}
  const categoryTotals: Record<string, { days: number; amount: number }> = {}

  // Initialize profile totals
  quote.profiles.forEach(profile => {
    profileTotals[profile.name] = { days: 0, rate: profile.daily_rate }
  })

  // Calculate costing elements (Step 4)
  let costingTotalDays = 0

  quote.costing_categories.forEach(category => {
    if (!categoryTotals[category.name]) {
      categoryTotals[category.name] = { days: 0, amount: 0 }
    }

    category.activities.forEach(activity => {
      if (!activity.active) return

      activity.components.forEach(component => {
        const abaque = quote.abaques.find(a => a.component_name === component.component_name)
        if (!abaque) return

        const baseDays = getDaysFromAbaque(abaque, component.complexity)
        const days = baseDays * component.coefficient
        const profile = quote.profiles.find(p => p.name === abaque.profile_name)
        const dailyRate = profile?.daily_rate || 0
        const amount = days * dailyRate

        costingDetails.push({
          category: category.name,
          activity: activity.name,
          component: component.component_name,
          complexity: getComplexityLabel(component.complexity),
          coefficient: component.coefficient,
          days,
          dailyRate,
          amount
        })

        costingTotalDays += days
        categoryTotals[category.name].days += days
        categoryTotals[category.name].amount += amount

        if (abaque.profile_name && profileTotals[abaque.profile_name]) {
          profileTotals[abaque.profile_name].days += days
        }
      })
    })
  })

  // Calculate transverse activities (Step 3)
  quote.transverse_levels.forEach(level => {
    level.activities.forEach(activity => {
      const profile = quote.profiles.find(p => p.name === activity.profile_name)
      const dailyRate = profile?.daily_rate || 0

      let days: number
      if (activity.type === 'fixed') {
        days = activity.value
      } else {
        // Rate is a percentage of total costing days
        days = (activity.value / 100) * costingTotalDays
      }

      const amount = days * dailyRate

      transverseDetails.push({
        level: level.level,
        activity: activity.name,
        profile: activity.profile_name,
        type: activity.type === 'fixed' ? 'Fixe' : 'Pourcentage',
        value: activity.value,
        days,
        dailyRate,
        amount
      })

      if (activity.profile_name && profileTotals[activity.profile_name]) {
        profileTotals[activity.profile_name].days += days
      }
    })
  })

  // Build profile summary
  const profileSummary = Object.entries(profileTotals).map(([profile, data]) => ({
    profile,
    totalDays: data.days,
    dailyRate: data.rate,
    amount: data.days * data.rate
  }))

  // Build category summary
  const categorySummary = Object.entries(categoryTotals).map(([category, data]) => ({
    category,
    totalDays: data.days,
    totalAmount: data.amount
  }))

  // Calculate totals
  const totalDays = profileSummary.reduce((sum, p) => sum + p.totalDays, 0)
  const totalHT = profileSummary.reduce((sum, p) => sum + p.amount, 0)
  const totalTVA = totalHT * VAT_RATE
  const totalTTC = totalHT + totalTVA

  return {
    totalDays,
    totalHT,
    totalTVA,
    totalTTC,
    costingDetails,
    transverseDetails,
    profileSummary,
    categorySummary
  }
}

// Export quote to Excel
export function exportQuoteToExcel(quote: Quote, projectTitle?: string): void {
  const data = calculateQuoteData(quote)
  const wb = XLSX.utils.book_new()

  // =============================================
  // SHEET 1: RAPPORT DÉTAILLÉ
  // =============================================
  const detailRows: (string | number)[][] = []

  // Header
  detailRows.push(['RAPPORT DÉTAILLÉ DU DEVIS'])
  detailRows.push([])
  detailRows.push(['Devis:', quote.name])
  detailRows.push(['Projet:', projectTitle || '-'])
  detailRows.push(['Date de début:', quote.start_date || '-'])
  detailRows.push(['Date de fin:', quote.end_date || '-'])
  detailRows.push([])
  detailRows.push([])

  // Costing details by category
  if (data.costingDetails.length > 0) {
    detailRows.push(['ÉLÉMENTS DE CHIFFRAGE'])
    detailRows.push([])

    // Group by category
    const categories = [...new Set(data.costingDetails.map(c => c.category))]

    categories.forEach(categoryName => {
      const categoryItems = data.costingDetails.filter(c => c.category === categoryName)
      const categoryTotal = categoryItems.reduce((sum, c) => sum + c.amount, 0)
      const categoryDays = categoryItems.reduce((sum, c) => sum + c.days, 0)

      detailRows.push([`▸ ${categoryName}`])
      detailRows.push(['', 'Activité', 'Composant', 'Complexité', 'Coeff.', 'Jours', 'Montant HT'])

      categoryItems.forEach(item => {
        detailRows.push([
          '',
          item.activity,
          item.component,
          item.complexity,
          item.coefficient,
          Number(item.days.toFixed(2)),
          Number(item.amount.toFixed(2))
        ])
      })

      detailRows.push(['', '', '', '', 'Sous-total:', Number(categoryDays.toFixed(2)), Number(categoryTotal.toFixed(2))])
      detailRows.push([])
    })

    // Total costing
    const totalCostingDays = data.costingDetails.reduce((sum, c) => sum + c.days, 0)
    const totalCostingAmount = data.costingDetails.reduce((sum, c) => sum + c.amount, 0)
    detailRows.push(['TOTAL ÉLÉMENTS DE CHIFFRAGE', '', '', '', '', Number(totalCostingDays.toFixed(2)), Number(totalCostingAmount.toFixed(2))])
    detailRows.push([])
    detailRows.push([])
  }

  // Transverse activities
  if (data.transverseDetails.length > 0) {
    detailRows.push(['ACTIVITÉS TRANSVERSES'])
    detailRows.push([])
    detailRows.push(['Niveau', 'Activité', 'Type', 'Valeur', '', 'Jours', 'Montant HT'])

    data.transverseDetails.forEach(t => {
      detailRows.push([
        `Niveau ${t.level}`,
        t.activity,
        t.type,
        t.type === 'Pourcentage' ? `${t.value}%` : t.value,
        '',
        Number(t.days.toFixed(2)),
        Number(t.amount.toFixed(2))
      ])
    })

    const totalTransverseDays = data.transverseDetails.reduce((sum, t) => sum + t.days, 0)
    const totalTransverseAmount = data.transverseDetails.reduce((sum, t) => sum + t.amount, 0)
    detailRows.push([])
    detailRows.push(['TOTAL ACTIVITÉS TRANSVERSES', '', '', '', '', Number(totalTransverseDays.toFixed(2)), Number(totalTransverseAmount.toFixed(2))])
    detailRows.push([])
    detailRows.push([])
  }

  // Final totals
  detailRows.push(['RÉCAPITULATIF FINANCIER'])
  detailRows.push([])
  detailRows.push(['Total jours', '', '', '', '', Number(data.totalDays.toFixed(2))])
  detailRows.push(['Total HT', '', '', '', '', '', formatCurrency(data.totalHT)])
  detailRows.push(['TVA (20%)', '', '', '', '', '', formatCurrency(data.totalTVA)])
  detailRows.push(['Total TTC', '', '', '', '', '', formatCurrency(data.totalTTC)])

  // Notes and payment terms
  if (quote.payment_terms || quote.notes) {
    detailRows.push([])
    detailRows.push([])
    if (quote.payment_terms) {
      detailRows.push(['Conditions de paiement:', quote.payment_terms])
    }
    if (quote.notes) {
      detailRows.push(['Notes:', quote.notes])
    }
  }

  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows)
  wsDetail['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
    { wch: 10 }, { wch: 12 }, { wch: 15 }
  ]
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Rapport détaillé')

  // =============================================
  // SHEET 2: RÉSUMÉ
  // =============================================
  const summaryRows: (string | number)[][] = []

  // Header
  summaryRows.push(['RÉSUMÉ DU DEVIS'])
  summaryRows.push([])
  summaryRows.push(['Devis:', quote.name])
  summaryRows.push(['Projet:', projectTitle || '-'])
  summaryRows.push(['Statut:', getStatusLabel(quote.status)])
  summaryRows.push(['Validité:', `${quote.validity_days} jours`])
  summaryRows.push([])
  summaryRows.push([])

  // Summary by category
  if (data.categorySummary.length > 0) {
    summaryRows.push(['SYNTHÈSE PAR CATÉGORIE'])
    summaryRows.push([])
    summaryRows.push(['Catégorie', 'Jours', 'Montant HT'])

    data.categorySummary.forEach(cat => {
      summaryRows.push([cat.category, Number(cat.totalDays.toFixed(2)), Number(cat.totalAmount.toFixed(2))])
    })

    const totalCostingDays = data.categorySummary.reduce((sum, c) => sum + c.totalDays, 0)
    const totalCostingAmount = data.categorySummary.reduce((sum, c) => sum + c.totalAmount, 0)
    summaryRows.push([])
    summaryRows.push(['Sous-total éléments de chiffrage', Number(totalCostingDays.toFixed(2)), Number(totalCostingAmount.toFixed(2))])
  }

  // Transverse summary
  if (data.transverseDetails.length > 0) {
    const totalTransverseDays = data.transverseDetails.reduce((sum, t) => sum + t.days, 0)
    const totalTransverseAmount = data.transverseDetails.reduce((sum, t) => sum + t.amount, 0)
    summaryRows.push(['Activités transverses', Number(totalTransverseDays.toFixed(2)), Number(totalTransverseAmount.toFixed(2))])
  }

  summaryRows.push([])
  summaryRows.push([])

  // Financial summary
  summaryRows.push(['TOTAL'])
  summaryRows.push([])
  summaryRows.push(['Description', '', 'Montant'])
  summaryRows.push(['Total jours', Number(data.totalDays.toFixed(2)), ''])
  summaryRows.push(['Total HT', '', formatCurrency(data.totalHT)])
  summaryRows.push(['TVA (20%)', '', formatCurrency(data.totalTVA)])
  summaryRows.push(['Total TTC', '', formatCurrency(data.totalTTC)])

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé')

  // Generate filename
  const sanitizedName = (quote.name || 'devis').replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').replace(/\s+/g, '_')
  const date = new Date().toISOString().split('T')[0]
  const filename = `${sanitizedName}_${date}.xlsx`

  // Download file
  XLSX.writeFile(wb, filename)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    accepted: 'Accepté',
    rejected: 'Refusé',
    expired: 'Expiré'
  }
  return labels[status] || status
}
