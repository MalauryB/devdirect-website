"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Settings, FileText, MessageSquare, Bell, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function DashboardPage() {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-foreground">{t('dashboard.loading')}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const firstName = user.user_metadata?.first_name || ""
  const lastName = user.user_metadata?.last_name || ""
  const displayName = firstName || lastName
    ? `${firstName} ${lastName}`.trim()
    : user.email?.split("@")[0]

  const menuItems = [
    {
      icon: User,
      label: t('dashboard.menu.profile'),
      description: t('dashboard.menu.profileDesc'),
      href: "/profile"
    },
    {
      icon: FileText,
      label: t('dashboard.menu.projects'),
      description: t('dashboard.menu.projectsDesc'),
      href: "/dashboard/projects",
      disabled: true
    },
    {
      icon: MessageSquare,
      label: t('dashboard.menu.messages'),
      description: t('dashboard.menu.messagesDesc'),
      href: "/dashboard/messages",
      disabled: true
    },
    {
      icon: Bell,
      label: t('dashboard.menu.notifications'),
      description: t('dashboard.menu.notificationsDesc'),
      href: "/dashboard/notifications",
      disabled: true
    },
    {
      icon: Settings,
      label: t('dashboard.menu.settings'),
      description: t('dashboard.menu.settingsDesc'),
      href: "/dashboard/settings",
      disabled: true
    }
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-foreground hover:bg-action/10 hover:text-action"
            asChild
          >
            <Link href="/">
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              {t('dashboard.backHome')}
            </Link>
          </Button>

          <div className="bg-white rounded-xl border-2 border-primary/30 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-action/10 px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-action text-action flex items-center justify-center text-2xl font-bold">
                  {firstName ? firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t('dashboard.welcome')}, {displayName}
                  </h1>
                  <p className="text-sm text-foreground/60">{t('dashboard.subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.quickAccess')}</h2>
              <div className="grid gap-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.disabled ? "#" : item.href}
                    className={`flex items-center gap-4 p-4 rounded-lg border border-primary/20 transition-colors ${
                      item.disabled
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : "hover:bg-primary/5 hover:border-primary/30"
                    }`}
                    onClick={(e) => item.disabled && e.preventDefault()}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-action" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-foreground/60">{item.description}</p>
                    </div>
                    {!item.disabled && (
                      <ChevronRight className="w-5 h-5 text-foreground/40" />
                    )}
                    {item.disabled && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {t('dashboard.comingSoon')}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
