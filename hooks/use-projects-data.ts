import { useEffect, useState, useCallback } from "react"
import { getUserProjects, getAllProjects } from "@/lib/projects"
import { Project } from "@/lib/types"

interface UseProjectsDataProps {
  user: { id: string } | null
  activeSection: string
}

export function useProjectsData({ user, activeSection }: UseProjectsDataProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [userProjectsLoading, setUserProjectsLoading] = useState(false)
  const [allProjectsLoading, setAllProjectsLoading] = useState(false)

  const projectsLoading = userProjectsLoading || allProjectsLoading

  const loadProjects = useCallback(async () => {
    if (!user) return
    setUserProjectsLoading(true)
    try {
      const { projects: userProjects } = await getUserProjects()
      setProjects(userProjects)
    } catch {
      // Error handled by state
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
    } catch {
      // Error handled by state
    } finally {
      setAllProjectsLoading(false)
    }
  }, [user])

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

  return {
    projects,
    allProjects,
    projectsLoading,
    loadProjects,
    loadAllProjects,
  }
}
