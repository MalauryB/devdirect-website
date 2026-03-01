import type { Metadata } from "next"
import { ServiceDetail } from "@/components/service-detail"

export const metadata: Metadata = {
  title: "IoT & Systèmes Embarqués - Nimli",
  description: "Développement de solutions IoT et systèmes embarqués. Capteurs connectés, protocoles industriels, architectures temps réel.",
}

export default function Page() {
  return <ServiceDetail slug="iot-embarque" />
}
