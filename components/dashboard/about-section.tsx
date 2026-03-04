"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Globe, Smartphone, Cpu, Palette, PenTool,
  MessageCircle, FileText, Code, Rocket,
  ArrowRight, Mail
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getPath } from "@/lib/utils-path"

interface AboutSectionProps {
  onNavigateToProjects: () => void
  userName: string
}

export function AboutSection({ onNavigateToProjects, userName }: AboutSectionProps) {
  const { t } = useLanguage()

  const steps = [
    { icon: MessageCircle, title: t('dashboard.about.steps.meeting.title'), description: t('dashboard.about.steps.meeting.description') },
    { icon: FileText, title: t('dashboard.about.steps.quote.title'), description: t('dashboard.about.steps.quote.description') },
    { icon: Code, title: t('dashboard.about.steps.build.title'), description: t('dashboard.about.steps.build.description') },
    { icon: Rocket, title: t('dashboard.about.steps.delivery.title'), description: t('dashboard.about.steps.delivery.description') },
  ]

  const services = [
    { icon: Globe, title: t('dashboard.about.services.web.title'), description: t('dashboard.about.services.web.description'), color: "bg-[#6cb1bb]" },
    { icon: Smartphone, title: t('dashboard.about.services.mobile.title'), description: t('dashboard.about.services.mobile.description'), color: "bg-[#ba9fdf]" },
    { icon: Cpu, title: t('dashboard.about.services.iot.title'), description: t('dashboard.about.services.iot.description'), color: "bg-[#9c984d]" },
    { icon: Palette, title: t('dashboard.about.services.ai.title'), description: t('dashboard.about.services.ai.description'), color: "bg-[#ea4c89]" },
    { icon: PenTool, title: t('dashboard.about.services.design.title'), description: t('dashboard.about.services.design.description'), color: "bg-[#7f7074]" },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto py-6 space-y-20">
      {/* Section 1 — Hero d'accueil */}
      <div>
        <h2 className="text-lg font-medium mb-2 text-foreground">
          {t('dashboard.about.welcome')}{userName ? `, ${userName}` : ''}
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          {t('dashboard.about.welcomeSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="sm" onClick={() => window.location.href = getPath('/devis')}>
            <Mail className="mr-2 w-4 h-4" />
            {t('dashboard.about.ctaDevis')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToProjects}
          >
            {t('dashboard.about.ctaProjects')}
            <ArrowRight className="ml-2 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Section 2 — Process */}
      <div>
        <h3 className="text-base font-medium mb-2">{t('dashboard.about.processTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-8">{t('dashboard.about.processSubtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full border-muted">
                <CardContent className="p-5 text-center">
                  <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs bg-primary">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-2">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2.5 w-5 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Services */}
      <div>
        <h3 className="text-base font-medium mb-8">{t('dashboard.about.servicesTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group transition-colors hover:border-primary/30 border-muted"
            >
              <CardContent className="p-5">
                <div className={`w-8 h-8 ${service.color} rounded-md flex items-center justify-center mb-4`}>
                  <service.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium mb-1">{service.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 4 — CTA final */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/15">
        <CardContent className="py-10 px-8 text-center">
          <h3 className="text-base font-medium mb-3">{t('dashboard.about.ctaTitle')}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {t('dashboard.about.ctaDescription')}
          </p>
          <Button size="sm" className="mb-4" onClick={() => window.location.href = getPath('/devis')}>
            <Mail className="mr-2 w-4 h-4" />
            {t('dashboard.about.ctaDevis')}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.about.ctaGuarantee')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
