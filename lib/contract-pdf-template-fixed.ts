import { escapeHtml } from './sanitize'
import { calculateQuoteData } from './quote-export'
import { ContractPdfData, formatDate, formatCurrency, formatCurrencyWords, extractPartyInfo } from './contract-pdf-helpers'

export function generateContractPdfHtml(data: ContractPdfData): string {
  const { contract, project, client, quote, provider } = data

  const contractNumber = contract.id.slice(0, 8).toUpperCase()
  const contractDate = formatDate(contract.created_at)
  const today = new Date()

  const {
    providerName, providerAddress, providerSiret, providerEmail, providerPhone,
    clientName, clientAddress, clientSiret, clientEmail, clientPhone, clientRepresentative,
  } = extractPartyInfo(client, provider)

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
  <title>${escapeHtml(contract.title)}</title>
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
    }

    .contract-content {
      padding: 0;
    }

    /* Prevent orphans and widows */
    .article {
      page-break-inside: avoid;
    }

    .signatures-section {
      page-break-inside: avoid;
    }

    .party-box {
      page-break-inside: avoid;
    }

    .pricing-table {
      page-break-inside: avoid;
    }

    /* Header - Style like quote */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .title-section h1 {
      font-size: 48px;
      font-weight: 700;
      letter-spacing: -2px;
      line-height: 1;
      margin-bottom: 8px;
    }

    .contract-number {
      display: inline-block;
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
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
      margin-bottom: 20px;
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
      margin: 20px 0;
    }

    /* Parties section */
    .parties-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
    }

    .party-box {
      flex: 1;
    }

    .party-box.right {
      text-align: right;
    }

    .party-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }

    .party-name {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .party-details {
      font-size: 11px;
      color: #333;
      line-height: 1.5;
    }

    .party-details p {
      margin-bottom: 3px;
    }

    /* Preamble */
    .preamble {
      margin-bottom: 25px;
      padding: 15px 20px;
      background: #f8f8f8;
      border-left: 3px solid #1a1a1a;
      font-size: 11px;
      font-style: italic;
      color: #444;
    }

    /* Articles */
    .article {
      margin-bottom: 20px;
    }

    .article-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #1a1a1a;
      color: #1a1a1a;
    }

    .article-content {
      font-size: 11px;
      text-align: justify;
      line-height: 1.6;
    }

    .article-content p {
      margin-bottom: 10px;
    }

    .article-content ul, .article-content ol {
      margin-left: 20px;
      margin-bottom: 10px;
    }

    .article-content li {
      margin-bottom: 5px;
    }

    .article-subsection {
      font-weight: 600;
      margin-top: 12px;
      margin-bottom: 6px;
    }

    /* Pricing table */
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 11px;
    }

    .pricing-table th {
      background: #fff;
      padding: 12px 15px;
      text-align: left;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #1a1a1a;
    }

    .pricing-table td {
      padding: 12px 15px;
      border-bottom: 1px solid #e5e5e5;
    }

    .pricing-table .total-row {
      font-weight: 600;
    }

    .pricing-table .grand-total {
      background: #1a1a1a;
      color: #fff;
    }

    .pricing-table .grand-total td {
      border-bottom: none;
      font-weight: 700;
    }

    /* Totals box */
    .totals {
      display: flex;
      justify-content: flex-end;
      margin: 20px 0;
    }

    .totals-box {
      width: 280px;
    }

    .total-row-box {
      display: flex;
      justify-content: space-between;
      padding: 8px 15px;
      font-size: 12px;
    }

    .total-row-box.grand-total {
      background: #1a1a1a;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      margin-top: 5px;
    }

    /* Signatures */
    .signatures-section {
      margin-top: 40px;
      padding-top: 25px;
      border-top: 1px solid #1a1a1a;
    }

    .signatures-title {
      font-size: 14px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .signatures-date {
      text-align: center;
      font-size: 11px;
      margin-bottom: 30px;
    }

    .signatures-container {
      display: flex;
      justify-content: space-between;
      gap: 60px;
    }

    .signature-box {
      flex: 1;
      text-align: center;
    }

    .signature-label {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .signature-name {
      font-size: 10px;
      color: #666;
      margin-bottom: 8px;
    }

    .signature-mention {
      font-size: 9px;
      color: #888;
      margin-bottom: 15px;
      font-style: italic;
    }

    .signature-area {
      height: 70px;
      border-bottom: 1px solid #1a1a1a;
      margin-bottom: 10px;
    }

    @page {
      size: A4;
      margin: 15mm 20mm;
    }

    @page :first {
      margin-top: 15mm;
    }
  </style>
</head>
<body>
  <div class="contract-content">
    <!-- Header -->
    <div class="header">
      <div class="title-section">
        <h1>CONTRAT</h1>
        <span class="contract-number">Contrat n°${contractNumber}</span>
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
      <p><strong>Type :</strong> ${contractTypeLabel}</p>
      <p><strong>Date :</strong> ${contractDate}</p>
    </div>

    <div class="divider"></div>

    <!-- Parties -->
    <div class="parties-container">
      <div class="party-box">
        <div class="party-label">Le Prestataire</div>
        <div class="party-name">${escapeHtml(providerName)}</div>
        <div class="party-details">
          <p>${escapeHtml(providerAddress)}</p>
          <p>SIRET : ${escapeHtml(providerSiret)}</p>
          <p>${escapeHtml(providerEmail)}</p>
          <p>${escapeHtml(providerPhone)}</p>
        </div>
      </div>
      <div class="party-box right">
        <div class="party-label">Le Client</div>
        <div class="party-name">${escapeHtml(clientName)}</div>
        <div class="party-details">
          ${clientAddress ? `<p>${escapeHtml(clientAddress)}</p>` : ''}
          ${clientSiret ? `<p>SIRET : ${escapeHtml(clientSiret)}</p>` : ''}
          ${clientEmail ? `<p>${escapeHtml(clientEmail)}</p>` : ''}
          ${clientPhone ? `<p>${escapeHtml(clientPhone)}</p>` : ''}
        </div>
      </div>
    </div>

    <div class="divider"></div>

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
        <p><strong>Projet : ${escapeHtml(projectTitle)}</strong></p>
        ${projectDescription ? `<p>${escapeHtml(projectDescription)}</p>` : ''}
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
        ${paymentSchedule ? `<p><em>Conditions particulières : ${escapeHtml(paymentSchedule)}</em></p>` : ''}
      </div>
    </div>

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
        <p>Le Prestataire est tenu à une <strong>obligation de résultat</strong> pour la réalisation de la prestation, conformément aux spécifications convenues.</p>
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

    <!-- Annexes -->
    <div class="article">
      <div class="article-title">Annexes</div>
      <div class="article-content">
        <p>Les documents suivants sont annexés au présent contrat et en font partie intégrante :</p>
        <ul>
          ${quote ? `<li><strong>Annexe 1 :</strong> Devis n° ${quote.id.slice(0, 8).toUpperCase()} du ${formatDate(quote.created_at)}</li>` : '<li><strong>Annexe 1 :</strong> Devis (à joindre)</li>'}
          <li><strong>Annexe 2 :</strong> Cahier des charges / Spécifications fonctionnelles</li>
          <li><strong>Annexe 3 :</strong> Planning prévisionnel de réalisation</li>
        </ul>
        <p style="font-size: 10px; color: #666; margin-top: 10px;"><em>Les parties reconnaissent avoir pris connaissance des annexes ci-dessus avant la signature du présent contrat.</em></p>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signatures-section">
      <div class="signatures-title">Signatures</div>
      <p style="text-align: center; font-size: 10px; margin-bottom: 20px;">Fait en deux exemplaires originaux, à _________________, le ____________________</p>

      <div class="signatures-container">
        <div class="signature-box">
          <div class="signature-label">Pour le Prestataire</div>
          <div class="signature-name">${escapeHtml(providerName)}</div>
          <div class="signature-mention">Précédé de la mention "Lu et approuvé"</div>
          <div class="signature-area">Signature</div>
        </div>
        <div class="signature-box">
          <div class="signature-label">Pour le Client</div>
          <div class="signature-name">${escapeHtml(clientName)}</div>
          <div class="signature-mention">Précédé de la mention "Lu et approuvé"</div>
          <div class="signature-area">Signature</div>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`
}
