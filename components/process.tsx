"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, FileText, Code, Rocket } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function Process() {
  const { t } = useLanguage()

  const steps = [
    {
      icon: MessageCircle,
      title: t('process.analysis.title'),
      description: t('process.analysis.description'),
      duration: "2-3 jours",
    },
    {
      icon: FileText,
      title: t('process.development.title'),
      description: t('process.development.description'),
      duration: "Selon le projet",
    },
    {
      icon: Code,
      title: t('process.testing.title'),
      description: t('process.testing.description'),
      duration: "Variable",
    },
    {
      icon: Rocket,
      title: t('process.deployment.title'),
      description: t('process.deployment.description'),
      duration: "1-2 jours",
    },
  ]
  return (
    <section id="process" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              {t('process.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t('process.analysis.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full bg-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-gray-500" />
                  </div>
                  <div
                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: "#7d7490" }}
                  >
                    {index + 1}
                  </div>
                  <CardTitle className="text-base font-medium">{step.title}</CardTitle>
                  <div className="text-sm text-primary font-medium">{step.duration}</div>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
              )}
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
