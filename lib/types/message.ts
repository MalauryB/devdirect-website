import type { Profile } from './profile'

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
