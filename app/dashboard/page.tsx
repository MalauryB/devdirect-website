"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { User, FileText, MessageSquare, Menu, X, Home, LogOut, Loader2, Check, Plus, Calendar, Euro, Info, Globe, Smartphone, Cpu, Palette, PenTool, Video, FileCheck, HeartHandshake, ArrowLeft, Clock, Target, Wrench, Monitor, Layers, MessageCircle, Pencil, Trash2, Camera, Download, Paperclip, Image as ImageIcon, BarChart3, Users, Filter, ChevronRight, ChevronDown, Mail, Phone, Building2, Receipt, Send, FileSpreadsheet, FolderOpen, Upload, File, History, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth, UserMetadata, ClientType, UserRole } from "@/contexts/auth-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/contexts/language-context"
import { ProjectFormWizard } from "@/components/project-form-wizard"
import { getUserProjects, updateProject, deleteProject, getAllProjects } from "@/lib/projects"
import { Project, ProjectStatus, ProjectFile, Quote, Profile, ProjectDocument, ProjectDocumentType } from "@/lib/types"
import { getQuotesByProject, deleteQuote, sendQuote, getAllQuotes } from "@/lib/quotes"
import { getProjectDocuments, uploadDocument, deleteDocument, getDocumentDownloadUrl, documentTypeLabels, getFileIcon, formatFileSize, uploadNewVersion, getDocumentVersions } from "@/lib/documents"
import { QuoteForm } from "@/components/quote-form"
import { uploadFile, deleteFile, validateFile, getSignedUrl } from "@/lib/storage"
import { exportQuoteToExcel, calculateQuoteData } from "@/lib/quote-export"
import { exportQuoteToPdf } from "@/lib/quote-pdf-export"
import { updateProfileAvatarUrl } from "@/lib/supabase"
import { MessageThread } from "@/components/message-thread"
import { getAllUnreadCounts } from "@/lib/messages"

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function DashboardPage() {
  const { user, loading, signOut, updateProfile } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  // Profile form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [clientType, setClientType] = useState<ClientType>("individual")
  const [companyName, setCompanyName] = useState("")
  const [siret, setSiret] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("France")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")
  // Engineer-specific profile fields
  const [jobTitle, setJobTitle] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Engineer-specific state
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  // Quotes state (for engineers)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null)
  const [deleteQuoteLoading, setDeleteQuoteLoading] = useState(false)
  const [sendingQuote, setSendingQuote] = useState<Quote | null>(null)
  const [sendQuoteLoading, setSendQuoteLoading] = useState(false)

  // Project sub-section state (for cascading navigation)
  const [projectSubSection, setProjectSubSection] = useState<'details' | 'quotes' | 'messages' | 'documents'>('details')

  // Engineer action tracking state
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [allQuotes, setAllQuotes] = useState<Quote[]>([])

  // Documents state
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  // Versioning state
  const [uploadingNewVersionId, setUploadingNewVersionId] = useState<string | null>(null)
  const [expandedVersionsId, setExpandedVersionsId] = useState<string | null>(null)
  const [documentVersions, setDocumentVersions] = useState<ProjectDocument[]>([])

  // Get user role
  const userRole: UserRole = user?.user_metadata?.role || 'client'
  const isEngineer = userRole === 'engineer'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const section = searchParams.get("section")
    const validSections = isEngineer
      ? ["overview", "allProjects", "clients", "profile"]
      : ["about", "projects", "profile", "messages"]

    if (section && validSections.includes(section)) {
      setActiveSection(section)
    } else if (!activeSection) {
      // Set default section based on role
      setActiveSection(isEngineer ? "overview" : "about")
    }
  }, [searchParams, isEngineer, activeSection])

  useEffect(() => {
    if (user?.user_metadata) {
      setFirstName(user.user_metadata.first_name || "")
      setLastName(user.user_metadata.last_name || "")
      setPhone(user.user_metadata.phone || "")
      setClientType(user.user_metadata.client_type || "individual")
      setCompanyName(user.user_metadata.company_name || "")
      setSiret(user.user_metadata.siret || "")
      setVatNumber(user.user_metadata.vat_number || "")
      setAddress(user.user_metadata.address || "")
      setPostalCode(user.user_metadata.postal_code || "")
      setCity(user.user_metadata.city || "")
      setCountry(user.user_metadata.country || "France")
      setAvatarUrl(user.user_metadata.avatar_url || "")
      // Engineer-specific fields
      setJobTitle(user.user_metadata.job_title || "")
      setBio(user.user_metadata.bio || "")
      setSkills(user.user_metadata.skills || [])
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

  const loadAllProjects = useCallback(async () => {
    if (!user) return
    setProjectsLoading(true)
    const { projects: fetchedProjects } = await getAllProjects(statusFilter)
    setAllProjects(fetchedProjects)
    setProjectsLoading(false)
  }, [user, statusFilter])

  const loadQuotes = useCallback(async (projectId: string) => {
    setQuotesLoading(true)
    const { quotes: fetchedQuotes } = await getQuotesByProject(projectId)
    setQuotes(fetchedQuotes)
    setQuotesLoading(false)
  }, [])

  const loadDocuments = useCallback(async (projectId: string) => {
    setDocumentsLoading(true)
    const { documents: fetchedDocuments } = await getProjectDocuments(projectId)
    setDocuments(fetchedDocuments)
    setDocumentsLoading(false)
  }, [])

  // Load engineer overview data (unread messages and all quotes)
  const loadEngineerOverviewData = useCallback(async () => {
    if (!user) return
    // Load unread message counts
    const { counts } = await getAllUnreadCounts(user.id)
    setUnreadCounts(counts)
    // Load all quotes
    const { quotes: fetchedQuotes } = await getAllQuotes()
    setAllQuotes(fetchedQuotes)
  }, [user])

  useEffect(() => {
    if (user && (activeSection === "projects" || activeSection === "messages")) {
      loadProjects()
    }
  }, [user, activeSection, loadProjects])

  useEffect(() => {
    if (user && (activeSection === "allProjects" || activeSection === "overview" || activeSection === "clients")) {
      loadAllProjects()
    }
  }, [user, activeSection, loadAllProjects])

  // Load engineer overview data when on overview section
  useEffect(() => {
    if (user && isEngineer && activeSection === "overview") {
      loadEngineerOverviewData()
    }
  }, [user, isEngineer, activeSection, loadEngineerOverviewData])

  // Load quotes when a project is selected in allProjects section (engineer view)
  useEffect(() => {
    if (selectedProject && isEngineer && activeSection === "allProjects") {
      loadQuotes(selectedProject.id)
      setProjectSubSection('details') // Reset to details when selecting a new project
    } else if (selectedProject && !isEngineer && activeSection === "projects") {
      // Client: load quotes for viewing and reset to details
      loadQuotes(selectedProject.id)
      setProjectSubSection('details')
    } else {
      setQuotes([])
      setShowQuoteForm(false)
      setEditingQuote(null)
    }
  }, [selectedProject, isEngineer, activeSection, loadQuotes])

  // Load documents when entering documents section
  useEffect(() => {
    if (selectedProject && projectSubSection === 'documents') {
      loadDocuments(selectedProject.id)
    }
  }, [selectedProject, projectSubSection, loadDocuments])

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

  // Status badge styling helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_review': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-purple-100 text-purple-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-orange-100 text-orange-800'
      case 'closed': return 'bg-muted text-gray-800'
      default: return 'bg-muted text-gray-800'
    }
  }

  // Menu items vary based on user role
  const clientMenuItems = [
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
    }
  ]

  const engineerMenuItems = [
    {
      id: "overview",
      icon: BarChart3,
      label: t('dashboard.menu.overview'),
    },
    {
      id: "allProjects",
      icon: FileText,
      label: t('dashboard.menu.allProjects'),
    },
    {
      id: "clients",
      icon: Users,
      label: t('dashboard.menu.clients'),
    },
    {
      id: "profile",
      icon: User,
      label: t('dashboard.menu.profile'),
    }
  ]

  const menuItems = isEngineer ? engineerMenuItems : clientMenuItems

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if ('disabled' in item && item.disabled) return
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
      client_type: clientType,
      company_name: companyName,
      siret: siret,
      vat_number: vatNumber,
      address: address,
      postal_code: postalCode,
      city: city,
      country: country,
      // Engineer-specific fields
      job_title: jobTitle,
      bio: bio,
      skills: skills,
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

  const handleDeleteProject = async () => {
    if (!deletingProject) return
    setDeleteLoading(true)
    const { error } = await deleteProject(deletingProject.id)
    if (!error) {
      setDeletingProject(null)
      setSelectedProject(null)
      loadProjects()
    }
    setDeleteLoading(false)
  }

  const handleEditProject = () => {
    if (!selectedProject) return
    setEditingProject(selectedProject)
    setSelectedProject(null)
    setShowProjectForm(true)
  }

  const handleDeleteQuote = async () => {
    if (!deletingQuote || !selectedProject) return
    setDeleteQuoteLoading(true)
    const { error } = await deleteQuote(deletingQuote.id)
    if (!error) {
      setDeletingQuote(null)
      loadQuotes(selectedProject.id)
    }
    setDeleteQuoteLoading(false)
  }

  const handleSendQuote = async () => {
    if (!sendingQuote || !selectedProject) return
    setSendQuoteLoading(true)
    const { error } = await sendQuote(sendingQuote.id)
    if (!error) {
      setSendingQuote(null)
      loadQuotes(selectedProject.id)
    }
    setSendQuoteLoading(false)
  }

  const getQuoteStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      default: return 'bg-muted text-gray-800'
    }
  }

  // Component to display a file item with download capability
  const ProjectFileItem = ({ file }: { file: ProjectFile }) => {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
      setLoading(true)
      const { url } = await getSignedUrl('projects', file.path)
      if (url) {
        window.open(url, '_blank')
      }
      setLoading(false)
    }

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-foreground/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
          <p className="text-xs text-foreground/50">{formatFileSize(file.size)}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-foreground/50" />
          ) : (
            <Download className="w-4 h-4 text-foreground/50" />
          )}
        </button>
      </div>
    )
  }

  // Component to display an image item with preview
  const ProjectImageItem = ({ file }: { file: ProjectFile }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const loadImage = async () => {
        const { url } = await getSignedUrl('projects', file.path)
        setImageUrl(url)
        setLoading(false)
      }
      loadImage()
    }, [file.path])

    const handleOpen = () => {
      if (imageUrl) {
        window.open(imageUrl, '_blank')
      }
    }

    return (
      <div
        onClick={handleOpen}
        className="aspect-square rounded-lg overflow-hidden bg-muted border border-border cursor-pointer hover:border-primary/30 transition-colors relative"
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-foreground/30" />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-foreground/30" />
          </div>
        )}
      </div>
    )
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file, 'images')
    if (!validation.valid) {
      setProfileError(validation.error || 'Fichier invalide')
      return
    }

    setAvatarUploading(true)
    setProfileError("")

    const { data, error } = await uploadFile(file, 'avatars', 'profile')

    if (error) {
      console.error('Upload error:', error)
      setProfileError(`${t('profile.avatarError')}: ${error.message}`)
    } else if (data && user) {
      console.log('Avatar uploaded:', data.url)
      setAvatarUrl(data.url)
      // Save avatar URL to auth.users metadata
      const { error: updateError } = await updateProfile({ avatar_url: data.url })
      if (updateError) {
        setProfileError(t('profile.error'))
      }
      // Also update the profiles table for other users to see
      const { error: profileError } = await updateProfileAvatarUrl(user.id, data.url)
      if (profileError) {
        console.error('Failed to update profiles table:', profileError)
      }
    }

    setAvatarUploading(false)
    if (e.target) e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Collapsible drawer */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`fixed lg:fixed inset-y-0 left-0 z-50 bg-white border-r border-border transform transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${sidebarExpanded ? "lg:w-64" : "lg:w-16"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className={`p-4 border-b border-border ${!sidebarExpanded && !sidebarOpen ? "lg:px-3" : ""}`}>
            <div className="flex items-center justify-between">
              <Link href="/" className={`text-xl font-bold logo-cubic text-black transition-opacity duration-200 ${!sidebarExpanded && !sidebarOpen ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
                {t('name')}
              </Link>
              {/* Logo icon when collapsed */}
              <div className={`hidden ${!sidebarExpanded && !sidebarOpen ? "lg:flex" : "lg:hidden"} items-center justify-center w-10 h-10`}>
                <span className="text-xl font-bold logo-cubic text-black">M</span>
              </div>
              <button
                className="lg:hidden p-2 hover:bg-primary/5 rounded-lg"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Menu items */}
          <nav className={`flex-1 p-4 space-y-1 overflow-y-auto ${!sidebarExpanded && !sidebarOpen ? "lg:p-2" : ""}`}>
            {menuItems.map((item) => {
              const isDisabled = 'disabled' in item ? Boolean(item.disabled) : false
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  disabled={isDisabled}
                  title={!sidebarExpanded && !sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    !sidebarExpanded && !sidebarOpen ? "lg:justify-center lg:px-0" : ""
                  } ${
                    activeSection === item.id
                      ? "bg-action/10 text-action font-medium"
                      : isDisabled
                      ? "opacity-50 cursor-not-allowed text-foreground/60"
                      : "hover:bg-primary/5 text-foreground"
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${activeSection === item.id ? 'text-action' : ''}`} />
                  <span className={`flex-1 transition-opacity duration-200 ${!sidebarExpanded && !sidebarOpen ? "lg:hidden" : ""}`}>{item.label}</span>
                  {isDisabled && (sidebarExpanded || sidebarOpen) && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {t('dashboard.comingSoon')}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Spacer for fixed sidebar on desktop */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-200 ${sidebarExpanded ? "w-64" : "w-16"}`} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            className="lg:hidden p-2 hover:bg-primary/5 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />

          {/* User account dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-white border-2 border-action text-action flex items-center justify-center hover:bg-action/10 transition-colors focus:outline-none overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={firstName || user.email || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {firstName ? firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-primary/20 shadow-lg">
              <div className="px-3 py-3 border-b border-primary/10">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-foreground/60 truncate">{user.email}</p>
              </div>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5 py-2.5 flex items-center"
                onClick={() => setActiveSection("profile")}
              >
                <User className="w-4 h-4 mr-3 text-foreground flex-shrink-0" />
                <span className="text-foreground">{t('navigation.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5 py-2.5 flex items-center">
                <Link href="/">
                  <Home className="w-4 h-4 mr-3 text-foreground flex-shrink-0" />
                  <span className="text-foreground">{t('navigation.accueil')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-primary/10" />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-primary/5 focus:bg-muted/50 py-2.5 text-red-600 focus:text-red-600 flex items-center"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>{t('navigation.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {activeSection === "profile" && (
            <div className="w-full">
              <h2 className="text-xl font-bold text-foreground mb-6">{t('profile.title')}</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                {/* Avatar */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">{t('profile.avatar')}</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover min-w-full min-h-full"
                            style={{ objectPosition: 'center' }}
                          />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                        {avatarUploading ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 text-white" />
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleAvatarUpload}
                          disabled={avatarUploading || saving}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/70">{t('profile.avatarDesc')}</p>
                      <p className="text-xs text-foreground/50 mt-1">PNG, JPG, GIF (max 2MB)</p>
                    </div>
                  </div>
                </div>

                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">{t('profile.personalInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="firstName" className="text-sm text-foreground/70">{t('profile.firstName')}</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder={t('profile.firstNamePlaceholder')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={saving}
                        className="border-border focus:border-gray-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName" className="text-sm text-foreground/70">{t('profile.lastName')}</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder={t('profile.lastNamePlaceholder')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={saving}
                        className="border-border focus:border-gray-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-sm text-foreground/70">{t('profile.phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t('profile.phonePlaceholder')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={saving}
                      className="border-border focus:border-gray-400"
                    />
                  </div>
                </div>

                {/* Champs spécifiques selon le rôle */}
                {isEngineer ? (
                  <>
                    {/* Poste */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-foreground">{t('profile.jobTitle')}</h3>
                      <Input
                        id="jobTitle"
                        type="text"
                        placeholder={t('profile.jobTitlePlaceholder')}
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        disabled={saving}
                        className="border-border focus:border-gray-400"
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-foreground">{t('profile.bio')}</h3>
                      <Textarea
                        id="bio"
                        placeholder={t('profile.bioPlaceholder')}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={saving}
                        rows={4}
                        className="border-border focus:border-gray-400 resize-none bg-white"
                      />
                    </div>

                    {/* Compétences */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-foreground">{t('profile.skills')}</h3>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder={t('profile.skillsPlaceholder')}
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          disabled={saving}
                          className="flex-1 border-border focus:border-gray-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                                setSkills([...skills, newSkill.trim()])
                                setNewSkill("")
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                              setSkills([...skills, newSkill.trim()])
                              setNewSkill("")
                            }
                          }}
                          disabled={saving || !newSkill.trim()}
                        >
                          {t('profile.addSkill')}
                        </Button>
                      </div>
                      {skills.length === 0 ? (
                        <p className="text-sm text-foreground/50">{t('profile.noSkills')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-foreground rounded-full text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                                disabled={saving}
                                className="text-foreground/50 hover:text-foreground ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Type de client */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground">{t('profile.clientType')}</h3>
                      <RadioGroup
                        value={clientType}
                        onValueChange={(value) => setClientType(value as ClientType)}
                        disabled={saving}
                        className="flex gap-4"
                      >
                        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                          clientType === "individual" ? 'border-gray-900' : 'border-border'
                        }`}>
                          <RadioGroupItem value="individual" className="border-gray-300" />
                          <span className="text-sm">{t('profile.individual')}</span>
                        </label>
                        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                          clientType === "company" ? 'border-gray-900' : 'border-border'
                        }`}>
                          <RadioGroupItem value="company" className="border-gray-300" />
                          <span className="text-sm">{t('profile.company')}</span>
                        </label>
                      </RadioGroup>
                    </div>

                    {/* Informations entreprise (conditionnelles) */}
                    {clientType === "company" && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-foreground">{t('profile.companyInfo')}</h3>
                        <div className="space-y-1">
                          <Label htmlFor="companyName" className="text-sm text-foreground/70">{t('profile.companyName')}</Label>
                          <Input
                            id="companyName"
                            type="text"
                            placeholder={t('profile.companyNamePlaceholder')}
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            disabled={saving}
                            className="border-border focus:border-gray-400"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor="siret" className="text-sm text-foreground/70">{t('profile.siret')}</Label>
                            <Input
                              id="siret"
                              type="text"
                              placeholder={t('profile.siretPlaceholder')}
                              value={siret}
                              onChange={(e) => setSiret(e.target.value)}
                              disabled={saving}
                              className="border-border focus:border-gray-400"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="vatNumber" className="text-sm text-foreground/70">{t('profile.vatNumber')}</Label>
                            <Input
                              id="vatNumber"
                              type="text"
                              placeholder={t('profile.vatNumberPlaceholder')}
                              value={vatNumber}
                              onChange={(e) => setVatNumber(e.target.value)}
                              disabled={saving}
                              className="border-border focus:border-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Adresse de facturation */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-foreground">{t('profile.billingAddress')}</h3>
                      <div className="space-y-1">
                        <Label htmlFor="address" className="text-sm text-foreground/70">{t('profile.address')}</Label>
                        <Input
                          id="address"
                          type="text"
                          placeholder={t('profile.addressPlaceholder')}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={saving}
                          className="border-border focus:border-gray-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="postalCode" className="text-sm text-foreground/70">{t('profile.postalCode')}</Label>
                          <Input
                            id="postalCode"
                            type="text"
                            placeholder={t('profile.postalCodePlaceholder')}
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            disabled={saving}
                            className="border-border focus:border-gray-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="city" className="text-sm text-foreground/70">{t('profile.city')}</Label>
                          <Input
                            id="city"
                            type="text"
                            placeholder={t('profile.cityPlaceholder')}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={saving}
                            className="border-border focus:border-gray-400"
                          />
                        </div>
                        <div className="space-y-1 col-span-2 md:col-span-1">
                          <Label htmlFor="country" className="text-sm text-foreground/70">{t('profile.country')}</Label>
                          <Input
                            id="country"
                            type="text"
                            placeholder={t('profile.countryPlaceholder')}
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            disabled={saving}
                            className="border-border focus:border-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

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
              {/* Vue détaillée d'un projet avec navigation secondaire */}
              {selectedProject ? (
                <div className={`flex gap-0 -m-4 lg:-m-6 ${projectSubSection === 'messages' ? 'h-[calc(100vh-65px)]' : 'min-h-[calc(100vh-65px)]'}`}>
                  {/* Secondary sidebar for project sub-sections */}
                  <div className="w-48 bg-muted/50 border-r border-border flex-shrink-0 flex flex-col">
                    <div className="p-4 border-b border-border">
                      <button
                        onClick={() => setSelectedProject(null)}
                        className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t('projects.details.back')}
                      </button>
                    </div>
                    <nav className="p-2">
                      <button
                        onClick={() => setProjectSubSection('details')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          projectSubSection === 'details'
                            ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        {t('projects.subSections.details')}
                      </button>
                      <button
                        onClick={() => setProjectSubSection('quotes')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
                          projectSubSection === 'quotes'
                            ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <Receipt className="w-4 h-4" />
                        {t('projects.subSections.quotes')}
                        {quotes.length > 0 && (
                          <span className="ml-auto text-xs bg-gray-200 text-foreground/70 px-1.5 py-0.5 rounded">
                            {quotes.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setProjectSubSection('messages')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
                          projectSubSection === 'messages'
                            ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t('messages.title')}
                      </button>
                      <button
                        onClick={() => setProjectSubSection('documents')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
                          projectSubSection === 'documents'
                            ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <FolderOpen className="w-4 h-4" />
                        {t('documents.title')}
                        {documents.length > 0 && (
                          <span className="ml-auto text-xs bg-gray-200 text-foreground/70 px-1.5 py-0.5 rounded">
                            {documents.length}
                          </span>
                        )}
                      </button>
                    </nav>
                    {/* Actions - only show for pending projects */}
                    {selectedProject.status === 'pending' && (
                      <div className="mt-auto p-4 border-t border-border space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditProject}
                          className="w-full text-foreground/70 hover:text-foreground"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          {t('projects.actions.edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingProject(selectedProject)}
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('projects.actions.delete')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Main content area */}
                  <div className={`flex-1 flex flex-col ${projectSubSection === 'messages' ? 'overflow-hidden' : 'p-4 lg:p-6 overflow-auto'}`}>
                    {/* Project Header - visible only in details section */}
                    {projectSubSection === 'details' && (
                      <div className="bg-white border border-border rounded-xl overflow-hidden mb-6">
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {/* User avatar or initials */}
                              <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center shadow-sm overflow-hidden">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={firstName || 'User'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xl font-bold text-white">
                                    {(firstName?.[0] || 'U').toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h2 className="text-xl font-bold text-foreground mb-2">
                                  {selectedProject.title || t('projects.untitled')}
                                </h2>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {selectedProject.project_types?.map((type) => (
                                    <span key={type} className="text-sm bg-muted text-foreground/70 px-3 py-1 rounded-full">
                                      {t(`projects.types.${type}`)}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm text-foreground/50">
                                  {t('projects.details.createdAt')}: {new Date(selectedProject.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <span className={`shrink-0 text-sm px-3 py-1.5 rounded-full font-medium ${getStatusBadgeClass(selectedProject.status)}`}>
                              {t(`projects.status.${selectedProject.status}`)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Details Sub-Section */}
                    {projectSubSection === 'details' && (
                      <div className="bg-white border border-border rounded-xl overflow-hidden">
                        <div className="p-6 space-y-8">
                          {/* Description */}
                          <div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                              <FileText className="w-4 h-4 text-[#6cb1bb]" />
                              {t('projects.details.description')}
                            </h3>
                            <p className="text-foreground/70 whitespace-pre-wrap">{selectedProject.description || '-'}</p>
                          </div>

                          {/* Features */}
                          {selectedProject.features && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Layers className="w-4 h-4 text-[#ba9fdf]" />
                                {t('projects.details.features')}
                              </h3>
                              <p className="text-foreground/70 whitespace-pre-wrap">{selectedProject.features}</p>
                            </div>
                          )}

                          {/* Target Audience */}
                          {selectedProject.target_audience && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Target className="w-4 h-4 text-[#ea4c89]" />
                                {t('projects.details.targetAudience')}
                              </h3>
                              <p className="text-foreground/70">{selectedProject.target_audience}</p>
                            </div>
                          )}

                          {/* Services */}
                          {selectedProject.services && selectedProject.services.length > 0 && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Wrench className="w-4 h-4 text-[#9c984d]" />
                                {t('projects.details.services')}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedProject.services.map((service) => (
                                  <span key={service} className="text-sm bg-muted/50 border border-border text-foreground/70 px-3 py-1 rounded-lg">
                                    {t(`projects.services.${service}`)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Platforms */}
                          {selectedProject.platforms && selectedProject.platforms.length > 0 && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Monitor className="w-4 h-4 text-[#6cb1bb]" />
                                {t('projects.details.platforms')}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedProject.platforms.map((platform) => (
                                  <span key={platform} className="text-sm bg-muted/50 border border-border text-foreground/70 px-3 py-1 rounded-lg">
                                    {platform}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Existing Project */}
                          {selectedProject.has_existing_project && selectedProject.existing_technologies && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Wrench className="w-4 h-4 text-[#7f7074]" />
                                {t('projects.details.existingTech')}
                              </h3>
                              <p className="text-foreground/70">{selectedProject.existing_technologies}</p>
                            </div>
                          )}

                          {/* Budget & Deadline */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedProject.budget && (
                              <div className="bg-muted/50 rounded-xl p-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                                  <Euro className="w-4 h-4 text-[#9c984d]" />
                                  {t('projects.details.budget')}
                                </h3>
                                <p className="text-foreground/70">{t(`projects.budget.${selectedProject.budget}`)}</p>
                              </div>
                            )}
                            {selectedProject.deadline && (
                              <div className="bg-muted/50 rounded-xl p-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                                  <Clock className="w-4 h-4 text-[#ea4c89]" />
                                  {t('projects.details.deadline')}
                                </h3>
                                <p className="text-foreground/70">{t(`projects.deadline.${selectedProject.deadline}`)}</p>
                              </div>
                            )}
                          </div>

                          {/* Design needs */}
                          {selectedProject.needs_design && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Palette className="w-4 h-4 text-[#ba9fdf]" />
                                {t('projects.details.needsDesign')}
                              </h3>
                              <p className="text-foreground/70">{t(`projects.form.needsDesign${selectedProject.needs_design.charAt(0).toUpperCase() + selectedProject.needs_design.slice(1)}`)}</p>
                            </div>
                          )}

                          {/* Additional Info */}
                          {selectedProject.additional_info && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <MessageCircle className="w-4 h-4 text-[#7f7074]" />
                                {t('projects.details.additionalInfo')}
                              </h3>
                              <p className="text-foreground/70 whitespace-pre-wrap">{selectedProject.additional_info}</p>
                            </div>
                          )}

                          {/* Attached Files */}
                          {(selectedProject.specifications_file ||
                            (selectedProject.design_files && selectedProject.design_files.length > 0) ||
                            (selectedProject.brand_assets && selectedProject.brand_assets.length > 0) ||
                            (selectedProject.inspiration_images && selectedProject.inspiration_images.length > 0) ||
                            (selectedProject.other_documents && selectedProject.other_documents.length > 0)) && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                                <Paperclip className="w-4 h-4 text-[#6cb1bb]" />
                                {t('projects.details.attachedFiles')}
                              </h3>
                              <div className="space-y-4">
                                {/* Specifications file */}
                                {selectedProject.specifications_file && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.specificationsFile')}</p>
                                    <ProjectFileItem file={selectedProject.specifications_file} />
                                  </div>
                                )}

                                {/* Design files */}
                                {selectedProject.design_files && selectedProject.design_files.length > 0 && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.designFiles')}</p>
                                    <div className="space-y-2">
                                      {selectedProject.design_files.map((file, index) => (
                                        <ProjectFileItem key={file.path || index} file={file} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Brand assets */}
                                {selectedProject.brand_assets && selectedProject.brand_assets.length > 0 && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.brandAssets')}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {selectedProject.brand_assets.map((file, index) => (
                                        <ProjectImageItem key={file.path || index} file={file} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Inspiration images */}
                                {selectedProject.inspiration_images && selectedProject.inspiration_images.length > 0 && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.inspirationImages')}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {selectedProject.inspiration_images.map((file, index) => (
                                        <ProjectImageItem key={file.path || index} file={file} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Other documents */}
                                {selectedProject.other_documents && selectedProject.other_documents.length > 0 && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.otherDocuments')}</p>
                                    <div className="space-y-2">
                                      {selectedProject.other_documents.map((file, index) => (
                                        <ProjectFileItem key={file.path || index} file={file} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quotes Sub-Section (Client view - read only) */}
                    {projectSubSection === 'quotes' && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="font-semibold text-foreground">{t('projects.subSections.quotes')}</h3>
                            <p className="text-sm text-foreground/50">{t('quotes.clientSubtitle')}</p>
                          </div>
                        </div>

                        {quotesLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                          </div>
                        ) : quotes.length === 0 ? (
                          <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
                            <Receipt className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                            <p className="text-foreground/70 font-medium">{t('quotes.noQuotes')}</p>
                            <p className="text-foreground/50 text-sm mt-1">{t('quotes.noQuotesClientDesc')}</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {quotes.map((quote) => {
                              const quoteData = calculateQuoteData(quote)
                              return (
                                <div
                                  key={quote.id}
                                  className="bg-white border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-foreground">{quote.name}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                          quote.status === 'draft' ? 'bg-muted text-gray-700' :
                                          quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                          quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                          'bg-red-100 text-red-700'
                                        }`}>
                                          {t(`quotes.status.${quote.status}`)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground/60 mb-3">
                                        {t('quotes.createdAt')}: {new Date(quote.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                      </p>
                                      <div className="flex items-center gap-4 text-sm">
                                        <span className="text-foreground/70">
                                          <strong>{quoteData.totalDays}</strong> {t('quotes.days')}
                                        </span>
                                        <span className="text-foreground font-semibold">
                                          {formatCurrency(quoteData.totalTTC)} TTC
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Download PDF */}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => exportQuoteToPdf(quote, selectedProject)}
                                        title={t('quotes.downloadPdf')}
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                      {/* Download Excel */}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => exportQuoteToExcel(quote, selectedProject?.title)}
                                        title={t('quotes.downloadExcel')}
                                      >
                                        <FileSpreadsheet className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {/* Messages Sub-Section */}
                    {projectSubSection === 'messages' && (
                      <>
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-white flex items-center justify-between flex-shrink-0">
                          <div>
                            <h3 className="font-semibold text-foreground">{selectedProject.title || t('projects.untitled')}</h3>
                            <p className="text-sm text-foreground/50">{t('messages.conversationWith')}</p>
                          </div>
                        </div>
                        {/* Message thread */}
                        <div className="flex-1 bg-muted/50 overflow-hidden">
                          <MessageThread
                            projectId={selectedProject.id}
                            currentUser={{
                              id: user?.id || '',
                              first_name: user?.user_metadata?.first_name,
                              last_name: user?.user_metadata?.last_name,
                              avatar_url: user?.user_metadata?.avatar_url,
                              role: userRole
                            }}
                          />
                        </div>
                      </>
                    )}

                    {/* Documents Sub-Section */}
                    {projectSubSection === 'documents' && (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="font-semibold text-foreground">{t('documents.title')}</h3>
                            <p className="text-sm text-foreground/50">{t('documents.clientSubtitle')}</p>
                          </div>
                        </div>

                        {/* Documents List */}
                        {documentsLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                          </div>
                        ) : documents.length === 0 ? (
                          <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
                            <FolderOpen className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                            <p className="text-foreground/70 font-medium">{t('documents.empty')}</p>
                            <p className="text-foreground/50 text-sm mt-1">{t('documents.emptyClientDescription')}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                                    {getFileIcon(doc.file_type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                                          <span className="text-xs bg-action/10 text-action px-1.5 py-0.5 rounded font-medium">
                                            v{doc.version}
                                          </span>
                                        </div>
                                        <span className="inline-block text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded mt-1">
                                          {t(`documents.types.${doc.type}`)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Download button */}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={async () => {
                                            const { url } = await getDocumentDownloadUrl(doc.file_path)
                                            if (url) window.open(url, '_blank')
                                          }}
                                          className="text-foreground/70 hover:text-foreground"
                                        >
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    {doc.description && (
                                      <p className="text-sm text-foreground/60 mt-2">{doc.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-foreground/50">
                                      <span>{doc.file_name}</span>
                                      <span>{formatFileSize(doc.file_size)}</span>
                                      <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
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
                    <div className="bg-white border border-border rounded-xl p-6 mb-6 min-h-[600px]">
                      <ProjectFormWizard
                        project={editingProject}
                        onSuccess={() => {
                          setShowProjectForm(false)
                          setEditingProject(null)
                          loadProjects()
                        }}
                        onCancel={() => {
                          setShowProjectForm(false)
                          setEditingProject(null)
                        }}
                      />
                    </div>
                  )}

                  {projectsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
                      <FileText className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                      <p className="text-foreground/70 font-medium">{t('projects.noProjects')}</p>
                      <p className="text-foreground/50 text-sm mt-1">{t('projects.noProjectsDesc')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="bg-white border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground mb-1">
                                {project.title || t('projects.untitled')}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.project_types?.map((type) => (
                                  <span key={type} className="text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded">
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
                            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}>
                              {t(`projects.status.${project.status}`)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === "about" && (
            <div className="w-full">
              <h2 className="text-xl font-bold text-[#38392c] mb-2">{t('dashboard.about.title')}</h2>
              <p className="text-[#7f7074] mb-8">{t('dashboard.about.intro')}</p>

              {/* Why choose us */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-[#38392c] mb-4">{t('dashboard.about.whyUs')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
                    <div className="w-10 h-10 bg-[#ba9fdf] rounded-lg flex items-center justify-center mb-3">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.features.freeMeeting.title')}</h4>
                    <p className="text-sm text-[#7f7074]">{t('dashboard.about.features.freeMeeting.description')}</p>
                  </div>
                  <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
                    <div className="w-10 h-10 bg-[#6cb1bb] rounded-lg flex items-center justify-center mb-3">
                      <FileCheck className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.features.transparentQuote.title')}</h4>
                    <p className="text-sm text-[#7f7074]">{t('dashboard.about.features.transparentQuote.description')}</p>
                  </div>
                  <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
                    <div className="w-10 h-10 bg-[#ea4c89] rounded-lg flex items-center justify-center mb-3">
                      <HeartHandshake className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.features.fullSupport.title')}</h4>
                    <p className="text-sm text-[#7f7074]">{t('dashboard.about.features.fullSupport.description')}</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-[#38392c] mb-4">{t('dashboard.about.servicesTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
                    <div className="w-10 h-10 bg-[#6cb1bb] rounded-lg flex items-center justify-center mb-3">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.web.title')}</h4>
                    <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.web.description')}</p>
                  </div>
                  <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
                    <div className="w-10 h-10 bg-[#ba9fdf] rounded-lg flex items-center justify-center mb-3">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.mobile.title')}</h4>
                    <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.mobile.description')}</p>
                  </div>
                  <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
                    <div className="w-10 h-10 bg-[#9c984d] rounded-lg flex items-center justify-center mb-3">
                      <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.iot.title')}</h4>
                    <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.iot.description')}</p>
                  </div>
                  <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
                    <div className="w-10 h-10 bg-[#ea4c89] rounded-lg flex items-center justify-center mb-3">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.ai.title')}</h4>
                    <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.ai.description')}</p>
                  </div>
                  <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
                    <div className="w-10 h-10 bg-[#7f7074] rounded-lg flex items-center justify-center mb-3">
                      <PenTool className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.design.title')}</h4>
                    <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.design.description')}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Client Messages Section */}
          {activeSection === "messages" && !isEngineer && (
            <div className="flex gap-0 -m-4 lg:-m-6 h-[calc(100vh-65px)]">
              {/* Secondary sidebar for projects */}
              <div className="w-56 bg-muted/50 border-r border-border flex-shrink-0 flex flex-col">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">{t('messages.title')}</h2>
                  <p className="text-xs text-foreground/50 mt-1">{t('messages.sectionDescription')}</p>
                </div>

                {projectsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-foreground/50" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-foreground/50 mb-3">{t('messages.noProjects')}</p>
                    <Button
                      onClick={() => setActiveSection('projects')}
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('projects.newProject')}
                    </Button>
                  </div>
                ) : (
                  <nav className="p-2 flex-1 overflow-y-auto">
                    <p className="text-xs font-medium text-foreground/40 uppercase tracking-wide px-2 mb-2">
                      {t('messages.selectProject')}
                    </p>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-colors mb-1 ${
                          selectedProject?.id === project.id
                            ? 'bg-white border border-border text-foreground'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <MessageCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          selectedProject?.id === project.id ? 'text-[#6cb1bb]' : ''
                        }`} />
                        <div className="flex-1 min-w-0">
                          <span className="block font-medium truncate">
                            {project.title || t('projects.untitled')}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBadgeClass(project.status)}`}>
                            {t(`projects.status.${project.status}`)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </nav>
                )}
              </div>

              {/* Main content area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedProject ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-white flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedProject.title || t('projects.untitled')}</h3>
                        <p className="text-sm text-foreground/50">{t('messages.conversationWith')}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveSection('projects')
                          setSelectedProject(selectedProject)
                        }}
                        className="text-foreground/70"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {t('messages.viewProject')}
                      </Button>
                    </div>
                    {/* Message thread */}
                    <div className="flex-1 bg-muted/50 overflow-hidden">
                      <MessageThread
                        projectId={selectedProject.id}
                        currentUser={{
                          id: user?.id || '',
                          first_name: user?.user_metadata?.first_name,
                          last_name: user?.user_metadata?.last_name,
                          avatar_url: user?.user_metadata?.avatar_url,
                          role: userRole
                        }}
                        otherParty={null}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-muted/50">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                      <p className="text-foreground/50">{t('messages.selectToView')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Engineer Overview Section */}
          {activeSection === "overview" && isEngineer && (
            <div className="w-full overflow-hidden">
              <h2 className="text-xl font-bold text-foreground mb-2">{t('dashboard.engineer.title')}</h2>
              <p className="text-foreground/60 mb-6">{t('dashboard.engineer.subtitle')}</p>

              {/* Actions to take */}
              {(() => {
                // Calculate projects with unread messages
                const projectsWithUnread = allProjects.filter(p => unreadCounts[p.id] > 0)
                const totalUnreadMessages = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)

                // Calculate projects needing quotes (pending/in_review without any quote)
                const projectsNeedingQuotes = allProjects.filter(p =>
                  (p.status === 'pending' || p.status === 'in_review') &&
                  !allQuotes.some(q => q.project_id === p.id)
                )

                // Calculate draft quotes that need to be sent
                const draftQuotes = allQuotes.filter(q => q.status === 'draft')
                const draftQuotesWithProjects = draftQuotes.map(q => ({
                  quote: q,
                  project: allProjects.find(p => p.id === q.project_id)
                })).filter(item => item.project)

                const hasActions = projectsWithUnread.length > 0 || projectsNeedingQuotes.length > 0 || draftQuotesWithProjects.length > 0

                return (
                  <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                          totalUnreadMessages > 0 ? 'border-secondary/50 bg-secondary/10' : 'border-border'
                        }`}
                        onClick={() => {
                          if (projectsWithUnread.length > 0) {
                            setSelectedProject(projectsWithUnread[0])
                            setActiveSection('allProjects')
                            setProjectSubSection('messages')
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            totalUnreadMessages > 0 ? 'bg-secondary/20' : 'bg-muted'
                          }`}>
                            <MessageCircle className={`w-5 h-5 ${totalUnreadMessages > 0 ? 'text-secondary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`text-2xl font-bold ${totalUnreadMessages > 0 ? 'text-secondary' : 'text-foreground/30'}`}>
                              {totalUnreadMessages}
                            </p>
                            <p className="text-xs text-foreground/50">{t('dashboard.engineer.actions.unreadMessages')}</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                          projectsNeedingQuotes.length > 0 ? 'border-primary/50 bg-primary/10' : 'border-border'
                        }`}
                        onClick={() => {
                          if (projectsNeedingQuotes.length > 0) {
                            setSelectedProject(projectsNeedingQuotes[0])
                            setActiveSection('allProjects')
                            setProjectSubSection('quotes')
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            projectsNeedingQuotes.length > 0 ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <Receipt className={`w-5 h-5 ${projectsNeedingQuotes.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`text-2xl font-bold ${projectsNeedingQuotes.length > 0 ? 'text-primary' : 'text-foreground/30'}`}>
                              {projectsNeedingQuotes.length}
                            </p>
                            <p className="text-xs text-foreground/50">{t('dashboard.engineer.actions.quotesToCreate')}</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                          draftQuotesWithProjects.length > 0 ? 'border-action/50 bg-action/10' : 'border-border'
                        }`}
                        onClick={() => {
                          if (draftQuotesWithProjects.length > 0 && draftQuotesWithProjects[0].project) {
                            setSelectedProject(draftQuotesWithProjects[0].project)
                            setActiveSection('allProjects')
                            setProjectSubSection('quotes')
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            draftQuotesWithProjects.length > 0 ? 'bg-action/20' : 'bg-muted'
                          }`}>
                            <Send className={`w-5 h-5 ${draftQuotesWithProjects.length > 0 ? 'text-action' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`text-2xl font-bold ${draftQuotesWithProjects.length > 0 ? 'text-action' : 'text-foreground/30'}`}>
                              {draftQuotesWithProjects.length}
                            </p>
                            <p className="text-xs text-foreground/50">{t('dashboard.engineer.actions.quotesToSend')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed actions list */}
                    {hasActions ? (
                      <div className="bg-white border border-border rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-border">
                          <h3 className="font-semibold text-foreground">{t('dashboard.engineer.actions.title')}</h3>
                        </div>
                        <div className="divide-y divide-border">
                          {/* Unread messages */}
                          {projectsWithUnread.map((project) => (
                            <div
                              key={`msg-${project.id}`}
                              onClick={() => {
                                setSelectedProject(project)
                                setActiveSection('allProjects')
                                setProjectSubSection('messages')
                              }}
                              className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-4"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">
                                  {t('dashboard.engineer.actions.replyTo')} {project.profiles?.first_name || project.profiles?.company_name || t('dashboard.engineer.actions.client')}
                                </p>
                                <p className="text-sm text-foreground/50 truncate">{project.title || t('projects.untitled')}</p>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                {unreadCounts[project.id]} {t('dashboard.engineer.actions.newMessage')}
                              </span>
                              <ChevronRight className="w-4 h-4 text-foreground/30" />
                            </div>
                          ))}

                          {/* Projects needing quotes */}
                          {projectsNeedingQuotes.map((project) => (
                            <div
                              key={`quote-${project.id}`}
                              onClick={() => {
                                setSelectedProject(project)
                                setActiveSection('allProjects')
                                setProjectSubSection('quotes')
                              }}
                              className="p-4 hover:bg-amber-50 cursor-pointer transition-colors flex items-center gap-4"
                            >
                              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Receipt className="w-4 h-4 text-amber-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">{t('dashboard.engineer.actions.createQuoteFor')}</p>
                                <p className="text-sm text-foreground/50 truncate">{project.title || t('projects.untitled')}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}>
                                {t(`projects.status.${project.status}`)}
                              </span>
                              <ChevronRight className="w-4 h-4 text-foreground/30" />
                            </div>
                          ))}

                          {/* Draft quotes to send */}
                          {draftQuotesWithProjects.map(({ quote, project }) => (
                            <div
                              key={`draft-${quote.id}`}
                              onClick={() => {
                                if (project) {
                                  setSelectedProject(project)
                                  setActiveSection('allProjects')
                                  setProjectSubSection('quotes')
                                }
                              }}
                              className="p-4 hover:bg-purple-50 cursor-pointer transition-colors flex items-center gap-4"
                            >
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Send className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">{t('dashboard.engineer.actions.sendQuote')}</p>
                                <p className="text-sm text-foreground/50 truncate">
                                  {quote.name || `${t('quotes.version')} ${quote.version}`} - {project?.title || t('projects.untitled')}
                                </p>
                              </div>
                              <span className="text-xs bg-muted text-foreground/70 px-2 py-1 rounded-full font-medium">
                                {t('quotes.status.draft')}
                              </span>
                              <ChevronRight className="w-4 h-4 text-foreground/30" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-border rounded-xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{t('dashboard.engineer.actions.allDone')}</h3>
                        <p className="text-foreground/50 text-sm">{t('dashboard.engineer.actions.noActions')}</p>
                        <Button
                          onClick={() => setActiveSection('allProjects')}
                          variant="outline"
                          className="mt-4"
                        >
                          {t('dashboard.engineer.viewAll')}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Engineer All Projects Section */}
          {activeSection === "allProjects" && isEngineer && (
            <div className="w-full">
              {selectedProject ? (
                // Project detail view with cascading navigation
                <div className={`flex gap-0 -m-4 lg:-m-6 ${projectSubSection === 'messages' ? 'h-[calc(100vh-65px)]' : 'min-h-[calc(100vh-65px)]'}`}>
                  {/* Secondary sidebar for project sub-sections */}
                  <div className="w-48 bg-muted/50 border-r border-border flex-shrink-0 flex flex-col">
                    <div className="p-4 border-b border-border">
                      <button
                        onClick={() => setSelectedProject(null)}
                        className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t('projects.details.back')}
                      </button>
                    </div>
                    <nav className="p-2">
                      <button
                        onClick={() => setProjectSubSection('details')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          projectSubSection === 'details'
                            ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        {t('projects.subSections.details')}
                      </button>
                      <button
                        onClick={() => {
                          setProjectSubSection('quotes')
                          // Fermer le formulaire de devis si on y est déjà et qu'on reclique
                          if (projectSubSection === 'quotes' && showQuoteForm) {
                            setShowQuoteForm(false)
                            setEditingQuote(null)
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
                          projectSubSection === 'quotes'
                            ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <Receipt className="w-4 h-4" />
                        {t('projects.subSections.quotes')}
                        {quotes.length > 0 && (
                          <span className="ml-auto text-xs bg-gray-200 text-foreground/70 px-1.5 py-0.5 rounded">
                            {quotes.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setProjectSubSection('messages')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
                          projectSubSection === 'messages'
                            ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t('messages.title')}
                      </button>
                      <button
                        onClick={() => setProjectSubSection('documents')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
                          projectSubSection === 'documents'
                            ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                            : 'text-foreground/70 hover:bg-white hover:text-foreground'
                        }`}
                      >
                        <FolderOpen className="w-4 h-4" />
                        {t('documents.title')}
                      </button>
                    </nav>
                  </div>

                  {/* Main content area */}
                  <div className={`flex-1 flex flex-col ${projectSubSection === 'messages' ? 'overflow-hidden' : 'p-4 lg:p-6 overflow-auto'}`}>
                    {/* Project Header - visible only in details section */}
                    {projectSubSection === 'details' && (
                      <div className="bg-white border border-border rounded-xl overflow-hidden mb-6">
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {/* Client avatar or initials */}
                              <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center shadow-sm overflow-hidden">
                                {selectedProject.profiles?.avatar_url ? (
                                  <img
                                    src={selectedProject.profiles.avatar_url}
                                    alt={selectedProject.profiles.company_name || selectedProject.profiles.first_name || 'Client'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xl font-bold text-white">
                                    {(selectedProject.profiles?.company_name?.[0] || selectedProject.profiles?.first_name?.[0] || 'C').toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h2 className="text-xl font-bold text-foreground mb-2">
                                  {selectedProject.title || t('projects.untitled')}
                                </h2>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {selectedProject.project_types?.map((type) => (
                                    <span key={type} className="text-sm bg-muted text-foreground/70 px-3 py-1 rounded-full">
                                      {t(`projects.types.${type}`)}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm text-foreground/50">
                                  {t('projects.details.createdAt')}: {new Date(selectedProject.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <span className={`shrink-0 text-sm px-3 py-1.5 rounded-full font-medium ${getStatusBadgeClass(selectedProject.status)}`}>
                              {t(`projects.status.${selectedProject.status}`)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Details Sub-Section */}
                    {projectSubSection === 'details' && (
                      <div className="bg-white border border-border rounded-xl overflow-hidden">
                        <div className="p-6 space-y-8">
                          {/* Description */}
                          <div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                              <FileText className="w-4 h-4 text-[#6cb1bb]" />
                              {t('projects.details.description')}
                            </h3>
                            <p className="text-foreground/70 whitespace-pre-wrap">{selectedProject.description || '-'}</p>
                          </div>

                          {/* Features */}
                          {selectedProject.features && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Layers className="w-4 h-4 text-[#ba9fdf]" />
                                {t('projects.details.features')}
                              </h3>
                              <p className="text-foreground/70 whitespace-pre-wrap">{selectedProject.features}</p>
                            </div>
                          )}

                          {/* Target Audience */}
                          {selectedProject.target_audience && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Target className="w-4 h-4 text-[#ea4c89]" />
                                {t('projects.details.targetAudience')}
                              </h3>
                              <p className="text-foreground/70">{selectedProject.target_audience}</p>
                            </div>
                          )}

                          {/* Services */}
                          {selectedProject.services && selectedProject.services.length > 0 && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Wrench className="w-4 h-4 text-[#9c984d]" />
                                {t('projects.details.services')}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedProject.services.map((service) => (
                                  <span key={service} className="text-sm bg-muted/50 border border-border text-foreground/70 px-3 py-1 rounded-lg">
                                    {t(`projects.services.${service}`)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Platforms */}
                          {selectedProject.platforms && selectedProject.platforms.length > 0 && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Monitor className="w-4 h-4 text-[#6cb1bb]" />
                                {t('projects.details.platforms')}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedProject.platforms.map((platform) => (
                                  <span key={platform} className="text-sm bg-muted/50 border border-border text-foreground/70 px-3 py-1 rounded-lg">
                                    {platform}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Budget & Deadline */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedProject.budget && (
                              <div className="bg-muted/50 rounded-xl p-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                                  <Euro className="w-4 h-4 text-[#9c984d]" />
                                  {t('projects.details.budget')}
                                </h3>
                                <p className="text-foreground/70">{t(`projects.budget.${selectedProject.budget}`)}</p>
                              </div>
                            )}
                            {selectedProject.deadline && (
                              <div className="bg-muted/50 rounded-xl p-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                                  <Clock className="w-4 h-4 text-[#ea4c89]" />
                                  {t('projects.details.deadline')}
                                </h3>
                                <p className="text-foreground/70">{t(`projects.deadline.${selectedProject.deadline}`)}</p>
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          {selectedProject.additional_info && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <MessageCircle className="w-4 h-4 text-[#7f7074]" />
                                {t('projects.details.additionalInfo')}
                              </h3>
                              <p className="text-foreground/70 whitespace-pre-wrap">{selectedProject.additional_info}</p>
                            </div>
                          )}

                          {/* Attached Files */}
                          {(selectedProject.specifications_file ||
                            (selectedProject.design_files && selectedProject.design_files.length > 0) ||
                            (selectedProject.brand_assets && selectedProject.brand_assets.length > 0) ||
                            (selectedProject.inspiration_images && selectedProject.inspiration_images.length > 0) ||
                            (selectedProject.other_documents && selectedProject.other_documents.length > 0)) && (
                            <div>
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                                <Paperclip className="w-4 h-4 text-[#6cb1bb]" />
                                {t('projects.details.attachedFiles')}
                              </h3>
                              <div className="space-y-4">
                                {selectedProject.specifications_file && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.specificationsFile')}</p>
                                    <ProjectFileItem file={selectedProject.specifications_file} />
                                  </div>
                                )}
                                {selectedProject.design_files && selectedProject.design_files.length > 0 && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.designFiles')}</p>
                                    <div className="space-y-2">
                                      {selectedProject.design_files.map((file, index) => (
                                        <ProjectFileItem key={file.path || index} file={file} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {selectedProject.brand_assets && selectedProject.brand_assets.length > 0 && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.brandAssets')}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {selectedProject.brand_assets.map((file, index) => (
                                        <ProjectImageItem key={file.path || index} file={file} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {selectedProject.inspiration_images && selectedProject.inspiration_images.length > 0 && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.inspirationImages')}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {selectedProject.inspiration_images.map((file, index) => (
                                        <ProjectImageItem key={file.path || index} file={file} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {selectedProject.other_documents && selectedProject.other_documents.length > 0 && (
                                  <div>
                                    <p className="text-xs text-foreground/50 mb-2">{t('projects.form.otherDocuments')}</p>
                                    <div className="space-y-2">
                                      {selectedProject.other_documents.map((file, index) => (
                                        <ProjectFileItem key={file.path || index} file={file} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quotes Sub-Section */}
                    {projectSubSection === 'quotes' && (
                      <div className="bg-white border border-border rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <Receipt className="w-5 h-5 text-[#9c984d]" />
                            {showQuoteForm
                              ? (editingQuote?.name || t('quotes.newQuote'))
                              : t('quotes.title')
                            }
                          </h3>
                          {showQuoteForm ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowQuoteForm(false)
                                setEditingQuote(null)
                              }}
                              className="text-foreground/50 hover:text-foreground"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingQuote(null)
                                setShowQuoteForm(true)
                              }}
                              className="bg-gray-900 hover:bg-gray-800 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t('quotes.newQuote')}
                            </Button>
                          )}
                        </div>

                        {showQuoteForm && (
                          <div className="p-4 border-b border-border bg-muted/50">
                            <QuoteForm
                              projectId={selectedProject.id}
                              project={selectedProject}
                              quote={editingQuote}
                              onSuccess={() => {
                                setShowQuoteForm(false)
                                setEditingQuote(null)
                                loadQuotes(selectedProject.id)
                              }}
                              onCancel={() => {
                                setShowQuoteForm(false)
                                setEditingQuote(null)
                              }}
                            />
                          </div>
                        )}

                        {!showQuoteForm && (
                          quotesLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                            </div>
                          ) : quotes.length === 0 ? (
                            <div className="text-center py-12">
                              <Receipt className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                              <p className="text-foreground/50">{t('quotes.noQuotes')}</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-border">
                              {quotes.map((quote) => {
                                const quoteData = calculateQuoteData(quote)
                                return (
                                <div key={quote.id} className="p-4 hover:bg-primary/5 transition-colors">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <span className="font-medium text-foreground">
                                        {quote.name || `${t('quotes.version')} ${quote.version}`}
                                      </span>
                                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getQuoteStatusBadgeClass(quote.status)}`}>
                                        {t(`quotes.status.${quote.status}`)}
                                      </span>
                                      <span className="text-sm font-semibold text-[#d4a5a5]">
                                        {formatCurrency(quoteData.totalTTC)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Export buttons - always visible */}
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => exportQuoteToExcel(quote, selectedProject?.title)}
                                        title={t('quotes.exportExcel')}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      >
                                        <FileSpreadsheet className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => exportQuoteToPdf(quote, selectedProject, user?.user_metadata as Profile | undefined)}
                                        title={t('quotes.exportPdf')}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </Button>
                                      {quote.status === 'draft' && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              setEditingQuote(quote)
                                              setShowQuoteForm(true)
                                            }}
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setDeletingQuote(quote)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )})}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Messages Section */}
                    {projectSubSection === 'messages' && (
                      <>
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-white flex items-center justify-between flex-shrink-0">
                          <div>
                            <h3 className="font-semibold text-foreground">{selectedProject.title || t('projects.untitled')}</h3>
                            <p className="text-sm text-foreground/50">{t('messages.conversationWith')}</p>
                          </div>
                        </div>
                        {/* Message thread */}
                        <div className="flex-1 bg-muted/50 overflow-hidden">
                          <MessageThread
                            projectId={selectedProject.id}
                            currentUser={{
                              id: user?.id || '',
                              first_name: user?.user_metadata?.first_name,
                              last_name: user?.user_metadata?.last_name,
                              avatar_url: user?.user_metadata?.avatar_url,
                              role: userRole
                            }}
                            otherParty={selectedProject.profiles}
                          />
                        </div>
                      </>
                    )}

                    {/* Documents Section */}
                    {projectSubSection === 'documents' && (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="font-semibold text-foreground">{t('documents.title')}</h3>
                            <p className="text-sm text-foreground/50">{t('documents.subtitle')}</p>
                          </div>
                          {isEngineer && (
                            <Button
                              onClick={() => setShowUploadModal(true)}
                              className="bg-action hover:bg-action/90 text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {t('documents.upload')}
                            </Button>
                          )}
                        </div>

                        {/* Upload Modal */}
                        {showUploadModal && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                              <div className="p-4 border-b border-border">
                                <h3 className="font-semibold text-foreground">{t('documents.uploadModal.title')}</h3>
                              </div>
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault()
                                  const form = e.target as HTMLFormElement
                                  const formData = new FormData(form)
                                  const name = formData.get('name') as string
                                  const description = formData.get('description') as string
                                  const type = formData.get('type') as ProjectDocumentType
                                  const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
                                  const file = fileInput?.files?.[0]

                                  if (!file || !name || !type) return

                                  setUploadingDocument(true)
                                  const { error } = await uploadDocument(selectedProject.id, file, {
                                    name,
                                    description: description || undefined,
                                    type
                                  })
                                  setUploadingDocument(false)

                                  if (!error) {
                                    setShowUploadModal(false)
                                    loadDocuments(selectedProject.id)
                                  }
                                }}
                                className="p-4 space-y-4"
                              >
                                <div>
                                  <Label htmlFor="doc-name">{t('documents.uploadModal.name')}</Label>
                                  <Input
                                    id="doc-name"
                                    name="name"
                                    placeholder={t('documents.uploadModal.namePlaceholder')}
                                    required
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="doc-description">{t('documents.uploadModal.description')}</Label>
                                  <Textarea
                                    id="doc-description"
                                    name="description"
                                    placeholder={t('documents.uploadModal.descriptionPlaceholder')}
                                    className="mt-1"
                                    rows={2}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="doc-type">{t('documents.uploadModal.type')}</Label>
                                  <select
                                    id="doc-type"
                                    name="type"
                                    required
                                    className="mt-1 w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                  >
                                    <option value="signed_quote">{t('documents.types.signed_quote')}</option>
                                    <option value="contract">{t('documents.types.contract')}</option>
                                    <option value="invoice">{t('documents.types.invoice')}</option>
                                    <option value="kickoff">{t('documents.types.kickoff')}</option>
                                    <option value="steering_committee">{t('documents.types.steering_committee')}</option>
                                    <option value="documentation">{t('documents.types.documentation')}</option>
                                    <option value="specification">{t('documents.types.specification')}</option>
                                    <option value="mockup">{t('documents.types.mockup')}</option>
                                    <option value="deliverable">{t('documents.types.deliverable')}</option>
                                    <option value="other">{t('documents.types.other')}</option>
                                  </select>
                                </div>
                                <div>
                                  <Label htmlFor="doc-file">{t('documents.uploadModal.file')}</Label>
                                  <Input
                                    id="doc-file"
                                    name="file"
                                    type="file"
                                    required
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1"
                                  >
                                    {t('documents.uploadModal.cancel')}
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={uploadingDocument}
                                    className="flex-1 bg-action hover:bg-action/90 text-white"
                                  >
                                    {uploadingDocument ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('documents.uploadModal.uploading')}
                                      </>
                                    ) : (
                                      t('documents.uploadModal.submit')
                                    )}
                                  </Button>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}

                        {/* Documents List */}
                        {documentsLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                          </div>
                        ) : documents.length === 0 ? (
                          <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
                            <FolderOpen className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                            <p className="text-foreground/70 font-medium">{t('documents.empty')}</p>
                            <p className="text-foreground/50 text-sm mt-1">{t('documents.emptyDescription')}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                                    {getFileIcon(doc.file_type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                                          <span className="text-xs bg-action/10 text-action px-1.5 py-0.5 rounded font-medium">
                                            v{doc.version}
                                          </span>
                                        </div>
                                        <span className="inline-block text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded mt-1">
                                          {t(`documents.types.${doc.type}`)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Download button */}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={async () => {
                                            const { url } = await getDocumentDownloadUrl(doc.file_path)
                                            if (url) {
                                              window.open(url, '_blank')
                                            }
                                          }}
                                          className="text-foreground/60 hover:text-foreground"
                                          title={t('documents.download')}
                                        >
                                          <Download className="w-4 h-4" />
                                        </Button>
                                        {/* New version button (engineer only) */}
                                        {isEngineer && (
                                          <>
                                            <label className="cursor-pointer">
                                              <input
                                                type="file"
                                                className="hidden"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0]
                                                  if (!file) return
                                                  setUploadingNewVersionId(doc.id)
                                                  const { error } = await uploadNewVersion(doc.id, file)
                                                  setUploadingNewVersionId(null)
                                                  if (!error) {
                                                    loadDocuments(selectedProject.id)
                                                  }
                                                  e.target.value = ''
                                                }}
                                                disabled={uploadingNewVersionId === doc.id}
                                              />
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="text-foreground/60 hover:text-foreground"
                                                title={t('documents.newVersion')}
                                              >
                                                <span>
                                                  {uploadingNewVersionId === doc.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                  ) : (
                                                    <UploadCloud className="w-4 h-4" />
                                                  )}
                                                </span>
                                              </Button>
                                            </label>
                                            {/* Delete button */}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={async () => {
                                                if (confirm(t('documents.deleteConfirm'))) {
                                                  setDeletingDocumentId(doc.id)
                                                  await deleteDocument(doc.id)
                                                  setDeletingDocumentId(null)
                                                  loadDocuments(selectedProject.id)
                                                }
                                              }}
                                              disabled={deletingDocumentId === doc.id}
                                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                              title={t('documents.delete')}
                                            >
                                              {deletingDocumentId === doc.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="w-4 h-4" />
                                              )}
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {doc.description && (
                                      <p className="text-sm text-foreground/60 mt-2">{doc.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-foreground/50">
                                      <span>{formatFileSize(doc.file_size)}</span>
                                      <span>{doc.file_name}</span>
                                      {doc.uploader && (
                                        <span>
                                          {t('documents.uploadedBy')} {doc.uploader.first_name} {doc.uploader.last_name} {t('documents.uploadedOn')} {new Date(doc.created_at).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                    {/* Version history toggle */}
                                    {doc.version > 1 && (
                                      <button
                                        onClick={async () => {
                                          if (expandedVersionsId === doc.id) {
                                            setExpandedVersionsId(null)
                                            setDocumentVersions([])
                                          } else {
                                            setExpandedVersionsId(doc.id)
                                            const { versions } = await getDocumentVersions(doc.id)
                                            setDocumentVersions(versions)
                                          }
                                        }}
                                        className="flex items-center gap-1 mt-3 text-xs text-action hover:text-action/80 transition-colors"
                                      >
                                        <History className="w-3 h-3" />
                                        {expandedVersionsId === doc.id ? t('documents.hideVersions') : t('documents.viewVersions')}
                                        {expandedVersionsId === doc.id ? (
                                          <ChevronDown className="w-3 h-3" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3" />
                                        )}
                                      </button>
                                    )}
                                    {/* Version history list */}
                                    {expandedVersionsId === doc.id && documentVersions.length > 0 && (
                                      <div className="mt-3 pl-3 border-l-2 border-border space-y-2">
                                        {documentVersions.filter(v => v.id !== doc.id).map((version) => (
                                          <div key={version.id} className="flex items-center justify-between text-xs text-foreground/60">
                                            <div className="flex items-center gap-2">
                                              <span className="bg-muted px-1.5 py-0.5 rounded">v{version.version}</span>
                                              <span>{version.file_name}</span>
                                              <span>({formatFileSize(version.file_size)})</span>
                                              <span>{new Date(version.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={async () => {
                                                const { url } = await getDocumentDownloadUrl(version.file_path)
                                                if (url) {
                                                  window.open(url, '_blank')
                                                }
                                              }}
                                              className="h-6 w-6 p-0 text-foreground/50 hover:text-foreground"
                                            >
                                              <Download className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{t('dashboard.allProjects.title')}</h2>
                      <p className="text-foreground/60 text-sm">{t('dashboard.allProjects.subtitle')}</p>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-foreground/50" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      >
                        <option value="all">{t('dashboard.allProjects.allStatuses')}</option>
                        <option value="pending">{t('projects.status.pending')}</option>
                        <option value="in_review">{t('projects.status.in_review')}</option>
                        <option value="active">{t('projects.status.active')}</option>
                        <option value="won">{t('projects.status.won')}</option>
                        <option value="lost">{t('projects.status.lost')}</option>
                        <option value="cancelled">{t('projects.status.cancelled')}</option>
                        <option value="closed">{t('projects.status.closed')}</option>
                      </select>
                    </div>
                  </div>

                  {projectsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                    </div>
                  ) : allProjects.length === 0 ? (
                    <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
                      <FileText className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                      <p className="text-foreground/70 font-medium">{t('dashboard.engineer.noProjects')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allProjects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="bg-white border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground mb-1">
                                {project.title || t('projects.untitled')}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.project_types?.map((type) => (
                                  <span key={type} className="text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded">
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
                            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}>
                              {t(`projects.status.${project.status}`)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Engineer Clients Section */}
          {activeSection === "clients" && isEngineer && (
            <div className="w-full">
              {(() => {
                // Calculate unique clients from allProjects with their profile info
                const clientMap = new Map<string, {
                  user_id: string
                  email: string
                  first_name: string
                  last_name: string
                  company_name: string
                  phone: string
                  avatar_url: string
                  project_count: number
                  projects: Project[]
                }>()

                allProjects.forEach(project => {
                  const existing = clientMap.get(project.user_id)
                  if (existing) {
                    existing.project_count++
                    existing.projects.push(project)
                  } else {
                    const profile = project.profiles
                    clientMap.set(project.user_id, {
                      user_id: project.user_id,
                      email: profile?.email || '',
                      first_name: profile?.first_name || '',
                      last_name: profile?.last_name || '',
                      company_name: profile?.company_name || '',
                      phone: profile?.phone || '',
                      avatar_url: profile?.avatar_url || '',
                      project_count: 1,
                      projects: [project]
                    })
                  }
                })
                const clients = Array.from(clientMap.values())

                // Get client display name
                const getClientDisplayName = (client: typeof clients[0]) => {
                  if (client.company_name) return client.company_name
                  if (client.first_name || client.last_name) {
                    return `${client.first_name} ${client.last_name}`.trim()
                  }
                  if (client.email) return client.email.split('@')[0]
                  return t('dashboard.clients.unknownClient')
                }

                // If a client is selected, show their detail view
                if (selectedClientId) {
                  const selectedClient = clients.find(c => c.user_id === selectedClientId)
                  if (!selectedClient) {
                    setSelectedClientId(null)
                    return null
                  }

                  return (
                    <div className="w-full">
                      <button
                        onClick={() => setSelectedClientId(null)}
                        className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t('dashboard.clients.backToList')}
                      </button>

                      {/* Client Info Card */}
                      <div className="bg-white border border-border rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center shrink-0 overflow-hidden">
                            {selectedClient.avatar_url ? (
                              <img
                                src={selectedClient.avatar_url}
                                alt={getClientDisplayName(selectedClient)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-bold text-white">
                                {(selectedClient.company_name?.[0] || selectedClient.first_name?.[0] || selectedClient.email?.[0] || 'C').toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-foreground mb-1">
                              {getClientDisplayName(selectedClient)}
                            </h2>
                            {selectedClient.company_name && (selectedClient.first_name || selectedClient.last_name) && (
                              <p className="text-foreground/60 mb-3">
                                {`${selectedClient.first_name} ${selectedClient.last_name}`.trim()}
                              </p>
                            )}

                            <div className="mt-4 space-y-2">
                              <h3 className="text-sm font-semibold text-foreground mb-2">{t('dashboard.clients.contactInfo')}</h3>
                              {selectedClient.email && (
                                <div className="flex items-center gap-2 text-sm text-foreground/70">
                                  <Mail className="w-4 h-4 text-foreground/50" />
                                  <a href={`mailto:${selectedClient.email}`} className="hover:text-foreground">
                                    {selectedClient.email}
                                  </a>
                                </div>
                              )}
                              {selectedClient.phone && (
                                <div className="flex items-center gap-2 text-sm text-foreground/70">
                                  <Phone className="w-4 h-4 text-foreground/50" />
                                  <a href={`tel:${selectedClient.phone}`} className="hover:text-foreground">
                                    {selectedClient.phone}
                                  </a>
                                </div>
                              )}
                              {selectedClient.company_name && (
                                <div className="flex items-center gap-2 text-sm text-foreground/70">
                                  <Building2 className="w-4 h-4 text-foreground/50" />
                                  {selectedClient.company_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Client Projects */}
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        {t('dashboard.clients.clientProjects')} ({selectedClient.project_count})
                      </h3>
                      <div className="space-y-4">
                        {selectedClient.projects.map((project) => (
                          <div
                            key={project.id}
                            onClick={() => {
                              setSelectedProject(project)
                              setActiveSection('allProjects')
                            }}
                            className="bg-white border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground mb-1">
                                  {project.title || t('projects.untitled')}
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {project.project_types?.map((type) => (
                                    <span key={type} className="text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded">
                                      {t(`projects.types.${type}`)}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm text-foreground/60 line-clamp-2">{project.description}</p>
                              </div>
                              <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}>
                                {t(`projects.status.${project.status}`)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                // Show client list
                return (
                  <>
                    <h2 className="text-xl font-bold text-foreground mb-2">{t('dashboard.clients.title')}</h2>
                    <p className="text-foreground/60 mb-6">{t('dashboard.clients.subtitle')}</p>

                    {clients.length === 0 ? (
                      <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
                        <Users className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                        <p className="text-foreground/70 font-medium">{t('dashboard.clients.noClients')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clients.map((client) => (
                          <div
                            key={client.user_id}
                            onClick={() => setSelectedClientId(client.user_id)}
                            className="bg-white border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden">
                                  {client.avatar_url ? (
                                    <img
                                      src={client.avatar_url}
                                      alt={getClientDisplayName(client)}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-lg font-bold text-white">
                                      {(client.company_name?.[0] || client.first_name?.[0] || client.email?.[0] || 'C').toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{getClientDisplayName(client)}</p>
                                  {client.company_name && (client.first_name || client.last_name) && (
                                    <p className="text-sm text-foreground/50">
                                      {`${client.first_name} ${client.last_name}`.trim()}
                                    </p>
                                  )}
                                  <p className="text-sm text-foreground/50">
                                    {client.project_count} {t('dashboard.clients.projectCount')}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-foreground/30" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </main>
      </div>

      {/* Delete confirmation modal */}
      {deletingProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('projects.actions.confirmDelete')}
            </h3>
            <p className="text-foreground/60 mb-6">
              {t('projects.actions.confirmDeleteDesc')}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingProject(null)}
                disabled={deleteLoading}
              >
                {t('projects.form.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProject}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('projects.actions.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete quote confirmation modal */}
      {deletingQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('quotes.actions.confirmDelete')}
            </h3>
            <p className="text-foreground/60 mb-6">
              {t('quotes.actions.confirmDeleteDesc')}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingQuote(null)}
                disabled={deleteQuoteLoading}
              >
                {t('quotes.form.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteQuote}
                disabled={deleteQuoteLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteQuoteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('quotes.actions.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send quote confirmation modal */}
      {sendingQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('quotes.actions.confirmSend')}
            </h3>
            <p className="text-foreground/60 mb-6">
              {t('quotes.actions.confirmSendDesc')}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSendingQuote(null)}
                disabled={sendQuoteLoading}
              >
                {t('quotes.form.cancel')}
              </Button>
              <Button
                onClick={handleSendQuote}
                disabled={sendQuoteLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {sendQuoteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Send className="w-4 h-4 mr-2" />
                {t('quotes.actions.send')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
