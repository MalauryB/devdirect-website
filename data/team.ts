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
    id: "malaury-boudon",
    role: "Développeuse Full Stack",
    experience: "6+ ans",
    skills: ["React", "Angular", "Java", "Node.js", "Flutter", "Spring Boot"],
    avatar: "nobody.jpg",
    bio: "Ingénieure en informatique spécialisée en développement web et mobile, avec expertise en gestion de projet Agile"
  },
  {
    id: "alexandre-picavet",
    role: "Développeur Full Stack & DevOps",
    experience: "5+ ans",
    skills: ["Java", "TypeScript", "Angular", "React", "Spring Boot", "Kubernetes"],
    avatar: "nobody.jpg",
    bio: "Développeur passionné spécialisé en architecture moderne et environnements Linux, expert en DevOps et gestion de serveurs"
  },
  {
    id: "thomas-buresi",
    role: "Développeur Mobile iOS & Android",
    experience: "5+ ans",
    skills: ["Swift", "SwiftUI", "Kotlin", "Flutter", "React Native", "TypeScript"],
    avatar: "nobody.jpg",
    bio: "Ingénieur INSA Lyon spécialisé en développement mobile natif iOS et Flutter. Expert en applications bancaires, billettique NFC et architecture mobile"
  },
  {
    id: "luc-pommeret",
    role: "Chercheur en IA & Machine Learning",
    experience: "2+ ans",
    skills: ["Machine Learning", "NLP", "LLMs", "Python", "Logique", "Recherche"],
    avatar: "nobody.jpg",
    bio: "Chercheur spécialisé en intelligence artificielle et traitement du langage naturel, expert en modèles de langage et logique formelle"
  },
  {
    id: "juliette-delsaut",
    role: "UX UI Designer",
    experience: "5+ ans",
    skills: ["Figma", "UX Research", "Design System", "Prototypage", "Design Thinking", "UI Kit"],
    avatar: "nobody.jpg",
    bio: "Designer UX/UI avec formation en développement, spécialisée en recherche utilisateur et conception d'interfaces"
  },
  {
    id: "alex-podgorny",
    role: "Data Scientist & Statisticien",
    experience: "3+ ans",
    skills: ["Python", "Machine Learning", "R", "Statistics", "PyTorch", "SQL"],
    avatar: "nobody.jpg",
    bio: "Doctorant en statistique spécialisé en modélisation des risques extrêmes, machine learning et analyse de données massives. Expert en théorie des valeurs extrêmes (EVT)"
  },
  {
    id: "victor-talbot",
    role: "Technical Leader .NET/Java",
    experience: "12+ ans",
    skills: [".NET Core", "Java", "Angular", "C#", "ASP.NET", "Kotlin"],
    avatar: "nobody.jpg",
    bio: "Technical Leader full-stack avec 12 ans d'expérience. Expert en architecture logicielle, modernisation de SI et pilotage technique d'équipes projets complexes"
  },
]

export const teamStatsData: TeamStat[] = [
  {
    id: "experts",
    icon: Users,
    value: "7",
    label: "Experts spécialisés",
    description: "Une équipe pluridisciplinaire en développement, design et IA"
  },
  {
    id: "experience",
    icon: Award,
    value: "38+",
    label: "Années d'expérience cumulées",
    description: "Expertise académique et industrielle reconnue"
  },
  {
    id: "delivery",
    icon: Clock,
    value: "100%",
    label: "Projets livrés à temps",
    description: "Respect des délais et de la qualité"
  },
]