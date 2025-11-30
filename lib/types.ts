export type ProjectStatus = 'pending' | 'in_review' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
export type ProjectType = 'web' | 'mobile' | 'iot' | 'ai' | 'consulting' | 'maintenance' | 'design'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  project_type: ProjectType
  budget_min?: number
  budget_max?: number
  deadline?: string
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface ProjectFormData {
  title: string
  description: string
  project_type: ProjectType
  budget_min?: number
  budget_max?: number
  deadline?: string
}
