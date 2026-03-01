import { useEffect, useState, useCallback } from "react"
import { getProjectDocuments } from "@/lib/documents"
import { ProjectDocument, Project } from "@/lib/types"

interface UseDocumentsDataProps {
  selectedProject: Project | null
  projectSubSection: string
}

export function useDocumentsData({
  selectedProject,
  projectSubSection,
}: UseDocumentsDataProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)

  const loadDocuments = useCallback(async (projectId: string) => {
    setDocumentsLoading(true)
    try {
      const { documents: fetchedDocuments } = await getProjectDocuments(projectId)
      setDocuments(fetchedDocuments)
    } catch {
      // Error handled by state
    } finally {
      setDocumentsLoading(false)
    }
  }, [])

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
    documents,
    documentsLoading,
    loadDocuments,
  }
}
