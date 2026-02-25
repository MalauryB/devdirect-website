"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Lien expiré ou invalide
          </h1>

          <p className="text-muted-foreground mb-6">
            Le lien de confirmation a expiré ou est invalide.
            Veuillez demander un nouveau lien de confirmation.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Retour à l'accueil
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/devis')}
              className="w-full"
            >
              Créer un nouveau compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
