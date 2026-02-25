import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
