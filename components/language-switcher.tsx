"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import type { Language } from "@/lib/translations"
import { ChevronDown } from "lucide-react"

const locales = [
  { code: 'fr' as Language, name: 'FR', flag: '🇫🇷' },
  { code: 'en' as Language, name: 'EN', flag: '🇺🇸' }
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLocale = locales.find(locale => locale.code === language) || locales[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{currentLocale.flag}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => {
                setLanguage(locale.code)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                language === locale.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">{locale.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay pour fermer le dropdown en cliquant à l'extérieur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}