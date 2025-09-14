import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden bg-white">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-semibold mb-6 text-balance leading-tight">
            Développez vos projets avec des <span className="text-primary">experts directs</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-3xl">
            Une équipe de développeurs passionnés qui travaillent directement pour vous. De l'IoT aux applications web
            et mobiles, nous concrétisons vos idées.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="text-base px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              Devis Gratuit
              <div className="ml-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4" style={{ color: "#bda3cc" }} />
              </div>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 border-primary/50 text-foreground bg-white hover:bg-white/90"
            >
              Découvrir nos services
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white border border-border rounded-xl p-6">
              <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
              <h3 className="font-medium mb-2">Première rencontre gratuite</h3>
              <p className="text-sm text-muted-foreground">Analysons ensemble vos besoins</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-6">
              <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
              <h3 className="font-medium mb-2">Devis transparent</h3>
              <p className="text-sm text-muted-foreground">Pas de surprises, tout est clair</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-6">
              <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
              <h3 className="font-medium mb-2">Accompagnement A à Z</h3>
              <p className="text-sm text-muted-foreground">De l'idée à la mise en ligne</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
