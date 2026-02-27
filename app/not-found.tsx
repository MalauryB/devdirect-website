import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-foreground/40">404</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Page introuvable</h2>
        <p className="text-foreground/60 mb-6">
          La page que vous recherchez n&apos;existe pas ou a &eacute;t&eacute; d&eacute;plac&eacute;e.
        </p>
        <Button asChild className="bg-primary text-white">
          <Link href="/">Retour &agrave; l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  )
}
