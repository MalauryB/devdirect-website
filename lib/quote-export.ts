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

  quote.profiles.forEach(profile => {
    profileTotals[profile.name] = { days: 0, rate: profile.daily_rate }
  })

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

  quote.transverse_levels.forEach(level => {
    level.activities.forEach(activity => {
      const profile = quote.profiles.find(p => p.name === activity.profile_name)
      const dailyRate = profile?.daily_rate || 0

      let days: number
      if (activity.type === 'fixed') {
        days = activity.value
      } else {
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

  const profileSummary = Object.entries(profileTotals).map(([profile, data]) => ({
    profile,
    totalDays: data.days,
    dailyRate: data.rate,
    amount: data.days * data.rate
  }))

  const categorySummary = Object.entries(categoryTotals).map(([category, data]) => ({
    category,
    totalDays: data.days,
    totalAmount: data.amount
  }))

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

// Style helpers
function applyStyles(ws: XLSX.WorkSheet, styles: Record<string, { fill?: string; font?: { bold?: boolean; color?: string; sz?: number }; border?: boolean; align?: string }>) {
  // Note: xlsx library community version has limited styling support
  // For full styling, xlsx-style or exceljs would be needed
  // We'll use what's available and structure data for clarity
}

// Export quote to Excel with styling
export function exportQuoteToExcel(quote: Quote, projectTitle?: string): void {
  const data = calculateQuoteData(quote)
  const wb = XLSX.utils.book_new()

  // =============================================
  // SHEET 1: RAPPORT DÉTAILLÉ
  // =============================================
  const detailRows: (string | number | null)[][] = []
  const detailMerges: XLSX.Range[] = []
  let rowIndex = 0

  // Title
  detailRows.push(['RAPPORT DÉTAILLÉ DU DEVIS', null, null, null, null, null, null])
  detailMerges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 6 } })
  rowIndex++

  detailRows.push([null, null, null, null, null, null, null])
  rowIndex++

  // Header info
  detailRows.push(['Devis :', quote.name, null, null, 'Date début :', quote.start_date || '-', null])
  rowIndex++
  detailRows.push(['Projet :', projectTitle || '-', null, null, 'Date fin :', quote.end_date || '-', null])
  rowIndex++

  detailRows.push([null, null, null, null, null, null, null])
  rowIndex++
  detailRows.push([null, null, null, null, null, null, null])
  rowIndex++

  // Costing details by category
  if (data.costingDetails.length > 0) {
    detailRows.push(['ÉLÉMENTS DE CHIFFRAGE', null, null, null, null, null, null])
    detailMerges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 6 } })
    rowIndex++

    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++

    const categories = [...new Set(data.costingDetails.map(c => c.category))]

    categories.forEach(categoryName => {
      const categoryItems = data.costingDetails.filter(c => c.category === categoryName)
      const categoryTotal = categoryItems.reduce((sum, c) => sum + c.amount, 0)
      const categoryDays = categoryItems.reduce((sum, c) => sum + c.days, 0)

      // Category header
      detailRows.push([`📁 ${categoryName}`, null, null, null, null, null, null])
      detailMerges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 6 } })
      rowIndex++

      // Column headers
      detailRows.push(['', 'Activité', 'Composant', 'Complexité', 'Coeff.', 'Jours', 'Montant HT (€)'])
      rowIndex++

      // Items
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
        rowIndex++
      })

      // Subtotal
      detailRows.push(['', '', '', '', '→ Sous-total', Number(categoryDays.toFixed(2)), Number(categoryTotal.toFixed(2))])
      rowIndex++

      detailRows.push([null, null, null, null, null, null, null])
      rowIndex++
    })

    // Total costing
    const totalCostingDays = data.costingDetails.reduce((sum, c) => sum + c.days, 0)
    const totalCostingAmount = data.costingDetails.reduce((sum, c) => sum + c.amount, 0)
    detailRows.push(['✅ TOTAL ÉLÉMENTS DE CHIFFRAGE', null, null, null, null, Number(totalCostingDays.toFixed(2)), Number(totalCostingAmount.toFixed(2))])
    detailMerges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 4 } })
    rowIndex++

    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++
    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++
  }

  // Transverse activities
  if (data.transverseDetails.length > 0) {
    detailRows.push(['ACTIVITÉS TRANSVERSES', null, null, null, null, null, null])
    detailMerges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 6 } })
    rowIndex++

    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++

    // Headers
    detailRows.push(['Niveau', 'Activité', 'Type', 'Valeur', '', 'Jours', 'Montant HT (€)'])
    rowIndex++

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
      rowIndex++
    })

    const totalTransverseDays = data.transverseDetails.reduce((sum, t) => sum + t.days, 0)
    const totalTransverseAmount = data.transverseDetails.reduce((sum, t) => sum + t.amount, 0)

    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++
    detailRows.push(['✅ TOTAL ACTIVITÉS TRANSVERSES', null, null, null, null, Number(totalTransverseDays.toFixed(2)), Number(totalTransverseAmount.toFixed(2))])
    detailMerges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 4 } })
    rowIndex++

    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++
    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++
  }

  // Financial summary
  detailRows.push(['💰 RÉCAPITULATIF FINANCIER', null, null, null, null, null, null])
  detailMerges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 6 } })
  rowIndex++

  detailRows.push([null, null, null, null, null, null, null])
  rowIndex++

  detailRows.push(['Total jours', null, null, null, null, Number(data.totalDays.toFixed(2)), null])
  rowIndex++
  detailRows.push(['Total HT', null, null, null, null, null, `${formatNumber(data.totalHT)} €`])
  rowIndex++
  detailRows.push(['TVA (20%)', null, null, null, null, null, `${formatNumber(data.totalTVA)} €`])
  rowIndex++
  detailRows.push(['TOTAL TTC', null, null, null, null, null, `${formatNumber(data.totalTTC)} €`])
  rowIndex++

  // Notes
  if (quote.payment_terms || quote.notes) {
    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++
    detailRows.push([null, null, null, null, null, null, null])
    rowIndex++

    if (quote.payment_terms) {
      detailRows.push(['📋 Conditions de paiement :', quote.payment_terms, null, null, null, null, null])
      detailMerges.push({ s: { r: rowIndex, c: 1 }, e: { r: rowIndex, c: 6 } })
      rowIndex++
    }
    if (quote.notes) {
      detailRows.push(['📝 Notes :', quote.notes, null, null, null, null, null])
      detailMerges.push({ s: { r: rowIndex, c: 1 }, e: { r: rowIndex, c: 6 } })
      rowIndex++
    }
  }

  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows)
  wsDetail['!cols'] = [
    { wch: 35 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }
  ]
  wsDetail['!merges'] = detailMerges

  // Set row heights for better readability
  wsDetail['!rows'] = [
    { hpt: 30 }, // Title row
  ]

  XLSX.utils.book_append_sheet(wb, wsDetail, 'Rapport détaillé')

  // =============================================
  // SHEET 2: RÉSUMÉ
  // =============================================
  const summaryRows: (string | number | null)[][] = []
  const summaryMerges: XLSX.Range[] = []
  let sRowIndex = 0

  // Title
  summaryRows.push(['RÉSUMÉ DU DEVIS', null, null])
  summaryMerges.push({ s: { r: sRowIndex, c: 0 }, e: { r: sRowIndex, c: 2 } })
  sRowIndex++

  summaryRows.push([null, null, null])
  sRowIndex++

  // Info
  summaryRows.push(['📄 Devis :', quote.name, null])
  sRowIndex++
  summaryRows.push(['📁 Projet :', projectTitle || '-', null])
  sRowIndex++
  summaryRows.push(['📊 Statut :', getStatusLabel(quote.status), null])
  sRowIndex++
  summaryRows.push(['⏱️ Validité :', `${quote.validity_days} jours`, null])
  sRowIndex++

  summaryRows.push([null, null, null])
  sRowIndex++
  summaryRows.push([null, null, null])
  sRowIndex++

  // Summary by category
  if (data.categorySummary.length > 0) {
    summaryRows.push(['SYNTHÈSE PAR CATÉGORIE', null, null])
    summaryMerges.push({ s: { r: sRowIndex, c: 0 }, e: { r: sRowIndex, c: 2 } })
    sRowIndex++

    summaryRows.push([null, null, null])
    sRowIndex++

    summaryRows.push(['Catégorie', 'Jours', 'Montant HT (€)'])
    sRowIndex++

    data.categorySummary.forEach(cat => {
      summaryRows.push([cat.category, Number(cat.totalDays.toFixed(2)), Number(cat.totalAmount.toFixed(2))])
      sRowIndex++
    })

    summaryRows.push([null, null, null])
    sRowIndex++

    const totalCostingDays = data.categorySummary.reduce((sum, c) => sum + c.totalDays, 0)
    const totalCostingAmount = data.categorySummary.reduce((sum, c) => sum + c.totalAmount, 0)
    summaryRows.push(['→ Sous-total chiffrage', Number(totalCostingDays.toFixed(2)), Number(totalCostingAmount.toFixed(2))])
    sRowIndex++
  }

  // Transverse summary
  if (data.transverseDetails.length > 0) {
    const totalTransverseDays = data.transverseDetails.reduce((sum, t) => sum + t.days, 0)
    const totalTransverseAmount = data.transverseDetails.reduce((sum, t) => sum + t.amount, 0)
    summaryRows.push(['→ Activités transverses', Number(totalTransverseDays.toFixed(2)), Number(totalTransverseAmount.toFixed(2))])
    sRowIndex++
  }

  summaryRows.push([null, null, null])
  sRowIndex++
  summaryRows.push([null, null, null])
  sRowIndex++

  // Financial summary
  summaryRows.push(['💰 TOTAUX', null, null])
  summaryMerges.push({ s: { r: sRowIndex, c: 0 }, e: { r: sRowIndex, c: 2 } })
  sRowIndex++

  summaryRows.push([null, null, null])
  sRowIndex++

  summaryRows.push(['Description', 'Jours', 'Montant'])
  sRowIndex++
  summaryRows.push(['Total jours', Number(data.totalDays.toFixed(2)), ''])
  sRowIndex++
  summaryRows.push(['Total HT', '', `${formatNumber(data.totalHT)} €`])
  sRowIndex++
  summaryRows.push(['TVA (20%)', '', `${formatNumber(data.totalTVA)} €`])
  sRowIndex++
  summaryRows.push(['TOTAL TTC', '', `${formatNumber(data.totalTTC)} €`])
  sRowIndex++

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 20 }]
  wsSummary['!merges'] = summaryMerges
  wsSummary['!rows'] = [{ hpt: 30 }]

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

function formatNumber(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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
