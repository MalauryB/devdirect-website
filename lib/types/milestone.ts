import type { Profile } from './profile'

// Project milestones / Roadmap
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export interface MilestoneAssignee {
  id: string
  milestone_id: string
  engineer_id: string
  assigned_at: string
  assigned_by: string | null
  // Relations (joined)
  engineer?: Profile
}

export interface MilestoneSubtask {
  id: string
  milestone_id: string
  title: string
  description: string | null
  is_completed: boolean
  completed_at: string | null
  completed_by: string | null
  order_index: number
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations (joined)
  completer?: Profile
}

export interface ProjectMilestone {
  id: string
  project_id: string
  title: string
  description: string | null
  status: MilestoneStatus
  due_date: string | null
  completed_at: string | null
  completed_by: string | null
  order_index: number
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations (joined)
  completer?: Profile
  creator?: Profile
  assignees?: MilestoneAssignee[]
  subtasks?: MilestoneSubtask[]
}
