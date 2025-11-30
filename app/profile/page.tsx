"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Calendar, Phone, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, UserMetadata } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.user_metadata) {
      setFirstName(user.user_metadata.first_name || "")
      setLastName(user.user_metadata.last_name || "")
      setPhone(user.user_metadata.phone || "")
    }
  }, [user])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/")
    }
  }, [user, loading, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    const metadata: UserMetadata = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    }

    const { error: updateError } = await updateProfile(metadata)

    if (updateError) {
      setError(t('profile.error'))
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setSaving(false)
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 text-foreground hover:bg-action/10 hover:text-action"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('profile.back')}
            </Link>
          </Button>

          <div className="bg-white rounded-xl border border-primary/20 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-action/10 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-action text-action flex items-center justify-center text-xl font-bold">
                  {firstName ? firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {firstName || lastName
                      ? `${firstName} ${lastName}`.trim()
                      : t('profile.title')}
                  </h1>
                  <p className="text-sm text-foreground/60">{t('profile.subtitle')}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-sm">{t('profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t('profile.firstNamePlaceholder')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={saving}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-sm">{t('profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t('profile.lastNamePlaceholder')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={saving}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm">{t('profile.phone')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('profile.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={saving}
                    className="pl-10 h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg border border-primary/10">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/60">{t('profile.email')}</p>
                    <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-background rounded-lg border border-primary/10">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-foreground/60">{t('profile.createdAt')}</p>
                    <p className="text-sm font-medium text-foreground">{createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-background rounded-lg border border-primary/10">
                  <div className="w-4 h-4 text-primary flex-shrink-0 text-xs font-bold">ID</div>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/60">{t('profile.userId')}</p>
                    <p className="text-xs font-medium text-foreground truncate">{user.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {t('profile.success')}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-white hover:bg-primary/5 text-foreground border-2 border-action h-9"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('profile.save')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
