'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Une erreur est survenue</h2>
        <p className="text-foreground/60 mb-6">
          Quelque chose s&apos;est mal pass&eacute;. Veuillez r&eacute;essayer.
        </p>
        <Button onClick={reset} className="bg-primary text-white">
          R&eacute;essayer
        </Button>
      </div>
    </div>
  )
}
