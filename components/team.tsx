"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getImagePath } from "@/lib/assets"

export function Team() {
  const { t } = useLanguage()

  const teamMembers = t('team.members')

  const stats = [
    {
      icon: Users,
      value: "7",
      label: t('team.stats.experts'),
    },
    {
      icon: Award,
      value: "38+",
      label: t('team.stats.experience'),
    },
  ]
  return (
    <section id="team" className="py-20 px-4 relative overflow-hidden bg-background">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              {t('team.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t('team.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-md mx-auto md:max-w-none">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white text-center group">
              <CardContent className="pt-8 pb-6">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member: any, index: number) => (
            <Card key={index} className="bg-white group">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-semibold leading-tight">{member.name}</CardTitle>
                <div className="text-sm text-muted-foreground mb-1">{member.role}</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center">
                  {member.description}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
