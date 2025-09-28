"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-primary/20 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold" style={{ color: "#bda3cc" }}>
              Cortex
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#services"
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Services
            </a>
            <a
              href="#process"
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Processus
            </a>
            <a href="#team" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              Équipe
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Contact
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/50 hover:border-primary text-foreground hover:text-primary bg-transparent"
            >
              Devis Gratuit
            </Button>
            <Button
              size="sm"
              className="border border-gray-300 hover:border-gray-400 bg-transparent hover:bg-transparent"
              style={{ color: "#bda3cc" }}
            >
              Nous Contacter
            </Button>
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
                Services
              </a>
              <a href="#process" className="text-foreground hover:text-primary transition-colors font-medium">
                Processus
              </a>
              <a href="#team" className="text-foreground hover:text-primary transition-colors font-medium">
                Équipe
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/50 hover:border-primary text-foreground bg-transparent"
                >
                  Devis Gratuit
                </Button>
                <Button
                  size="sm"
                  className="border border-gray-300 hover:border-gray-400 bg-transparent hover:bg-transparent"
                  style={{ color: "#bda3cc" }}
                >
                  Nous Contacter
                </Button>
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
