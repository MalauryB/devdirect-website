export type ProjectStatus = 'pending' | 'in_review' | 'active' | 'won' | 'lost' | 'cancelled' | 'closed'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

// Profil assigné au devis (nom + TJM)
export interface QuoteProfile {
  name: string
  daily_rate: number
}

// Abaque (grille de chiffrage par composant)
export interface QuoteAbaque {
  component_name: string
  profile_name: string // profil sélectionné parmi ceux définis en étape 1
  // Jours par niveau de complexité
  days_ts: number // Très Simple
  days_s: number  // Simple
  days_m: number  // Moyen
  days_c: number  // Complexe
  days_tc: number // Très Complexe
}

// Activité transverse (dans un niveau)
export type TransverseActivityType = 'fixed' | 'rate'

export interface TransverseActivity {
  name: string
  profile_name: string
  type: TransverseActivityType // 'fixed' = valeur fixe en jours, 'rate' = pourcentage du total
  value: number // jours si fixed, pourcentage si rate
}

// Niveau d'activités transverses
export interface TransverseLevel {
  level: number // 0, 1, 2, 3...
  activities: TransverseActivity[]
}

// Étape 4: Éléments de chiffrage
export type ComplexityLevel = 'ts' | 's' | 'm' | 'c' | 'tc'

// Composant dans une activité de chiffrage
export interface CostingComponent {
  coefficient: number
  component_name: string // référence à un abaque
  complexity: ComplexityLevel
  comment: string
}

// Activité de chiffrage (dans une catégorie)
export interface CostingActivity {
  name: string
  active: boolean
  components: CostingComponent[]
}

// Catégorie d'éléments de chiffrage
export interface CostingCategory {
  name: string
  activities: CostingActivity[]
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

  // Étape 2: Abaques (grilles de chiffrage)
  abaques: QuoteAbaque[]

  // Étape 3: Activités transverses (par niveaux)
  transverse_levels: TransverseLevel[]

  // Étape 4: Éléments de chiffrage
  costing_categories: CostingCategory[]

  // Récapitulatif
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
  // Step 4: Éléments de chiffrage
  costing_categories: CostingCategory[]
  // Step 5: Récapitulatif
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
  // Engineer-specific fields
  job_title: string
  bio: string
  skills: string[]
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

// Messages
export interface MessageAttachment {
  url: string
  path: string
  name: string
  type: string
  size: number
}

export interface Message {
  id: string
  project_id: string
  sender_id: string
  content: string
  attachment?: MessageAttachment | null
  is_read: boolean
  read_at: string | null
  is_deleted?: boolean
  deleted_at?: string | null
  created_at: string
  updated_at: string
  // Relations (joined)
  sender?: Profile
}

// Types de documents de projet
export type ProjectDocumentType =
  | 'signed_quote'      // Devis signé
  | 'contract'          // Contrat
  | 'invoice'           // Facture
  | 'kickoff'           // Kick-off
  | 'steering_committee' // Comité de suivi
  | 'documentation'     // Documentation technique
  | 'specification'     // Cahier des charges
  | 'mockup'            // Maquette
  | 'deliverable'       // Livrable
  | 'other'             // Autre

export interface ProjectDocument {
  id: string
  project_id: string
  uploaded_by: string
  name: string
  description: string | null
  type: ProjectDocumentType
  file_path: string
  file_name: string
  file_size: number
  file_type: string // MIME type
  // Versioning
  version: number
  parent_id: string | null // ID du document original (null si c'est la v1)
  is_latest: boolean // true si c'est la dernière version
  created_at: string
  updated_at: string
  // Relations (joined)
  uploader?: Profile
  // Versions liées (pour affichage)
  versions?: ProjectDocument[]
}

// Time tracking
export type TimeEntryCategory = 'development' | 'meeting' | 'review' | 'documentation' | 'design' | 'testing' | 'support' | 'other'

export interface TimeEntry {
  id: string
  project_id: string
  engineer_id: string
  date: string // YYYY-MM-DD
  hours: number
  description: string | null
  category: TimeEntryCategory | null
  created_at: string
  updated_at: string
  // Relations (joined)
  engineer?: Profile
}
