import { useState, useCallback } from "react"
import { servicesData, Service } from "@/data/services"

export function useServices() {
  const [services] = useState<Service[]>(servicesData)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const handleServiceDetails = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setSelectedService(service)
      // Ici on pourrait ajouter de la logique comme ouvrir une modal, router, etc.
    }
  }, [services])

  const resetSelection = useCallback(() => {
    setSelectedService(null)
  }, [])

  return {
    services,
    selectedService,
    handleServiceDetails,
    resetSelection,
  }
}