import { Users, Award, Clock } from "lucide-react"

export interface TeamMember {
  id: string
  role: string
  experience: string
  skills: string[]
  avatar?: string
  bio?: string
}

export interface TeamStat {
  id: string
  icon: any
  value: string
  label: string
  description?: string
}

export const teamMembersData: TeamMember[] = [
  {
    id: "fullstack-senior",
    role: "Développeur Full-Stack Senior",
    experience: "8+ ans",
    skills: ["React", "Node.js", "Python", "AWS"],
    avatar: "professional-developer-portrait.png",
  },
  {
    id: "mobile-expert",
    role: "Développeur Mobile Expert",
    experience: "6+ ans",
    skills: ["React Native", "Flutter", "iOS", "Android"],
    avatar: "mobile-developer-portrait.jpg",
  },
  {
    id: "iot-backend",
    role: "Développeur IoT & Backend",
    experience: "7+ ans",
    skills: ["Arduino", "Raspberry Pi", "C++", "Docker"],
    avatar: "iot-developer-portrait.jpg",
  },
  {
    id: "ux-designer",
    role: "UX/UI Designer",
    experience: "5+ ans",
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    avatar: "ux-designer-portrait.png",
  },
]

export const teamStatsData: TeamStat[] = [
  {
    id: "experts",
    icon: Users,
    value: "4",
    label: "Experts dédiés",
    description: "Une équipe soudée et complémentaire"
  },
  {
    id: "experience",
    icon: Award,
    value: "25+",
    label: "Années d'expérience cumulées",
    description: "Expertise reconnue dans nos domaines"
  },
  {
    id: "delivery",
    icon: Clock,
    value: "100%",
    label: "Projets livrés à temps",
    description: "Respect des délais garantis"
  },
]