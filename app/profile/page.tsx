"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/")
    }
  }, [user, loading, router, mounted])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">{t('profile.loading')}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-foreground hover:bg-primary/5"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('profile.back')}
            </Link>
          </Button>

          <div className="bg-white rounded-xl border border-primary/20 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-action/10 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-action text-action flex items-center justify-center text-2xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t('profile.title')}
                  </h1>
                  <p className="text-foreground/60">{t('profile.subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-primary/10 pb-2">
                  {t('profile.personalInfo')}
                </h2>

                <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-primary/10">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground/60">{t('profile.email')}</p>
                    <p className="font-medium text-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-primary/10">
                  <User className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground/60">{t('profile.userId')}</p>
                    <p className="font-medium text-foreground text-sm">{user.id}</p>
                  </div>
                </div>

                {createdAt && (
                  <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-primary/10">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-foreground/60">{t('profile.createdAt')}</p>
                      <p className="font-medium text-foreground">{createdAt}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
