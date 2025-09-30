"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useContact } from "@/contexts/contact-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useLanguage()
  const { openDialog } = useContact()

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-primary/20 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="mx-auto" style={{ maxWidth: "83rem" }}>
          <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-3xl font-bold logo-cubic text-black">
              {t('name')}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#services"
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              {t('navigation.services')}
            </a>
            <a
              href="#process"
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              {t('navigation.processus')}
            </a>
            <a href="#team" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              {t('navigation.equipe')}
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              {t('navigation.contact')}
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/50 hover:border-primary text-foreground hover:text-primary bg-transparent"
              onClick={openDialog}
            >
              {t('hero.cta')}
            </Button>
            <Button
              size="sm"
              className="bg-action hover:bg-action/90 text-white border-0"
              onClick={openDialog}
            >
              {t('navigation.contact')}
            </Button>
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden bg-white w-10 h-10 rounded-lg flex items-center justify-center border border-primary/30"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>

          {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-primary/20 pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#services" className="text-foreground hover:text-primary transition-colors font-medium">
                {t('navigation.services')}
              </a>
              <a href="#process" className="text-foreground hover:text-primary transition-colors font-medium">
                {t('navigation.processus')}
              </a>
              <a href="#team" className="text-foreground hover:text-primary transition-colors font-medium">
                {t('navigation.equipe')}
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
                {t('navigation.contact')}
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/50 hover:border-primary text-foreground bg-transparent"
                  onClick={openDialog}
                >
                  {t('hero.cta')}
                </Button>
                <Button
                  size="sm"
                  className="bg-action hover:bg-action/90 text-white border-0"
                  onClick={openDialog}
                >
                  {t('navigation.contact')}
                </Button>
                <div className="flex justify-center pt-2">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </nav>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg width="100%" height="2" className="block" viewBox="0 0 800 2" preserveAspectRatio="none">
          <path d="M 80 1 Q 400 1 600 1.5 T 720 1" stroke="#9ca3af" strokeWidth="1" fill="none" opacity="0.6" />
        </svg>
      </div>
    </header>
  )
}
