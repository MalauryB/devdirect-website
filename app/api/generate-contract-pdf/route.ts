import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { generateContractPdfHtml, generateTimeAndMaterialsContractPdfHtml } from '@/lib/contract-pdf-template'
import { generateQuotePdfHtml } from '@/lib/quote-pdf-template'
import { ProjectContract, Project, Profile, Quote, ProjectDocument } from '@/lib/types'

// Generate an annex cover page
function generateAnnexCoverPage(annexNumber: number, title: string, description: string, documentInfo?: { name: string; version: number; date: string } | null): string {
  return `
    <div class="annex-cover" style="page-break-before: always; page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding: 60px; text-align: center; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
      <div style="margin-bottom: 40px;">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 80px; height: 80px;">
          <path d="M50 10L90 30V70L50 90L10 70V30L50 10Z" stroke="#1a1a1a" stroke-width="2" fill="none"/>
          <path d="M50 10V50M50 50L90 30M50 50L10 30M50 50V90" stroke="#1a1a1a" stroke-width="2"/>
        </svg>
      </div>
      <div style="font-size: 14px; font-weight: 500; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
        Annexe ${annexNumber}
      </div>
      <h1 style="font-size: 36px; font-weight: 700; margin-bottom: 20px; color: #1a1a1a;">
        ${title}
      </h1>
      <p style="font-size: 14px; color: #666; max-width: 400px; line-height: 1.6;">
        ${description}
      </p>
      ${documentInfo ? `
        <div style="margin-top: 40px; padding: 20px 30px; background: #f8f8f8; border-radius: 8px;">
          <p style="font-size: 12px; color: #333; margin-bottom: 5px;"><strong>Document :</strong> ${documentInfo.name}</p>
          <p style="font-size: 11px; color: #666;">Version ${documentInfo.version} - ${documentInfo.date}</p>
        </div>
      ` : `
        <div style="margin-top: 40px; padding: 20px 30px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;">
          <p style="font-size: 12px; color: #92400e; font-weight: 500;">Document à joindre</p>
          <p style="font-size: 11px; color: #b45309;">Ce document doit être annexé manuellement au contrat.</p>
        </div>
      `}
    </div>
  `
}

// Wrap quote HTML to fit as an annex (remove body styling, add page break)
function wrapQuoteAsAnnex(quoteHtml: string): string {
  // Extract just the body content and add annexe styling
  const bodyMatch = quoteHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const bodyContent = bodyMatch ? bodyMatch[1] : quoteHtml

  return `
    <div class="annex-content" style="page-break-before: always;">
      ${bodyContent}
    </div>
  `
}

// Generate placeholder page for external documents
function generateExternalDocumentPlaceholder(annexNumber: number, title: string, documentInfo?: { name: string; version: number; date: string; fileType: string } | null): string {
  if (documentInfo && documentInfo.fileType === 'application/pdf') {
    // For PDFs, we just show a cover page - the actual PDF will be merged separately
    return generateAnnexCoverPage(
      annexNumber,
      title,
      'Ce document est joint au présent contrat.',
      documentInfo
    )
  }

  return generateAnnexCoverPage(
    annexNumber,
    title,
    'Ce document doit être joint au présent contrat.',
    documentInfo
  )
}

export async function POST(request: NextRequest) {
  try {
    const {
      contract,
      project,
      client,
      quote,
      provider,
      includeAnnexes = true,
      specificationDocument,
      planningDocument
    } = await request.json() as {
      contract: ProjectContract
      project?: Project | null
      client?: Profile | null
      quote?: Quote | null
      provider?: {
        name: string
        address: string
        siret: string
        email: string
        phone: string
      }
      includeAnnexes?: boolean
      specificationDocument?: ProjectDocument | null
      planningDocument?: ProjectDocument | null
    }

    if (!contract) {
      return NextResponse.json({ error: 'Contract data is required' }, { status: 400 })
    }

    // Generate main contract HTML based on contract type
    let fullHtml = contract.type === 'time_and_materials'
      ? generateTimeAndMaterialsContractPdfHtml({ contract, project, client, quote, provider })
      : generateContractPdfHtml({ contract, project, client, quote, provider })

    // Only add annexes for forfait contracts with includeAnnexes flag
    if (includeAnnexes && contract.type !== 'time_and_materials') {
      // Close the contract HTML body/html tags and we'll append annexes
      fullHtml = fullHtml.replace('</body></html>', '')

      // Annexe 1: Devis (if linked)
      if (quote) {
        const quoteCoverPage = generateAnnexCoverPage(
          1,
          'Devis',
          'Devis détaillé de la prestation.',
          {
            name: `Devis n° ${quote.id.slice(0, 8).toUpperCase()}`,
            version: 1,
            date: new Date(quote.created_at || Date.now()).toLocaleDateString('fr-FR')
          }
        )
        fullHtml += quoteCoverPage

        // Generate quote HTML and add it
        const quoteHtml = generateQuotePdfHtml({ quote, project, client })
        fullHtml += wrapQuoteAsAnnex(quoteHtml)
      } else {
        // No quote linked - show placeholder
        fullHtml += generateAnnexCoverPage(
          1,
          'Devis',
          'Le devis détaillé de la prestation doit être joint au contrat.',
          null
        )
      }

      // Annexe 2: Cahier des charges
      const specInfo = specificationDocument ? {
        name: specificationDocument.name,
        version: specificationDocument.version,
        date: new Date(specificationDocument.created_at).toLocaleDateString('fr-FR'),
        fileType: specificationDocument.file_type
      } : null

      fullHtml += generateExternalDocumentPlaceholder(
        2,
        'Cahier des charges',
        specInfo
      )

      // Annexe 3: Planning prévisionnel
      const planningInfo = planningDocument ? {
        name: planningDocument.name,
        version: planningDocument.version,
        date: new Date(planningDocument.created_at).toLocaleDateString('fr-FR'),
        fileType: planningDocument.file_type
      } : null

      fullHtml += generateExternalDocumentPlaceholder(
        3,
        'Planning prévisionnel',
        planningInfo
      )

      // Close HTML
      fullHtml += '</body></html>'
    }

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // Set content and wait for fonts to load
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })

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
