import type { Profile } from './profile'
import type { Project } from './project'
import type { Quote } from './quote'

// Project Contracts
export type ContractType = 'service_agreement' | 'time_and_materials' | 'terms_of_sale' | 'amendment'
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled'

// Profile for time and materials contracts (multiple TJM rates)
export interface ContractProfile {
  id: string
  contract_id: string
  profile_name: string // e.g., "Developpeur Senior", "Chef de projet", etc.
  daily_rate: number // TJM en euros HT
  estimated_days: number | null // Volume previsionnel en jours (optional)
  created_at: string
}

export interface ProjectContract {
  id: string
  project_id: string
  quote_id: string | null
  type: ContractType
  title: string
  content: string
  status: ContractStatus
  sent_at: string | null
  signed_at: string | null
  valid_until: string | null
  client_signature_url: string | null
  provider_signature_url: string | null
  pdf_url: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  version: number
  parent_contract_id: string | null
  // Contract settings (forfait)
  delivery_delay: string | null // '1_month' | '2_months' | '3_months' | '6_months' | 'custom'
  payment_schedule: string | null // '30-40-30' | '50-50' | '30-70' | '100'
  // Contract settings (regie / time_and_materials)
  work_location: string | null // 'client' | 'remote' | 'hybrid'
  contract_duration: string | null // '3_months' | '6_months' | '12_months' | 'custom'
  notice_period: string | null // '15_days' | '1_month'
  billing_frequency: string | null // 'weekly' | 'monthly'
  // Relations (joined)
  creator?: Profile
  project?: Project
  quote?: Quote
  profiles?: ContractProfile[] // Multiple profiles with different TJM rates
}
