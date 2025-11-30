"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { User, Settings, FileText, MessageSquare, Bell, Menu, X, Home, LogOut, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, UserMetadata } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function DashboardPage() {
  const { user, loading, signOut, updateProfile } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")

  // Profile form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const section = searchParams.get("section")
    if (section && ["overview", "profile", "projects", "messages", "notifications", "settings"].includes(section)) {
      setActiveSection(section)
    }
  }, [searchParams])

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

  const displayName = firstName || lastName
    ? `${firstName} ${lastName}`.trim()
    : user.email?.split("@")[0]

  const menuItems = [
    {
      id: "overview",
      icon: Home,
      label: t('dashboard.menu.overview'),
    },
    {
      id: "profile",
      icon: User,
      label: t('dashboard.menu.profile'),
    },
    {
      id: "projects",
      icon: FileText,
      label: t('dashboard.menu.projects'),
      disabled: true
    },
    {
      id: "messages",
      icon: MessageSquare,
      label: t('dashboard.menu.messages'),
      disabled: true
    },
    {
      id: "notifications",
      icon: Bell,
      label: t('dashboard.menu.notifications'),
      disabled: true
    },
    {
      id: "settings",
      icon: Settings,
      label: t('dashboard.menu.settings'),
      disabled: true
    }
  ]

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.disabled) return
    if (item.href) {
      router.push(item.href)
    } else {
      setActiveSection(item.id)
      setSidebarOpen(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setProfileError("")
    setProfileSuccess(false)

    const metadata: UserMetadata = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    }

    const { error: updateError } = await updateProfile(metadata)

    if (updateError) {
      setProfileError(t('profile.error'))
    } else {
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold logo-cubic text-black">
                {t('name')}
              </Link>
              <button
                className="lg:hidden p-2 hover:bg-gray-50 rounded-lg"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-foreground flex items-center justify-center text-sm font-bold">
                {firstName ? firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  activeSection === item.id && !item.href
                    ? "bg-gray-100 text-foreground font-medium"
                    : item.disabled
                    ? "opacity-50 cursor-not-allowed text-foreground/60"
                    : "hover:bg-gray-50 text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.disabled && (
                  <span className="text-xs bg-gray-100 text-foreground/60 px-1.5 py-0.5 rounded">
                    {t('dashboard.comingSoon')}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('navigation.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile menu button */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <button
            className="p-2 hover:bg-gray-50 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-6">
          {activeSection === "overview" && (
            <div className="max-w-4xl">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {t('dashboard.welcomeCard.title')}
                </h2>
                <p className="text-foreground/70">
                  {t('dashboard.welcomeCard.description')}
                </p>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.quickAccess')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.filter(item => item.id !== "overview").map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    disabled={item.disabled}
                    className={`flex items-center gap-4 p-4 rounded-xl border border-gray-200 transition-colors text-left ${
                      item.disabled
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : "hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-foreground/70" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-foreground/60">
                        {t(`dashboard.menu.${item.id}Desc`)}
                      </p>
                    </div>
                    {item.disabled && (
                      <span className="text-xs bg-gray-100 text-foreground/60 px-2 py-1 rounded">
                        {t('dashboard.comingSoon')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === "profile" && (
            <div className="max-w-md">
              <h2 className="text-xl font-bold text-foreground mb-4">{t('profile.title')}</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">{t('profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t('profile.firstNamePlaceholder')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={saving}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">{t('profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t('profile.lastNamePlaceholder')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={saving}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t('profile.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('profile.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={saving}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>

                {profileError && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                    {profileError}
                  </p>
                )}

                {profileSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {t('profile.success')}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('profile.save')}
                </Button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
