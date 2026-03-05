"use client"

import Image from "next/image"
import { Code2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useContact } from "@/contexts/contact-context"

export function Footer() {
  const { t } = useLanguage()
  const { openDialog } = useContact()
  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Image src="/logo_nimli.png" alt="Nimli" width={100} height={40} className="h-8 w-auto" />
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t('footer.description')}
            </p>
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
                <button
                  onClick={openDialog}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {t('footer.contact')}
                </button>
              </li>
            </ul>
          </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 {t('name')}. {t('footer.rights')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
