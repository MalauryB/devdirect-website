import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { Process } from "@/components/process"
import { Team } from "@/components/team"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <main className="pt-20">
        <Hero />
        <Services />
        <Process />
        <Team />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
