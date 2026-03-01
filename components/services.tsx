"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getPath } from "@/lib/utils-path"

export function Services() {
  const { t } = useLanguage()

  const services = [
    {
      number: "01",
      title: t('services.design.title'),
      tags: [t('services.tags.websites'), t('services.tags.mobileApps'), t('services.tags.platforms')],
      description: t('services.design.description'),
      slug: "design-maquettes",
    },
    {
      number: "02",
      title: t('services.webDev.title'),
      tags: [t('services.tags.showcaseSites'), t('services.tags.webApps'), t('services.tags.businessTools')],
      description: t('services.webDev.description'),
      slug: "developpement-web",
    },
    {
      number: "03",
      title: t('services.mobileDev.title'),
      tags: ["iPhone", "Android", t('services.tags.multiPlatform')],
      description: t('services.mobileDev.description'),
      slug: "developpement-mobile",
    },
    {
      number: "04",
      title: t('services.ai.title'),
      tags: [t('services.tags.automation'), t('services.tags.dataAnalysis'), t('services.tags.smartChatbots')],
      description: t('services.ai.description'),
      slug: "intelligence-artificielle",
    },
    {
      number: "05",
      title: t('services.iot.title'),
      tags: [t('services.tags.connectedDevices'), t('services.tags.sensors'), t('services.tags.prototyping')],
      description: t('services.iot.description'),
      slug: "iot-embarque",
    },
  ]

  return (
    <section id="services" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              {t('services.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="bg-white group relative h-full flex flex-col">
                <CardHeader>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {service.number}
                  </div>
                  <CardTitle className="text-lg font-semibold leading-tight">
                    {service.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {service.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {service.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit rounded-full"
                    onClick={() => {
                      window.location.href = getPath(`/services/${service.slug}`)
                    }}
                  >
                    {t('hero.moreDetails')}
                    <ArrowRight className="ml-2 w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
