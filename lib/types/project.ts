import type { Profile } from './profile'

export type ProjectStatus = 'pending' | 'in_review' | 'active' | 'won' | 'lost' | 'cancelled' | 'closed'

export interface ProjectFile {
  name: string
  url: string
  path: string
  size: number
  type: string
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

  // Services demandes
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

  // Budget et delais
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

// Default project form data (shared across devis page, wizard, and legacy form)
export const DEFAULT_PROJECT_FORM_DATA: ProjectFormData = {
  title: "",
  project_types: [],
  services: [],
  platforms: [],
  description: "",
  features: "",
  target_audience: "",
  has_existing_project: false,
  existing_technologies: "",
  needs_design: "",
  budget: "",
  deadline: "",
  additional_info: "",
}

export function getProjectFormData(project?: Project | null): ProjectFormData {
  if (!project) return { ...DEFAULT_PROJECT_FORM_DATA }
  return {
    title: project.title || "",
    project_types: project.project_types || [],
    services: project.services || [],
    platforms: project.platforms || [],
    description: project.description || "",
    features: project.features || "",
    target_audience: project.target_audience || "",
    has_existing_project: project.has_existing_project || false,
    existing_technologies: project.existing_technologies || "",
    needs_design: project.needs_design || "",
    budget: project.budget || "",
    deadline: project.deadline || "",
    additional_info: project.additional_info || "",
    specifications_file: project.specifications_file || null,
    design_files: project.design_files || null,
    brand_assets: project.brand_assets || null,
    inspiration_images: project.inspiration_images || null,
    other_documents: project.other_documents || null,
  }
}
