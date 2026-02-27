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
  const [projectsLoading, setProjectsLoading] = useState(false)

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

  // --- Loaders ---

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
    const { projects: fetchedProjects } = await getAllProjects('all')
    setAllProjects(fetchedProjects)
    setProjectsLoading(false)
  }, [user])

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

  const loadEngineerOverviewData = useCallback(async () => {
    if (!user) return
    const { counts, oldestDates } = await getAllUnreadCounts(user.id)
    setUnreadCounts(counts)
    setUnreadOldestDates(oldestDates)
    const { quotes: fetchedQuotes } = await getAllQuotes()
    setAllQuotes(fetchedQuotes)
    const { assignments: fetchedAssignments } = await getAllAssignments()
    setAssignments(fetchedAssignments)
    const { engineers: fetchedEngineers } = await getEngineers()
    setEngineers(fetchedEngineers)
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
    if (user && (activeSection === "projects" || activeSection === "messages")) {
      loadProjects()
    }
  }, [user, activeSection, loadProjects])

  // Load all projects (engineer)
  useEffect(() => {
    if (user && (activeSection === "allProjects" || activeSection === "overview" || activeSection === "clients")) {
      loadAllProjects()
    }
  }, [user, activeSection, loadAllProjects])

  // Load engineer overview data
  useEffect(() => {
    if (user && isEngineer && activeSection === "overview") {
      loadEngineerOverviewData()
    }
  }, [user, isEngineer, activeSection, loadEngineerOverviewData])

  // Load unread counts for clients (badge)
  useEffect(() => {
    const loadClientUnreadCounts = async () => {
      if (user && !isEngineer) {
        const { counts } = await getAllUnreadCounts(user.id)
        setUnreadCounts(counts)
      }
    }
    loadClientUnreadCounts()
  }, [user, isEngineer])

  // Load engineer action counts at startup (badge)
  useEffect(() => {
    const loadEngineerActionCounts = async () => {
      if (user && isEngineer) {
        const { counts } = await getAllUnreadCounts(user.id)
        setUnreadCounts(counts)
        const { quotes: fetchedQuotes } = await getAllQuotes()
        setAllQuotes(fetchedQuotes)
      }
    }
    loadEngineerActionCounts()
  }, [user, isEngineer])

  // Load quotes when project selected
  useEffect(() => {
    if (selectedProject && isEngineer && activeSection === "allProjects") {
      loadQuotes(selectedProject.id)
    } else if (selectedProject && !isEngineer && activeSection === "projects") {
      loadQuotes(selectedProject.id)
    } else {
      setQuotes([])
    }
  }, [selectedProject, isEngineer, activeSection, loadQuotes])

  // Load documents when entering documents section
  useEffect(() => {
    if (selectedProject && projectSubSection === 'documents') {
      loadDocuments(selectedProject.id)
    }
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
