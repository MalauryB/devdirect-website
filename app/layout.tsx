import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { LanguageProvider } from "@/contexts/language-context"
import { ContactProvider } from "@/contexts/contact-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ContactDialog } from "@/components/contact-dialog"
import { AuthModal } from "@/components/auth-modal"
import "./globals.css"

export const metadata: Metadata = {
  title: "Nimli - Experts en informatique, mathématiques et IA",
  description: "Services informatiques de qualité à prix justes. Applications web, mobiles, IoT. Équipe de développeurs expérimentés.",
  generator: "Nimli",
  icons: {
    icon: "/nimli-favicon.svg",
    apple: "/nimli-favicon.svg",
  },
  openGraph: {
    title: 'Nimli - Solutions numériques sur mesure',
    description: 'Services informatiques de qualité à prix justes. Applications web, mobiles, IoT. Équipe de développeurs expérimentés.',
    url: 'https://nimli.fr',
    siteName: 'Nimli',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Nimli - Solutions numériques sur mesure',
    description: 'Services informatiques de qualité à prix justes. Applications web, mobiles, IoT. Équipe de développeurs expérimentés.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <LanguageProvider>
          <AuthProvider>
            <ContactProvider>
              <Suspense fallback={
                <div className="min-h-screen bg-white flex items-center justify-center">
                  <div className="animate-pulse text-foreground">Chargement...</div>
                </div>
              }>{children}</Suspense>
              <ContactDialog />
              <AuthModal />
              {process.env.NODE_ENV === 'production' && <Analytics />}
            </ContactProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}