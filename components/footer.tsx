"use client"

import { Code2, Mail, Phone, MapPin } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-white border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold" style={{ color: "#bda3cc" }}>
                {t('name')}
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contact@memory.fr</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-medium mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('services.webDev.title')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('services.mobileDev.title')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('services.iot.title')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('services.ai.title')}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-medium mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('navigation.equipe')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('navigation.processus')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 {t('name')}. {t('footer.rights')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
