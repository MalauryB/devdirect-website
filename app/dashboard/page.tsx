"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { User, FileText, MessageSquare, Menu, X, Home, LogOut, Loader2, Check, Plus, Calendar, Euro, Info, Globe, Smartphone, Cpu, Palette, PenTool, Video, FileCheck, HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth, UserMetadata } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { ProjectForm } from "@/components/project-form"
import { getUserProjects } from "@/lib/projects"
import { Project, ProjectStatus } from "@/lib/types"

export default function DashboardPage() {
  const { user, loading, signOut, updateProfile } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("about")

  // Profile form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")

  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const section = searchParams.get("section")
    if (section && ["profile", "projects", "messages", "about"].includes(section)) {
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

  const loadProjects = useCallback(async () => {
    if (!user) return
    setProjectsLoading(true)
    const { projects: userProjects } = await getUserProjects()
    setProjects(userProjects)
    setProjectsLoading(false)
  }, [user])

  useEffect(() => {
    if (user && activeSection === "projects") {
      loadProjects()
    }
  }, [user, activeSection, loadProjects])

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
      id: "about",
      icon: Info,
      label: t('dashboard.menu.about'),
    },
    {
      id: "projects",
      icon: FileText,
      label: t('dashboard.menu.projects'),
    },
    {
      id: "profile",
      icon: User,
      label: t('dashboard.menu.profile'),
    },
    {
      id: "messages",
      icon: MessageSquare,
      label: t('dashboard.menu.messages'),
      disabled: true
    }
  ]

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.disabled) return
    setActiveSection(item.id)
    setSidebarOpen(false)
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

          {/* Menu items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  activeSection === item.id
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
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            className="lg:hidden p-2 hover:bg-gray-50 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />

          {/* User account dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-white border-2 border-gray-300 text-foreground flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none">
                <span className="text-sm font-semibold">
                  {firstName ? firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
              <div className="px-3 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-foreground/60 truncate">{user.email}</p>
              </div>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 flex items-center"
                onClick={() => setActiveSection("profile")}
              >
                <User className="w-4 h-4 mr-3 text-foreground flex-shrink-0" />
                <span className="text-foreground">{t('navigation.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 flex items-center">
                <Link href="/">
                  <Home className="w-4 h-4 mr-3 text-foreground flex-shrink-0" />
                  <span className="text-foreground">{t('navigation.accueil')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 text-red-600 focus:text-red-600 flex items-center"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>{t('navigation.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-6">
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

          {activeSection === "projects" && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{t('projects.title')}</h2>
                {!showProjectForm && (
                  <Button
                    onClick={() => setShowProjectForm(true)}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('projects.newProject')}
                  </Button>
                )}
              </div>

              {showProjectForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                  <ProjectForm
                    onSuccess={() => {
                      setShowProjectForm(false)
                      loadProjects()
                    }}
                    onCancel={() => setShowProjectForm(false)}
                  />
                </div>
              )}

              {projectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl">
                  <FileText className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                  <p className="text-foreground/70 font-medium">{t('projects.noProjects')}</p>
                  <p className="text-foreground/50 text-sm mt-1">{t('projects.noProjectsDesc')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {project.project_types?.map((type) => (
                              <span key={type} className="text-xs bg-gray-100 text-foreground/70 px-2 py-0.5 rounded">
                                {t(`projects.types.${type}`)}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-foreground/60 line-clamp-2">{project.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-foreground/50">
                            {project.budget && (
                              <span className="flex items-center gap-1">
                                <Euro className="w-4 h-4" />
                                {t(`projects.budget.${project.budget}`)}
                              </span>
                            )}
                            {project.deadline && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {t(`projects.deadline.${project.deadline}`)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                          project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          project.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                          project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t(`projects.status.${project.status}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "about" && (
            <div className="w-full">
              <h2 className="text-xl font-bold text-foreground mb-2">{t('dashboard.about.title')}</h2>
              <p className="text-foreground/70 mb-8">{t('dashboard.about.intro')}</p>

              {/* Why choose us */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.about.whyUs')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-3">
                      <Video className="w-5 h-5 text-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{t('dashboard.about.features.freeMeeting.title')}</h4>
                    <p className="text-sm text-foreground/60">{t('dashboard.about.features.freeMeeting.description')}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-3">
                      <FileCheck className="w-5 h-5 text-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{t('dashboard.about.features.transparentQuote.title')}</h4>
                    <p className="text-sm text-foreground/60">{t('dashboard.about.features.transparentQuote.description')}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-3">
                      <HeartHandshake className="w-5 h-5 text-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{t('dashboard.about.features.fullSupport.title')}</h4>
                    <p className="text-sm text-foreground/60">{t('dashboard.about.features.fullSupport.description')}</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.about.servicesTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <Globe className="w-5 h-5 text-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{t('dashboard.about.services.web.title')}</h4>
                    <p className="text-sm text-foreground/60">{t('dashboard.about.services.web.description')}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <Smartphone className="w-5 h-5 text-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{t('dashboard.about.services.mobile.title')}</h4>
                    <p className="text-sm text-foreground/60">{t('dashboard.about.services.mobile.description')}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <Cpu className="w-5 h-5 text-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{t('dashboard.about.services.iot.title')}</h4>
                    <p className="text-sm text-foreground/60">{t('dashboard.about.services.iot.description')}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <Palette className="w-5 h-5 text-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{t('dashboard.about.services.ai.title')}</h4>
                    <p className="text-sm text-foreground/60">{t('dashboard.about.services.ai.description')}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <PenTool className="w-5 h-5 text-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{t('dashboard.about.services.design.title')}</h4>
                    <p className="text-sm text-foreground/60">{t('dashboard.about.services.design.description')}</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  )
}
