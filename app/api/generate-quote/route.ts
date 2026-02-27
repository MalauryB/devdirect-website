import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Project, QuoteFormData } from '@/lib/types'
import { requireAuth } from '@/lib/auth'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth(request)
  if (authError) return authError

  try {
    const { project } = await request.json() as { project: Project }

    if (!project) {
      return NextResponse.json({ error: 'Project data is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = buildPrompt(project)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response from Claude
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
    const jsonString = jsonMatch ? jsonMatch[1] : responseText

    let quoteData: Partial<QuoteFormData>
    try {
      quoteData = JSON.parse(jsonString)
    } catch {
      console.error('Failed to parse Claude response:', responseText)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    return NextResponse.json({ quote: quoteData })
  } catch (error) {
    console.error('Error generating quote:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quote' },
      { status: 500 }
    )
  }
}

function buildPrompt(project: Project): string {
  const budgetLabels: Record<string, string> = {
    small: '< 5 000 €',
    medium: '5 000 € - 15 000 €',
    large: '15 000 € - 50 000 €',
    xlarge: '> 50 000 €',
    flexible: 'Flexible'
  }

  const deadlineLabels: Record<string, string> = {
    urgent: '< 1 mois',
    short: '1-3 mois',
    medium: '3-6 mois',
    long: '> 6 mois',
    flexible: 'Flexible'
  }

  return `Tu es un expert en chiffrage de projets informatiques pour une agence de développement web/mobile/IA.

Analyse ce projet et génère un devis structuré.

## INFORMATIONS DU PROJET

**Titre:** ${project.title}

**Types de projet:** ${project.project_types?.join(', ') || 'Non spécifié'}

**Services demandés:** ${project.services?.join(', ') || 'Non spécifié'}

**Plateformes cibles:** ${project.platforms?.join(', ') || 'Non spécifié'}

**Description:**
${project.description || 'Non fournie'}

**Fonctionnalités souhaitées:**
${project.features || 'Non spécifiées'}

**Public cible:**
${project.target_audience || 'Non spécifié'}

**Projet existant:** ${project.has_existing_project ? 'Oui' : 'Non'}
${project.existing_technologies ? `**Technologies existantes:** ${project.existing_technologies}` : ''}

**Besoin de design:** ${project.needs_design === 'yes' ? 'Oui, design complet' : project.needs_design === 'partial' ? 'Partiel' : 'Non'}

**Budget indicatif:** ${budgetLabels[project.budget] || project.budget}

**Délai souhaité:** ${deadlineLabels[project.deadline] || project.deadline}

${project.additional_info ? `**Informations complémentaires:**\n${project.additional_info}` : ''}

## INSTRUCTIONS

Génère un devis avec la structure JSON suivante. Sois réaliste et détaillé.

### Profils disponibles (choisis parmi ceux-ci):
- "Développeur Junior" (TJM: 350€)
- "Développeur Senior" (TJM: 550€)
- "Lead Développeur" (TJM: 700€)
- "Designer UI/UX" (TJM: 450€)
- "Chef de projet" (TJM: 500€)
- "DevOps" (TJM: 550€)
- "Data Scientist" (TJM: 600€)

### Niveaux de complexité pour les abaques:
- ts: Très Simple (0.5 jour)
- s: Simple (1 jour)
- m: Moyen (2 jours)
- c: Complexe (3-5 jours)
- tc: Très Complexe (5-10 jours)

### Format de réponse (JSON uniquement):

\`\`\`json
{
  "name": "Nom descriptif du devis",
  "comment": "Commentaire général sur le projet et les hypothèses",
  "profiles": [
    { "name": "Nom du profil", "daily_rate": 550 }
  ],
  "abaques": [
    {
      "component_name": "Nom du composant (ex: Page web, API endpoint, Écran mobile...)",
      "profile_name": "Nom du profil associé",
      "days_ts": 0.5,
      "days_s": 1,
      "days_m": 2,
      "days_c": 4,
      "days_tc": 8
    }
  ],
  "transverse_levels": [
    {
      "level": 0,
      "activities": [
        {
          "name": "Gestion de projet",
          "profile_name": "Chef de projet",
          "type": "rate",
          "value": 15
        },
        {
          "name": "Recette et tests",
          "profile_name": "Développeur Senior",
          "type": "rate",
          "value": 10
        }
      ]
    }
  ],
  "costing_categories": [
    {
      "name": "Nom de la catégorie (ex: Backend, Frontend, Design...)",
      "activities": [
        {
          "name": "Nom de l'activité",
          "active": true,
          "components": [
            {
              "coefficient": 1,
              "component_name": "Référence à un abaque",
              "complexity": "m",
              "comment": "Description optionnelle"
            }
          ]
        }
      ]
    }
  ],
  "notes": "Notes pour le client",
  "payment_terms": "30% à la commande, 40% à mi-parcours, 30% à la livraison",
  "validity_days": 30
}
\`\`\`

IMPORTANT:
- Chaque component_name dans costing_categories doit correspondre à un component_name défini dans abaques
- Les profile_name dans abaques et transverse_levels doivent correspondre aux profiles définis
- Adapte le nombre de jours dans les abaques selon la complexité réelle du projet
- Le type "rate" dans transverse_levels signifie un pourcentage du total des éléments de chiffrage
- Le type "fixed" signifie un nombre fixe de jours
- Génère des catégories logiques selon le projet (Backend, Frontend, Mobile, Design, Infrastructure, etc.)
- Sois réaliste sur les estimations de temps

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`
}
