import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Project, Quote, ContractType, Profile } from '@/lib/types'
import { calculateQuoteData } from '@/lib/quote-export'
import { requireEngineer } from '@/lib/auth'
import { parseAIJsonResponse } from '@/lib/ai-helpers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ContractGenerationRequest {
  project: Project
  quote?: Quote | null
  client: Partial<Profile>
  provider: {
    name: string
    address: string
    siret: string
    email: string
    phone: string
  }
  contractType: ContractType
  language: 'fr' | 'en'
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireEngineer(request)
  if (authError) return authError

  try {
    const data = await request.json() as ContractGenerationRequest

    if (!data.project) {
      return NextResponse.json({ error: 'Project data is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = buildContractPrompt(data)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response from Claude
    let contract: { title: string; content: string }
    try {
      contract = parseAIJsonResponse(responseText)
    } catch {
      console.error('Failed to parse Claude response:', responseText)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    return NextResponse.json({ contract })
  } catch (error) {
    console.error('Generate contract error:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}

function buildContractPrompt(data: ContractGenerationRequest): string {
  const { project, quote, client, provider, contractType, language } = data

  const clientName = client.company_name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client'
  const clientAddress = [client.address, client.postal_code, client.city, client.country].filter(Boolean).join(', ')

  let contractTypeLabel = ''
  let contractInstructions = ''

  if (language === 'fr') {
    switch (contractType) {
      case 'service_agreement':
        contractTypeLabel = 'Contrat de Prestation de Services'
        contractInstructions = `
Génère un contrat de prestation de services professionnel et complet incluant:
- Les parties (prestataire et client)
- L'objet du contrat (description des services)
- Les obligations du prestataire
- Les obligations du client
- Les conditions financières (montant, échéancier de paiement)
- Les délais d'exécution
- La propriété intellectuelle
- La confidentialité
- La responsabilité et garanties
- La résiliation
- Les litiges et droit applicable
- Les signatures`
        break
      case 'terms_of_sale':
        contractTypeLabel = 'Conditions Générales de Vente'
        contractInstructions = `
Génère des Conditions Générales de Vente (CGV) professionnelles incluant:
- Champ d'application
- Les services proposés
- Les tarifs et modalités de paiement
- Les délais d'exécution
- Le droit de rétractation
- Les garanties
- La limitation de responsabilité
- La propriété intellectuelle
- La protection des données personnelles
- Les modifications des CGV
- Le droit applicable et litiges`
        break
      case 'amendment':
        contractTypeLabel = 'Avenant au Contrat'
        contractInstructions = `
Génère un avenant au contrat incluant:
- Référence au contrat initial
- Les parties
- Les modifications apportées
- Les articles modifiés ou ajoutés
- La date d'effet des modifications
- La confirmation que les autres clauses restent inchangées
- Les signatures`
        break
    }
  } else {
    switch (contractType) {
      case 'service_agreement':
        contractTypeLabel = 'Service Agreement'
        contractInstructions = `
Generate a professional and comprehensive service agreement including:
- The parties (service provider and client)
- Purpose of the agreement (description of services)
- Provider's obligations
- Client's obligations
- Financial terms (amount, payment schedule)
- Execution timeline
- Intellectual property
- Confidentiality
- Liability and warranties
- Termination
- Disputes and applicable law
- Signatures`
        break
      case 'terms_of_sale':
        contractTypeLabel = 'Terms of Sale'
        contractInstructions = `
Generate professional Terms of Sale including:
- Scope of application
- Services offered
- Pricing and payment terms
- Execution timeline
- Right of withdrawal
- Warranties
- Limitation of liability
- Intellectual property
- Personal data protection
- Amendments to terms
- Applicable law and disputes`
        break
      case 'amendment':
        contractTypeLabel = 'Contract Amendment'
        contractInstructions = `
Generate a contract amendment including:
- Reference to the original contract
- The parties
- Modifications made
- Modified or added articles
- Effective date of modifications
- Confirmation that other clauses remain unchanged
- Signatures`
        break
    }
  }

  const quoteInfo = quote ? (() => {
    const calculated = calculateQuoteData(quote)
    return `
${language === 'fr' ? 'INFORMATIONS DU DEVIS' : 'QUOTE INFORMATION'}:
- ${language === 'fr' ? 'Montant HT' : 'Amount excl. tax'}: ${calculated.totalHT.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €
- ${language === 'fr' ? 'TVA' : 'VAT'}: ${calculated.totalTVA.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €
- ${language === 'fr' ? 'Montant TTC' : 'Amount incl. tax'}: ${calculated.totalTTC.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €
- ${language === 'fr' ? 'Validité' : 'Validity'}: ${quote.validity_days} ${language === 'fr' ? 'jours' : 'days'}
`
  })() : ''

  const prompt = language === 'fr' ? `
Tu es un expert juridique spécialisé dans la rédaction de contrats de services numériques et développement logiciel.

${contractInstructions}

INFORMATIONS DU PRESTATAIRE:
- Nom: ${provider.name}
- Adresse: ${provider.address}
- SIRET: ${provider.siret}
- Email: ${provider.email}
- Téléphone: ${provider.phone}

INFORMATIONS DU CLIENT:
- Nom/Entreprise: ${clientName}
- Adresse: ${clientAddress || 'Non renseignée'}
- Email: ${client.email || 'Non renseigné'}
- Téléphone: ${client.phone || 'Non renseigné'}
${client.siret ? `- SIRET: ${client.siret}` : ''}

INFORMATIONS DU PROJET:
- Titre: ${project.title || 'Projet sans titre'}
- Description: ${project.description || 'Pas de description'}
- Types: ${project.project_types?.join(', ') || 'Non spécifié'}
- Services demandés: ${project.services?.join(', ') || 'Non spécifié'}
${quoteInfo}

INSTRUCTIONS IMPORTANTES:
1. Le contrat doit être rédigé en français juridique professionnel
2. Inclure des placeholders [À COMPLÉTER] pour les informations manquantes ou à personnaliser
3. Utiliser la date du jour pour la date du contrat: ${new Date().toLocaleDateString('fr-FR')}
4. Le contrat doit être prêt à être signé avec un minimum de modifications

Réponds UNIQUEMENT avec un objet JSON dans le format suivant:
\`\`\`json
{
  "title": "${contractTypeLabel} - ${project.title || 'Projet'}",
  "content": "Le contenu complet du contrat en HTML avec des balises <h2>, <h3>, <p>, <ul>, <li> pour le formatage. Utilise des sauts de ligne appropriés."
}
\`\`\`
` : `
You are a legal expert specialized in writing contracts for digital services and software development.

${contractInstructions}

PROVIDER INFORMATION:
- Name: ${provider.name}
- Address: ${provider.address}
- Registration Number: ${provider.siret}
- Email: ${provider.email}
- Phone: ${provider.phone}

CLIENT INFORMATION:
- Name/Company: ${clientName}
- Address: ${clientAddress || 'Not provided'}
- Email: ${client.email || 'Not provided'}
- Phone: ${client.phone || 'Not provided'}
${client.siret ? `- Registration Number: ${client.siret}` : ''}

PROJECT INFORMATION:
- Title: ${project.title || 'Untitled Project'}
- Description: ${project.description || 'No description'}
- Types: ${project.project_types?.join(', ') || 'Not specified'}
- Requested services: ${project.services?.join(', ') || 'Not specified'}
${quoteInfo}

IMPORTANT INSTRUCTIONS:
1. The contract must be written in professional legal English
2. Include placeholders [TO BE COMPLETED] for missing or customizable information
3. Use today's date for the contract date: ${new Date().toLocaleDateString('en-US')}
4. The contract should be ready to sign with minimal modifications

Respond ONLY with a JSON object in the following format:
\`\`\`json
{
  "title": "${contractTypeLabel} - ${project.title || 'Project'}",
  "content": "The complete contract content in HTML with <h2>, <h3>, <p>, <ul>, <li> tags for formatting. Use appropriate line breaks."
}
\`\`\`
`

  return prompt
}
