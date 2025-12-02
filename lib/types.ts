export type ProjectStatus = 'pending' | 'in_review' | 'active' | 'won' | 'lost' | 'cancelled' | 'closed'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

// Profil assigné au devis (nom + TJM)
export interface QuoteProfile {
  name: string
  daily_rate: number
}

// Phase du projet
export interface QuotePhase {
  name: string
  description: string
  duration_days: number
  profiles: string[] // noms des profils assignés
}

// Ligne du devis
export interface QuoteLineItem {
  description: string
  phase_id: number
  profile_name: string
  days: number
  daily_rate: number
  total: number
}

export interface Quote {
  id: string
  project_id: string
  version: number

  // Étape 1: Informations générales
  name: string
  start_date: string | null
  end_date: string | null
  comment: string
  profiles: QuoteProfile[]

  // Étape 2: Phases
  phases: QuotePhase[]

  // Étape 3: Lignes du devis
  line_items: QuoteLineItem[]

  // Étape 4: Récapitulatif
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

// Données du formulaire étape par étape
export interface QuoteFormDataStep1 {
  name: string
  start_date: string
  end_date: string
  status: QuoteStatus
  comment: string
  profiles: QuoteProfile[]
}

export interface QuoteFormDataStep2 {
  phases: QuotePhase[]
}

export interface QuoteFormDataStep3 {
  line_items: QuoteLineItem[]
}

export interface QuoteFormDataStep4 {
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
  phases: QuotePhase[]
  // Step 3
  line_items: QuoteLineItem[]
  // Step 4
  notes: string
  payment_terms: string
  validity_days: number
}

export interface ProjectFile {
  name: string
  url: string
  path: string
  size: number
  type: string
}

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  phone: string
  client_type: string
  siret: string
  avatar_url: string
  role: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string

  // Profile relation (joined from profiles table)
  profiles?: Profile

  // Titre du projet
  title: string

  // Type de projet (checkboxes multiples)
  project_types: string[]

  // Services demandés
  services: string[]

  // Plateformes cibles
  platforms: string[]

  // Description du projet
  description: string
  features: string
  target_audience: string

  // Projet existant
  has_existing_project: boolean
  existing_technologies: string

  // Design
  needs_design: string // 'yes' | 'partial' | 'no'

  // Budget et délais
  budget: string // 'small' | 'medium' | 'large' | 'xlarge' | 'flexible'
  deadline: string // 'urgent' | 'short' | 'medium' | 'long' | 'flexible'

  // Informations additionnelles
  additional_info: string

  // Fichiers joints
  specifications_file?: ProjectFile | null
  design_files?: ProjectFile[] | null
  brand_assets?: ProjectFile[] | null
  inspiration_images?: ProjectFile[] | null
  other_documents?: ProjectFile[] | null

  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface ProjectFormData {
  title: string
  project_types: string[]
  services: string[]
  platforms: string[]
  description: string
  features: string
  target_audience: string
  has_existing_project: boolean
  existing_technologies: string
  needs_design: string
  budget: string
  deadline: string
  additional_info: string
  // Fichiers joints
  specifications_file?: ProjectFile | null
  design_files?: ProjectFile[] | null
  brand_assets?: ProjectFile[] | null
  inspiration_images?: ProjectFile[] | null
  other_documents?: ProjectFile[] | null
}
