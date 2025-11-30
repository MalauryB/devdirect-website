"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useLanguage()
  const { user, openAuthModal, signOut } = useAuth()

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

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-white border-2 border-action text-action flex items-center justify-center hover:bg-action/10 transition-colors focus:outline-none">
                    <span className="text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-primary/20 shadow-lg">
                  <div className="px-3 py-3 border-b border-primary/10">
                    <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5 py-2.5 flex items-center">
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-3 text-foreground flex-shrink-0" />
                      <span className="text-foreground">{t('navigation.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/10" />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5 py-2.5 text-foreground focus:text-foreground flex items-center"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>{t('navigation.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white border-primary/30 hover:bg-primary/5"
                onClick={openAuthModal}
              >
                <User className="w-4 h-4" />
                {t('navigation.login')}
              </Button>
            )}
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
              <div className="flex flex-col items-center gap-4 pt-4">
                <LanguageSwitcher />
                {user ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex items-center gap-3 pb-3 border-b border-primary/10 w-full justify-center">
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-action text-action flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-center gap-2 bg-white border-primary/20 hover:bg-primary/5 w-full"
                      asChild
                    >
                      <Link href="/profile">
                        <User className="w-4 h-4 text-foreground flex-shrink-0" />
                        <span>{t('navigation.profile')}</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-center gap-2 bg-white border-primary/20 hover:bg-primary/5 w-full"
                      onClick={() => signOut()}
                    >
                      <LogOut className="w-4 h-4 text-foreground flex-shrink-0" />
                      <span>{t('navigation.logout')}</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-white border-primary/30 hover:bg-primary/5"
                    onClick={openAuthModal}
                  >
                    <User className="w-4 h-4" />
                    {t('navigation.login')}
                  </Button>
                )}
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
