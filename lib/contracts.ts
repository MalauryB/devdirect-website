import { supabase } from './supabase'
import { ProjectContract, ContractType, ContractStatus } from './types'

// Get all contracts for a project
export async function getProjectContracts(projectId: string): Promise<ProjectContract[]> {
  const { data, error } = await supabase
    .from('project_contracts')
    .select(`
      *,
      creator:profiles!project_contracts_created_by_fkey(id, first_name, last_name, email, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contracts:', error)
    return []
  }

  return data || []
}

// Get a single contract by ID
export async function getContract(contractId: string): Promise<ProjectContract | null> {
  const { data, error } = await supabase
    .from('project_contracts')
    .select(`
      *,
      creator:profiles!project_contracts_created_by_fkey(id, first_name, last_name, email, avatar_url)
    `)
    .eq('id', contractId)
    .single()

  if (error) {
    console.error('Error fetching contract:', error)
    return null
  }

  return data
}

// Create a new contract
export async function createContract(contract: {
  project_id: string
  quote_id?: string
  type: ContractType
  title: string
  content: string
  valid_until?: string
}): Promise<ProjectContract | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('project_contracts')
    .insert({
      project_id: contract.project_id,
      quote_id: contract.quote_id || null,
      type: contract.type,
      title: contract.title,
      content: contract.content,
      valid_until: contract.valid_until || null,
      status: 'draft',
      created_by: user.id,
      updated_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating contract:', error)
    return null
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
  }
): Promise<ProjectContract | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('project_contracts')
    .update({
      ...updates,
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
