"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard?section=profile")
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-pulse text-foreground">Redirecting...</div>
    </div>
  )
}
