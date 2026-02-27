import { Quote, Project, Profile } from './types'
import { calculateQuoteData } from './quote-export'
import { escapeHtml } from './sanitize'

interface PdfData {
  quote: Quote
  project?: Project | null
  engineer?: Profile | null
  client?: Profile | null
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

export function generateQuotePdfHtml(data: PdfData): string {
  const { quote, project, engineer, client } = data
  const calculated = calculateQuoteData(quote)

  // Build line items from costing categories
  const lineItems: { description: string; unitPrice: number; quantity: number; total: number }[] = []

  for (const category of quote.costing_categories) {
    for (const activity of category.activities) {
      if (!activity.active) continue

      let activityDays = 0
      let activityAmount = 0

      for (const component of activity.components) {
        const abaque = quote.abaques.find(a => a.component_name === component.component_name)
        if (!abaque) continue

        const profile = quote.profiles.find(p => p.name === abaque.profile_name)
        const dailyRate = profile?.daily_rate || 0

        const complexityDays: Record<string, number> = {
          ts: abaque.days_ts,
          s: abaque.days_s,
          m: abaque.days_m,
          c: abaque.days_c,
          tc: abaque.days_tc
        }

        const days = (complexityDays[component.complexity] || 0) * component.coefficient
        activityDays += days
        activityAmount += days * dailyRate
      }

      if (activityDays > 0) {
        lineItems.push({
          description: `${category.name} - ${activity.name}`,
          unitPrice: Math.round(activityAmount / activityDays),
          quantity: activityDays,
          total: activityAmount
        })
      }
    }
  }

  // Calculate total costing days for transverse calculations
  const totalCostingDays = lineItems.reduce((sum, item) => sum + item.quantity, 0)

  // Add transverse activities
  for (const level of quote.transverse_levels) {
    for (const activity of level.activities) {
      const profile = quote.profiles.find(p => p.name === activity.profile_name)
      const dailyRate = profile?.daily_rate || 0

      let days = 0
      if (activity.type === 'fixed') {
        days = activity.value
      } else {
        // rate type - percentage of total costing days
        days = (totalCostingDays * activity.value) / 100
      }

      if (days > 0) {
        lineItems.push({
          description: activity.name,
          unitPrice: dailyRate,
          quantity: Math.round(days * 10) / 10,
          total: days * dailyRate
        })
      }
    }
  }

  const engineerName = engineer
    ? `${engineer.first_name || ''} ${engineer.last_name || ''}`.trim() || 'Nimli'
    : 'Nimli'

  const engineerPhone = engineer?.phone || ''
  const engineerEmail = engineer?.email || 'contact@nimli.fr'

  const clientName = client
    ? client.company_name || `${client.first_name || ''} ${client.last_name || ''}`.trim()
    : project?.profiles?.company_name || 'Client'

  const clientPhone = client?.phone || project?.profiles?.phone || ''
  const clientAddress = ''

  const quoteNumber = quote.id.slice(0, 8).toUpperCase()
  const today = new Date()
  const quoteDate = formatDate(quote.created_at || today.toISOString())
  const validityText = `${quote.validity_days} jours`

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis ${quoteNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .title-section h1 {
      font-size: 72px;
      font-weight: 700;
      letter-spacing: -2px;
      line-height: 1;
      margin-bottom: 5px;
    }

    .quote-number {
      display: inline-block;
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .cube {
      width: 80px;
      height: 80px;
    }

    .cube svg {
      width: 100%;
      height: 100%;
    }

    /* Meta info */
    .meta-info {
      margin-bottom: 25px;
    }

    .meta-info p {
      font-size: 11px;
      margin-bottom: 2px;
    }

    .meta-info strong {
      font-weight: 600;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: #1a1a1a;
      margin: 25px 0;
    }

    /* Parties */
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .party h3 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }

    .party p {
      font-size: 11px;
      margin-bottom: 3px;
      color: #333;
    }

    .party-right {
      text-align: right;
    }

    /* Table */
    .quote-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .quote-table thead th {
      background: #fff;
      padding: 12px 15px;
      text-align: left;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #1a1a1a;
    }

    .quote-table thead th:nth-child(2),
    .quote-table thead th:nth-child(3),
    .quote-table thead th:nth-child(4) {
      text-align: center;
    }

    .quote-table tbody td {
      padding: 14px 15px;
      border-bottom: 1px solid #e5e5e5;
      font-size: 11px;
    }

    .quote-table tbody td:nth-child(2),
    .quote-table tbody td:nth-child(3),
    .quote-table tbody td:nth-child(4) {
      text-align: center;
    }

    /* Totals */
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }

    .totals-box {
      width: 280px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 15px;
      font-size: 12px;
    }

    .total-row.subtotal {
      font-weight: 500;
    }

    .total-row.tva {
      color: #666;
    }

    .total-row.grand-total {
      background: #1a1a1a;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      margin-top: 5px;
    }

    /* Footer section */
    .footer-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .terms h4 {
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .terms p {
      font-size: 10px;
      color: #666;
      margin-bottom: 3px;
    }

    .signature {
      text-align: center;
    }

    .signature p {
      font-size: 10px;
      margin-bottom: 10px;
    }

    .signature-line {
      width: 200px;
      height: 1px;
      background: #1a1a1a;
      margin-top: 40px;
    }

    /* Thank you */
    .thank-you {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #1a1a1a;
    }

    .thank-you p {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Print styles */
    @media print {
      body {
        padding: 20px;
      }

      .container {
        max-width: none;
      }
    }

    @page {
      size: A4;
      margin: 15mm;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="title-section">
        <h1>DEVIS</h1>
        <span class="quote-number">Devis n°${quoteNumber}</span>
      </div>
      <div class="cube">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10L90 30V70L50 90L10 70V30L50 10Z" stroke="#1a1a1a" stroke-width="2" fill="none"/>
          <path d="M50 10V50M50 50L90 30M50 50L10 30M50 50V90" stroke="#1a1a1a" stroke-width="2"/>
        </svg>
      </div>
    </div>

    <!-- Meta info -->
    <div class="meta-info">
      <p><strong>Date du devis :</strong> ${quoteDate}</p>
      <p><strong>Validité du devis :</strong> ${validityText}</p>
    </div>

    <div class="divider"></div>

    <!-- Parties -->
    <div class="parties">
      <div class="party">
        <h3>${escapeHtml(engineerName)}</h3>
        ${engineerPhone ? `<p>${escapeHtml(engineerPhone)}</p>` : ''}
        <p>${escapeHtml(engineerEmail)}</p>
      </div>
      <div class="party party-right">
        <h3>À l'attention de</h3>
        <p><strong>${escapeHtml(clientName)}</strong></p>
        ${clientPhone ? `<p>${escapeHtml(clientPhone)}</p>` : ''}
        ${clientAddress ? `<p>${clientAddress}</p>` : ''}
      </div>
    </div>

    <!-- Quote table -->
    <table class="quote-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Prix</th>
          <th>Quantité</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems.map(item => `
        <tr>
          <td>${escapeHtml(item.description)}</td>
          <td>${formatCurrency(item.unitPrice)}</td>
          <td>${item.quantity.toFixed(1)} j</td>
          <td>${formatCurrency(item.total)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-box">
        <div class="total-row subtotal">
          <span>Sous total :</span>
          <span>${formatCurrency(calculated.totalHT)}</span>
        </div>
        <div class="total-row tva">
          <span>TVA (20%) :</span>
          <span>${formatCurrency(calculated.totalTVA)}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL :</span>
          <span>${formatCurrency(calculated.totalTTC)}</span>
        </div>
      </div>
    </div>

    <!-- Footer section -->
    <div class="footer-section">
      <div class="terms">
        <h4>Termes et conditions</h4>
        ${quote.payment_terms ? quote.payment_terms.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('') : `
        <p>Le paiement sera dû sous un mois</p>
        <p>Un acompte de 30% est requis</p>
        `}
      </div>
      <div class="signature">
        <p>Signature suivie de la mention<br/>"bon pour accord"</p>
        <div class="signature-line"></div>
      </div>
    </div>

    <!-- Thank you -->
    <div class="thank-you">
      <p>Merci de votre confiance</p>
    </div>
  </div>
</body>
</html>`
}
