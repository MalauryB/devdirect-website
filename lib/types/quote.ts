export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

// Profil assign au devis (nom + TJM)
export interface QuoteProfile {
  name: string
  daily_rate: number
}

// Abaque (grille de chiffrage par composant)
export interface QuoteAbaque {
  component_name: string
  profile_name: string // profil selectionne parmi ceux definis en etape 1
  // Jours par niveau de complexite
  days_ts: number // Tres Simple
  days_s: number  // Simple
  days_m: number  // Moyen
  days_c: number  // Complexe
  days_tc: number // Tres Complexe
}

// Activite transverse (dans un niveau)
export type TransverseActivityType = 'fixed' | 'rate'

export interface TransverseActivity {
  name: string
  profile_name: string
  type: TransverseActivityType // 'fixed' = valeur fixe en jours, 'rate' = pourcentage du total
  value: number // jours si fixed, pourcentage si rate
}

// Niveau d'activites transverses
export interface TransverseLevel {
  level: number // 0, 1, 2, 3...
  activities: TransverseActivity[]
}

// Etape 4: Elements de chiffrage
export type ComplexityLevel = 'ts' | 's' | 'm' | 'c' | 'tc'

// Composant dans une activite de chiffrage
export interface CostingComponent {
  coefficient: number
  component_name: string // reference a un abaque
  complexity: ComplexityLevel
  comment: string
}

// Activite de chiffrage (dans une categorie)
export interface CostingActivity {
  name: string
  active: boolean
  components: CostingComponent[]
}

// Categorie d'elements de chiffrage
export interface CostingCategory {
  name: string
  activities: CostingActivity[]
}

export interface Quote {
  id: string
  project_id: string
  version: number

  // Etape 1: Informations generales
  name: string
  start_date: string | null
  end_date: string | null
  comment: string
  profiles: QuoteProfile[]

  // Etape 2: Abaques (grilles de chiffrage)
  abaques: QuoteAbaque[]

  // Etape 3: Activites transverses (par niveaux)
  transverse_levels: TransverseLevel[]

  // Etape 4: Elements de chiffrage
  costing_categories: CostingCategory[]

  // Recapitulatif
  notes: string
  payment_terms: string
  validity_days: number

  // Montant et statut
  amount: number
  status: QuoteStatus
  created_at: string
  updated_at: string
  sent_at: string | null
  accepted_at: string | null
}

// Donnees du formulaire etape par etape
export interface QuoteFormDataStep1 {
  name: string
  start_date: string
  end_date: string
  status: QuoteStatus
  comment: string
  profiles: QuoteProfile[]
}

export interface QuoteFormDataStep2 {
  abaques: QuoteAbaque[]
}

export interface QuoteFormDataStep3 {
  transverse_levels: TransverseLevel[]
}

export interface QuoteFormDataStep4 {
  costing_categories: CostingCategory[]
}

export interface QuoteFormDataStep5 {
  notes: string
  payment_terms: string
  validity_days: number
}

export interface QuoteFormData {
  // Step 1
  name: string
  start_date: string
  end_date: string
  status: QuoteStatus
  comment: string
  profiles: QuoteProfile[]
  // Step 2
  abaques: QuoteAbaque[]
  // Step 3
  transverse_levels: TransverseLevel[]
  // Step 4: Elements de chiffrage
  costing_categories: CostingCategory[]
  // Step 5: Recapitulatif
  notes: string
  payment_terms: string
  validity_days: number
}
