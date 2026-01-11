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
    // Nimbus cloud logo
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><ellipse cx='50' cy='55' rx='35' ry='20' fill='%23a8d5e5'/><circle cx='35' cy='45' r='18' fill='%23c4e4f0'/><circle cx='55' cy='38' r='22' fill='%23d4ecf4'/><circle cx='70' cy='50' r='15' fill='%23b8dce8'/><ellipse cx='50' cy='55' rx='35' ry='20' fill='%23a8d5e5'/></svg>",
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
              <Suspense fallback={null}>{children}</Suspense>
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