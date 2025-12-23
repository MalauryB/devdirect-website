import { ProjectContract, Project, Profile } from './types'

interface ContractPdfData {
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

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function generateContractPdfHtml(data: ContractPdfData): string {
  const { contract, project, client, provider } = data

  const contractNumber = contract.id.slice(0, 8).toUpperCase()
  const contractDate = formatDate(contract.created_at)

  const clientName = client
    ? client.company_name || `${client.first_name || ''} ${client.last_name || ''}`.trim()
    : project?.profiles?.company_name || 'Client'

  const providerName = provider?.name || 'Memory Agency'
  const providerAddress = provider?.address || ''
  const providerSiret = provider?.siret || ''
  const providerEmail = provider?.email || 'contact@memory-agency.com'
  const providerPhone = provider?.phone || ''

  const typeLabels: Record<string, string> = {
    service_agreement: 'Contrat de Prestation de Services',
    terms_of_sale: 'Conditions Générales de Vente',
    amendment: 'Avenant au Contrat'
  }

  const contractTypeLabel = typeLabels[contract.type] || contract.type

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${contract.title}</title>
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
      line-height: 1.6;
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
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1a1a1a;
    }

    .title-section h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .contract-type {
      display: inline-block;
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .contract-number {
      margin-top: 8px;
      font-size: 10px;
      color: #666;
    }

    .cube {
      width: 70px;
      height: 70px;
    }

    .cube svg {
      width: 100%;
      height: 100%;
    }

    /* Meta info */
    .meta-info {
      margin-bottom: 25px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .meta-info p {
      font-size: 11px;
      margin-bottom: 4px;
    }

    .meta-info strong {
      font-weight: 600;
    }

    /* Parties */
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 40px;
    }

    .party {
      flex: 1;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .party h3 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      color: #ea4c89;
    }

    .party p {
      font-size: 11px;
      margin-bottom: 3px;
      color: #333;
    }

    .party .name {
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 5px;
    }

    /* Contract content */
    .contract-content {
      margin-bottom: 40px;
    }

    .contract-content h2 {
      font-size: 16px;
      font-weight: 700;
      margin-top: 25px;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e5e5;
    }

    .contract-content h3 {
      font-size: 13px;
      font-weight: 600;
      margin-top: 18px;
      margin-bottom: 8px;
    }

    .contract-content p {
      font-size: 11px;
      margin-bottom: 10px;
      text-align: justify;
    }

    .contract-content ul, .contract-content ol {
      margin-left: 20px;
      margin-bottom: 10px;
    }

    .contract-content li {
      font-size: 11px;
      margin-bottom: 5px;
    }

    /* Signatures */
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #1a1a1a;
    }

    .signature-box {
      width: 45%;
      text-align: center;
    }

    .signature-box h4 {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .signature-box p {
      font-size: 10px;
      color: #666;
      margin-bottom: 5px;
    }

    .signature-line {
      width: 100%;
      height: 1px;
      background: #1a1a1a;
      margin-top: 60px;
    }

    .signature-label {
      font-size: 9px;
      color: #666;
      margin-top: 5px;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
    }

    .footer p {
      font-size: 9px;
      color: #666;
    }

    /* Print styles */
    @media print {
      body {
        padding: 15mm;
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
        <h1>${contract.title}</h1>
        <span class="contract-type">${contractTypeLabel}</span>
        <p class="contract-number">Réf: ${contractNumber}</p>
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
      <p><strong>Date du contrat :</strong> ${contractDate}</p>
      ${contract.valid_until ? `<p><strong>Valide jusqu'au :</strong> ${formatDate(contract.valid_until)}</p>` : ''}
      ${project ? `<p><strong>Projet :</strong> ${project.title}</p>` : ''}
    </div>

    <!-- Parties -->
    <div class="parties">
      <div class="party">
        <h3>Le Prestataire</h3>
        <p class="name">${providerName}</p>
        ${providerAddress ? `<p>${providerAddress}</p>` : ''}
        ${providerSiret ? `<p>SIRET: ${providerSiret}</p>` : ''}
        ${providerEmail ? `<p>${providerEmail}</p>` : ''}
        ${providerPhone ? `<p>${providerPhone}</p>` : ''}
      </div>
      <div class="party">
        <h3>Le Client</h3>
        <p class="name">${clientName}</p>
        ${client?.email ? `<p>${client.email}</p>` : ''}
        ${client?.phone ? `<p>${client.phone}</p>` : ''}
        ${client?.siret ? `<p>SIRET: ${client.siret}</p>` : ''}
      </div>
    </div>

    <!-- Contract content -->
    <div class="contract-content">
      ${contract.content}
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div class="signature-box">
        <h4>Pour le Prestataire</h4>
        <p>${providerName}</p>
        <p>Signature précédée de la mention<br/>"Lu et approuvé"</p>
        <div class="signature-line"></div>
        <p class="signature-label">Date et signature</p>
      </div>
      <div class="signature-box">
        <h4>Pour le Client</h4>
        <p>${clientName}</p>
        <p>Signature précédée de la mention<br/>"Lu et approuvé"</p>
        <div class="signature-line"></div>
        <p class="signature-label">Date et signature</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} - Réf: ${contractNumber}</p>
    </div>
  </div>
</body>
</html>`
}
