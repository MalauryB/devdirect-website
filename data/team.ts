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
    id: "ai-researcher",
    role: "Expert en Intelligence Artificielle",
    experience: "10+ ans",
    skills: ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
    avatar: "ai-researcher-portrait.png",
    bio: "Docteur en IA, spécialisé dans les réseaux de neurones et l'apprentissage automatique"
  },
  {
    id: "data-scientist",
    role: "Data Scientist & Mathématicien",
    experience: "8+ ans",
    skills: ["Statistiques", "Python", "R", "Optimisation"],
    avatar: "data-scientist-portrait.jpg",
    bio: "Expert en analyse de données complexes et modélisation mathématique"
  },
  {
    id: "software-architect",
    role: "Architecte Logiciel Senior",
    experience: "12+ ans",
    skills: ["Architecture", "Microservices", "Cloud", "DevOps"],
    avatar: "software-architect-portrait.jpg",
    bio: "Spécialisé dans la conception de systèmes distribués et scalables"
  },
  {
    id: "research-engineer",
    role: "Ingénieur de Recherche",
    experience: "7+ ans",
    skills: ["Algorithmes", "Optimisation", "Calcul Scientifique", "HPC"],
    avatar: "research-engineer-portrait.png",
    bio: "Expert en algorithmes avancés et calcul haute performance"
  },
]

export const teamStatsData: TeamStat[] = [
  {
    id: "experts",
    icon: Users,
    value: "4",
    label: "Experts spécialisés",
    description: "Une équipe pluridisciplinaire en IA, maths et informatique"
  },
  {
    id: "experience",
    icon: Award,
    value: "37+",
    label: "Années d'expérience cumulées",
    description: "Expertise académique et industrielle reconnue"
  },
  {
    id: "delivery",
    icon: Clock,
    value: "100%",
    label: "Projets livrés à temps",
    description: "Respect des délais et de la qualité scientifique"
  },
]