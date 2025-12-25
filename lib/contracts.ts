import { supabase } from './supabase'
import { ProjectContract, ContractType, ContractStatus, ContractProfile } from './types'

// Get all contracts for a project with their profiles
export async function getProjectContracts(projectId: string): Promise<ProjectContract[]> {
  const { data, error } = await supabase
    .from('project_contracts')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contracts:', error)
    return []
  }

  // Fetch profiles for time_and_materials contracts
  const contracts = data || []
  const tmContracts = contracts.filter(c => c.type === 'time_and_materials')

  if (tmContracts.length > 0) {
    const { data: profiles } = await supabase
      .from('contract_profiles')
      .select('*')
      .in('contract_id', tmContracts.map(c => c.id))
      .order('created_at', { ascending: true })

    if (profiles) {
      contracts.forEach(contract => {
        if (contract.type === 'time_and_materials') {
          contract.profiles = profiles.filter(p => p.contract_id === contract.id)
        }
      })
    }
  }

  return contracts
}

// Get a single contract by ID with profiles
export async function getContract(contractId: string): Promise<ProjectContract | null> {
  const { data, error } = await supabase
    .from('project_contracts')
    .select('*')
    .eq('id', contractId)
    .single()

  if (error) {
    console.error('Error fetching contract:', error)
    return null
  }

  // Fetch profiles for time_and_materials contracts
  if (data && data.type === 'time_and_materials') {
    const { data: profiles } = await supabase
      .from('contract_profiles')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true })

    if (profiles) {
      data.profiles = profiles
    }
  }

  return data
}

// Profile input for creating contracts
export interface ContractProfileInput {
  profile_name: string
  daily_rate: number
  estimated_days?: number | null
}

// Create a new contract
export async function createContract(contract: {
  project_id: string
  quote_id?: string
  type: ContractType
  title: string
  content: string
  valid_until?: string
  // Fixed-price specific
  delivery_delay?: string
  payment_schedule?: string
  // Time and materials specific
  profiles?: ContractProfileInput[] // Multiple profiles with TJM
  work_location?: string
  contract_duration?: string
  notice_period?: string
  billing_frequency?: string
}): Promise<ProjectContract | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const insertData: Record<string, unknown> = {
    project_id: contract.project_id,
    quote_id: contract.quote_id || null,
    type: contract.type,
    title: contract.title,
    content: contract.content,
    valid_until: contract.valid_until || null,
    status: 'draft',
    created_by: user.id,
    updated_by: user.id
  }

  // Add type-specific fields
  if (contract.type === 'service_agreement') {
    insertData.delivery_delay = contract.delivery_delay || '3_months'
    insertData.payment_schedule = contract.payment_schedule || '30-40-30'
  } else if (contract.type === 'time_and_materials') {
    insertData.work_location = contract.work_location || 'remote'
    insertData.contract_duration = contract.contract_duration || '6_months'
    insertData.notice_period = contract.notice_period || '1_month'
    insertData.billing_frequency = contract.billing_frequency || 'monthly'
  }

  const { data, error } = await supabase
    .from('project_contracts')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating contract:', error)
    return null
  }

  // Create profiles for time_and_materials contracts
  if (contract.type === 'time_and_materials' && contract.profiles && contract.profiles.length > 0) {
    const profilesToInsert = contract.profiles.map(p => ({
      contract_id: data.id,
      profile_name: p.profile_name,
      daily_rate: p.daily_rate,
      estimated_days: p.estimated_days || null
    }))

    const { data: profiles, error: profilesError } = await supabase
      .from('contract_profiles')
      .insert(profilesToInsert)
      .select()

    if (profilesError) {
      console.error('Error creating contract profiles:', profilesError)
    } else {
      data.profiles = profiles
    }
  }

  return data
}

// Update contract content
export async function updateContract(
  contractId: string,
  updates: {
    title?: string
    content?: string
    valid_until?: string
    type?: ContractType
    // Fixed-price specific
    delivery_delay?: string
    payment_schedule?: string
    // Time and materials specific
    profiles?: ContractProfileInput[] // Replace all profiles
    work_location?: string
    contract_duration?: string
    notice_period?: string
    billing_frequency?: string
  }
): Promise<ProjectContract | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Extract profiles from updates (handle separately)
  const { profiles, ...contractUpdates } = updates

  const { data, error } = await supabase
    .from('project_contracts')
    .update({
      ...contractUpdates,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', contractId)
    .select()
    .single()

  if (error) {
    console.error('Error updating contract:', error)
    return null
  }

  // Update profiles for time_and_materials contracts (replace all)
  if (data.type === 'time_and_materials' && profiles !== undefined) {
    // Delete existing profiles
    await supabase
      .from('contract_profiles')
      .delete()
      .eq('contract_id', contractId)

    // Insert new profiles
    if (profiles.length > 0) {
      const profilesToInsert = profiles.map(p => ({
        contract_id: contractId,
        profile_name: p.profile_name,
        daily_rate: p.daily_rate,
        estimated_days: p.estimated_days || null
      }))

      const { data: newProfiles, error: profilesError } = await supabase
        .from('contract_profiles')
        .insert(profilesToInsert)
        .select()

      if (profilesError) {
        console.error('Error updating contract profiles:', profilesError)
      } else {
        data.profiles = newProfiles
      }
    } else {
      data.profiles = []
    }
  }

  return data
}

// Update contract status
export async function updateContractStatus(
  contractId: string,
  status: ContractStatus
): Promise<ProjectContract | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const updates: Record<string, unknown> = {
    status,
    updated_by: user.id,
    updated_at: new Date().toISOString()
  }

  // Set timestamps based on status
  if (status === 'sent') {
    updates.sent_at = new Date().toISOString()
  } else if (status === 'signed') {
    updates.signed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('project_contracts')
    .update(updates)
    .eq('id', contractId)
    .select()
    .single()

  if (error) {
    console.error('Error updating contract status:', error)
    return null
  }

  return data
}

// Delete a contract (only drafts)
export async function deleteContract(contractId: string): Promise<boolean> {
  const { error } = await supabase
    .from('project_contracts')
    .delete()
    .eq('id', contractId)
    .eq('status', 'draft')

  if (error) {
    console.error('Error deleting contract:', error)
    return false
  }

  return true
}

// Save PDF URL after generation
export async function saveContractPdf(contractId: string, pdfUrl: string): Promise<boolean> {
  const { error } = await supabase
    .from('project_contracts')
    .update({ pdf_url: pdfUrl })
    .eq('id', contractId)

  if (error) {
    console.error('Error saving contract PDF URL:', error)
    return false
  }

  return true
}

// Sign contract (for client)
export async function signContract(
  contractId: string,
  signatureUrl: string
): Promise<ProjectContract | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('project_contracts')
    .update({
      client_signature_url: signatureUrl,
      status: 'signed',
      signed_at: new Date().toISOString(),
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', contractId)
    .eq('status', 'sent')
    .select()
    .single()

  if (error) {
    console.error('Error signing contract:', error)
    return null
  }

  return data
}

// Create amendment from existing contract
export async function createAmendment(
  parentContractId: string,
  content: string,
  title: string
): Promise<ProjectContract | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get parent contract
  const parentContract = await getContract(parentContractId)
  if (!parentContract) return null

  const { data, error } = await supabase
    .from('project_contracts')
    .insert({
      project_id: parentContract.project_id,
      quote_id: parentContract.quote_id,
      type: 'amendment',
      title,
      content,
      status: 'draft',
      version: parentContract.version + 1,
      parent_contract_id: parentContractId,
      created_by: user.id,
      updated_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating amendment:', error)
    return null
  }

  return data
}

// Get contract type label
export function getContractTypeLabel(type: ContractType, t: (key: string) => string): string {
  const labels: Record<ContractType, string> = {
    service_agreement: t('contracts.types.serviceAgreement'),
    time_and_materials: t('contracts.types.timeAndMaterials'),
    terms_of_sale: t('contracts.types.termsOfSale'),
    amendment: t('contracts.types.amendment')
  }
  return labels[type] || type
}

// Get contract status label
export function getContractStatusLabel(status: ContractStatus, t: (key: string) => string): string {
  const labels: Record<ContractStatus, string> = {
    draft: t('contracts.status.draft'),
    sent: t('contracts.status.sent'),
    signed: t('contracts.status.signed'),
    cancelled: t('contracts.status.cancelled')
  }
  return labels[status] || status
}
