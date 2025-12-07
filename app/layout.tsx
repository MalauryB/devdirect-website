import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { LanguageProvider } from "@/contexts/language-context"
import { ContactProvider } from "@/contexts/contact-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ContactDialog } from "@/components/contact-dialog"
import { AuthModal } from "@/components/auth-modal"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Memo'ry - Experts en informatique, mathématiques et IA",
  description: "Services informatiques de qualité à prix justes. Applications web, mobiles, IoT. Équipe de développeurs expérimentés.",
  generator: "Memo'ry",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 5L95 27.5V72.5L50 95L5 72.5V27.5L50 5Z' fill='%23d4a5a5'/><path d='M50 5L95 27.5L50 50L5 27.5L50 5Z' fill='%23e8c4c4'/><path d='M50 50V95L5 72.5V27.5L50 50Z' fill='%23c48b8b'/><path d='M50 50V95L95 72.5V27.5L50 50Z' fill='%23d4a5a5'/></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`font-sans ${inter.variable}`}>
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