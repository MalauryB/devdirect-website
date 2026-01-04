import { ProjectContract, Project, Profile, Quote, ProjectDocument } from './types'

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
    planningDocument
  } = params

  const response = await fetch('/api/generate-contract-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contract,
      project,
      client,
      quote,
      provider,
      includeAnnexes,
      signedQuoteDocument,
      specificationDocument,
      planningDocument
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
