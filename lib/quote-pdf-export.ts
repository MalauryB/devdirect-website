import { Quote, Project, Profile } from './types'

export async function exportQuoteToPdf(
  quote: Quote,
  project?: Project | null,
  engineer?: Profile | null,
  client?: Profile | null,
  accessToken?: string
): Promise<void> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch('/api/generate-quote-pdf', {
      method: 'POST',
      headers,
      body: JSON.stringify({ quote, project, engineer, client }),
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
    link.download = `devis-${quote.id.slice(0, 8)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    throw error
  }
}
