import type { Profile } from './profile'

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
