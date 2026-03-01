import { useEffect, useState, useCallback } from "react"
import { getAllUnreadCounts, markMessagesAsRead } from "@/lib/messages"
import { getAllAssignments, assignAction, unassignAction, getEngineers, ActionAssignment, ActionType } from "@/lib/assignments"
import { Profile } from "@/lib/types"

interface UseEngineersDataProps {
  user: { id: string } | null
  isEngineer: boolean
  activeSection: string
}

export function useEngineersData({
  user,
  isEngineer,
  activeSection,
}: UseEngineersDataProps) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [unreadOldestDates, setUnreadOldestDates] = useState<Record<string, string>>({})
  const [assignments, setAssignments] = useState<ActionAssignment[]>([])
  const [engineers, setEngineers] = useState<Partial<Profile>[]>([])

  const loadEngineerOverviewData = useCallback(async () => {
    if (!user) return
    try {
      const { counts, oldestDates } = await getAllUnreadCounts(user.id)
      setUnreadCounts(counts)
      setUnreadOldestDates(oldestDates)
      const { assignments: fetchedAssignments } = await getAllAssignments()
      setAssignments(fetchedAssignments)
      const { engineers: fetchedEngineers } = await getEngineers()
      setEngineers(fetchedEngineers)
    } catch {
      // Error handled by state
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
    } catch {
      // Error handled silently
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
    } catch {
      // Error handled silently
    }
  }, [user])

  // --- Effects ---

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
        } catch {
          // Error handled silently
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
        } catch {
          // Error handled silently
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, isEngineer])

  return {
    unreadCounts,
    unreadOldestDates,
    assignments,
    engineers,
    handleMarkAsHandled,
    handleAssignAction,
  }
}
