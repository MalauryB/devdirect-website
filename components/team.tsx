import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Clock } from "lucide-react"

const teamMembers = [
  {
    role: "Développeuse Full-Stack Senior",
    experience: "6+ ans",
    skills: ["React", "Angular", "Java", "Node.js", "Spring Boot", "Flutter", "PostgreSQL"],
    avatar: "/experts/malaury_boudon.jpg",
  },
  {
    role: "Développeur Full-Stack Expert",
    experience: "5+ ans",
    skills: ["TypeScript", "Java", "Angular", "React", "Spring Boot", "Kubernetes", "Docker"],
    avatar: "/mobile-developer-portrait.jpg",
  },
  {
    role: "Développeur Mobile Expert",
    experience: "4+ ans",
    skills: ["Swift", "Kotlin", "Flutter", "React Native", "iOS", "Android", "TypeScript"],
    avatar: "/iot-developer-portrait.jpg",
  },
  {
    role: "UX/UI Designer",
    experience: "5+ ans",
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    avatar: "/ux-designer-portrait.png",
  },
]

const stats = [
  {
    icon: Users,
    value: "4",
    label: "Experts dédiés",
  },
  {
    icon: Award,
    value: "25+",
    label: "Années d'expérience cumulées",
  },
  {
    icon: Clock,
    value: "100%",
    label: "Projets livrés à temps",
  },
]

export function Team() {
  return (
    <section id="team" className="py-20 px-4 relative overflow-hidden bg-white">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Notre <span className="text-primary">Équipe</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Une équipe soudée de professionnels expérimentés, passionnés par les nouvelles technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border border-primary/20 text-center group">
              <CardContent className="pt-8 pb-6">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="bg-white border border-primary/20 group">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/30">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.role}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-primary/30">
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
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
