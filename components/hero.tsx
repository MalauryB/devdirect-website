"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { VoxelWebDev } from "@/components/voxel-web-dev"
import { useLanguage } from "@/contexts/language-context"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="pt-8 pb-20 px-4 relative overflow-hidden bg-white">
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Modèle 3D de développement web à gauche */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl">
              <VoxelWebDev className="w-full h-full" />
            </div>
          </div>

          {/* Contenu principal à droite */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-semibold mb-6 text-balance leading-tight">
            {t('hero.title')}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-3xl">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="text-base px-8 bg-primary hover:bg-primary/90 text-primary-foreground border border-action" onClick={() => window.location.href = '/devis'}>
              {t('hero.cta')}
              <div className="ml-2 w-6 h-6 bg-action rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 border-primary/50 text-foreground bg-white hover:bg-white/90"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.moreDetails')}
            </Button>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-border rounded-xl p-6">
                  <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
                  <h3 className="font-medium mb-2">{t('hero.features.freeMeeting.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('hero.features.freeMeeting.description')}</p>
                </div>
                <div className="bg-white border border-border rounded-xl p-6">
                  <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
                  <h3 className="font-medium mb-2">{t('hero.features.transparentQuote.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('hero.features.transparentQuote.description')}</p>
                </div>
                <div className="bg-white border border-border rounded-xl p-6">
                  <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
                  <h3 className="font-medium mb-2">{t('hero.features.fullSupport.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('hero.features.fullSupport.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
