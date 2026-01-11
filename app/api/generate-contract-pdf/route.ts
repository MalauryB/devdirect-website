import { NextRequest, NextResponse } from 'next/server'
import puppeteer, { Browser } from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { generateContractPdfHtml, generateTimeAndMaterialsContractPdfHtml } from '@/lib/contract-pdf-template'
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

// Download PDF from a signed URL
async function downloadPdfFromSignedUrl(signedUrl: string): Promise<Uint8Array | null> {
  try {
    console.log('Downloading PDF from signed URL...')
    const response = await fetch(signedUrl)

    if (!response.ok) {
      console.error('Failed to fetch from signed URL:', response.status, response.statusText)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('PDF downloaded successfully, size:', arrayBuffer.byteLength)
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error('Error downloading PDF from signed URL:', error)
    return null
  }
}

// Generate a single page PDF from HTML (for cover pages)
async function generateCoverPagePdf(browser: Browser, html: string): Promise<Uint8Array> {
  const page = await browser.newPage()
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { margin: 0; }
        body { margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `, { waitUntil: 'networkidle0' })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  })

  await page.close()
  return new Uint8Array(pdfBuffer)
}

export async function POST(request: NextRequest) {
  let browser: Browser | null = null

  try {
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
      signedQuoteUrl,
      specificationUrl,
      planningUrl
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
      signedQuoteDocument?: ProjectDocument | null
      specificationDocument?: ProjectDocument | null
      planningDocument?: ProjectDocument | null
      signedQuoteUrl?: string | null
      specificationUrl?: string | null
      planningUrl?: string | null
    }

    if (!contract) {
      return NextResponse.json({ error: 'Contract data is required' }, { status: 400 })
    }

    // Launch browser once
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    // Generate main contract HTML based on contract type
    const contractHtml = contract.type === 'time_and_materials'
      ? generateTimeAndMaterialsContractPdfHtml({ contract, project, client, provider })
      : generateContractPdfHtml({ contract, project, client, quote, provider })

    // Generate main contract PDF
    const page = await browser.newPage()
    await page.setContent(contractHtml, { waitUntil: 'networkidle0' })
    const contractPdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    })
    await page.close()

    // If no annexes needed or T&M contract, return just the contract
    if (!includeAnnexes || contract.type === 'time_and_materials') {
      await browser.close()
      return new NextResponse(Buffer.from(contractPdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="contrat-${contract.id.slice(0, 8)}.pdf"`,
        },
      })
    }

    // Create merged PDF document
    const mergedPdf = await PDFDocument.create()

    // Add main contract
    const contractPdf = await PDFDocument.load(contractPdfBuffer)
    const contractPages = await mergedPdf.copyPages(contractPdf, contractPdf.getPageIndices())
    contractPages.forEach(page => mergedPdf.addPage(page))

    // Helper to add annex with cover page and PDF content
    async function addAnnex(
      annexNumber: number,
      title: string,
      document: ProjectDocument | null | undefined,
      signedUrl: string | null | undefined
    ) {
      console.log(`\n=== Adding Annex ${annexNumber}: ${title} ===`)
      console.log('Document:', document ? {
        id: document.id,
        name: document.name,
        file_path: document.file_path,
        file_type: document.file_type
      } : 'null')
      console.log('Signed URL:', signedUrl ? 'provided' : 'not provided')

      const docInfo = document ? {
        name: document.name,
        version: document.version,
        date: new Date(document.created_at).toLocaleDateString('fr-FR')
      } : null

      // Generate and add cover page
      const coverHtml = generateAnnexCoverPage(
        annexNumber,
        title,
        document ? 'Ce document est joint au présent contrat.' : 'Ce document doit être joint au présent contrat.',
        docInfo
      )
      const coverPdfBytes = await generateCoverPagePdf(browser!, coverHtml)
      const coverPdf = await PDFDocument.load(coverPdfBytes)
      const coverPages = await mergedPdf.copyPages(coverPdf, coverPdf.getPageIndices())
      coverPages.forEach(page => mergedPdf.addPage(page))
      console.log('Cover page added')

      // If we have a signed URL, download and merge the PDF
      if (signedUrl) {
        console.log('Attempting to download and merge PDF from signed URL...')
        const pdfBytes = await downloadPdfFromSignedUrl(signedUrl)
        if (pdfBytes) {
          console.log(`Downloaded ${pdfBytes.length} bytes`)
          try {
            const annexPdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
            const pageCount = annexPdf.getPageCount()
            console.log(`PDF loaded successfully with ${pageCount} pages`)
            const annexPages = await mergedPdf.copyPages(annexPdf, annexPdf.getPageIndices())
            annexPages.forEach(page => mergedPdf.addPage(page))
            console.log(`Added ${annexPages.length} pages from annex`)
          } catch (err) {
            console.error(`Failed to load annex PDF for ${title}:`, err)
            // Continue without the annex content - cover page already added
          }
        } else {
          console.log('Failed to download PDF - no bytes returned')
        }
      } else {
        console.log('No signed URL provided, skipping PDF merge')
      }
    }

    // Add annexes with their signed URLs
    await addAnnex(1, 'Devis signé', signedQuoteDocument, signedQuoteUrl)
    await addAnnex(2, 'Cahier des charges', specificationDocument, specificationUrl)
    await addAnnex(3, 'Planning prévisionnel', planningDocument, planningUrl)

    // Close browser
    await browser.close()
    browser = null

    // Save merged PDF
    const mergedPdfBytes = await mergedPdf.save()

    return new NextResponse(Buffer.from(mergedPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contrat-${contract.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    if (browser) {
      await browser.close()
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
