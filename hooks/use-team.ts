import { useState, useCallback } from "react"
import { teamMembersData, teamStatsData, TeamMember, TeamStat } from "@/data/team"

export function useTeam() {
  const [teamMembers] = useState<TeamMember[]>(teamMembersData)
  const [teamStats] = useState<TeamStat[]>(teamStatsData)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const handleMemberClick = useCallback((memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (member) {
      setSelectedMember(member)
      // Ici on pourrait ajouter de la logique comme ouvrir une modal, router, etc.
    }
  }, [teamMembers])

  const resetSelection = useCallback(() => {
    setSelectedMember(null)
  }, [])

  return {
    teamMembers,
    teamStats,
    selectedMember,
    handleMemberClick,
    resetSelection,
  }
}