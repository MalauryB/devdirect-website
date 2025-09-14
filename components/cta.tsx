import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail } from "lucide-react"

export function CTA() {
  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Prêt à démarrer votre projet ?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Contactez-nous dès aujourd'hui pour une première rencontre gratuite et un devis personnalisé.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="text-lg px-8">
                <Phone className="mr-2 w-5 h-5" />
                Appeler maintenant
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Mail className="mr-2 w-5 h-5" />
                Envoyer un email
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Réponse garantie sous 24h • Devis gratuit • Sans engagement
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
