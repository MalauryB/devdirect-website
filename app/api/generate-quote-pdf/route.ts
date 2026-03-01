import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { generateQuotePdfHtml } from '@/lib/quote-pdf-template'
import { Quote, Project, Profile } from '@/lib/types'
import { requireAuth } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth(request)
  if (authError) return authError

  const { success: rateLimitOk } = rateLimit(`generate-quote-pdf:${user.id}`, 20, 60000)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const { quote, project, engineer, client } = await request.json() as {
      quote: Quote
      project?: Project | null
      engineer?: Profile | null
      client?: Profile | null
    }

    if (!quote) {
      return NextResponse.json({ error: 'Quote data is required' }, { status: 400 })
    }

    // Generate HTML from template
    const html = generateQuotePdfHtml({ quote, project, engineer, client })

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: process.env.PUPPETEER_SANDBOX === 'false' ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
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
        'Content-Disposition': `attachment; filename="devis-${quote.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Generate quote PDF error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}
