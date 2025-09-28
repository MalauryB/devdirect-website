import { Globe, Smartphone, Cpu, Palette } from "lucide-react"

export interface Service {
  id: string
  icon: any
  title: string
  description: string
  image?: string
  features?: string[]
}

export const servicesData: Service[] = [
  {
    id: "web-apps",
    icon: Globe,
    title: "Applications Web",
    description:
      "Sites vitrine, plateformes SaaS, e-commerce. Technologies modernes et performantes pour tous vos besoins digitaux.",
    image: "modern-web-dev-workspace.png",
    features: ["React", "Next.js", "TypeScript", "Node.js"]
  },
  {
    id: "mobile-apps",
    icon: Smartphone,
    title: "Applications Mobiles",
    description: "Applications natives et cross-platform pour iOS et Android avec une expérience utilisateur optimale.",
    image: "project-3.png",
    features: ["React Native", "Flutter", "iOS", "Android"]
  },
  {
    id: "iot-integrations",
    icon: Cpu,
    title: "IoT & Intégrations",
    description: "Objets connectés, automatisation et intégrations système pour moderniser vos processus.",
    image: "iot-devices-and-sensors-connected.jpg",
    features: ["Arduino", "Raspberry Pi", "C++", "Docker"]
  },
  {
    id: "ux-ui-design",
    icon: Palette,
    title: "UX/UI Design",
    description: "Conception d'interfaces utilisateur modernes, intuitives et centrées sur l'expérience utilisateur.",
    image: "ui-ux-design-mockups-and-wireframes.jpg",
    features: ["Figma", "Adobe XD", "Prototyping", "User Research"]
  },
]