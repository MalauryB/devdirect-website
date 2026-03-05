import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  // Rate limit by IP (5 requests per minute)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { success: rateLimitOk } = rateLimit(`contact:${ip}`, 5, 60000)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const { name, email, phone, company, message } = await request.json()

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 })
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
    }

    const contactEmail = process.env.CONTACT_EMAIL || 'contact@nimli.fr'

    const { error } = await resend.emails.send({
      from: 'Nimli <contact@nimli.fr>',
      to: [contactEmail],
      replyTo: email,
      subject: `Nouveau message de ${name} – ${company?.trim() || 'Particulier'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #e2196b; padding-bottom: 10px;">
            Nouveau message depuis nimli.fr
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #737373; width: 120px;">Nom</td>
              <td style="padding: 8px 12px; color: #1a1a1a;">${escapeHtml(name)}</td>
            </tr>
            <tr style="background: #f5f0eb;">
              <td style="padding: 8px 12px; font-weight: bold; color: #737373;">Email</td>
              <td style="padding: 8px 12px; color: #1a1a1a;">
                <a href="mailto:${escapeHtml(email)}" style="color: #e2196b;">${escapeHtml(email)}</a>
              </td>
            </tr>
            ${phone?.trim() ? `
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #737373;">Téléphone</td>
              <td style="padding: 8px 12px; color: #1a1a1a;">${escapeHtml(phone)}</td>
            </tr>` : ''}
            ${company?.trim() ? `
            <tr style="background: #f5f0eb;">
              <td style="padding: 8px 12px; font-weight: bold; color: #737373;">Entreprise</td>
              <td style="padding: 8px 12px; color: #1a1a1a;">${escapeHtml(company)}</td>
            </tr>` : ''}
          </table>
          <div style="background: #f5f0eb; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <p style="font-weight: bold; color: #737373; margin: 0 0 8px 0;">Message</p>
            <p style="color: #1a1a1a; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
          <p style="color: #737373; font-size: 12px; margin-top: 24px;">
            Vous pouvez répondre directement à cet email pour contacter ${escapeHtml(name)}.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
