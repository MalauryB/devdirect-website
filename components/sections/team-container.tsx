"use client"

import { TeamMemberCard } from "@/components/presentational/team-member-card"
import { StatCard } from "@/components/presentational/stat-card"
import { SectionHeader } from "@/components/presentational/section-header"
import { useTeam } from "@/hooks/use-team"

export function TeamContainer() {
  const { teamMembers, teamStats, handleMemberClick } = useTeam()

  return (
    <section id="team" className="py-20 px-4 relative overflow-hidden bg-white">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Notre"
            highlight="Équipe"
            description="Une équipe soudée de professionnels expérimentés, passionnés par les nouvelles technologies."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {teamStats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onMemberClick={handleMemberClick}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}