'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { CheckCircle, Rocket, Users, Clock, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useContact } from "@/contexts/contact-context"
import { getPath } from "@/lib/utils-path"
import { getImagePath } from "@/lib/assets"

interface ServiceDetailProps {
  slug: string
}

export function ServiceDetail({ slug }: ServiceDetailProps) {
  const router = useRouter()
  const { t, tRaw } = useLanguage()
  const { openDialog } = useContact()

  const title = t(`serviceDetail.${slug}.title`)
  if (title === `serviceDetail.${slug}.title`) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service non trouvé</h1>
          <Button onClick={() => router.push("/")}>{t('serviceDetail.common.getQuote')}</Button>
        </div>
      </div>
    )
  }

  const subtitle = t(`serviceDetail.${slug}.subtitle`)
  const description = t(`serviceDetail.${slug}.description`)
  const image = t(`serviceDetail.${slug}.image`)
  const whatWeOffer = tRaw(`serviceDetail.${slug}.whatWeOffer`) as string[]
  const technologies = tRaw(`serviceDetail.${slug}.technologies`) as Array<{ name: string; items: string[] }>
  const process = tRaw(`serviceDetail.${slug}.process`) as Array<{ title: string; description: string; duration: string }>
  const pricing = tRaw(`serviceDetail.${slug}.pricing`) as Record<string, { title: string; marketPrice?: string; price: string; features: string[] }>
  const faqs = tRaw(`serviceDetail.${slug}.faqs`) as Array<{ question: string; answer: string }>

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 -mt-20 pt-36 pb-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              className="mb-8"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('navigation.accueil')}
            </Button>

            {image && (
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-8">
                <img
                  src={getImagePath(image)}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{subtitle}</p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">{description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => window.location.href = getPath("/devis")}>
                  {t('serviceDetail.common.getQuote')}
                </Button>
                <Button size="lg" variant="outline" onClick={openDialog}>
                  {t('serviceDetail.common.contactUs')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              {t('serviceDetail.common.whatWeOffer')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {whatWeOffer.map((item: string, index: number) => (
                <Card key={index} className="bg-white">
                  <CardContent className="flex items-start gap-3 p-5">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              {t('serviceDetail.common.technologies')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technologies.map((category: { name: string; items: string[] }, index: number) => (
                <Card key={index} className="bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {category.items.map((tech: string, techIndex: number) => (
                      <Badge key={techIndex} variant="secondary" className="text-sm">
                        {tech}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              {t('serviceDetail.common.ourProcess')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {process.map((step: { title: string; description: string; duration: string }, index: number) => (
                <Card key={index} className="bg-white relative h-full">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{step.title}</CardTitle>
                    <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {step.duration}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              {t('serviceDetail.common.pricing')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {['small', 'medium', 'large'].map((tier) => {
                const plan = pricing[tier]
                if (!plan) return null
                const isHighlighted = tier === 'medium'
                return (
                  <Card
                    key={tier}
                    className={`bg-white h-full flex flex-col ${isHighlighted ? 'border-primary border-2' : ''}`}
                  >
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg font-semibold">{plan.title}</CardTitle>
                      {plan.marketPrice && (
                        <div className="text-base text-muted-foreground line-through mt-2">
                          {plan.marketPrice}
                        </div>
                      )}
                      <div className="text-2xl font-bold text-primary mt-1">{plan.price}</div>
                      {plan.marketPrice && (
                        <Badge className="bg-primary/10 text-primary border-0 mt-1">{t('serviceDetail.common.pricingBadge')}</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2.5">
                        {plan.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t('serviceDetail.common.pricingDisclaimer')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              {t('serviceDetail.common.faq')}
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq: { question: string; answer: string }, index: number) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  {t('serviceDetail.common.ctaTitle')}
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {t('serviceDetail.common.ctaDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => window.location.href = getPath("/devis")}>
                    <Rocket className="mr-2 w-5 h-5" />
                    {t('serviceDetail.common.ctaQuote')}
                  </Button>
                  <Button size="lg" variant="outline" onClick={openDialog}>
                    <Users className="mr-2 w-5 h-5" />
                    {t('serviceDetail.common.ctaSpeakExpert')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
