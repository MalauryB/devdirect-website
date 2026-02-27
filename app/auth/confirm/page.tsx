"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { validateRedirectUrl } from "@/lib/validate-redirect"
import { Loader2, CheckCircle } from "lucide-react"

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type') as 'signup' | 'recovery' | 'email'
      const next = validateRedirectUrl(searchParams.get('next'))

      if (!token_hash || !type) {
        setStatus('error')
        setMessage('Paramètres manquants')
        return
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        })

        if (error) {
          setStatus('error')
          setMessage(error.message)
          setTimeout(() => router.push('/auth/error'), 2000)
        } else {
          setStatus('success')
          setMessage('Email confirmé ! Redirection...')

          // Small delay to show success message
          setTimeout(() => {
            router.push(next)
          }, 1500)
        }
      } catch {
        setStatus('error')
        setMessage('Une erreur est survenue')
        setTimeout(() => router.push('/auth/error'), 2000)
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-muted-foreground mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Confirmation en cours...
              </h1>
              <p className="text-muted-foreground">
                Veuillez patienter pendant que nous vérifions votre email.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Email confirmé !
              </h1>
              <p className="text-muted-foreground">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">!</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Erreur
              </h1>
              <p className="text-muted-foreground">
                {message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
