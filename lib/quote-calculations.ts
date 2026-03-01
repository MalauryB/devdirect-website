import { Quote, QuoteAbaque, ComplexityLevel } from './types'

export const VAT_RATE = 0.20 // 20% TVA

export interface CalculatedQuoteData {
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
