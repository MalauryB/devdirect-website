export type ProjectStatus = 'pending' | 'in_review' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

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
