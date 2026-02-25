"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useContact } from "@/contexts/contact-context"
import { getPath } from "@/lib/utils-path"

export function CTA() {
  const { t } = useLanguage()
  const { openDialog } = useContact()

  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t('cta.title')}</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              {t('cta.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="text-lg px-8" onClick={openDialog}>
                <Phone className="mr-2 w-5 h-5" />
                {t('navigation.contact')}
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" onClick={() => window.location.href = getPath('/devis')}>
                <Mail className="mr-2 w-5 h-5" />
                {t('cta.button')}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {t('cta.guarantee')}
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
