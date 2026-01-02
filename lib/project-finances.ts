import { Quote, ProjectContract } from './types'
import { calculateQuoteData } from './quote-export'

// Time stats result from getProjectTimeStats
export interface TimeStatsResult {
  totalHours: number
  totalDays: number
  byEngineer: { engineerId: string; engineerName: string; hours: number; days: number }[]
  byCategory: { category: string; hours: number; days: number }[]
  byMonth: { month: string; hours: number; days: number }[]
}

// Profile financial breakdown
export interface ProfileFinance {
  profileName: string
  budgetDays: number
  budgetAmount: number
  dailyRate: number
  consumedDays: number
  consumedAmount: number
  remainingDays: number
  consumptionPercent: number
}

// Monthly evolution data
export interface MonthlyEvolution {
  month: string
  monthLabel: string
  hoursWorked: number
  daysWorked: number
  cumulativeDays: number
  budgetConsumedPercent: number
}

// Category breakdown data
export interface CategoryBreakdown {
  category: string
  categoryLabel: string
  hours: number
  days: number
  percent: number
}

// Complete project finance data
export interface ProjectFinanceData {
  // Budget totals
  totalBudgetHT: number
  totalBudgetTVA: number
  totalBudgetTTC: number
  totalBudgetDays: number

  // Consumption
  consumedDays: number
  consumedHours: number
  remainingDays: number
  consumptionPercent: number

  // Estimated value of consumed time
  consumedValueHT: number
  remainingValueHT: number

  // Breakdowns
  profileBreakdown: ProfileFinance[]
  monthlyEvolution: MonthlyEvolution[]
  categoryBreakdown: CategoryBreakdown[]

  // Source data counts
  acceptedQuotesCount: number
  signedContractsCount: number
  hasData: boolean
}

const VAT_RATE = 0.20

// Category labels for display
const CATEGORY_LABELS: Record<string, string> = {
  development: 'Développement',
  meeting: 'Réunions',
  review: 'Revue de code',
  documentation: 'Documentation',
  design: 'Design',
  testing: 'Tests',
  support: 'Support',
  other: 'Autre'
}

// Month labels for display
function getMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-')
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  return `${monthNames[parseInt(monthNum) - 1]} ${year.slice(2)}`
}

export function calculateProjectFinances(
  quotes: Quote[],
  contracts: ProjectContract[],
  timeStats: TimeStatsResult
): ProjectFinanceData {
  // Initialize budget tracking
  let totalBudgetHT = 0
  let totalBudgetDays = 0
  const profileBudgets = new Map<string, { days: number; amount: number; rate: number }>()

  // Track which quotes are already counted via signed contracts
  const quotesUsedByContracts = new Set<string>()

  // 1. First, process signed contracts (they take priority)
  const signedContracts = contracts.filter(c => c.status === 'signed')

  // 1a. Signed fixed-price contracts (service_agreement) - use linked quote data
  const signedFixedContracts = signedContracts.filter(c => c.type === 'service_agreement')

  for (const contract of signedFixedContracts) {
    if (contract.quote_id) {
      // Find the linked quote
      const linkedQuote = quotes.find(q => q.id === contract.quote_id)
      if (linkedQuote) {
        quotesUsedByContracts.add(linkedQuote.id)
        const quoteData = calculateQuoteData(linkedQuote)
        totalBudgetHT += quoteData.totalHT
        totalBudgetDays += quoteData.totalDays

        // Aggregate by profile from quote
        for (const profile of quoteData.profileSummary) {
          const existing = profileBudgets.get(profile.profile) || { days: 0, amount: 0, rate: profile.dailyRate }
          profileBudgets.set(profile.profile, {
            days: existing.days + profile.totalDays,
            amount: existing.amount + profile.amount,
            rate: profile.dailyRate
          })
        }
      }
    }
  }

  // 1b. Signed time_and_materials contracts - use contract profiles
  const signedTMContracts = signedContracts.filter(c => c.type === 'time_and_materials')

  for (const contract of signedTMContracts) {
    if (contract.profiles && contract.profiles.length > 0) {
      for (const profile of contract.profiles) {
        // Include profile even without estimated_days (T&M contracts may not have volume forecast)
        const estimatedDays = profile.estimated_days || 0
        const amount = profile.daily_rate * estimatedDays
        totalBudgetDays += estimatedDays
        totalBudgetHT += amount

        const existing = profileBudgets.get(profile.profile_name) || { days: 0, amount: 0, rate: profile.daily_rate }
        profileBudgets.set(profile.profile_name, {
          days: existing.days + estimatedDays,
          amount: existing.amount + amount,
          rate: profile.daily_rate
        })
      }
    } else {
      // Contract without profiles - create a placeholder entry to show it exists
      // This happens when a T&M contract was created without defining profiles
      profileBudgets.set(`Contrat régie #${contract.id.slice(0, 8)}`, {
        days: 0,
        amount: 0,
        rate: 0
      })
    }
  }

  // 2. Add budget from accepted quotes NOT already counted via contracts
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted' && !quotesUsedByContracts.has(q.id))

  for (const quote of acceptedQuotes) {
    const quoteData = calculateQuoteData(quote)
    totalBudgetHT += quoteData.totalHT
    totalBudgetDays += quoteData.totalDays

    // Aggregate by profile from quote
    for (const profile of quoteData.profileSummary) {
      const existing = profileBudgets.get(profile.profile) || { days: 0, amount: 0, rate: profile.dailyRate }
      profileBudgets.set(profile.profile, {
        days: existing.days + profile.totalDays,
        amount: existing.amount + profile.amount,
        rate: profile.dailyRate
      })
    }
  }

  // 3. Calculate consumed from time entries
  const consumedDays = timeStats.totalDays
  const consumedHours = timeStats.totalHours

  // 4. Calculate average daily rate for value estimation
  const avgDailyRate = totalBudgetDays > 0 ? totalBudgetHT / totalBudgetDays : 0
  const consumedValueHT = consumedDays * avgDailyRate
  const remainingValueHT = Math.max(0, totalBudgetHT - consumedValueHT)

  // 5. Build profile breakdown with consumption
  // Match time entries by engineer to profiles (best effort matching)
  const profileBreakdown: ProfileFinance[] = Array.from(profileBudgets.entries()).map(([name, budget]) => {
    // Try to match engineer time to profile name
    // This is a simplified approach - in production you might want explicit profile-engineer mapping
    let consumedForProfile = 0

    for (const engineer of timeStats.byEngineer) {
      const engineerNameLower = engineer.engineerName.toLowerCase()
      const profileNameLower = name.toLowerCase()

      // Check if engineer name contains profile keywords
      if (engineerNameLower.includes('senior') && profileNameLower.includes('senior')) {
        consumedForProfile += engineer.days
      } else if (engineerNameLower.includes('junior') && profileNameLower.includes('junior')) {
        consumedForProfile += engineer.days
      } else if (engineerNameLower.includes('chef') && profileNameLower.includes('chef')) {
        consumedForProfile += engineer.days
      } else if (engineerNameLower.includes('lead') && profileNameLower.includes('lead')) {
        consumedForProfile += engineer.days
      }
    }

    // If no specific match, distribute proportionally
    if (consumedForProfile === 0 && profileBudgets.size === 1) {
      consumedForProfile = consumedDays
    }

    const consumptionPercent = budget.days > 0 ? (consumedForProfile / budget.days) * 100 : 0

    return {
      profileName: name,
      budgetDays: budget.days,
      budgetAmount: budget.amount,
      dailyRate: budget.rate,
      consumedDays: consumedForProfile,
      consumedAmount: consumedForProfile * budget.rate,
      remainingDays: Math.max(0, budget.days - consumedForProfile),
      consumptionPercent: Math.min(100, consumptionPercent)
    }
  })

  // If no profile breakdown but we have consumed time, create a generic entry
  if (profileBreakdown.length === 0 && consumedDays > 0) {
    profileBreakdown.push({
      profileName: 'Non affecté',
      budgetDays: 0,
      budgetAmount: 0,
      dailyRate: 0,
      consumedDays: consumedDays,
      consumedAmount: 0,
      remainingDays: 0,
      consumptionPercent: 0
    })
  }

  // 6. Monthly evolution with cumulative
  let cumulative = 0
  const monthlyEvolution: MonthlyEvolution[] = timeStats.byMonth.map(m => {
    cumulative += m.days
    return {
      month: m.month,
      monthLabel: getMonthLabel(m.month),
      hoursWorked: m.hours,
      daysWorked: m.days,
      cumulativeDays: cumulative,
      budgetConsumedPercent: totalBudgetDays > 0
        ? Math.min(100, (cumulative / totalBudgetDays) * 100)
        : 0
    }
  })

  // 7. Category breakdown with percentages and labels
  const categoryBreakdown: CategoryBreakdown[] = timeStats.byCategory.map(c => ({
    category: c.category,
    categoryLabel: CATEGORY_LABELS[c.category] || c.category,
    hours: c.hours,
    days: c.days,
    percent: timeStats.totalDays > 0 ? (c.days / timeStats.totalDays) * 100 : 0
  })).sort((a, b) => b.days - a.days) // Sort by days descending

  // 8. Calculate final metrics
  const remainingDays = Math.max(0, totalBudgetDays - consumedDays)
  const consumptionPercent = totalBudgetDays > 0
    ? Math.min(100, (consumedDays / totalBudgetDays) * 100)
    : 0

  const totalSignedContracts = signedFixedContracts.length + signedTMContracts.length
  const hasData = acceptedQuotes.length > 0 || totalSignedContracts > 0 || consumedDays > 0

  return {
    totalBudgetHT,
    totalBudgetTVA: totalBudgetHT * VAT_RATE,
    totalBudgetTTC: totalBudgetHT * (1 + VAT_RATE),
    totalBudgetDays,
    consumedDays,
    consumedHours,
    remainingDays,
    consumptionPercent,
    consumedValueHT,
    remainingValueHT,
    profileBreakdown,
    monthlyEvolution,
    categoryBreakdown,
    acceptedQuotesCount: acceptedQuotes.length,
    signedContractsCount: totalSignedContracts,
    hasData
  }
}

// Helper to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Helper to format currency with decimals
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Helper to get consumption status color
export function getConsumptionColor(percent: number): string {
  if (percent >= 90) return 'text-red-600'
  if (percent >= 75) return 'text-amber-600'
  if (percent >= 50) return 'text-blue-600'
  return 'text-green-600'
}

// Helper to get consumption background color
export function getConsumptionBgColor(percent: number): string {
  if (percent >= 90) return 'bg-red-100'
  if (percent >= 75) return 'bg-amber-100'
  if (percent >= 50) return 'bg-blue-100'
  return 'bg-green-100'
}
