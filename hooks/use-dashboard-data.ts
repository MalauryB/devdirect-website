import { Project } from "@/lib/types"
import { useProjectsData } from "@/hooks/use-projects-data"
import { useQuotesData } from "@/hooks/use-quotes-data"
import { useDocumentsData } from "@/hooks/use-documents-data"
import { useEngineersData } from "@/hooks/use-engineers-data"

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
  const {
    projects,
    allProjects,
    projectsLoading,
    loadProjects,
    loadAllProjects,
  } = useProjectsData({ user, activeSection })

  const {
    quotes,
    quotesLoading,
    allQuotes,
    loadQuotes,
  } = useQuotesData({ user, isEngineer, activeSection, selectedProject })

  const {
    documents,
    documentsLoading,
    loadDocuments,
  } = useDocumentsData({ selectedProject, projectSubSection })

  const {
    unreadCounts,
    unreadOldestDates,
    assignments,
    engineers,
    handleMarkAsHandled,
    handleAssignAction,
  } = useEngineersData({ user, isEngineer, activeSection })

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
