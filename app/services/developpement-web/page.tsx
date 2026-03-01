import type { Metadata } from "next"
import { ServiceDetail } from "@/components/service-detail"

export const metadata: Metadata = {
  title: "Développement Web - Nimli",
  description: "Création de sites web et applications web sur mesure. React, Next.js, Angular, Node.js. Solutions performantes et modernes.",
}

export default function Page() {
  return <ServiceDetail slug="developpement-web" />
}
