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

  // Initialize profile totals
  quote.profiles.forEach(profile => {
    profileTotals[profile.name] = { days: 0, rate: profile.daily_rate }
  })

  // Calculate costing elements (Step 4)
  let costingTotalDays = 0

  quote.costing_categories.forEach(category => {
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
    profileSummary
  }
}

// Export quote to Excel
export function exportQuoteToExcel(quote: Quote, projectTitle?: string): void {
  const data = calculateQuoteData(quote)
  const wb = XLSX.utils.book_new()

  // Sheet 1: Summary
  const summaryData = [
    ['RÉCAPITULATIF DU DEVIS'],
    [],
    ['Nom du devis', quote.name],
    ['Projet', projectTitle || '-'],
    ['Date de début', quote.start_date || '-'],
    ['Date de fin', quote.end_date || '-'],
    ['Statut', quote.status],
    ['Validité', `${quote.validity_days} jours`],
    [],
    ['TOTAUX'],
    ['Total jours', data.totalDays.toFixed(2)],
    ['Total HT', formatCurrency(data.totalHT)],
    ['TVA (20%)', formatCurrency(data.totalTVA)],
    ['Total TTC', formatCurrency(data.totalTTC)],
    [],
    ['CONDITIONS DE PAIEMENT'],
    [quote.payment_terms || '-'],
    [],
    ['NOTES'],
    [quote.notes || '-']
  ]

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)

  // Set column widths
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 40 }]

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Récapitulatif')

  // Sheet 2: Profiles
  const profilesHeader = ['Profil', 'TJM (€)', 'Total Jours', 'Montant HT (€)']
  const profilesRows = data.profileSummary.map(p => [
    p.profile,
    p.dailyRate,
    p.totalDays.toFixed(2),
    p.amount.toFixed(2)
  ])
  profilesRows.push([])
  profilesRows.push(['TOTAL', '', data.totalDays.toFixed(2), data.totalHT.toFixed(2)])

  const wsProfiles = XLSX.utils.aoa_to_sheet([profilesHeader, ...profilesRows])
  wsProfiles['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsProfiles, 'Profils')

  // Sheet 3: Abaques (pricing grid)
  const abaquesHeader = ['Composant', 'Profil', 'TJM', 'TS', 'S', 'M', 'C', 'TC']
  const abaquesRows = quote.abaques.map(a => {
    const profile = quote.profiles.find(p => p.name === a.profile_name)
    return [
      a.component_name,
      a.profile_name,
      profile?.daily_rate || 0,
      a.days_ts,
      a.days_s,
      a.days_m,
      a.days_c,
      a.days_tc
    ]
  })

  const wsAbaques = XLSX.utils.aoa_to_sheet([abaquesHeader, ...abaquesRows])
  wsAbaques['!cols'] = [
    { wch: 25 }, { wch: 20 }, { wch: 10 },
    { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }
  ]
  XLSX.utils.book_append_sheet(wb, wsAbaques, 'Abaques')

  // Sheet 4: Costing Details
  if (data.costingDetails.length > 0) {
    const costingHeader = ['Catégorie', 'Activité', 'Composant', 'Complexité', 'Coeff.', 'Jours', 'TJM (€)', 'Montant (€)']
    const costingRows = data.costingDetails.map(c => [
      c.category,
      c.activity,
      c.component,
      c.complexity,
      c.coefficient,
      c.days.toFixed(2),
      c.dailyRate,
      c.amount.toFixed(2)
    ])

    const costingTotal = data.costingDetails.reduce((sum, c) => sum + c.amount, 0)
    const costingDays = data.costingDetails.reduce((sum, c) => sum + c.days, 0)
    costingRows.push([])
    costingRows.push(['TOTAL', '', '', '', '', costingDays.toFixed(2), '', costingTotal.toFixed(2)])

    const wsCosting = XLSX.utils.aoa_to_sheet([costingHeader, ...costingRows])
    wsCosting['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 12 },
      { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 12 }
    ]
    XLSX.utils.book_append_sheet(wb, wsCosting, 'Éléments de chiffrage')
  }

  // Sheet 5: Transverse Activities
  if (data.transverseDetails.length > 0) {
    const transverseHeader = ['Niveau', 'Activité', 'Profil', 'Type', 'Valeur', 'Jours', 'TJM (€)', 'Montant (€)']
    const transverseRows = data.transverseDetails.map(t => [
      `Niveau ${t.level}`,
      t.activity,
      t.profile,
      t.type,
      t.type === 'Pourcentage' ? `${t.value}%` : t.value,
      t.days.toFixed(2),
      t.dailyRate,
      t.amount.toFixed(2)
    ])

    const transverseTotal = data.transverseDetails.reduce((sum, t) => sum + t.amount, 0)
    const transverseDays = data.transverseDetails.reduce((sum, t) => sum + t.days, 0)
    transverseRows.push([])
    transverseRows.push(['TOTAL', '', '', '', '', transverseDays.toFixed(2), '', transverseTotal.toFixed(2)])

    const wsTransverse = XLSX.utils.aoa_to_sheet([transverseHeader, ...transverseRows])
    wsTransverse['!cols'] = [
      { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 12 },
      { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 12 }
    ]
    XLSX.utils.book_append_sheet(wb, wsTransverse, 'Activités transverses')
  }

  // Sheet 6: Price Summary (HT/TVA/TTC)
  const priceData = [
    ['RÉCAPITULATIF DES PRIX'],
    [],
    ['Description', 'Montant'],
    ['Total HT', formatCurrency(data.totalHT)],
    ['TVA (20%)', formatCurrency(data.totalTVA)],
    ['Total TTC', formatCurrency(data.totalTTC)],
    [],
    ['DÉTAIL PAR PROFIL'],
    ['Profil', 'Jours', 'TJM', 'Montant HT'],
    ...data.profileSummary.map(p => [
      p.profile,
      p.totalDays.toFixed(2),
      formatCurrency(p.dailyRate),
      formatCurrency(p.amount)
    ])
  ]

  const wsPrice = XLSX.utils.aoa_to_sheet(priceData)
  wsPrice['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsPrice, 'Prix')

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
