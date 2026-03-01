import { useEffect, useState, useCallback } from "react"
import { getQuotesByProject, getAllQuotes } from "@/lib/quotes"
import { Quote, Project } from "@/lib/types"

interface UseQuotesDataProps {
  user: { id: string } | null
  isEngineer: boolean
  activeSection: string
  selectedProject: Project | null
}

export function useQuotesData({
  user,
  isEngineer,
  activeSection,
  selectedProject,
}: UseQuotesDataProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [allQuotes, setAllQuotes] = useState<Quote[]>([])

  const loadQuotes = useCallback(async (projectId: string) => {
    setQuotesLoading(true)
    try {
      const { quotes: fetchedQuotes } = await getQuotesByProject(projectId)
      setQuotes(fetchedQuotes)
    } catch {
      // Error handled by state
    } finally {
      setQuotesLoading(false)
    }
  }, [])

  const loadAllQuotes = useCallback(async () => {
    if (!user) return
    try {
      const { quotes: fetchedQuotes } = await getAllQuotes()
      setAllQuotes(fetchedQuotes)
    } catch {
      // Error handled silently
    }
  }, [user])

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

  // Load all quotes at startup for engineers (badge)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (user && isEngineer) {
        try {
          const { quotes: fetchedQuotes } = await getAllQuotes()
          if (!cancelled) {
            setAllQuotes(fetchedQuotes)
          }
        } catch {
          // Error handled silently
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, isEngineer])

  return {
    quotes,
    quotesLoading,
    allQuotes,
    loadQuotes,
    setAllQuotes,
  }
}
