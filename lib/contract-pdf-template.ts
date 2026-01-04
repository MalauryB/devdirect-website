import { ProjectContract, Project, Profile, Quote } from './types'
import { calculateQuoteData } from './quote-export'

interface ContractPdfData {
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
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatCurrencyWords(amount: number): string {
  // Simple conversion for common amounts
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']

  if (amount === 0) return 'zéro euro'

  const euros = Math.floor(amount)
  const cents = Math.round((amount - euros) * 100)

  let result = ''

  // Simplified: just return the numeric representation for large amounts
  if (euros >= 1000) {
    result = `${euros.toLocaleString('fr-FR')} euros`
  } else if (euros >= 100) {
    const hundreds = Math.floor(euros / 100)
    const remainder = euros % 100
    result = (hundreds === 1 ? 'cent' : units[hundreds] + ' cent') + (remainder > 0 ? ' ' + formatSmallNumber(remainder) : '') + ' euros'
  } else {
    result = formatSmallNumber(euros) + ' euros'
  }

  if (cents > 0) {
    result += ` et ${cents} centimes`
  }

  return result

  function formatSmallNumber(n: number): string {
    if (n < 10) return units[n]
    if (n < 20) return teens[n - 10]
    if (n < 70) {
      const t = Math.floor(n / 10)
      const u = n % 10
      return tens[t] + (u > 0 ? (u === 1 && t > 1 ? '-et-un' : '-' + units[u]) : '')
    }
    if (n < 80) {
      return 'soixante-' + teens[n - 70]
    }
    if (n < 100) {
      const u = n - 80
      if (u === 0) return 'quatre-vingts'
      if (u < 10) return 'quatre-vingt-' + units[u]
      return 'quatre-vingt-' + teens[u - 10]
    }
    return String(n)
  }
}

export function generateContractPdfHtml(data: ContractPdfData): string {
  const { contract, project, client, quote, provider } = data

  const contractNumber = contract.id.slice(0, 8).toUpperCase()
  const contractDate = formatDate(contract.created_at)
  const today = new Date()

  // Provider info
  const providerName = provider?.name || 'Memory Agency'
  const providerAddress = provider?.address || '123 Rue de l\'Innovation, 75001 Paris'
  const providerSiret = provider?.siret || '123 456 789 00001'
  const providerEmail = provider?.email || 'contact@memory-agency.com'
  const providerPhone = provider?.phone || '+33 1 23 45 67 89'

  // Client info
  const clientName = client?.company_name || `${client?.first_name || ''} ${client?.last_name || ''}`.trim() || 'Client'
  const clientAddress = client ? [client.address, client.postal_code, client.city].filter(Boolean).join(', ') : ''
  const clientSiret = client?.siret || ''
  const clientEmail = client?.email || ''
  const clientPhone = client?.phone || ''
  const clientRepresentative = `${client?.first_name || ''} ${client?.last_name || ''}`.trim()

  // Project info
  const projectTitle = project?.title || contract.title || 'Prestation informatique'
  const projectDescription = project?.description || ''

  // Quote info for pricing
  let totalHT = 0
  let totalTVA = 0
  let totalTTC = 0
  let paymentSchedule = ''

  if (quote) {
    const calculated = calculateQuoteData(quote)
    totalHT = calculated.totalHT
    totalTVA = calculated.totalTVA
    totalTTC = calculated.totalTTC
    paymentSchedule = quote.payment_terms || ''
  }

  // Contract type labels
  const typeLabels: Record<string, string> = {
    service_agreement: 'CONTRAT DE PRESTATION DE SERVICES INFORMATIQUES AU FORFAIT',
    terms_of_sale: 'CONDITIONS GÉNÉRALES DE VENTE',
    amendment: 'AVENANT AU CONTRAT'
  }
  const contractTypeLabel = typeLabels[contract.type] || 'CONTRAT DE PRESTATION DE SERVICES'

  // Determine delivery deadline from project or default
  const deliveryDeadline = project?.deadline === 'urgent' ? '1 mois' :
    project?.deadline === 'short' ? '2 mois' :
    project?.deadline === 'medium' ? '3 mois' :
    project?.deadline === 'long' ? '6 mois' : '3 mois'

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
      font-size: 10px;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }

    .page {
      padding: 40px 50px;
      min-height: 297mm;
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #1a1a1a;
    }

    .title-section h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .contract-ref {
      font-size: 10px;
      color: #666;
    }

    .cube {
      width: 50px;
      height: 50px;
    }

    .cube svg {
      width: 100%;
      height: 100%;
    }

    /* Parties section */
    .parties-header {
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      margin: 20px 0 15px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .parties-container {
      display: flex;
      justify-content: space-between;
      gap: 30px;
      margin-bottom: 25px;
    }

    .party-box {
      flex: 1;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
    }

    .party-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #ea4c89;
      margin-bottom: 8px;
    }

    .party-name {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .party-details {
      font-size: 9px;
      color: #444;
      line-height: 1.5;
    }

    .party-details p {
      margin-bottom: 2px;
    }

    /* Preamble */
    .preamble {
      margin-bottom: 20px;
      padding: 12px 15px;
      background: #f5f5f5;
      border-radius: 6px;
      font-size: 10px;
      font-style: italic;
    }

    /* Articles */
    .article {
      margin-bottom: 18px;
    }

    .article-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e5e5;
      color: #1a1a1a;
    }

    .article-content {
      font-size: 10px;
      text-align: justify;
      line-height: 1.65;
    }

    .article-content p {
      margin-bottom: 8px;
    }

    .article-content ul, .article-content ol {
      margin-left: 15px;
      margin-bottom: 8px;
    }

    .article-content li {
      margin-bottom: 4px;
    }

    .article-subsection {
      font-weight: 600;
      margin-top: 10px;
      margin-bottom: 5px;
    }

    /* Pricing table */
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9px;
    }

    .pricing-table th {
      background: #1a1a1a;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .pricing-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e5e5;
    }

    .pricing-table .total-row {
      font-weight: 700;
      background: #f5f5f5;
    }

    .pricing-table .grand-total {
      background: #1a1a1a;
      color: #fff;
    }

    /* Signatures */
    .signatures-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #1a1a1a;
    }

    .signatures-title {
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 25px;
      text-transform: uppercase;
    }

    .signatures-container {
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }

    .signature-box {
      flex: 1;
      text-align: center;
    }

    .signature-label {
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .signature-name {
      font-size: 9px;
      color: #666;
      margin-bottom: 8px;
    }

    .signature-mention {
      font-size: 8px;
      color: #888;
      margin-bottom: 15px;
      font-style: italic;
    }

    .signature-area {
      height: 60px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ccc;
      font-size: 8px;
    }

    .signature-line {
      width: 100%;
      height: 1px;
      background: #1a1a1a;
      margin-top: 50px;
    }

    .signature-date {
      font-size: 9px;
      margin-top: 8px;
    }

    /* Footer */
    .page-footer {
      position: absolute;
      bottom: 20px;
      left: 50px;
      right: 50px;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #999;
      border-top: 1px solid #e5e5e5;
      padding-top: 10px;
    }

    /* Paraph zone */
    .paraph-zone {
      position: absolute;
      bottom: 50px;
      right: 50px;
      width: 80px;
      height: 40px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7px;
      color: #ccc;
    }

    /* Print styles */
    @media print {
      .page {
        padding: 15mm 20mm;
      }
    }

    @page {
      size: A4;
      margin: 0;
    }
  </style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="title-section">
        <h1>${contractTypeLabel}</h1>
        <p class="contract-ref">Contrat n° ${contractNumber} - ${contractDate}</p>
      </div>
      <div class="cube">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10L90 30V70L50 90L10 70V30L50 10Z" stroke="#1a1a1a" stroke-width="2" fill="none"/>
          <path d="M50 10V50M50 50L90 30M50 50L10 30M50 50V90" stroke="#1a1a1a" stroke-width="2"/>
        </svg>
      </div>
    </div>

    <!-- Parties -->
    <div class="parties-header">Entre les soussignés</div>
    <div class="parties-container">
      <div class="party-box">
        <div class="party-label">Le Prestataire</div>
        <div class="party-name">${providerName}</div>
        <div class="party-details">
          <p>${providerAddress}</p>
          <p>SIRET : ${providerSiret}</p>
          <p>Email : ${providerEmail}</p>
          <p>Tél : ${providerPhone}</p>
        </div>
      </div>
      <div class="party-box">
        <div class="party-label">Le Client</div>
        <div class="party-name">${clientName}</div>
        <div class="party-details">
          ${clientAddress ? `<p>${clientAddress}</p>` : ''}
          ${clientSiret ? `<p>SIRET : ${clientSiret}</p>` : ''}
          ${clientEmail ? `<p>Email : ${clientEmail}</p>` : ''}
          ${clientPhone ? `<p>Tél : ${clientPhone}</p>` : ''}
          ${clientRepresentative ? `<p>Représenté par : ${clientRepresentative}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Preamble -->
    <div class="preamble">
      Il a été préalablement exposé ce qui suit : Le Client a exprimé le besoin de réaliser un projet informatique
      et a sollicité le Prestataire pour la réalisation de celui-ci. Le Prestataire a déclaré avoir les compétences
      nécessaires pour répondre aux besoins du Client. En conséquence, il a été convenu ce qui suit :
    </div>

    <!-- ARTICLE 1 -->
    <div class="article">
      <div class="article-title">Article 1 - Objet du contrat</div>
      <div class="article-content">
        <p>Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire s'engage à réaliser pour le compte du Client la prestation suivante :</p>
        <p><strong>Projet : ${projectTitle}</strong></p>
        ${projectDescription ? `<p>${projectDescription}</p>` : ''}
        <p>La prestation est réalisée au forfait, ce qui signifie que le Prestataire s'engage sur un résultat déterminé pour un prix global et définitif.</p>
      </div>
    </div>

    <!-- ARTICLE 2 -->
    <div class="article">
      <div class="article-title">Article 2 - Documents contractuels</div>
      <div class="article-content">
        <p>Le présent contrat est constitué des documents contractuels suivants, présentés par ordre de priorité décroissante :</p>
        <ol>
          <li>Le présent contrat de prestation</li>
          <li>Le cahier des charges ou spécifications fonctionnelles</li>
          ${quote ? `<li>Le devis n° ${quote.id.slice(0, 8).toUpperCase()} du ${formatDate(quote.created_at)}</li>` : ''}
          <li>Les annexes techniques éventuelles</li>
        </ol>
        <p>En cas de contradiction entre ces documents, le document de rang supérieur prévaut.</p>
      </div>
    </div>

    <!-- ARTICLE 3 -->
    <div class="article">
      <div class="article-title">Article 3 - Prix et modalités de paiement</div>
      <div class="article-content">
        <p class="article-subsection">3.1 Prix</p>
        <p>Le prix de la prestation est fixé forfaitairement à :</p>

        <table class="pricing-table">
          <tr>
            <th>Désignation</th>
            <th style="text-align: right;">Montant</th>
          </tr>
          <tr>
            <td>Total Hors Taxes (HT)</td>
            <td style="text-align: right;">${formatCurrency(totalHT)}</td>
          </tr>
          <tr>
            <td>TVA (20%)</td>
            <td style="text-align: right;">${formatCurrency(totalTVA)}</td>
          </tr>
          <tr class="grand-total">
            <td><strong>Total Toutes Taxes Comprises (TTC)</strong></td>
            <td style="text-align: right;"><strong>${formatCurrency(totalTTC)}</strong></td>
          </tr>
        </table>

        <p>Soit ${formatCurrencyWords(totalTTC)} TTC.</p>

        <p class="article-subsection">3.2 Modalités de paiement</p>
        <p>Le paiement s'effectue selon l'échéancier suivant :</p>
        <ul>
          <li><strong>30% à la signature</strong> du présent contrat, soit ${formatCurrency(totalTTC * 0.3)}</li>
          <li><strong>40% à la livraison</strong> de la version beta, soit ${formatCurrency(totalTTC * 0.4)}</li>
          <li><strong>30% à la recette finale</strong>, soit ${formatCurrency(totalTTC * 0.3)}</li>
        </ul>
        <p>Les factures sont payables à réception, par virement bancaire.</p>
        ${paymentSchedule ? `<p><em>Conditions particulières : ${paymentSchedule}</em></p>` : ''}
      </div>
    </div>

    <div class="paraph-zone">Paraphe</div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <!-- ARTICLE 4 -->
    <div class="article">
      <div class="article-title">Article 4 - Délais de réalisation</div>
      <div class="article-content">
        <p>Le Prestataire s'engage à livrer la prestation dans un délai de <strong>${deliveryDeadline}</strong> à compter de la date de signature du présent contrat et de réception de l'acompte initial.</p>
        <p>Ce délai est donné à titre indicatif. Tout retard de livraison imputable au Prestataire et excédant 15 jours ouvrés pourra donner lieu à des pénalités de retard de 1% du montant HT par semaine de retard, plafonnées à 10% du montant total HT.</p>
        <p>Les délais pourront être prolongés d'un commun accord entre les parties, notamment en cas de :</p>
        <ul>
          <li>Retard du Client dans la fourniture des éléments nécessaires</li>
          <li>Demandes de modifications substantielles du cahier des charges</li>
          <li>Cas de force majeure</li>
        </ul>
      </div>
    </div>

    <!-- ARTICLE 5 -->
    <div class="article">
      <div class="article-title">Article 5 - Obligations du Client</div>
      <div class="article-content">
        <p>Le Client s'engage à :</p>
        <ul>
          <li>Fournir au Prestataire toutes les informations et documents nécessaires à la bonne exécution de la prestation dans les délais convenus</li>
          <li>Désigner un interlocuteur unique habilité à prendre les décisions nécessaires</li>
          <li>Participer activement aux phases de validation et de recette</li>
          <li>Respecter les délais de validation qui lui incombent (maximum 5 jours ouvrés par validation)</li>
          <li>Régler les factures dans les délais convenus</li>
          <li>Respecter les droits de propriété intellectuelle du Prestataire</li>
        </ul>
        <p>Tout retard du Client dans l'exécution de ses obligations entraînera de plein droit un décalage équivalent du calendrier de réalisation.</p>
      </div>
    </div>

    <!-- ARTICLE 6 -->
    <div class="article">
      <div class="article-title">Article 6 - Obligations du Prestataire</div>
      <div class="article-content">
        <p>Le Prestataire s'engage à :</p>
        <ul>
          <li>Exécuter la prestation conformément aux règles de l'art et aux spécifications convenues</li>
          <li>Informer régulièrement le Client de l'avancement des travaux</li>
          <li>Signaler sans délai toute difficulté susceptible d'affecter la bonne exécution de la prestation</li>
          <li>Respecter la confidentialité des informations communiquées par le Client</li>
          <li>Livrer un travail de qualité, exempt de vices et de bugs majeurs</li>
          <li>Fournir la documentation technique nécessaire à l'utilisation des livrables</li>
        </ul>
        <p>Le Prestataire est tenu à une obligation de moyens renforcée pour la réalisation de la prestation.</p>
      </div>
    </div>

    <!-- ARTICLE 7 -->
    <div class="article">
      <div class="article-title">Article 7 - Procédure de recette</div>
      <div class="article-content">
        <p class="article-subsection">7.1 Livraison</p>
        <p>À l'issue de la réalisation, le Prestataire procède à la livraison des livrables et en informe le Client par écrit (email accepté).</p>

        <p class="article-subsection">7.2 Vérification</p>
        <p>Le Client dispose d'un délai de <strong>10 jours ouvrés</strong> à compter de la livraison pour procéder à la vérification de conformité des livrables. Les anomalies éventuelles doivent être signalées par écrit.</p>

        <p class="article-subsection">7.3 Corrections</p>
        <p>Le Prestataire s'engage à corriger les anomalies signalées dans un délai raisonnable. Seules les non-conformités par rapport aux spécifications convenues constituent des anomalies recevables.</p>

        <p class="article-subsection">7.4 Recette définitive</p>
        <p>À défaut de réserves formulées dans le délai de vérification, la recette est réputée acquise. La recette définitive donne lieu au paiement du solde de la prestation.</p>
      </div>
    </div>

    <div class="paraph-zone">Paraphe</div>
  </div>

  <!-- PAGE 3 -->
  <div class="page">
    <!-- ARTICLE 8 -->
    <div class="article">
      <div class="article-title">Article 8 - Propriété intellectuelle</div>
      <div class="article-content">
        <p class="article-subsection">8.1 Cession des droits</p>
        <p>Sous réserve du complet paiement du prix, le Prestataire cède au Client l'ensemble des droits patrimoniaux sur les livrables spécifiquement créés pour le Client, pour toute la durée de protection des droits et pour le monde entier.</p>

        <p class="article-subsection">8.2 Éléments préexistants</p>
        <p>Le Prestataire conserve la propriété intellectuelle sur les éléments préexistants (frameworks, bibliothèques, outils, méthodologies) intégrés dans les livrables. Le Client bénéficie d'une licence d'utilisation non exclusive sur ces éléments.</p>

        <p class="article-subsection">8.3 Droit de référence</p>
        <p>Sauf opposition écrite du Client, le Prestataire pourra faire mention de la réalisation dans ses références commerciales.</p>
      </div>
    </div>

    <!-- ARTICLE 9 -->
    <div class="article">
      <div class="article-title">Article 9 - Garantie</div>
      <div class="article-content">
        <p>Le Prestataire garantit la conformité des livrables aux spécifications convenues pendant une durée de <strong>3 mois</strong> à compter de la recette définitive.</p>
        <p>Cette garantie couvre la correction des anomalies de fonctionnement, à l'exclusion de :</p>
        <ul>
          <li>Les modifications réalisées par le Client ou un tiers sans accord du Prestataire</li>
          <li>Les anomalies résultant d'une utilisation non conforme</li>
          <li>Les évolutions ou nouvelles fonctionnalités</li>
          <li>Les problèmes liés à l'environnement technique du Client</li>
        </ul>
        <p>Au-delà de la période de garantie, le Prestataire pourra proposer un contrat de maintenance.</p>
      </div>
    </div>

    <!-- ARTICLE 10 -->
    <div class="article">
      <div class="article-title">Article 10 - Confidentialité</div>
      <div class="article-content">
        <p>Chaque partie s'engage à maintenir strictement confidentielles toutes les informations de nature commerciale, technique, financière ou autre, communiquées par l'autre partie dans le cadre du présent contrat.</p>
        <p>Cette obligation de confidentialité s'applique pendant toute la durée du contrat et pendant une période de <strong>2 ans</strong> après son terme.</p>
        <p>Ne sont pas soumises à cette obligation les informations :</p>
        <ul>
          <li>Déjà publiques au moment de leur communication</li>
          <li>Devenues publiques sans faute de la partie les ayant reçues</li>
          <li>Communiquées par un tiers de manière licite</li>
          <li>Devant être divulguées en vertu d'une obligation légale</li>
        </ul>
      </div>
    </div>

    <!-- ARTICLE 11 -->
    <div class="article">
      <div class="article-title">Article 11 - Responsabilité</div>
      <div class="article-content">
        <p>La responsabilité du Prestataire est limitée aux dommages directs et prévisibles résultant d'un manquement prouvé à ses obligations contractuelles.</p>
        <p>En tout état de cause, la responsabilité totale du Prestataire ne pourra excéder le montant total HT perçu au titre du présent contrat.</p>
        <p>Le Prestataire ne saurait être tenu responsable des dommages indirects tels que perte de données, perte de chiffre d'affaires, perte de clientèle, atteinte à l'image, ou tout autre préjudice indirect.</p>
      </div>
    </div>

    <div class="paraph-zone">Paraphe</div>
  </div>

  <!-- PAGE 4 -->
  <div class="page">
    <!-- ARTICLE 12 -->
    <div class="article">
      <div class="article-title">Article 12 - Résiliation</div>
      <div class="article-content">
        <p class="article-subsection">12.1 Résiliation pour faute</p>
        <p>En cas de manquement grave de l'une des parties à ses obligations, l'autre partie pourra résilier le contrat de plein droit 15 jours après mise en demeure restée sans effet, par lettre recommandée avec accusé de réception.</p>

        <p class="article-subsection">12.2 Résiliation pour convenance</p>
        <p>Le Client peut résilier le contrat pour convenance moyennant :</p>
        <ul>
          <li>Le paiement des sommes déjà échues</li>
          <li>Le paiement d'une indemnité égale à 30% du montant restant dû</li>
        </ul>

        <p class="article-subsection">12.3 Conséquences de la résiliation</p>
        <p>En cas de résiliation, le Prestataire remettra au Client l'ensemble des travaux réalisés à la date de résiliation, dans l'état où ils se trouvent.</p>
      </div>
    </div>

    <!-- ARTICLE 13 -->
    <div class="article">
      <div class="article-title">Article 13 - Droit applicable et litiges</div>
      <div class="article-content">
        <p>Le présent contrat est soumis au droit français.</p>
        <p>En cas de litige relatif à l'interprétation ou à l'exécution du présent contrat, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.</p>
        <p>À défaut d'accord amiable dans un délai de 30 jours, le litige sera soumis à la compétence exclusive du <strong>Tribunal de Commerce de Paris</strong>.</p>
      </div>
    </div>

    <!-- ARTICLE 14 -->
    <div class="article">
      <div class="article-title">Article 14 - Dispositions générales</div>
      <div class="article-content">
        <p><strong>Intégralité :</strong> Le présent contrat constitue l'intégralité de l'accord entre les parties et annule tout accord antérieur.</p>
        <p><strong>Modification :</strong> Toute modification du contrat doit faire l'objet d'un avenant écrit signé par les deux parties.</p>
        <p><strong>Nullité partielle :</strong> La nullité d'une clause n'affecte pas la validité des autres clauses du contrat.</p>
        <p><strong>Renonciation :</strong> Le fait pour l'une des parties de ne pas se prévaloir d'un manquement ne vaut pas renonciation à s'en prévaloir ultérieurement.</p>
        <p><strong>Élection de domicile :</strong> Les parties font élection de domicile à leurs adresses respectives indiquées en tête du présent contrat.</p>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signatures-section">
      <div class="signatures-title">Signatures</div>
      <p style="text-align: center; font-size: 10px; margin-bottom: 20px;">Fait en deux exemplaires originaux, à _________________, le ____________________</p>

      <div class="signatures-container">
        <div class="signature-box">
          <div class="signature-label">Pour le Prestataire</div>
          <div class="signature-name">${providerName}</div>
          <div class="signature-mention">Précédé de la mention "Lu et approuvé"</div>
          <div class="signature-area">Signature</div>
        </div>
        <div class="signature-box">
          <div class="signature-label">Pour le Client</div>
          <div class="signature-name">${clientName}</div>
          <div class="signature-mention">Précédé de la mention "Lu et approuvé"</div>
          <div class="signature-area">Signature</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e5e5; font-size: 8px; color: #999;">
      <span>Contrat n&deg; ${contractNumber}</span>
      <span>${providerName}</span>
      <span>Page 4/4</span>
    </div>
  </div>
</body>
</html>`
}

// Time and Materials Contract (Régie)
export function generateTimeAndMaterialsContractPdfHtml(data: ContractPdfData): string {
  const { contract, project, client, provider } = data

  const contractNumber = contract.id.slice(0, 8).toUpperCase()
  const contractDate = formatDate(contract.created_at)

  // Provider info
  const providerName = provider?.name || 'Memory Agency'
  const providerAddress = provider?.address || '123 Rue de l\'Innovation, 75001 Paris'
  const providerSiret = provider?.siret || '123 456 789 00001'
  const providerEmail = provider?.email || 'contact@memory-agency.com'
  const providerPhone = provider?.phone || '+33 1 23 45 67 89'

  // Client info
  const clientName = client?.company_name || `${client?.first_name || ''} ${client?.last_name || ''}`.trim() || 'Client'
  const clientAddress = client ? [client.address, client.postal_code, client.city].filter(Boolean).join(', ') : ''
  const clientCity = client?.city || ''
  const clientSiret = client?.siret || ''
  const clientEmail = client?.email || ''
  const clientPhone = client?.phone || ''
  const clientRepresentative = `${client?.first_name || ''} ${client?.last_name || ''}`.trim()

  // Project info
  const projectTitle = project?.title || contract.title || 'Assistance technique informatique'

  // Signature location and date
  const signatureLocation = clientCity || 'Paris'
  const signatureDate = formatDate(new Date().toISOString())

  // Time and materials specific - Profiles
  const profiles = contract.profiles || []
  const workLocation = contract.work_location || 'remote'
  const contractDuration = contract.contract_duration || '6_months'
  const noticePeriod = contract.notice_period || '1_month'
  const billingFrequency = contract.billing_frequency || 'monthly'

  // Calculate totals from profiles
  const totalEstimatedDays = profiles.reduce((sum, p) => sum + (p.estimated_days || 0), 0)
  const totalEstimatedAmount = profiles.reduce((sum, p) => {
    if (p.daily_rate && p.estimated_days) {
      return sum + (p.daily_rate * p.estimated_days)
    }
    return sum
  }, 0)

  // Labels
  const workLocationLabel = workLocation === 'client' ? 'Dans les locaux du Client' :
    workLocation === 'remote' ? 'À distance (télétravail)' : 'En mode hybride selon les besoins'

  const durationLabel = contractDuration === '3_months' ? '3 mois' :
    contractDuration === '6_months' ? '6 mois' :
    contractDuration === '12_months' ? '12 mois' : contractDuration

  const noticeLabel = noticePeriod === '15_days' ? '15 jours' : '1 mois'
  const billingLabel = billingFrequency === 'weekly' ? 'hebdomadaire' : 'mensuelle'

  // Generate profiles table rows
  const profilesTableRows = profiles.length > 0
    ? profiles.map(p => `
        <tr>
          <td>${p.profile_name}</td>
          <td style="text-align: right;">${formatCurrency(p.daily_rate)} HT</td>
          <td style="text-align: right;">${formatCurrency(p.daily_rate / 2)} HT</td>
          <td style="text-align: center;">${p.estimated_days || '-'}</td>
          <td style="text-align: right;">${p.estimated_days ? formatCurrency(p.daily_rate * p.estimated_days) + ' HT' : '-'}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="5" style="text-align: center; color: #666;">Aucun profil défini</td></tr>`

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
      font-size: 10px;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }

    .page {
      padding: 40px 50px;
      min-height: 297mm;
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #2563eb;
    }

    .title-section h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 5px;
      text-transform: uppercase;
      color: #2563eb;
    }

    .title-section h2 {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      margin-bottom: 8px;
    }

    .contract-ref {
      font-size: 10px;
      color: #666;
    }

    .cube {
      width: 50px;
      height: 50px;
    }

    .cube svg {
      width: 100%;
      height: 100%;
    }

    /* Warning box */
    .warning-box {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      padding: 12px 15px;
      margin-bottom: 20px;
    }

    .warning-box h3 {
      font-size: 11px;
      font-weight: 700;
      color: #b45309;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .warning-box p {
      font-size: 9px;
      color: #92400e;
      line-height: 1.5;
    }

    /* Parties section */
    .parties-header {
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      margin: 20px 0 15px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #2563eb;
    }

    .parties-container {
      display: flex;
      justify-content: space-between;
      gap: 30px;
      margin-bottom: 25px;
    }

    .party-box {
      flex: 1;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
    }

    .party-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #2563eb;
      margin-bottom: 8px;
    }

    .party-name {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .party-details {
      font-size: 9px;
      color: #444;
      line-height: 1.5;
    }

    .party-details p {
      margin-bottom: 2px;
    }

    /* Preamble */
    .preamble {
      margin-bottom: 20px;
      padding: 12px 15px;
      background: #f5f5f5;
      border-radius: 6px;
      font-size: 10px;
      font-style: italic;
    }

    /* Articles */
    .article {
      margin-bottom: 18px;
    }

    .article-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #2563eb;
      color: #2563eb;
    }

    .article-content {
      font-size: 10px;
      text-align: justify;
      line-height: 1.65;
    }

    .article-content p {
      margin-bottom: 8px;
    }

    .article-content ul, .article-content ol {
      margin-left: 15px;
      margin-bottom: 8px;
    }

    .article-content li {
      margin-bottom: 4px;
    }

    .article-subsection {
      font-weight: 600;
      margin-top: 10px;
      margin-bottom: 5px;
    }

    /* Pricing table */
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9px;
    }

    .pricing-table th {
      background: #2563eb;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .pricing-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e5e5;
    }

    .pricing-table .total-row {
      font-weight: 700;
      background: #f5f5f5;
    }

    /* Checkbox list */
    .checkbox-list {
      list-style: none;
      margin-left: 0;
    }

    .checkbox-list li {
      padding-left: 20px;
      position: relative;
    }

    .checkbox-list li::before {
      content: "☐";
      position: absolute;
      left: 0;
    }

    .checkbox-list li.checked::before {
      content: "☑";
      color: #2563eb;
    }

    /* Signatures */
    .signatures-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #2563eb;
    }

    .signatures-title {
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 25px;
      text-transform: uppercase;
      color: #2563eb;
    }

    .signatures-container {
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }

    .signature-box {
      flex: 1;
      text-align: center;
    }

    .signature-label {
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .signature-name {
      font-size: 9px;
      color: #666;
      margin-bottom: 8px;
    }

    .signature-mention {
      font-size: 8px;
      color: #888;
      margin-bottom: 15px;
      font-style: italic;
    }

    .signature-area {
      height: 60px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ccc;
      font-size: 8px;
    }

    .signature-date {
      font-size: 9px;
      margin-top: 8px;
    }

    /* Footer */
    .page-footer {
      position: absolute;
      bottom: 20px;
      left: 50px;
      right: 50px;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #999;
      border-top: 1px solid #e5e5e5;
      padding-top: 10px;
    }

    /* Paraph zone */
    .paraph-zone {
      position: absolute;
      bottom: 50px;
      right: 50px;
      width: 80px;
      height: 40px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7px;
      color: #ccc;
    }

    /* Print styles */
    @media print {
      .page {
        padding: 15mm 20mm;
      }
    }

    @page {
      size: A4;
      margin: 0;
    }
  </style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="title-section">
        <h1>CONTRAT DE PRESTATION INFORMATIQUE</h1>
        <h2>En régie / Assistance technique</h2>
        <p style="font-size: 9px; color: #64748b; font-style: italic;">(Obligation de moyens)</p>
        <p class="contract-ref">Contrat n° ${contractNumber} - ${contractDate}</p>
      </div>
      <div class="cube">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10L90 30V70L50 90L10 70V30L50 10Z" stroke="#2563eb" stroke-width="2" fill="none"/>
          <path d="M50 10V50M50 50L90 30M50 50L10 30M50 50V90" stroke="#2563eb" stroke-width="2"/>
        </svg>
      </div>
    </div>

    <!-- Warning box -->
    <div class="warning-box">
      <h3>⚠️ NATURE DU CONTRAT</h3>
      <p>Ce contrat est un contrat de prestation en régie. Le Prestataire s'engage à mettre à disposition ses compétences et son temps, mais <strong>n'est pas tenu à une obligation de résultat</strong>. La facturation est basée sur le temps effectivement passé.</p>
    </div>

    <!-- Parties -->
    <div class="parties-header">Entre les soussignés</div>
    <div class="parties-container">
      <div class="party-box">
        <div class="party-label">Le Prestataire</div>
        <div class="party-name">${providerName}</div>
        <div class="party-details">
          <p>${providerAddress}</p>
          <p>SIRET : ${providerSiret}</p>
          <p>Email : ${providerEmail}</p>
          <p>Tél : ${providerPhone}</p>
        </div>
      </div>
      <div class="party-box">
        <div class="party-label">Le Client</div>
        <div class="party-name">${clientName}</div>
        <div class="party-details">
          ${clientAddress ? `<p>${clientAddress}</p>` : ''}
          ${clientSiret ? `<p>SIRET : ${clientSiret}</p>` : ''}
          ${clientEmail ? `<p>Email : ${clientEmail}</p>` : ''}
          ${clientPhone ? `<p>Tél : ${clientPhone}</p>` : ''}
          ${clientRepresentative ? `<p>Représenté par : ${clientRepresentative}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Preamble -->
    <div class="preamble">
      Il a été convenu ce qui suit :
    </div>

    <!-- ARTICLE 1 -->
    <div class="article">
      <div class="article-title">Article 1 - Objet du contrat</div>
      <div class="article-content">
        <p>Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire met à disposition du Client ses compétences techniques pour la réalisation de missions d'assistance informatique.</p>
        <p><strong>Mission : ${projectTitle}</strong></p>
        <p>Les missions pourront notamment porter sur :</p>
        <ul>
          <li>Développement et maintenance d'applications</li>
          <li>Conseil et expertise technique</li>
          <li>Support et assistance aux équipes</li>
          <li>Audit et optimisation de systèmes</li>
        </ul>
      </div>
    </div>

    <!-- ARTICLE 2 -->
    <div class="article">
      <div class="article-title">Article 2 - Nature des obligations</div>
      <div class="article-content">
        <p><strong>Le présent contrat est un contrat de prestation en régie.</strong></p>
        <p>Le Prestataire s'engage à mettre en œuvre tous les moyens nécessaires à la bonne exécution des missions qui lui sont confiées. Il est soumis à une <strong>obligation de moyens</strong> et non de résultat.</p>
        <p>Le Client conserve la maîtrise et la responsabilité de son projet. Il définit les priorités, valide les orientations et prend les décisions relatives à l'avancement des travaux.</p>
      </div>
    </div>

    <!-- ARTICLE 3 -->
    <div class="article">
      <div class="article-title">Article 3 - Modalités d'exécution</div>
      <div class="article-content">
        <p class="article-subsection">3.1 Lieu d'exécution</p>
        <p>Les prestations seront réalisées : <strong>${workLocationLabel}</strong></p>

        <p class="article-subsection">3.2 Volume et planification</p>
        <p>Le Client commande un volume prévisionnel de :</p>
        <p style="text-align: center; font-size: 14px; font-weight: 700; margin: 10px 0;">${totalEstimatedDays > 0 ? totalEstimatedDays + ' jours de prestation' : 'À définir par bon de commande'}</p>
        <p>Ce volume est donné à titre indicatif et pourra être ajusté d'un commun accord. Le planning d'intervention sera défini conjointement.</p>
        <p><strong>Plafond mensuel :</strong> Sauf accord écrit préalable, le volume mensuel ne pourra excéder <strong>${totalEstimatedDays > 0 ? Math.ceil(totalEstimatedDays / 6) + ' jours' : '_____ jours'}</strong>.</p>

        <p class="article-subsection">3.3 Suivi des temps</p>
        <p>Le Prestataire établira un relevé des temps passés (feuille de temps / timesheet) sur une base ${billingLabel}, qui sera validé par le Client avant facturation.</p>
      </div>
    </div>

    <div class="paraph-zone">Paraphe</div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <!-- ARTICLE 4 -->
    <div class="article">
      <div class="article-title">Article 4 - Tarification</div>
      <div class="article-content">
        <p class="article-subsection">4.1 Grille tarifaire</p>
        <p>Les prestations seront facturées sur la base des taux journaliers suivants :</p>

        <table class="pricing-table">
          <tr>
            <th>Profil</th>
            <th style="text-align: right;">TJM</th>
            <th style="text-align: right;">Demi-journée</th>
            <th style="text-align: center;">Jours estimés</th>
            <th style="text-align: right;">Montant estimé</th>
          </tr>
          ${profilesTableRows}
          ${totalEstimatedAmount > 0 ? `
          <tr class="total-row">
            <td colspan="3"><strong>Total prévisionnel</strong></td>
            <td style="text-align: center;"><strong>${totalEstimatedDays}</strong></td>
            <td style="text-align: right;"><strong>${formatCurrency(totalEstimatedAmount)} HT</strong></td>
          </tr>
          ` : ''}
        </table>

        ${profiles.length === 0 ? `
        <p><strong>À défaut d'annexe tarifaire signée, le TJM applicable sera de __________ € HT.</strong></p>
        ` : ''}

        <p style="font-size: 9px; color: #666; margin-top: 8px;">Base journalière : 7 heures de travail effectif. Les montants estimés sont donnés à titre indicatif et ne constituent pas un engagement ferme.</p>

        <p class="article-subsection">4.2 Révision tarifaire</p>
        <p>Les tarifs pourront être révisés annuellement, à la date anniversaire du contrat, après notification écrite avec un préavis de 30 jours.</p>

        <p class="article-subsection">4.3 Frais annexes</p>
        <p>Les frais de déplacement, d'hébergement et de repas engagés pour les besoins de la mission seront refacturés au réel sur justificatifs, après accord préalable du Client pour tout déplacement.</p>
      </div>
    </div>

    <!-- ARTICLE 5 -->
    <div class="article">
      <div class="article-title">Article 5 - Facturation et paiement</div>
      <div class="article-content">
        <p>La facturation sera effectuée ${billingLabel === 'hebdomadaire' ? 'chaque semaine' : 'mensuellement'}, sur la base des relevés de temps validés par le Client.</p>
        <p>Les factures sont payables à <strong>30 jours</strong> date de facture, par virement bancaire.</p>
        <p>En cas de retard de paiement, des pénalités seront appliquées au taux de trois fois le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.</p>
      </div>
    </div>

    <!-- ARTICLE 6 -->
    <div class="article">
      <div class="article-title">Article 6 - Durée du contrat</div>
      <div class="article-content">
        <p>Le présent contrat est conclu pour une durée de <strong>${durationLabel}</strong> à compter de sa signature.</p>
        <p>Il pourra être renouvelé par tacite reconduction pour des périodes équivalentes, sauf dénonciation par l'une des parties avec un préavis de ${noticeLabel}.</p>
        <p>Chaque partie peut mettre fin au contrat à tout moment, sous réserve de respecter un préavis de <strong>${noticeLabel}</strong>. Les prestations réalisées jusqu'à la date effective de résiliation restent dues.</p>
      </div>
    </div>

    <!-- ARTICLE 7 -->
    <div class="article">
      <div class="article-title">Article 7 - Obligations du Client</div>
      <div class="article-content">
        <p>Le Client s'engage à :</p>
        <ul>
          <li>Définir clairement les missions confiées au Prestataire</li>
          <li>Fournir les accès, outils et informations nécessaires à l'exécution des missions</li>
          <li>Désigner un responsable de projet pour le suivi et la validation</li>
          <li>Valider les relevés de temps dans un délai de 5 jours ouvrés</li>
          <li>Régler les factures aux échéances convenues</li>
        </ul>
      </div>
    </div>

    <!-- ARTICLE 8 -->
    <div class="article">
      <div class="article-title">Article 8 - Obligations du Prestataire</div>
      <div class="article-content">
        <p>Le Prestataire s'engage à :</p>
        <ul>
          <li>Exécuter les missions avec diligence et professionnalisme</li>
          <li>Mettre en œuvre ses meilleurs efforts pour atteindre les objectifs fixés</li>
          <li>Informer le Client de toute difficulté rencontrée</li>
          <li>Respecter les règles et procédures du Client</li>
          <li>Établir des relevés de temps précis et sincères</li>
          <li>Conseiller le Client sur les meilleures pratiques</li>
        </ul>
      </div>
    </div>

    <div class="paraph-zone">Paraphe</div>
  </div>

  <!-- PAGE 3 -->
  <div class="page">
    <!-- ARTICLE 9 -->
    <div class="article">
      <div class="article-title">Article 9 - Indépendance du Prestataire</div>
      <div class="article-content">
        <p>Le Prestataire exerce son activité de manière indépendante. Le présent contrat ne crée aucun lien de subordination entre les parties.</p>
        <p>Le Prestataire organise librement son travail dans le respect des objectifs fixés. Il conserve la maîtrise de ses méthodes et outils de travail.</p>
        <p>Le Prestataire peut intervenir pour d'autres clients, sous réserve de respecter ses engagements de disponibilité et de confidentialité.</p>
      </div>
    </div>

    <!-- ARTICLE 10 -->
    <div class="article">
      <div class="article-title">Article 10 - Propriété intellectuelle</div>
      <div class="article-content">
        <p>Les développements spécifiquement réalisés par le Prestataire dans le cadre des missions sont la propriété du Client, sous réserve du complet paiement des prestations correspondantes.</p>
        <p>Le Prestataire conserve la propriété de ses outils, méthodes, frameworks et composants génériques préexistants ou développés indépendamment. Le Client bénéficie d'une licence d'utilisation non exclusive et perpétuelle sur ces éléments intégrés aux livrables.</p>
        <p>Le Prestataire conserve le droit de réutiliser, pour d'autres clients, les savoir-faire, techniques et composants génériques développés dans le cadre des missions, à l'exclusion des éléments spécifiques au métier ou aux données du Client.</p>
      </div>
    </div>

    <!-- ARTICLE 11 -->
    <div class="article">
      <div class="article-title">Article 11 - Confidentialité</div>
      <div class="article-content">
        <p>Le Prestataire s'engage à conserver strictement confidentielles toutes les informations du Client auxquelles il aura accès dans le cadre de ses missions.</p>
        <p>Cette obligation perdure pendant toute la durée du contrat et <strong>2 ans</strong> après son terme.</p>
      </div>
    </div>

    <!-- ARTICLE 12 - RGPD -->
    <div class="article">
      <div class="article-title">Article 12 - Protection des données personnelles (RGPD)</div>
      <div class="article-content">
        <p>Dans le cadre de l'exécution du présent contrat, le Prestataire peut être amené à traiter des données à caractère personnel pour le compte du Client.</p>
        <p>Le Prestataire s'engage à :</p>
        <ul>
          <li>Traiter les données uniquement pour les finalités prévues au contrat</li>
          <li>Ne pas transférer les données vers des pays tiers sans garanties appropriées</li>
          <li>Mettre en œuvre les mesures techniques et organisationnelles appropriées</li>
          <li>Assister le Client dans le respect de ses obligations RGPD</li>
          <li>Supprimer ou restituer les données à l'issue du contrat selon les instructions du Client</li>
          <li>Notifier le Client dans les 48h en cas de violation de données</li>
        </ul>
        <p>Le Client reste responsable de traitement et garantit la licéité des traitements confiés au Prestataire.</p>
      </div>
    </div>

    <!-- ARTICLE 13 -->
    <div class="article">
      <div class="article-title">Article 13 - Force majeure</div>
      <div class="article-content">
        <p>Aucune des parties ne pourra être tenue responsable d'un manquement à ses obligations contractuelles si ce manquement résulte d'un cas de force majeure au sens de l'article 1218 du Code civil.</p>
        <p>Sont notamment considérés comme cas de force majeure : catastrophes naturelles, guerres, grèves générales, épidémies, pannes majeures d'infrastructures (électricité, télécommunications, internet).</p>
        <p>La partie affectée devra notifier l'autre partie dans les 48 heures. Si la force majeure perdure au-delà de <strong>30 jours</strong>, chaque partie pourra résilier le contrat sans indemnité.</p>
      </div>
    </div>

    <div class="paraph-zone">Paraphe</div>
  </div>

  <!-- PAGE 4 -->
  <div class="page">
    <!-- ARTICLE 14 -->
    <div class="article">
      <div class="article-title">Article 14 - Responsabilité</div>
      <div class="article-content">
        <p>Le Prestataire étant soumis à une obligation de moyens, sa responsabilité ne pourra être engagée que s'il est démontré qu'il n'a pas mis en œuvre les diligences normalement attendues d'un professionnel.</p>
        <p>En tout état de cause, la responsabilité du Prestataire est limitée au montant des sommes effectivement perçues au titre du présent contrat au cours des <strong>12 derniers mois</strong>.</p>
        <p>Le Prestataire ne pourra être tenu responsable des dommages indirects (perte de données, manque à gagner, préjudice commercial).</p>
      </div>
    </div>

    <!-- ARTICLE 15 -->
    <div class="article">
      <div class="article-title">Article 15 - Retards et pénalités</div>
      <div class="article-content">
        <p class="article-subsection">15.1 Retard du Client</p>
        <p>Tout retard du Client dans la fourniture des éléments nécessaires, la validation des livrables ou le paiement des factures entraînera :</p>
        <ul>
          <li>Un décalage équivalent du calendrier d'intervention</li>
          <li>La possibilité pour le Prestataire de suspendre ses prestations après mise en demeure de 8 jours</li>
          <li>Le maintien de la facturation des jours prévus non réalisés du fait du Client</li>
        </ul>
        <p class="article-subsection">15.2 Retard de paiement</p>
        <p>En cas de retard de paiement, des pénalités de retard au taux de 3 fois le taux d'intérêt légal seront appliquées de plein droit, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.</p>
      </div>
    </div>

    <!-- ARTICLE 16 -->
    <div class="article">
      <div class="article-title">Article 16 - Résiliation</div>
      <div class="article-content">
        <p>Outre la résiliation avec préavis prévue à l'Article 6, chaque partie peut résilier le contrat de plein droit en cas de manquement grave de l'autre partie, 15 jours après mise en demeure restée sans effet.</p>
        <p>En cas de résiliation, les prestations réalisées jusqu'à la date effective de fin de contrat restent dues.</p>
      </div>
    </div>

    <!-- ARTICLE 17 -->
    <div class="article">
      <div class="article-title">Article 17 - Loi applicable et litiges</div>
      <div class="article-content">
        <p>Le présent contrat est soumis au droit français.</p>
        <p>En cas de litige, les parties rechercheront une solution amiable. À défaut d'accord dans un délai de 30 jours, le litige sera soumis aux tribunaux compétents de <strong>Paris</strong>.</p>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signatures-section">
      <div class="signatures-title">Signatures</div>
      <p style="text-align: center; font-size: 10px; margin-bottom: 20px;">Fait en deux exemplaires originaux, à <strong>${signatureLocation}</strong>, le <strong>${signatureDate}</strong></p>

      <div class="signatures-container">
        <div class="signature-box">
          <div class="signature-label">Pour le Prestataire</div>
          <div class="signature-name">${providerName}</div>
          <div class="signature-mention">Précédé de la mention "Lu et approuvé"</div>
          <div class="signature-area">Signature</div>
        </div>
        <div class="signature-box">
          <div class="signature-label">Pour le Client</div>
          <div class="signature-name">${clientName}</div>
          <div class="signature-mention">Précédé de la mention "Lu et approuvé"</div>
          <div class="signature-area">Signature</div>
        </div>
      </div>
    </div>

    <!-- Annexes -->
    <div class="article" style="margin-top: 40px;">
      <div class="article-title">Annexes</div>
      <div class="article-content">
        <ul>
          <li>Annexe 1 : Grille tarifaire détaillée et profils intervenants</li>
          <li>Annexe 2 : Modèle de relevé de temps (timesheet)</li>
          <li>Annexe 3 : Conditions générales de prestation (le cas échéant)</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e5e5; font-size: 8px; color: #999;">
      <span>Contrat n&deg; ${contractNumber}</span>
      <span>${providerName}</span>
      <span>Page 4/4</span>
    </div>
  </div>
</body>
</html>`
}
