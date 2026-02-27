import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Project } from '@/lib/types'
import { requireEngineer } from '@/lib/auth'
import { parseAIJsonResponse } from '@/lib/ai-helpers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface GeneratedMilestone {
  title: string
  description: string
  due_date?: string
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireEngineer(request)
  if (authError) return authError

  try {
    const { project, startDate } = await request.json() as { project: Project; startDate?: string }

    if (!project) {
      return NextResponse.json({ error: 'Project data is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = buildPrompt(project, startDate)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response from Claude
    let milestones: GeneratedMilestone[]
    try {
      const parsed = parseAIJsonResponse(responseText)
      milestones = parsed.milestones || parsed
    } catch {
      console.error('Failed to parse Claude response:', responseText)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    return NextResponse.json({ milestones })
  } catch (error) {
    console.error('Generate roadmap error:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}

function buildPrompt(project: Project, startDate?: string): string {
  const deadlineLabels: Record<string, string> = {
    urgent: '< 1 mois',
    short: '1-3 mois',
    medium: '3-6 mois',
    long: '> 6 mois',
    flexible: 'Flexible'
  }

  const today = startDate || new Date().toISOString().split('T')[0]

  return `Tu es un expert en gestion de projets informatiques.

Analyse ce projet et génère une roadmap avec des étapes clés (milestones) pour suivre l'avancement.

## INFORMATIONS DU PROJET

**Titre:** ${project.title}

**Types de projet:** ${project.project_types?.join(', ') || 'Non spécifié'}

**Services demandés:** ${project.services?.join(', ') || 'Non spécifié'}

**Plateformes cibles:** ${project.platforms?.join(', ') || 'Non spécifié'}

**Description:**
${project.description || 'Non fournie'}

**Fonctionnalités souhaitées:**
${project.features || 'Non spécifiées'}

**Projet existant:** ${project.has_existing_project ? 'Oui' : 'Non'}
${project.existing_technologies ? `**Technologies existantes:** ${project.existing_technologies}` : ''}

**Besoin de design:** ${project.needs_design === 'yes' ? 'Oui, design complet' : project.needs_design === 'partial' ? 'Partiel' : 'Non'}

**Délai souhaité:** ${deadlineLabels[project.deadline] || project.deadline}

${project.additional_info ? `**Informations complémentaires:**\n${project.additional_info}` : ''}

## INSTRUCTIONS

Génère une roadmap réaliste avec 5 à 10 étapes clés. La date de début est le ${today}.

Chaque milestone doit:
- Avoir un titre court et clair
- Avoir une description expliquant ce qui sera livré/validé
- Avoir une date d'échéance réaliste (format YYYY-MM-DD)

Les milestones doivent couvrir:
1. Phase de lancement/kick-off
2. Phases de conception (si design nécessaire)
3. Phases de développement (découpées logiquement)
4. Phase de tests/recette
5. Phase de mise en production

### Format de réponse (JSON uniquement):

\`\`\`json
{
  "milestones": [
    {
      "title": "Kick-off projet",
      "description": "Réunion de lancement, validation du périmètre et des spécifications",
      "due_date": "2024-01-15"
    },
    {
      "title": "Livraison maquettes",
      "description": "Validation des maquettes UI/UX pour toutes les pages principales",
      "due_date": "2024-01-30"
    }
  ]
}
\`\`\`

IMPORTANT:
- Les dates doivent être cohérentes avec le délai souhaité
- Les milestones doivent être ordonnés chronologiquement
- Adapte le nombre de milestones à la complexité du projet
- Chaque milestone doit représenter un livrable ou une validation concrète

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`
}
