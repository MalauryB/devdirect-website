"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, getTranslation } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLanguage(savedLang)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language)
    }
  }, [language, mounted])

  const t = (key: string) => getTranslation(language, key)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          {children}
        </div>
      </div>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Return default values for SSR/SSG
    return {
      language: 'fr' as Language,
      setLanguage: () => {},
      t: (key: string) => getTranslation('fr', key)
    }
  }
  return context
}