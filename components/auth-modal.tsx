"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

type AuthMode = "login" | "register" | "forgot"

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp, resetPassword } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
  }

  const handleClose = () => {
    resetForm()
    setMode("login")
    closeAuthModal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) {
      setError(t('auth.errors.emailRequired'))
      return
    }

    if (mode !== "forgot" && !password) {
      setError(t('auth.errors.fieldsRequired'))
      return
    }

    if (mode === "register" && password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'))
      return
    }

    if (mode !== "forgot" && password.length < 6) {
      setError(t('auth.errors.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password)
        if (error) {
          setError(t('auth.errors.invalidCredentials'))
        } else {
          handleClose()
          router.push("/dashboard")
        }
      } else if (mode === "register") {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setSuccess(t('auth.success.checkEmail'))
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setSuccess(t('auth.success.resetEmail'))
        }
      }
    } catch {
      setError(t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setError("")
    setSuccess("")
  }

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" && t('auth.login.title')}
            {mode === "register" && t('auth.register.title')}
            {mode === "forgot" && t('auth.forgot.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </p>
          )}

          <Button type="submit" className="w-full bg-white hover:bg-white/90 text-foreground border-2 border-action" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "login" && t('auth.login.button')}
            {mode === "register" && t('auth.register.button')}
            {mode === "forgot" && t('auth.forgot.button')}
          </Button>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
              className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
            >
              {t('auth.login.forgotPassword')}
            </button>
          )}

          <p className="text-sm text-center text-muted-foreground">
            {mode === "login" && t('auth.login.noAccount')}
            {mode === "register" && t('auth.register.hasAccount')}
            {mode === "forgot" && t('auth.forgot.rememberPassword')}
            {" "}
            <button
              type="button"
              onClick={() => {
                if (mode === "forgot") {
                  setMode("login")
                } else {
                  setMode(mode === "login" ? "register" : "login")
                }
                setError("")
                setSuccess("")
              }}
              className="text-action hover:underline font-medium"
            >
              {mode === "login" && t('auth.login.createAccount')}
              {mode === "register" && t('auth.register.login')}
              {mode === "forgot" && t('auth.forgot.backToLogin')}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
