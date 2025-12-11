import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { QuoteFormData } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ConversationMessage {
  role: "user" | "assistant"
  content: string
}

interface RequestBody {
  message: string
  quoteData: QuoteFormData
  projectDescription?: string
  conversationHistory: ConversationMessage[]
}

export async function POST(request: NextRequest) {
  try {
    const { message, quoteData, projectDescription, conversationHistory } = await request.json() as RequestBody

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const systemPrompt = buildSystemPrompt(quoteData, projectDescription)

    // Build messages array with conversation history
    const messages: { role: "user" | "assistant", content: string }[] = [
      ...conversationHistory.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user" as const, content: message }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Try to extract JSON modifications if present
    let modifications: Partial<QuoteFormData> | null = null
    let cleanMessage = responseText

    // Look for JSON block with modifications (```json ... ```)
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])
        // Validate that it looks like quote data (has at least one expected key)
        if (parsed && typeof parsed === 'object' &&
            (parsed.profiles || parsed.abaques || parsed.costing_categories ||
             parsed.transverse_levels || parsed.notes || parsed.discount_percent)) {
          modifications = parsed
          // Remove the JSON block from the message
          cleanMessage = responseText.replace(/```json\n?[\s\S]*?\n?```/g, '').trim()
        }
      } catch {
        // JSON parsing failed, no modifications
      }
    }

    // Also try to find inline JSON markers [MODIFICATIONS]...[/MODIFICATIONS]
    const inlineJsonMatch = responseText.match(/\[MODIFICATIONS\]([\s\S]*?)\[\/MODIFICATIONS\]/)
    if (inlineJsonMatch && !modifications) {
      try {
        const parsed = JSON.parse(inlineJsonMatch[1])
        if (parsed && typeof parsed === 'object') {
          modifications = parsed
          cleanMessage = responseText.replace(/\[MODIFICATIONS\][\s\S]*?\[\/MODIFICATIONS\]/g, '').trim()
        }
      } catch {
        // JSON parsing failed
      }
    }

    // Try to find any JSON object that looks like quote modifications (last resort)
    if (!modifications) {
      // Look for a JSON object that starts with { and contains quote-related keys
      const anyJsonMatch = responseText.match(/(\{[\s\S]*"(?:profiles|abaques|costing_categories|transverse_levels)"[\s\S]*\})/)
      if (anyJsonMatch) {
        try {
          const parsed = JSON.parse(anyJsonMatch[1])
          if (parsed && typeof parsed === 'object') {
            modifications = parsed
            cleanMessage = responseText.replace(anyJsonMatch[0], '').trim()
          }
        } catch {
          // JSON parsing failed
        }
      }
    }

    return NextResponse.json({
      message: cleanMessage || "J'ai effectué les modifications demandées.",
      modifications
    })
  } catch (error) {
    console.error('Error in quote AI assistant:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    )
  }
}

function buildSystemPrompt(quoteData: QuoteFormData, projectDescription?: string): string {
  const quoteContext = JSON.stringify(quoteData, null, 2)

  return `Tu es un assistant IA expert en chiffrage de projets informatiques. Tu aides l'ingénieur à modifier et optimiser ses devis.

## CONTEXTE DU PROJET
${projectDescription || "Pas de description disponible"}

## DEVIS ACTUEL
\`\`\`json
${quoteContext}
\`\`\`

## STRUCTURE DU DEVIS

Le devis est structuré ainsi :
- **profiles**: Liste des profils avec nom et taux journalier (daily_rate en €)
- **abaques**: Composants de référence avec jours par complexité (days_ts=très simple, days_s=simple, days_m=moyen, days_c=complexe, days_tc=très complexe)
- **transverse_levels**: Niveaux d'activités transverses (level) avec leurs activités (activities) de types: project_management, quality, documentation, meetings, training
- **costing_categories**: Catégories de chiffrage contenant des activités (activities), chaque activité ayant des composants (components) avec complexité et coefficient

## COMPLEXITÉS DISPONIBLES
- "tres_simple" (TS)
- "simple" (S)
- "moyen" (M)
- "complexe" (C)
- "tres_complexe" (TC)

## TES CAPACITÉS

Tu peux :
1. **Modifier les jours estimés** dans les abaques ou les composants
2. **Changer les coefficients** des composants (multiplicateur de la complexité)
3. **Modifier la complexité** des composants
4. **Ajouter des activités** dans les catégories existantes
5. **Supprimer des activités** ou composants
6. **Modifier les descriptions** des activités
7. **Ajuster les profils** (taux journaliers, noms)
8. **Modifier les activités transverses** et leurs pourcentages

## FORMAT DE RÉPONSE OBLIGATOIRE

Quand tu effectues des modifications, tu DOIS:

1. D'abord expliquer brièvement ce que tu vas modifier
2. Ensuite inclure un bloc JSON avec les modifications COMPLÈTES des sections concernées

IMPORTANT: Le bloc JSON doit contenir la TOTALITÉ de la section modifiée, pas seulement les éléments changés.
Par exemple, si tu modifies une activité dans costing_categories, inclus TOUTES les catégories avec TOUTES leurs activités.

Format OBLIGATOIRE:
\`\`\`json
{
  "costing_categories": [
    // LA LISTE COMPLETE des catégories avec leurs activités
  ]
}
\`\`\`

NE PAS inclure de commentaires dans le JSON.
NE PAS retourner le JSON dans le texte sans le bloc \`\`\`json.
TOUJOURS utiliser le format \`\`\`json ... \`\`\` pour le JSON.

## RÈGLES

1. Réponds TOUJOURS en français
2. Sois précis et concis dans tes explications
3. Si tu ne comprends pas la demande, demande des clarifications
4. Ne modifie que ce qui est demandé
5. Propose des alternatives si la demande n'est pas réalisable
6. Garde une approche professionnelle et pragmatique

## EXEMPLES DE DEMANDES

- "Réduis le temps de développement de 20%"
- "Ajoute une phase de tests unitaires"
- "Augmente la complexité du module paiement"
- "Supprime l'activité de formation"
- "Change le TJM du développeur senior à 600€"
- "Ajoute 2 jours de réunions client"`
}
