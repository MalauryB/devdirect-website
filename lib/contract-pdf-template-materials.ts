import { escapeHtml } from './sanitize'
import { ContractPdfData, formatDate, formatCurrency, extractPartyInfo } from './contract-pdf-helpers'

// Time and Materials Contract (Régie)
export function generateTimeAndMaterialsContractPdfHtml(data: ContractPdfData): string {
  const { contract, project, client, provider } = data

  const contractNumber = contract.id.slice(0, 8).toUpperCase()
  const contractDate = formatDate(contract.created_at)

  const {
    providerName, providerAddress, providerSiret, providerEmail, providerPhone,
    clientName, clientAddress, clientSiret, clientEmail, clientPhone, clientRepresentative,
  } = extractPartyInfo(client, provider)
  const clientCity = client?.city || ''

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
          <td>${escapeHtml(p.profile_name)}</td>
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

    /* Warning box */
    .warning-box {
      margin-bottom: 20px;
      padding: 15px 20px;
      background: #f8f8f8;
      border-left: 3px solid #1a1a1a;
    }

    .warning-box h3 {
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .warning-box p {
      font-size: 10px;
      color: #444;
      line-height: 1.5;
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
      <p><strong>Type :</strong> Contrat de prestation en régie (Assistance technique)</p>
      <p><strong>Date :</strong> ${contractDate}</p>
    </div>

    <div class="divider"></div>

    <!-- Warning box -->
    <div class="warning-box">
      <h3>NATURE DU CONTRAT</h3>
      <p>Ce contrat est un contrat de prestation en régie. Le Prestataire s'engage à mettre à disposition ses compétences et son temps, mais <strong>n'est pas tenu à une obligation de résultat</strong>. La facturation est basée sur le temps effectivement passé.</p>
    </div>

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
      Il a été convenu ce qui suit :
    </div>

    <!-- ARTICLE 1 -->
    <div class="article">
      <div class="article-title">Article 1 - Objet du contrat</div>
      <div class="article-content">
        <p>Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire met à disposition du Client ses compétences techniques pour la réalisation de missions d'assistance informatique.</p>
        <p><strong>Mission : ${escapeHtml(projectTitle)}</strong></p>
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

  </div>
</body>
</html>`
}
