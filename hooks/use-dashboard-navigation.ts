import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Project, Profile, Quote } from "@/lib/types"

export type SubSection = 'details' | 'quotes' | 'messages' | 'documents' | 'time' | 'roadmap' | 'contracts' | 'finances'

interface UseDashboardNavigationProps {
  user: { id: string } | null
  loading: boolean
  isEngineer: boolean
}

export function useDashboardNavigation({
  user,
  loading,
  isEngineer,
}: UseDashboardNavigationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  // Project navigation
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectSubSection, setProjectSubSection] = useState<SubSection>('details')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  // Project form state (client)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Modal state
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null)
  const [deleteQuoteLoading, setDeleteQuoteLoading] = useState(false)
  const [viewingClientProfile, setViewingClientProfile] = useState<Profile | null>(null)

  // Ref to skip URL restoration during programmatic navigation
  const isNavigatingRef = useRef(false)

  // Ref for project lists (updated externally by the page)
  const projectListsRef = useRef<{ projects: Project[]; allProjects: Project[] }>({
    projects: [],
    allProjects: [],
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to home if not authenticated
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/")
    }
  }, [user, loading, router, mounted])

  // Read URL params on mount and set state
  useEffect(() => {
    if (isNavigatingRef.current) return

    const section = searchParams.get("section")
    const projectId = searchParams.get("project")
    const subSection = searchParams.get("sub") as SubSection | null
    const clientId = searchParams.get("client")

    const validSections = isEngineer
      ? ["overview", "allProjects", "clients", "profile"]
      : ["about", "projects", "profile", "messages"]

    if (section && validSections.includes(section)) {
      setActiveSection(section)
    } else if (!activeSection) {
      setActiveSection(isEngineer ? "overview" : "about")
    }

    const { projects, allProjects } = projectListsRef.current
    if (projectId && (allProjects.length > 0 || projects.length > 0)) {
      const projectList = isEngineer ? allProjects : projects
      const project = projectList.find(p => p.id === projectId)
      if (project && !selectedProject) {
        setSelectedProject(project)
        if (subSection) {
          setProjectSubSection(subSection)
        }
      }
    }

    if (clientId && isEngineer && !selectedClientId) {
      setSelectedClientId(clientId)
    }
  }, [searchParams, isEngineer, activeSection, projectListsRef.current.projects, projectListsRef.current.allProjects])

  // Update URL when navigation state changes
  useEffect(() => {
    if (!mounted || !activeSection) return

    const params = new URLSearchParams()
    params.set("section", activeSection)

    if (selectedProject) {
      params.set("project", selectedProject.id)
      params.set("sub", projectSubSection)
    }

    if (selectedClientId && activeSection === "clients") {
      params.set("client", selectedClientId)
    }

    const newUrl = `/dashboard?${params.toString()}`
    const currentUrl = window.location.pathname + window.location.search

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [mounted, activeSection, selectedProject, projectSubSection, selectedClientId, router])

  // --- Navigation helpers ---

  const navigateToProject = (project: Project, subSection: SubSection = 'details') => {
    isNavigatingRef.current = true
    setSelectedProject(project)
    setProjectSubSection(subSection)
    setTimeout(() => { isNavigatingRef.current = false }, 100)
  }

  const navigateToSection = (section: string) => {
    setActiveSection(section)
    setSidebarOpen(false)
    if (section === 'allProjects' || section === 'projects') {
      setSelectedProject(null)
    }
    if (section === 'clients') {
      setSelectedClientId(null)
    }
  }

  const navigateToProjectFromOverview = (project: Project, subSection: SubSection) => {
    setSelectedProject(project)
    setActiveSection('allProjects')
    setProjectSubSection(subSection)
  }

  const navigateToProjectFromClients = (project: Project) => {
    isNavigatingRef.current = true
    setSelectedClientId(null)
    setSelectedProject(project)
    setActiveSection('allProjects')
    setProjectSubSection('details')
    setTimeout(() => { isNavigatingRef.current = false }, 100)
  }

  const navigateToProjectFromFinances = (project: Project, subSection: SubSection = 'finances') => {
    setSelectedProject(project)
    setActiveSection('allProjects')
    setProjectSubSection(subSection)
  }

  const handleEditProject = () => {
    if (!selectedProject) return
    setEditingProject(selectedProject)
    setSelectedProject(null)
    setShowProjectForm(true)
  }

  return {
    // Core nav
    mounted,
    activeSection,
    sidebarOpen, setSidebarOpen,
    sidebarExpanded, setSidebarExpanded,

    // Project nav
    selectedProject, setSelectedProject,
    projectSubSection, setProjectSubSection,
    selectedClientId, setSelectedClientId,

    // Project form
    showProjectForm, setShowProjectForm,
    editingProject, setEditingProject,

    // Modals
    deletingProject, setDeletingProject,
    deleteLoading, setDeleteLoading,
    deletingQuote, setDeletingQuote,
    deleteQuoteLoading, setDeleteQuoteLoading,
    viewingClientProfile, setViewingClientProfile,

    // Navigation helpers
    navigateToSection,
    navigateToProject,
    navigateToProjectFromOverview,
    navigateToProjectFromClients,
    navigateToProjectFromFinances,
    handleEditProject,

    // Ref for project lists (set externally)
    projectListsRef,
  }
}
