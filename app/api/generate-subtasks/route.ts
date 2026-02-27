import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ProjectMilestone } from '@/lib/types'
import { requireEngineer } from '@/lib/auth'
import { parseAIJsonResponse } from '@/lib/ai-helpers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface GeneratedSubtask {
  title: string
  description: string
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireEngineer(request)
  if (authError) return authError

  try {
    const { milestone, projectContext } = await request.json() as {
      milestone: ProjectMilestone
      projectContext?: string
    }

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone data is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = buildPrompt(milestone, projectContext)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response from Claude
    let subtasks: GeneratedSubtask[]
    try {
      const parsed = parseAIJsonResponse(responseText)
      subtasks = parsed.subtasks || parsed
    } catch {
      console.error('Failed to parse Claude response:', responseText)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    return NextResponse.json({ subtasks })
  } catch (error) {
    console.error('Generate subtasks error:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}

function buildPrompt(milestone: ProjectMilestone, projectContext?: string): string {
  return `Tu es un expert en gestion de projets informatiques.

Décompose cette étape de projet (milestone) en sous-tâches concrètes et actionnables.

## ÉTAPE À DÉCOMPOSER

**Titre:** ${milestone.title}

**Description:** ${milestone.description || 'Non fournie'}

${projectContext ? `## CONTEXTE DU PROJET\n${projectContext}\n` : ''}

## INSTRUCTIONS

Génère entre 3 et 8 sous-tâches pour accomplir cette étape. Chaque sous-tâche doit être:
- Concrète et actionnable
- Suffisamment petite pour être réalisée en quelques heures à 1-2 jours
- Claire et sans ambiguïté

### Format de réponse (JSON uniquement):

\`\`\`json
{
  "subtasks": [
    {
      "title": "Titre court et clair",
      "description": "Description de ce qui doit être fait"
    }
  ]
}
\`\`\`

IMPORTANT:
- Les sous-tâches doivent être ordonnées logiquement (dépendances)
- Adapte le nombre de sous-tâches à la complexité de l'étape
- Chaque sous-tâche doit représenter une action concrète

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`
}
