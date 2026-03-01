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
import { Loader2, Eye, EyeOff } from "lucide-react"

type AuthMode = "login" | "register" | "forgot"

interface FieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp, resetPassword } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setFieldErrors({})
    setSuccess("")
  }

  const handleClose = () => {
    resetForm()
    setMode("login")
    closeAuthModal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setSuccess("")

    const errors: FieldErrors = {}

    if (!email) {
      errors.email = t('auth.errors.emailRequired')
    }

    if (mode !== "forgot" && !password) {
      errors.password = t('auth.errors.fieldsRequired')
    } else if (mode !== "forgot" && password.length < 6) {
      errors.password = t('auth.errors.passwordTooShort')
    }

    if (mode === "register" && password !== confirmPassword) {
      errors.confirmPassword = t('auth.errors.passwordMismatch')
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password)
        if (error) {
          setFieldErrors({ general: t('auth.errors.invalidCredentials') })
        } else {
          handleClose()
          router.push("/dashboard")
        }
      } else if (mode === "register") {
        const { error } = await signUp(email, password)
        if (error) {
          setFieldErrors({ general: error.message })
        } else {
          setSuccess(t('auth.success.checkEmail'))
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email)
        if (error) {
          setFieldErrors({ general: error.message })
        } else {
          setSuccess(t('auth.success.resetEmail'))
        }
      }
    } catch {
      setFieldErrors({ general: t('auth.errors.generic') })
    } finally {
      setLoading(false)
    }
  }

  const errorBorder = "border-red-400 focus-visible:ring-red-300"

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setFieldErrors({})
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
            <Label htmlFor="email" className={fieldErrors.email ? 'text-red-600' : ''}>{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })) }}
              disabled={loading}
              className={fieldErrors.email ? errorBorder : ''}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password" className={fieldErrors.password ? 'text-red-600' : ''}>{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })) }}
                  disabled={loading}
                  className={`pr-10 ${fieldErrors.password ? errorBorder : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={fieldErrors.confirmPassword ? 'text-red-600' : ''}>{t('auth.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({ ...prev, confirmPassword: undefined })) }}
                  disabled={loading}
                  className={`pr-10 ${fieldErrors.confirmPassword ? errorBorder : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {fieldErrors.general && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {fieldErrors.general}
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
              onClick={() => { setMode("forgot"); setFieldErrors({}); setSuccess(""); }}
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
                setFieldErrors({})
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
