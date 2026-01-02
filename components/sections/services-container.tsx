"use client"

import { ServiceCard } from "@/components/presentational/service-card"
import { SectionHeader } from "@/components/presentational/section-header"
import { useServices } from "@/hooks/use-services"

export function ServicesContainer() {
  const { services, handleServiceDetails } = useServices()

  return (
    <section id="services" className="py-20 px-4 relative overflow-hidden bg-[#141414] rounded-3xl">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Nos"
            highlight="Services"
            description="De l'idée à la réalisation, nous maîtrisons toutes les technologies pour donner vie à vos projets digitaux."
            className="text-white [&_p]:text-white/70 [&_span]:text-[#ea4c89]"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onDetailsClick={handleServiceDetails}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}