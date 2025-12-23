import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { generateContractPdfHtml } from '@/lib/contract-pdf-template'
import { ProjectContract, Project, Profile } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { contract, project, client, provider } = await request.json() as {
      contract: ProjectContract
      project?: Project | null
      client?: Profile | null
      provider?: {
        name: string
        address: string
        siret: string
        email: string
        phone: string
      }
    }

    if (!contract) {
      return NextResponse.json({ error: 'Contract data is required' }, { status: 400 })
    }

    // Generate HTML from template
    const html = generateContractPdfHtml({ contract, project, client, provider })

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // Set content and wait for fonts to load
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    })

    await browser.close()

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contrat-${contract.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
