import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ServicesContainer } from "@/components/sections/services-container"
import { Process } from "@/components/process"
import { TeamContainer } from "@/components/sections/team-container"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <main className="pt-20">
        <Hero />
        <ServicesContainer />
        <Process />
        <TeamContainer />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
