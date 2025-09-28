import { Card, CardContent } from "@/components/ui/card"
import { TeamStat } from "@/data/team"

interface StatCardProps {
  stat: TeamStat
  className?: string
}

export function StatCard({ stat, className = "" }: StatCardProps) {
  const Icon = stat.icon

  return (
    <Card className={`bg-white border border-primary/20 text-center group hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="pt-8 pb-6">
        <div className="flex justify-center mb-4">
          <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">
          {stat.value}
        </div>
        <div className="text-muted-foreground font-medium mb-1">{stat.label}</div>
        {stat.description && (
          <div className="text-xs text-muted-foreground/70">{stat.description}</div>
        )}
      </CardContent>
    </Card>
  )
}