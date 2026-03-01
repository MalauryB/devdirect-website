"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

type AuthMode = "login" | "register" | "forgot"

interface DevisAuthFormProps {
  loading: boolean
  success: boolean
}

export function DevisAuthForm({ loading: externalLoading, success }: DevisAuthFormProps) {
  const { t } = useLanguage()
  const { signIn, signUp, resetPassword } = useAuth()

  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [authSuccess, setAuthSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const isLoading = loading || externalLoading

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setAuthSuccess("")

    if (!email) {
      setError(t('auth.errors.emailRequired'))
      return
    }

    if (authMode !== "forgot" && !password) {
      setError(t('auth.errors.fieldsRequired'))
      return
    }

    if (authMode === "register" && password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'))
      return
    }

    if (authMode !== "forgot" && password.length < 6) {
      setError(t('auth.errors.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      if (authMode === "login") {
        const { error } = await signIn(email, password)
        if (error) {
          setError(t('auth.errors.invalidCredentials'))
        }
      } else if (authMode === "register") {
        const { error, data } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else if (data?.user && !data.user.identities?.length) {
          setError(t('auth.errors.generic'))
        } else if (data?.session) {
          // User is automatically logged in
        } else {
          setAuthSuccess(t('auth.success.checkEmail'))
        }
      } else if (authMode === "forgot") {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setAuthSuccess(t('auth.success.resetEmail'))
        }
      }
    } catch {
      setError(t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.projectSent')}</h2>
        <p className="text-foreground/60">{t('projectWizard.redirecting')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3">
          {t(`auth.${authMode}.title`)}
        </h1>
        <p className="text-foreground/60">
          {t(`auth.${authMode}.subtitle`)}
        </p>
      </div>

      <form onSubmit={handleAuthSubmit} className="max-w-md mx-auto space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            disabled={isLoading}
            className="border-border focus:border-primary"
          />
        </div>

        {authMode !== "forgot" && (
          <div className="space-y-1.5">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="border-border focus:border-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {authMode === "register" && (
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="border-border focus:border-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        {authSuccess && (
          <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{authSuccess}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {t(`auth.${authMode}.button`)}
        </Button>

        <div className="text-center space-y-2">
          {authMode === "login" && (
            <>
              <button
                type="button"
                onClick={() => setAuthMode("forgot")}
                className="text-sm text-foreground/60 hover:text-foreground"
              >
                {t('auth.login.forgotPassword')}
              </button>
              <p className="text-sm text-foreground/60">
                {t('auth.login.noAccount')}{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-foreground font-medium hover:underline"
                >
                  {t('auth.login.createAccount')}
                </button>
              </p>
            </>
          )}
          {authMode === "register" && (
            <p className="text-sm text-foreground/60">
              {t('auth.register.hasAccount')}{" "}
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="text-foreground font-medium hover:underline"
              >
                {t('auth.register.login')}
              </button>
            </p>
          )}
          {authMode === "forgot" && (
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              {t('auth.forgot.backToLogin')}
            </button>
          )}
        </div>
      </form>
    </>
  )
}
