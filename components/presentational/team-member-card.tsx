import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TeamMember } from "@/data/team"
import { getImagePath } from "@/lib/assets"

interface TeamMemberCardProps {
  member: TeamMember
  onMemberClick?: (memberId: string) => void
  className?: string
}

export function TeamMemberCard({ member, onMemberClick, className = "" }: TeamMemberCardProps) {
  return (
    <Card
      className={`bg-white border border-primary/20 group cursor-pointer hover:shadow-lg transition-all duration-300 ${className}`}
      onClick={() => onMemberClick?.(member.id)}
    >
      <CardHeader className="text-center">
        <div className="relative mx-auto mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/30 group-hover:border-primary/50 transition-colors">
            <img
              src={getImagePath(member.avatar)}
              alt={`Portrait de ${member.role}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-primary/30 group-hover:border-primary/50 transition-colors">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>
        </div>
        <CardTitle className="text-base font-medium leading-tight">{member.role}</CardTitle>
        <div className="text-primary font-semibold text-sm">{member.experience}</div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center">
          {member.skills.map((skill, skillIndex) => (
            <Badge
              key={skillIndex}
              variant="secondary"
              className="text-xs bg-primary/10 border-primary/20 hover:border-primary/40 transition-colors"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}