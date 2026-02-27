import { useEffect, useState, useCallback } from "react"
import { getUserProjects, getAllProjects } from "@/lib/projects"
import { Project, Quote, Profile, ProjectDocument } from "@/lib/types"
import { getQuotesByProject, getAllQuotes } from "@/lib/quotes"
import { getProjectDocuments } from "@/lib/documents"
import { getAllUnreadCounts, markMessagesAsRead } from "@/lib/messages"
import { getAllAssignments, assignAction, unassignAction, getEngineers, ActionAssignment, ActionType } from "@/lib/assignments"

interface UseDashboardDataProps {
  user: { id: string } | null
  isEngineer: boolean
  activeSection: string
  selectedProject: Project | null
  projectSubSection: string
}

export function useDashboardData({
  user,
  isEngineer,
  activeSection,
  selectedProject,
  projectSubSection,
}: UseDashboardDataProps) {
  // Projects
  const [projects, setProjects] = useState<Project[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [userProjectsLoading, setUserProjectsLoading] = useState(false)
  const [allProjectsLoading, setAllProjectsLoading] = useState(false)

  // Quotes
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [allQuotes, setAllQuotes] = useState<Quote[]>([])

  // Documents
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)

  // Unread counts & engineer data
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [unreadOldestDates, setUnreadOldestDates] = useState<Record<string, string>>({})
  const [assignments, setAssignments] = useState<ActionAssignment[]>([])
  const [engineers, setEngineers] = useState<Partial<Profile>[]>([])

  // Backward-compatible combined loading state
  const projectsLoading = userProjectsLoading || allProjectsLoading

  // --- Loaders ---

  const loadProjects = useCallback(async () => {
    if (!user) return
    setUserProjectsLoading(true)
    try {
      const { projects: userProjects } = await getUserProjects()
      setProjects(userProjects)
    } catch (error) {
      console.error('Error loading user projects:', error)
    } finally {
      setUserProjectsLoading(false)
    }
  }, [user])

  const loadAllProjects = useCallback(async () => {
    if (!user) return
    setAllProjectsLoading(true)
    try {
      const { projects: fetchedProjects } = await getAllProjects('all')
      setAllProjects(fetchedProjects)
    } catch (error) {
      console.error('Error loading all projects:', error)
    } finally {
      setAllProjectsLoading(false)
    }
  }, [user])

  const loadQuotes = useCallback(async (projectId: string) => {
    setQuotesLoading(true)
    try {
      const { quotes: fetchedQuotes } = await getQuotesByProject(projectId)
      setQuotes(fetchedQuotes)
    } catch (error) {
      console.error('Error loading quotes:', error)
    } finally {
      setQuotesLoading(false)
    }
  }, [])

  const loadDocuments = useCallback(async (projectId: string) => {
    setDocumentsLoading(true)
    try {
      const { documents: fetchedDocuments } = await getProjectDocuments(projectId)
      setDocuments(fetchedDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setDocumentsLoading(false)
    }
  }, [])

  const loadEngineerOverviewData = useCallback(async () => {
    if (!user) return
    try {
      const { counts, oldestDates } = await getAllUnreadCounts(user.id)
      setUnreadCounts(counts)
      setUnreadOldestDates(oldestDates)
      const { quotes: fetchedQuotes } = await getAllQuotes()
      setAllQuotes(fetchedQuotes)
      const { assignments: fetchedAssignments } = await getAllAssignments()
      setAssignments(fetchedAssignments)
      const { engineers: fetchedEngineers } = await getEngineers()
      setEngineers(fetchedEngineers)
    } catch (error) {
      console.error('Error loading engineer overview data:', error)
    }
  }, [user])

  // --- Actions ---

  const handleMarkAsHandled = useCallback(async (projectId: string) => {
    if (!user) return
    try {
      await markMessagesAsRead(projectId, user.id)
      const { counts, oldestDates } = await getAllUnreadCounts(user.id)
      setUnreadCounts(counts)
      setUnreadOldestDates(oldestDates)
    } catch (error) {
      console.error('Error marking messages as handled:', error)
    }
  }, [user])

  const handleAssignAction = useCallback(async (
    actionType: ActionType,
    engineerId: string | null,
    projectId?: string,
    quoteId?: string
  ) => {
    if (!user) return
    try {
      if (engineerId) {
        await assignAction(actionType, engineerId, user.id, projectId, quoteId)
      } else {
        await unassignAction(actionType, projectId, quoteId)
      }
      const { assignments: fetchedAssignments } = await getAllAssignments()
      setAssignments(fetchedAssignments)
    } catch (error) {
      console.error('Error assigning action:', error)
    }
  }, [user])

  // --- Effects ---

  // Load client projects
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (user && (activeSection === "projects" || activeSection === "messages")) {
        if (!cancelled) {
          loadProjects()
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, activeSection, loadProjects])

  // Load all projects (engineer)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (user && (activeSection === "allProjects" || activeSection === "overview" || activeSection === "clients")) {
        if (!cancelled) {
          loadAllProjects()
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, activeSection, loadAllProjects])

  // Load engineer overview data
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (user && isEngineer && activeSection === "overview") {
        if (!cancelled) {
          loadEngineerOverviewData()
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, isEngineer, activeSection, loadEngineerOverviewData])

  // Load unread counts for clients (badge)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (user && !isEngineer) {
        try {
          const { counts } = await getAllUnreadCounts(user.id)
          if (!cancelled) {
            setUnreadCounts(counts)
          }
        } catch (error) {
          console.error('Error loading client unread counts:', error)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, isEngineer])

  // Load engineer action counts at startup (badge)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (user && isEngineer) {
        try {
          const { counts } = await getAllUnreadCounts(user.id)
          if (!cancelled) {
            setUnreadCounts(counts)
          }
          const { quotes: fetchedQuotes } = await getAllQuotes()
          if (!cancelled) {
            setAllQuotes(fetchedQuotes)
          }
        } catch (error) {
          console.error('Error loading engineer action counts:', error)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, isEngineer])

  // Load quotes when project selected
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (selectedProject && isEngineer && activeSection === "allProjects") {
        if (!cancelled) {
          loadQuotes(selectedProject.id)
        }
      } else if (selectedProject && !isEngineer && activeSection === "projects") {
        if (!cancelled) {
          loadQuotes(selectedProject.id)
        }
      } else {
        if (!cancelled) {
          setQuotes([])
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedProject, isEngineer, activeSection, loadQuotes])

  // Load documents when entering documents section
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (selectedProject && projectSubSection === 'documents') {
        if (!cancelled) {
          loadDocuments(selectedProject.id)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedProject, projectSubSection, loadDocuments])

  return {
    // Projects
    projects,
    allProjects,
    projectsLoading,
    loadProjects,
    loadAllProjects,

    // Quotes
    quotes,
    quotesLoading,
    allQuotes,
    loadQuotes,

    // Documents
    documents,
    documentsLoading,
    loadDocuments,

    // Unread & engineer
    unreadCounts,
    unreadOldestDates,
    assignments,
    engineers,

    // Actions
    handleMarkAsHandled,
    handleAssignAction,
  }
}
