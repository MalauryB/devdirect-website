import { ProjectContract, Project, Profile } from './types'

export async function exportContractToPdf(
  contract: ProjectContract,
  project?: Project | null,
  client?: Profile | null,
  provider?: {
    name: string
    address: string
    siret: string
    email: string
    phone: string
  }
): Promise<void> {
  try {
    const response = await fetch('/api/generate-contract-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contract, project, client, provider }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate PDF')
    }

    // Get the PDF blob
    const blob = await response.blob()

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contrat-${contract.id.slice(0, 8)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    throw error
  }
}
