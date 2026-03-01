import { fr } from './fr'
import { en } from './en'

export const translations = { fr, en }

export type Language = 'fr' | 'en'
export type TranslationKey = keyof typeof translations.fr

export function getTranslation(lang: Language, key: string): any {
  const keys = key.split('.')
  let value: any = translations[lang]

  for (const k of keys) {
    value = value?.[k]
  }

  return value || key
}
