import { fr } from './fr'
import { en } from './en'

export const translations = { fr, en }

export type Language = 'fr' | 'en'
export type TranslationKey = keyof typeof translations.fr

export function getTranslation(lang: Language, key: string): unknown {
  const keys = key.split('.')
  let value: Record<string, unknown> | unknown = translations[lang]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }

  return value || key
}
