import type { Metadata } from "next"
import { ServiceDetail } from "@/components/service-detail"

export const metadata: Metadata = {
  title: "Développement Mobile - Nimli",
  description: "Applications mobiles iOS et Android natives et cross-platform. Swift, Kotlin, Flutter, React Native. Expériences mobiles performantes.",
}

export default function Page() {
  return <ServiceDetail slug="developpement-mobile" />
}
