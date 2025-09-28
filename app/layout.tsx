import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Memo'ry - Experts en informatique, mathématiques et IA",
  description:
    "Services informatiques de qualité à prix justes. Applications web, mobiles, IoT. Équipe de développeurs expérimentés.",
  generator: "Memo'ry",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${inter.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
