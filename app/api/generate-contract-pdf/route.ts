import { NextRequest, NextResponse } from 'next/server'
import puppeteer, { Browser } from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { generateContractPdfHtml, generateTimeAndMaterialsContractPdfHtml } from '@/lib/contract-pdf-template'
import { ProjectContract, Project, Profile, Quote, ProjectDocument } from '@/lib/types'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for downloading files
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

// Download PDF from Supabase Storage
async function downloadPdfFromStorage(filePath: string): Promise<Uint8Array | null> {
  try {
    const { data, error } = await supabase.storage
      .from('project-documents')
      .download(filePath)

    if (error || !data) {
      console.error('Error downloading PDF:', error)
      return null
    }

    const arrayBuffer = await data.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error('Error downloading PDF from storage:', error)
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
      signedQuoteDocument?: ProjectDocument | null
      specificationDocument?: ProjectDocument | null
      planningDocument?: ProjectDocument | null
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
      document: ProjectDocument | null | undefined
    ) {
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

      // If document exists and is a PDF, download and merge it
      if (document && document.file_type === 'application/pdf' && document.file_path) {
        const pdfBytes = await downloadPdfFromStorage(document.file_path)
        if (pdfBytes) {
          try {
            const annexPdf = await PDFDocument.load(pdfBytes)
            const annexPages = await mergedPdf.copyPages(annexPdf, annexPdf.getPageIndices())
            annexPages.forEach(page => mergedPdf.addPage(page))
          } catch (err) {
            console.error(`Failed to load annex PDF for ${title}:`, err)
            // Continue without the annex content - cover page already added
          }
        }
      }
    }

    // Add annexes
    await addAnnex(1, 'Devis signé', signedQuoteDocument)
    await addAnnex(2, 'Cahier des charges', specificationDocument)
    await addAnnex(3, 'Planning prévisionnel', planningDocument)

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
