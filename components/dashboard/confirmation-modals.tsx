"use client"

import { X, User, Loader2, Send, Building, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { Project, Quote, Profile } from "@/lib/types"

// --- Delete Project Modal ---
interface DeleteProjectModalProps {
  project: Project | null
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteProjectModal({ project, loading, onConfirm, onCancel }: DeleteProjectModalProps) {
  const { t } = useLanguage()
  if (!project) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('projects.actions.confirmDelete')}
        </h3>
        <p className="text-foreground/60 mb-6">
          {t('projects.actions.confirmDeleteDesc')}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {t('projects.form.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('projects.actions.delete')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Client Profile Modal ---
interface ClientProfileModalProps {
  profile: Profile | null
  onClose: () => void
}

export function ClientProfileModal({ profile, onClose }: ClientProfileModalProps) {
  const { t } = useLanguage()
  if (!profile) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {t('projects.details.clientProfile')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Avatar and name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e2b3f7] to-[#8b5fbf] flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {profile.company_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || t('projects.details.unknownClient')}
            </p>
            {profile.company_name && (profile.first_name || profile.last_name) && (
              <p className="text-sm text-foreground/60">
                {`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                {profile.contact_position && ` - ${profile.contact_position}`}
              </p>
            )}
          </div>
        </div>

        {/* Personal info */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6cb1bb]" />
              {t('projects.details.personalInfo')}
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-foreground/60">{t('profile.email')}</span>
                <span className="text-sm font-medium text-foreground">{profile.email}</span>
              </div>
              {profile.professional_email && (
                <div className="flex justify-between">
                  <span className="text-sm text-foreground/60">{t('profile.professionalEmail')}</span>
                  <span className="text-sm font-medium text-foreground">{profile.professional_email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-foreground/60">{t('profile.phone')}</span>
                <span className="text-sm font-medium text-foreground">{profile.phone || t('projects.details.noPhone')}</span>
              </div>
            </div>
          </div>

          {/* Company info (if company) */}
          {profile.client_type === 'company' && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#ba9fdf]" />
                {t('projects.details.companyInfo')}
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                {profile.company_name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground/60">{t('profile.companyName')}</span>
                    <span className="text-sm font-medium text-foreground">{profile.company_name}</span>
                  </div>
                )}
                {profile.legal_form && (
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground/60">{t('profile.legalForm')}</span>
                    <span className="text-sm font-medium text-foreground">{profile.legal_form}</span>
                  </div>
                )}
                {profile.siret && (
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground/60">{t('profile.siret')}</span>
                    <span className="text-sm font-medium text-foreground">{profile.siret}</span>
                  </div>
                )}
                {profile.vat_number && (
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground/60">{t('profile.vatNumber')}</span>
                    <span className="text-sm font-medium text-foreground">{profile.vat_number}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Billing address */}
          {(profile.address || profile.city) && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ea4c89]" />
                {t('projects.details.billingAddress')}
              </h4>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  {profile.address && <span>{profile.address}<br /></span>}
                  {profile.postal_code && profile.city && (
                    <span>{profile.postal_code} {profile.city}<br /></span>
                  )}
                  {profile.country && <span>{profile.country}</span>}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('projects.form.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Delete Quote Modal ---
interface DeleteQuoteModalProps {
  quote: Quote | null
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteQuoteModal({ quote, loading, onConfirm, onCancel }: DeleteQuoteModalProps) {
  const { t } = useLanguage()
  if (!quote) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('quotes.actions.confirmDelete')}
        </h3>
        <p className="text-foreground/60 mb-6">
          {t('quotes.actions.confirmDeleteDesc')}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {t('quotes.form.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('quotes.actions.delete')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Send Quote Modal ---
interface SendQuoteModalProps {
  quote: Quote | null
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function SendQuoteModal({ quote, loading, onConfirm, onCancel }: SendQuoteModalProps) {
  const { t } = useLanguage()
  if (!quote) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('quotes.actions.confirmSend')}
        </h3>
        <p className="text-foreground/60 mb-6">
          {t('quotes.actions.confirmSendDesc')}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {t('quotes.form.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Send className="w-4 h-4 mr-2" />
            {t('quotes.actions.send')}
          </Button>
        </div>
      </div>
    </div>
  )
}
