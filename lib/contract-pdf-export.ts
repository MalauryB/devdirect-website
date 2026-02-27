import { ProjectContract, Project, Profile, Quote, ProjectDocument } from './types'
import { supabase } from './supabase'

interface ContractPdfParams {
  contract: ProjectContract
  project?: Project | null
  client?: Profile | null
  quote?: Quote | null // Used for calculating amounts in the contract body
  provider?: {
    name: string
    address: string
    siret: string
    email: string
    phone: string
  }
  includeAnnexes?: boolean
  signedQuoteDocument?: ProjectDocument | null // Physical signed quote document for annex
  specificationDocument?: ProjectDocument | null
  planningDocument?: ProjectDocument | null
  accessToken?: string
}

// Generate a signed URL for a document
async function getSignedUrlForDocument(
  document: ProjectDocument | null | undefined
): Promise<string | null> {
  if (!document?.file_path) return null

  const isPdf = document.file_type?.toLowerCase().includes('pdf') ||
                document.file_path?.toLowerCase().endsWith('.pdf')
  if (!isPdf) return null

  try {
    const { data, error } = await supabase.storage
      .from('project-documents')
      .createSignedUrl(document.file_path, 300) // 5 minutes validity

    if (error || !data?.signedUrl) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('Error generating signed URL:', err)
    return null
  }
}

// Generate PDF and return blob URL for preview
export async function generateContractPdfUrl(
  params: ContractPdfParams
): Promise<string> {
  const {
    contract,
    project,
    client,
    quote,
    provider,
    includeAnnexes = true,
    signedQuoteDocument,
    specificationDocument,
    planningDocument,
    accessToken
  } = params

  // Generate signed URLs for documents
  let signedQuoteUrl: string | null = null
  let specificationUrl: string | null = null
  let planningUrl: string | null = null

  if (includeAnnexes) {
    [signedQuoteUrl, specificationUrl, planningUrl] = await Promise.all([
      getSignedUrlForDocument(signedQuoteDocument),
      getSignedUrlForDocument(specificationDocument),
      getSignedUrlForDocument(planningDocument)
    ])
    console.log('Generated signed URLs:', {
      signedQuoteUrl: signedQuoteUrl ? 'yes' : 'no',
      specificationUrl: specificationUrl ? 'yes' : 'no',
      planningUrl: planningUrl ? 'yes' : 'no'
    })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch('/api/generate-contract-pdf', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contract,
      project,
      client,
      quote,
      provider,
      includeAnnexes,
      signedQuoteDocument,
      specificationDocument,
      planningDocument,
      // Pass signed URLs for server to download PDFs
      signedQuoteUrl,
      specificationUrl,
      planningUrl
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate PDF')
  }

  const blob = await response.blob()
  return window.URL.createObjectURL(blob)
}

// Download PDF from blob URL
export function downloadContractPdf(url: string, contractId: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = `contrat-${contractId.slice(0, 8)}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Legacy function for backwards compatibility
export async function exportContractToPdf(
  contract: ProjectContract,
  project?: Project | null,
  client?: Profile | null,
  quote?: Quote | null,
  provider?: {
    name: string
    address: string
    siret: string
    email: string
    phone: string
  },
  signedQuoteDocument?: ProjectDocument | null,
  specificationDocument?: ProjectDocument | null,
  planningDocument?: ProjectDocument | null
): Promise<void> {
  try {
    const url = await generateContractPdfUrl({
      contract,
      project,
      client,
      quote,
      provider,
      includeAnnexes: true,
      signedQuoteDocument,
      specificationDocument,
      planningDocument
    })
    downloadContractPdf(url, contract.id)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    throw error
  }
}

// Export type for external use
export type { ContractPdfParams }
