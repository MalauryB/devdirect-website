"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getPath } from "@/lib/utils-path"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="pt-20 pb-20 px-4 relative overflow-hidden bg-background">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-semibold mb-6 text-balance leading-tight">
            {t('hero.title')}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
            <Button size="lg" className="text-base px-8" onClick={() => window.location.href = getPath('/devis')}>
              {t('hero.cta')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 border-primary/50"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.moreDetails')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white text-center">
              <CardContent>
                <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-2">{t('hero.features.freeMeeting.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('hero.features.freeMeeting.description')}</p>
              </CardContent>
            </Card>
            <Card className="bg-white text-center">
              <CardContent>
                <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-2">{t('hero.features.transparentQuote.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('hero.features.transparentQuote.description')}</p>
              </CardContent>
            </Card>
            <Card className="bg-white text-center">
              <CardContent>
                <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-2">{t('hero.features.turnkey.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('hero.features.turnkey.description')}</p>
              </CardContent>
            </Card>
            <Card className="bg-white text-center">
              <CardContent>
                <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-2">{t('hero.features.fullSupport.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('hero.features.fullSupport.description')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
