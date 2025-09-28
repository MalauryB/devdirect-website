import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Service } from "@/data/services"
import { getImagePath } from "@/lib/assets"

interface ServiceCardProps {
  service: Service
  onDetailsClick?: (serviceId: string) => void
  className?: string
}

export function ServiceCard({ service, onDetailsClick, className = "" }: ServiceCardProps) {
  const Icon = service.icon

  return (
    <Card className={`bg-white border-0 rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      <div className="aspect-video bg-white rounded-t-2xl px-3 pt-4">
        <div className="w-full h-full bg-gray-100 rounded-t-xl overflow-hidden">
          <img
            src={getImagePath(service.image)}
            alt={`Illustration pour ${service.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {service.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground leading-relaxed text-sm">
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="ghost"
          onClick={() => onDetailsClick?.(service.id)}
          className="text-foreground hover:text-primary hover:bg-primary/10 p-0 h-auto font-medium group/btn"
        >
          En savoir plus
          <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  )
}