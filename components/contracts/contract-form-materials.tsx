"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { ContractProfileInput } from "@/lib/contracts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  X,
  Users,
} from "lucide-react"

interface ContractFormMaterialsProps {
  formProfiles: ContractProfileInput[]
  formWorkLocation: string
  formContractDuration: string
  formNoticePeriod: string
  formBillingFrequency: string
  hasValidProfiles: boolean
  profilesTotalEstimate: number
  profilesTotalDays: number
  onAddProfile: () => void
  onRemoveProfile: (index: number) => void
  onUpdateProfile: (index: number, field: keyof ContractProfileInput, value: string | number | null) => void
  onWorkLocationChange: (value: string) => void
  onContractDurationChange: (value: string) => void
  onNoticePeriodChange: (value: string) => void
  onBillingFrequencyChange: (value: string) => void
}

export function ContractFormMaterials({
  formProfiles,
  formWorkLocation,
  formContractDuration,
  formNoticePeriod,
  formBillingFrequency,
  hasValidProfiles,
  profilesTotalEstimate,
  profilesTotalDays,
  onAddProfile,
  onRemoveProfile,
  onUpdateProfile,
  onWorkLocationChange,
  onContractDurationChange,
  onNoticePeriodChange,
  onBillingFrequencyChange,
}: ContractFormMaterialsProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Profiles section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('contracts.profiles')}
            <span className="text-xs text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddProfile}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            {t('contracts.addProfile')}
          </Button>
        </div>

        <div className="space-y-3">
          {formProfiles.map((profile, index) => (
            <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground/60">
                  {t('contracts.profileNumber')} {index + 1}
                </span>
                {formProfiles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveProfile(index)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    aria-label="Supprimer le profil"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Profile name */}
                <div className="col-span-3 sm:col-span-1">
                  <Input
                    placeholder={t('contracts.profileNamePlaceholder')}
                    value={profile.profile_name}
                    onChange={(e) => onUpdateProfile(index, 'profile_name', e.target.value)}
                    className={!profile.profile_name.trim() ? 'border-red-300' : ''}
                  />
                </div>

                {/* Daily rate */}
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="500"
                    value={profile.daily_rate || ''}
                    onChange={(e) => onUpdateProfile(index, 'daily_rate', Number(e.target.value))}
                    className={!profile.daily_rate ? 'border-red-300 pr-16' : 'pr-16'}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground/50">&euro;/jour</span>
                </div>

                {/* Estimated days */}
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="20"
                    value={profile.estimated_days || ''}
                    onChange={(e) => onUpdateProfile(index, 'estimated_days', e.target.value ? Number(e.target.value) : null)}
                    className="pr-12"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground/50">jours</span>
                </div>
              </div>

              {/* Profile subtotal */}
              {profile.daily_rate > 0 && profile.estimated_days && profile.estimated_days > 0 && (
                <div className="text-xs text-foreground/60 text-right">
                  Sous-total: {(profile.daily_rate * profile.estimated_days).toLocaleString('fr-FR')} &euro; HT
                </div>
              )}
            </div>
          ))}
        </div>

        {!hasValidProfiles && (
          <p className="text-xs text-red-500">{t('contracts.profileRequired')}</p>
        )}
      </div>

      {/* Estimated total preview */}
      {profilesTotalEstimate > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-2">
          <p className="text-sm font-medium text-foreground">{t('contracts.estimatedTotal')}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-foreground/50 text-xs">{t('contracts.totalDays')}</p>
              <p className="font-semibold">{profilesTotalDays} {t('contracts.days')}</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs">{t('contracts.totalHT')}</p>
              <p className="font-semibold">{profilesTotalEstimate.toLocaleString('fr-FR')} &euro;</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs">{t('contracts.totalTTC')}</p>
              <p className="font-semibold text-action">{(profilesTotalEstimate * 1.2).toLocaleString('fr-FR')} &euro;</p>
            </div>
          </div>
          <p className="text-xs text-foreground/40 italic">* {t('contracts.estimatedTotalHint')}</p>
        </div>
      )}

      {/* Work location */}
      <div className="space-y-2">
        <Label>{t('contracts.workLocation')}</Label>
        <Select value={formWorkLocation} onValueChange={onWorkLocationChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">{t('contracts.workLocations.client')}</SelectItem>
            <SelectItem value="remote">{t('contracts.workLocations.remote')}</SelectItem>
            <SelectItem value="hybrid">{t('contracts.workLocations.hybrid')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contract duration */}
      <div className="space-y-2">
        <Label>{t('contracts.contractDuration')}</Label>
        <Select value={formContractDuration} onValueChange={onContractDurationChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3_months">{t('contracts.durations.3months')}</SelectItem>
            <SelectItem value="6_months">{t('contracts.durations.6months')}</SelectItem>
            <SelectItem value="12_months">{t('contracts.durations.12months')}</SelectItem>
            <SelectItem value="custom">{t('contracts.durations.custom')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notice period */}
      <div className="space-y-2">
        <Label>{t('contracts.noticePeriod')}</Label>
        <Select value={formNoticePeriod} onValueChange={onNoticePeriodChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15_days">{t('contracts.noticePeriods.15days')}</SelectItem>
            <SelectItem value="1_month">{t('contracts.noticePeriods.1month')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Billing frequency */}
      <div className="space-y-2">
        <Label>{t('contracts.billingFrequency')}</Label>
        <Select value={formBillingFrequency} onValueChange={onBillingFrequencyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">{t('contracts.billingFrequencies.weekly')}</SelectItem>
            <SelectItem value="monthly">{t('contracts.billingFrequencies.monthly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
