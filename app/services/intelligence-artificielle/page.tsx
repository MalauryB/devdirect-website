import type { Metadata } from "next"
import { ServiceDetail } from "@/components/service-detail"

export const metadata: Metadata = {
  title: "Intelligence Artificielle - Nimli",
  description: "Solutions d'intelligence artificielle et machine learning sur mesure. NLP, LLMs, analyse de données, automatisation intelligente.",
}

export default function Page() {
  return <ServiceDetail slug="intelligence-artificielle" />
}
