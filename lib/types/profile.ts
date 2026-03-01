export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  legal_form?: string
  professional_email?: string
  contact_position?: string
  phone: string
  client_type: string
  siret: string
  vat_number?: string
  avatar_url: string
  role: string
  // Address fields
  address?: string
  postal_code?: string
  city?: string
  country?: string
  // Engineer-specific fields
  job_title: string
  bio: string
  skills: string[]
  created_at: string
  updated_at: string
}

// Current user type (derived from Supabase user, used across components)
export interface CurrentUser {
  id: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  role?: string
}
