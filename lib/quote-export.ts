import XLSX from 'xlsx-js-style'
import { Quote, QuoteAbaque, ComplexityLevel } from './types'

const VAT_RATE = 0.20 // 20% TVA

// Style definitions
const styles = {
  title: {
    font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4A5568" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "2D3748" } },
      bottom: { style: "thin", color: { rgb: "2D3748" } },
      left: { style: "thin", color: { rgb: "2D3748" } },
      right: { style: "thin", color: { rgb: "2D3748" } }
    }
  },
  sectionHeader: {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "718096" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "4A5568" } },
      bottom: { style: "thin", color: { rgb: "4A5568" } },
      left: { style: "thin", color: { rgb: "4A5568" } },
      right: { style: "thin", color: { rgb: "4A5568" } }
    }
  },
  categoryHeader: {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "D4A5A5" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "C48B8B" } },
      bottom: { style: "thin", color: { rgb: "C48B8B" } },
      left: { style: "thin", color: { rgb: "C48B8B" } },
      right: { style: "thin", color: { rgb: "C48B8B" } }
    }
  },
  tableHeader: {
    font: { bold: true, sz: 10, color: { rgb: "374151" } },
    fill: { fgColor: { rgb: "E5E7EB" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "D1D5DB" } },
      bottom: { style: "thin", color: { rgb: "D1D5DB" } },
      left: { style: "thin", color: { rgb: "D1D5DB" } },
      right: { style: "thin", color: { rgb: "D1D5DB" } }
    }
  },
  tableCell: {
    font: { sz: 10, color: { rgb: "374151" } },
    fill: { fgColor: { rgb: "FFFFFF" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
      left: { style: "thin", color: { rgb: "E5E7EB" } },
      right: { style: "thin", color: { rgb: "E5E7EB" } }
    }
  },
  tableCellAlt: {
    font: { sz: 10, color: { rgb: "374151" } },
    fill: { fgColor: { rgb: "F9FAFB" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
      left: { style: "thin", color: { rgb: "E5E7EB" } },
      right: { style: "thin", color: { rgb: "E5E7EB" } }
    }
  },
  tableCellNumber: {
    font: { sz: 10, color: { rgb: "374151" } },
    fill: { fgColor: { rgb: "FFFFFF" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
      left: { style: "thin", color: { rgb: "E5E7EB" } },
      right: { style: "thin", color: { rgb: "E5E7EB" } }
    }
  },
  subtotal: {
    font: { bold: true, sz: 10, color: { rgb: "374151" } },
    fill: { fgColor: { rgb: "FEF3C7" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "FCD34D" } },
      bottom: { style: "thin", color: { rgb: "FCD34D" } },
      left: { style: "thin", color: { rgb: "FCD34D" } },
      right: { style: "thin", color: { rgb: "FCD34D" } }
    }
  },
  total: {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "059669" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "047857" } },
      bottom: { style: "medium", color: { rgb: "047857" } },
      left: { style: "medium", color: { rgb: "047857" } },
      right: { style: "medium", color: { rgb: "047857" } }
    }
  },
  totalLabel: {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "059669" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "047857" } },
      bottom: { style: "medium", color: { rgb: "047857" } },
      left: { style: "medium", color: { rgb: "047857" } },
      right: { style: "medium", color: { rgb: "047857" } }
    }
  },
  grandTotal: {
    font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "7C3AED" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "6D28D9" } },
      bottom: { style: "medium", color: { rgb: "6D28D9" } },
      left: { style: "medium", color: { rgb: "6D28D9" } },
      right: { style: "medium", color: { rgb: "6D28D9" } }
    }
  },
  grandTotalLabel: {
    font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "7C3AED" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "6D28D9" } },
      bottom: { style: "medium", color: { rgb: "6D28D9" } },
      left: { style: "medium", color: { rgb: "6D28D9" } },
      right: { style: "medium", color: { rgb: "6D28D9" } }
    }
  },
  infoLabel: {
    font: { bold: true, sz: 10, color: { rgb: "6B7280" } },
    alignment: { horizontal: "left", vertical: "center" }
  },
  infoValue: {
    font: { sz: 10, color: { rgb: "111827" } },
    alignment: { horizontal: "left", vertical: "center" }
  }
}

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

// Helper to create styled cell
function cell(value: string | number | null, style: object) {
  return { v: value, s: style }
}

// Type for cell data
type CellValue = { v: string | number | null; s: object } | null

export function exportQuoteToExcel(quote: Quote, projectTitle?: string): void {
  const data = calculateQuoteData(quote)
  const wb = XLSX.utils.book_new()

  // =============================================
  // SHEET 1: RAPPORT DÉTAILLÉ
  // =============================================
  const detailData: CellValue[][] = []
  const detailMerges: XLSX.Range[] = []
  let row = 0

  // Title row
  detailData.push([
    cell('RAPPORT DÉTAILLÉ DU DEVIS', styles.title),
    cell(null, styles.title),
    cell(null, styles.title),
    cell(null, styles.title),
    cell(null, styles.title),
    cell(null, styles.title),
    cell(null, styles.title)
  ])
  detailMerges.push({ s: { r: row, c: 0 }, e: { r: row, c: 6 } })
  row++

  // Empty row
  detailData.push([null, null, null, null, null, null, null])
  row++

  // Info rows
  detailData.push([
    cell('Devis :', styles.infoLabel),
    cell(quote.name, styles.infoValue),
    null,
    null,
    cell('Date début :', styles.infoLabel),
    cell(quote.start_date || '-', styles.infoValue),
    null
  ])
  row++

  detailData.push([
    cell('Projet :', styles.infoLabel),
    cell(projectTitle || '-', styles.infoValue),
    null,
    null,
    cell('Date fin :', styles.infoLabel),
    cell(quote.end_date || '-', styles.infoValue),
    null
  ])
  row++

  detailData.push([null, null, null, null, null, null, null])
  row++

  // Costing details
  if (data.costingDetails.length > 0) {
    detailData.push([
      cell('ÉLÉMENTS DE CHIFFRAGE', styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader)
    ])
    detailMerges.push({ s: { r: row, c: 0 }, e: { r: row, c: 6 } })
    row++

    detailData.push([null, null, null, null, null, null, null])
    row++

    const categories = [...new Set(data.costingDetails.map(c => c.category))]

    categories.forEach(categoryName => {
      const categoryItems = data.costingDetails.filter(c => c.category === categoryName)
      const categoryTotal = categoryItems.reduce((sum, c) => sum + c.amount, 0)
      const categoryDays = categoryItems.reduce((sum, c) => sum + c.days, 0)

      // Category header
      detailData.push([
        cell(`📁 ${categoryName}`, styles.categoryHeader),
        cell(null, styles.categoryHeader),
        cell(null, styles.categoryHeader),
        cell(null, styles.categoryHeader),
        cell(null, styles.categoryHeader),
        cell(null, styles.categoryHeader),
        cell(null, styles.categoryHeader)
      ])
      detailMerges.push({ s: { r: row, c: 0 }, e: { r: row, c: 6 } })
      row++

      // Column headers
      detailData.push([
        cell('', styles.tableHeader),
        cell('Activité', styles.tableHeader),
        cell('Composant', styles.tableHeader),
        cell('Complexité', styles.tableHeader),
        cell('Coeff.', styles.tableHeader),
        cell('Jours', styles.tableHeader),
        cell('Montant HT (€)', styles.tableHeader)
      ])
      row++

      // Items
      categoryItems.forEach((item, idx) => {
        const cellStyle = idx % 2 === 0 ? styles.tableCell : styles.tableCellAlt
        const numStyle = { ...cellStyle, alignment: { horizontal: "right", vertical: "center" } }
        detailData.push([
          cell('', cellStyle),
          cell(item.activity, cellStyle),
          cell(item.component, cellStyle),
          cell(item.complexity, cellStyle),
          cell(item.coefficient, numStyle),
          cell(Number(item.days.toFixed(2)), numStyle),
          cell(Number(item.amount.toFixed(2)), numStyle)
        ])
        row++
      })

      // Subtotal
      detailData.push([
        cell('', styles.subtotal),
        cell('', styles.subtotal),
        cell('', styles.subtotal),
        cell('', styles.subtotal),
        cell('Sous-total :', styles.subtotal),
        cell(Number(categoryDays.toFixed(2)), styles.subtotal),
        cell(Number(categoryTotal.toFixed(2)), styles.subtotal)
      ])
      row++

      detailData.push([null, null, null, null, null, null, null])
      row++
    })

    // Total costing
    const totalCostingDays = data.costingDetails.reduce((sum, c) => sum + c.days, 0)
    const totalCostingAmount = data.costingDetails.reduce((sum, c) => sum + c.amount, 0)
    detailData.push([
      cell('✅ TOTAL ÉLÉMENTS DE CHIFFRAGE', styles.totalLabel),
      cell(null, styles.totalLabel),
      cell(null, styles.totalLabel),
      cell(null, styles.totalLabel),
      cell(null, styles.totalLabel),
      cell(Number(totalCostingDays.toFixed(2)), styles.total),
      cell(Number(totalCostingAmount.toFixed(2)), styles.total)
    ])
    detailMerges.push({ s: { r: row, c: 0 }, e: { r: row, c: 4 } })
    row++

    detailData.push([null, null, null, null, null, null, null])
    row++
  }

  // Transverse activities
  if (data.transverseDetails.length > 0) {
    detailData.push([
      cell('ACTIVITÉS TRANSVERSES', styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader)
    ])
    detailMerges.push({ s: { r: row, c: 0 }, e: { r: row, c: 6 } })
    row++

    detailData.push([null, null, null, null, null, null, null])
    row++

    // Headers
    detailData.push([
      cell('Niveau', styles.tableHeader),
      cell('Activité', styles.tableHeader),
      cell('Type', styles.tableHeader),
      cell('Valeur', styles.tableHeader),
      cell('', styles.tableHeader),
      cell('Jours', styles.tableHeader),
      cell('Montant HT (€)', styles.tableHeader)
    ])
    row++

    data.transverseDetails.forEach((t, idx) => {
      const cellStyle = idx % 2 === 0 ? styles.tableCell : styles.tableCellAlt
      const numStyle = { ...cellStyle, alignment: { horizontal: "right", vertical: "center" } }
      detailData.push([
        cell(`Niveau ${t.level}`, cellStyle),
        cell(t.activity, cellStyle),
        cell(t.type, cellStyle),
        cell(t.type === 'Pourcentage' ? `${t.value}%` : t.value, numStyle),
        cell('', cellStyle),
        cell(Number(t.days.toFixed(2)), numStyle),
        cell(Number(t.amount.toFixed(2)), numStyle)
      ])
      row++
    })

    const totalTransverseDays = data.transverseDetails.reduce((sum, t) => sum + t.days, 0)
    const totalTransverseAmount = data.transverseDetails.reduce((sum, t) => sum + t.amount, 0)

    detailData.push([null, null, null, null, null, null, null])
    row++

    detailData.push([
      cell('✅ TOTAL ACTIVITÉS TRANSVERSES', styles.totalLabel),
      cell(null, styles.totalLabel),
      cell(null, styles.totalLabel),
      cell(null, styles.totalLabel),
      cell(null, styles.totalLabel),
      cell(Number(totalTransverseDays.toFixed(2)), styles.total),
      cell(Number(totalTransverseAmount.toFixed(2)), styles.total)
    ])
    detailMerges.push({ s: { r: row, c: 0 }, e: { r: row, c: 4 } })
    row++

    detailData.push([null, null, null, null, null, null, null])
    row++
  }

  // Financial summary
  detailData.push([null, null, null, null, null, null, null])
  row++

  detailData.push([
    cell('💰 RÉCAPITULATIF FINANCIER', styles.sectionHeader),
    cell(null, styles.sectionHeader),
    cell(null, styles.sectionHeader),
    cell(null, styles.sectionHeader),
    cell(null, styles.sectionHeader),
    cell(null, styles.sectionHeader),
    cell(null, styles.sectionHeader)
  ])
  detailMerges.push({ s: { r: row, c: 0 }, e: { r: row, c: 6 } })
  row++

  detailData.push([null, null, null, null, null, null, null])
  row++

  detailData.push([
    cell('Total jours', styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(Number(data.totalDays.toFixed(2)), { ...styles.tableCellNumber, font: { bold: true, sz: 10, color: { rgb: "374151" } } }),
    cell(null, styles.tableCell)
  ])
  row++

  detailData.push([
    cell('Total HT', styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(`${formatNumber(data.totalHT)} €`, { ...styles.tableCellNumber, font: { bold: true, sz: 10, color: { rgb: "374151" } } })
  ])
  row++

  detailData.push([
    cell('TVA (20%)', styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(null, styles.tableCell),
    cell(`${formatNumber(data.totalTVA)} €`, styles.tableCellNumber)
  ])
  row++

  detailData.push([
    cell('TOTAL TTC', styles.grandTotalLabel),
    cell(null, styles.grandTotalLabel),
    cell(null, styles.grandTotalLabel),
    cell(null, styles.grandTotalLabel),
    cell(null, styles.grandTotalLabel),
    cell(null, styles.grandTotalLabel),
    cell(`${formatNumber(data.totalTTC)} €`, styles.grandTotal)
  ])
  detailMerges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } })
  row++

  const wsDetail = XLSX.utils.aoa_to_sheet(detailData)
  wsDetail['!cols'] = [
    { wch: 35 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }
  ]
  wsDetail['!merges'] = detailMerges
  wsDetail['!rows'] = [{ hpt: 28 }]

  XLSX.utils.book_append_sheet(wb, wsDetail, 'Rapport détaillé')

  // =============================================
  // SHEET 2: RÉSUMÉ
  // =============================================
  const summaryData: CellValue[][] = []
  const summaryMerges: XLSX.Range[] = []
  let sRow = 0

  // Title
  summaryData.push([
    cell('RÉSUMÉ DU DEVIS', styles.title),
    cell(null, styles.title),
    cell(null, styles.title)
  ])
  summaryMerges.push({ s: { r: sRow, c: 0 }, e: { r: sRow, c: 2 } })
  sRow++

  summaryData.push([null, null, null])
  sRow++

  // Info
  summaryData.push([cell('Devis :', styles.infoLabel), cell(quote.name, styles.infoValue), null])
  sRow++
  summaryData.push([cell('Projet :', styles.infoLabel), cell(projectTitle || '-', styles.infoValue), null])
  sRow++
  summaryData.push([cell('Statut :', styles.infoLabel), cell(getStatusLabel(quote.status), styles.infoValue), null])
  sRow++
  summaryData.push([cell('Validité :', styles.infoLabel), cell(`${quote.validity_days} jours`, styles.infoValue), null])
  sRow++

  summaryData.push([null, null, null])
  sRow++

  // Summary by category
  if (data.categorySummary.length > 0) {
    summaryData.push([
      cell('SYNTHÈSE PAR CATÉGORIE', styles.sectionHeader),
      cell(null, styles.sectionHeader),
      cell(null, styles.sectionHeader)
    ])
    summaryMerges.push({ s: { r: sRow, c: 0 }, e: { r: sRow, c: 2 } })
    sRow++

    summaryData.push([null, null, null])
    sRow++

    summaryData.push([
      cell('Catégorie', styles.tableHeader),
      cell('Jours', styles.tableHeader),
      cell('Montant HT (€)', styles.tableHeader)
    ])
    sRow++

    data.categorySummary.forEach((cat, idx) => {
      const cellStyle = idx % 2 === 0 ? styles.tableCell : styles.tableCellAlt
      const numStyle = { ...cellStyle, alignment: { horizontal: "right", vertical: "center" } }
      summaryData.push([
        cell(cat.category, cellStyle),
        cell(Number(cat.totalDays.toFixed(2)), numStyle),
        cell(Number(cat.totalAmount.toFixed(2)), numStyle)
      ])
      sRow++
    })

    const totalCostingDays = data.categorySummary.reduce((sum, c) => sum + c.totalDays, 0)
    const totalCostingAmount = data.categorySummary.reduce((sum, c) => sum + c.totalAmount, 0)

    summaryData.push([
      cell('Sous-total chiffrage', styles.subtotal),
      cell(Number(totalCostingDays.toFixed(2)), styles.subtotal),
      cell(Number(totalCostingAmount.toFixed(2)), styles.subtotal)
    ])
    sRow++
  }

  // Transverse summary
  if (data.transverseDetails.length > 0) {
    const totalTransverseDays = data.transverseDetails.reduce((sum, t) => sum + t.days, 0)
    const totalTransverseAmount = data.transverseDetails.reduce((sum, t) => sum + t.amount, 0)
    summaryData.push([
      cell('Activités transverses', styles.tableCell),
      cell(Number(totalTransverseDays.toFixed(2)), styles.tableCellNumber),
      cell(Number(totalTransverseAmount.toFixed(2)), styles.tableCellNumber)
    ])
    sRow++
  }

  summaryData.push([null, null, null])
  sRow++

  // Totals
  summaryData.push([
    cell('💰 TOTAUX', styles.sectionHeader),
    cell(null, styles.sectionHeader),
    cell(null, styles.sectionHeader)
  ])
  summaryMerges.push({ s: { r: sRow, c: 0 }, e: { r: sRow, c: 2 } })
  sRow++

  summaryData.push([null, null, null])
  sRow++

  summaryData.push([
    cell('Total jours', styles.tableCell),
    cell(Number(data.totalDays.toFixed(2)), { ...styles.tableCellNumber, font: { bold: true, sz: 10, color: { rgb: "374151" } } }),
    cell(null, styles.tableCell)
  ])
  sRow++

  summaryData.push([
    cell('Total HT', styles.tableCell),
    cell(null, styles.tableCell),
    cell(`${formatNumber(data.totalHT)} €`, { ...styles.tableCellNumber, font: { bold: true, sz: 10, color: { rgb: "374151" } } })
  ])
  sRow++

  summaryData.push([
    cell('TVA (20%)', styles.tableCell),
    cell(null, styles.tableCell),
    cell(`${formatNumber(data.totalTVA)} €`, styles.tableCellNumber)
  ])
  sRow++

  summaryData.push([
    cell('TOTAL TTC', styles.grandTotalLabel),
    cell(null, styles.grandTotalLabel),
    cell(`${formatNumber(data.totalTTC)} €`, styles.grandTotal)
  ])
  summaryMerges.push({ s: { r: sRow, c: 0 }, e: { r: sRow, c: 1 } })
  sRow++

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 20 }]
  wsSummary['!merges'] = summaryMerges
  wsSummary['!rows'] = [{ hpt: 28 }]

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé')

  // Generate filename
  const sanitizedName = (quote.name || 'devis').replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').replace(/\s+/g, '_')
  const date = new Date().toISOString().split('T')[0]
  const filename = `${sanitizedName}_${date}.xlsx`

  XLSX.writeFile(wb, filename)
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
