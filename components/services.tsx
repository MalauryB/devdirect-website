"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getPath } from "@/lib/utils-path"

export function Services() {
  const { t } = useLanguage()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const services = [
    {
      number: "01",
      title: t('services.design.title'),
      tags: ["Saas Platform", "Web Platform", "Mobile App"],
      description: t('services.design.description'),
      slug: "design-maquettes",
    },
    {
      number: "02",
      title: t('services.webDev.title'),
      tags: ["React", "Next.js", "Node.js", "TypeScript"],
      description: t('services.webDev.description'),
      slug: "developpement-web",
    },
    {
      number: "03",
      title: t('services.mobileDev.title'),
      tags: ["React Native", "iOS", "Android", "Flutter"],
      description: t('services.mobileDev.description'),
      slug: "developpement-mobile",
    },
    {
      number: "04",
      title: t('services.ai.title'),
      tags: ["Machine Learning", "LLM", "Computer Vision", "NLP"],
      description: t('services.ai.description'),
      slug: "intelligence-artificielle",
    },
    {
      number: "05",
      title: t('services.iot.title'),
      tags: ["Embedded Systems", "Arduino", "Raspberry Pi", "Sensors"],
      description: t('services.iot.description'),
      slug: "iot-embarque",
    },
  ]

  return (
    <section id="services" className="py-20 relative overflow-hidden bg-white">
      {/* Title with container */}
      <div className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#141414]">
            {t('services.title')}
          </h2>
        </div>
      </div>

      {/* Full-width Accordion Services */}
      <div className="border-t border-gray-200">
        {services.map((service, index) => {
          const isHovered = hoveredIndex === index

          return (
            <div
              key={index}
              className={`
                border-b border-gray-200 transition-all duration-500 ease-out
                ${isHovered ? 'bg-[#ea4c89]/10' : 'bg-transparent'}
              `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto py-8">
                  <div className="flex items-start gap-8 md:gap-16">
                    {/* Number */}
                    <span className="text-sm text-gray-400 font-medium pt-2 min-w-[32px]">
                      {service.number}
                    </span>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Title */}
                      <h3 className="text-2xl md:text-3xl font-medium text-[#141414] mb-3">
                        {service.title}
                      </h3>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        {service.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="flex items-center gap-2">
                            {tagIndex > 0 && <span className="text-gray-300">•</span>}
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Expanded Content */}
                      <div
                        className={`
                          overflow-hidden transition-all duration-500 ease-out
                          ${isHovered ? 'max-h-48 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}
                        `}
                      >
                        <p className="text-gray-600 leading-relaxed max-w-2xl mb-6">
                          {service.description}
                        </p>

                        <Button
                          variant="outline"
                          className="rounded-full border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-white transition-colors"
                          onClick={() => {
                            window.location.href = getPath(`/services/${service.slug}`)
                          }}
                        >
                          {t('hero.moreDetails')}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
