"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"

export interface CompanySettings {
  name: string
  address: string
  siret: string
  email: string
  phone: string
  vat: string
}

interface CompanySettingsFormProps {
  saving: boolean
  onSettingsChange: (settings: CompanySettings) => void
}

export function CompanySettingsForm({ saving, onSettingsChange }: CompanySettingsFormProps) {
  const { t } = useLanguage()

  const [name, setName] = useState("Nimli")
  const [address, setAddress] = useState("")
  const [siret, setSiret] = useState("")
  const [email, setEmail] = useState("contact@nimli.fr")
  const [phone, setPhone] = useState("")
  const [vat, setVat] = useState("")

  // Load company settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('nimli_company_settings')
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          if (settings.name) setName(settings.name)
          if (settings.address) setAddress(settings.address)
          if (settings.siret) setSiret(settings.siret)
          if (settings.email) setEmail(settings.email)
          if (settings.phone) setPhone(settings.phone)
          if (settings.vat) setVat(settings.vat)
        } catch (e) {
          console.error('Failed to parse company settings:', e)
        }
      }
    }
  }, [])

  // Notify parent of current settings whenever they change
  useEffect(() => {
    onSettingsChange({ name, address, siret, email, phone, vat })
  }, [name, address, siret, email, phone, vat, onSettingsChange])

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div>
        <h3 className="text-sm font-medium text-foreground">{t('profile.companySettings')}</h3>
        <p className="text-xs text-foreground/50 mt-1">{t('profile.companySettingsDesc')}</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="companySettingsName" className="text-sm text-foreground/70">{t('profile.companyName')}</Label>
        <Input
          id="companySettingsName"
          type="text"
          placeholder="Nimli"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          className="border-border focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="companySettingsAddress" className="text-sm text-foreground/70">{t('profile.fullAddress')}</Label>
        <Input
          id="companySettingsAddress"
          type="text"
          placeholder={t('profile.fullAddressPlaceholder')}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={saving}
          className="border-border focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="companySettingsSiret" className="text-sm text-foreground/70">{t('profile.siret')}</Label>
          <Input
            id="companySettingsSiret"
            type="text"
            placeholder="XXX XXX XXX XXXXX"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            disabled={saving}
            className="border-border focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="companySettingsVat" className="text-sm text-foreground/70">{t('profile.vatNumber')}</Label>
          <Input
            id="companySettingsVat"
            type="text"
            placeholder="FR XX XXX XXX XXX"
            value={vat}
            onChange={(e) => setVat(e.target.value)}
            disabled={saving}
            className="border-border focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="companySettingsEmail" className="text-sm text-foreground/70">{t('profile.email')}</Label>
          <Input
            id="companySettingsEmail"
            type="email"
            placeholder="contact@nimli.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={saving}
            className="border-border focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="companySettingsPhone" className="text-sm text-foreground/70">{t('profile.phone')}</Label>
          <Input
            id="companySettingsPhone"
            type="tel"
            placeholder="+33 1 23 45 67 89"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={saving}
            className="border-border focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}
