import type { Metadata } from "next"
import { ServiceDetail } from "@/components/service-detail"

export const metadata: Metadata = {
  title: "Design & Maquettes - Nimli",
  description: "Conception UX/UI et maquettes sur mesure. Figma, design systems, prototypage, recherche utilisateur. Interfaces intuitives et modernes.",
}

export default function Page() {
  return <ServiceDetail slug="design-maquettes" />
}
