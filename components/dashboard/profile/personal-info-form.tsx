"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/contexts/language-context"
import { ClientType } from "@/contexts/auth-context"

interface PersonalInfoFormProps {
  isEngineer: boolean
  saving: boolean
  // Common fields
  firstName: string
  setFirstName: (v: string) => void
  lastName: string
  setLastName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  // Engineer-specific fields
  jobTitle: string
  setJobTitle: (v: string) => void
  bio: string
  setBio: (v: string) => void
  // Client-specific fields
  clientType: ClientType
  setClientType: (v: ClientType) => void
  companyName: string
  setCompanyName: (v: string) => void
  legalForm: string
  setLegalForm: (v: string) => void
  professionalEmail: string
  setProfessionalEmail: (v: string) => void
  contactPosition: string
  setContactPosition: (v: string) => void
  siret: string
  setSiret: (v: string) => void
  vatNumber: string
  setVatNumber: (v: string) => void
  address: string
  setAddress: (v: string) => void
  postalCode: string
  setPostalCode: (v: string) => void
  city: string
  setCity: (v: string) => void
  country: string
  setCountry: (v: string) => void
}

export function PersonalInfoForm({
  isEngineer,
  saving,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  jobTitle,
  setJobTitle,
  bio,
  setBio,
  clientType,
  setClientType,
  companyName,
  setCompanyName,
  legalForm,
  setLegalForm,
  professionalEmail,
  setProfessionalEmail,
  contactPosition,
  setContactPosition,
  siret,
  setSiret,
  vatNumber,
  setVatNumber,
  address,
  setAddress,
  postalCode,
  setPostalCode,
  city,
  setCity,
  country,
  setCountry,
}: PersonalInfoFormProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Personal information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">{t('profile.personalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="firstName" className="text-sm text-foreground/70">{t('profile.firstName')}</Label>
            <Input
              id="firstName"
              type="text"
              placeholder={t('profile.firstNamePlaceholder')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={saving}
              className="border-border focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName" className="text-sm text-foreground/70">{t('profile.lastName')}</Label>
            <Input
              id="lastName"
              type="text"
              placeholder={t('profile.lastNamePlaceholder')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={saving}
              className="border-border focus:border-primary"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-sm text-foreground/70">{t('profile.phone')}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder={t('profile.phonePlaceholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={saving}
            className="border-border focus:border-primary"
          />
        </div>
      </div>

      {/* Role-specific fields */}
      {isEngineer ? (
        <>
          {/* Job title */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">{t('profile.jobTitle')}</h3>
            <Input
              id="jobTitle"
              type="text"
              placeholder={t('profile.jobTitlePlaceholder')}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={saving}
              className="border-border focus:border-primary"
            />
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">{t('profile.bio')}</h3>
            <Textarea
              id="bio"
              placeholder={t('profile.bioPlaceholder')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={saving}
              rows={4}
              className="border-border focus:border-primary resize-none bg-white"
            />
          </div>
        </>
      ) : (
        <>
          {/* Client type */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">{t('profile.clientType')}</h3>
            <RadioGroup
              value={clientType}
              onValueChange={(value) => setClientType(value as ClientType)}
              disabled={saving}
              className="flex gap-4"
            >
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                clientType === "individual" ? 'border-primary' : 'border-border'
              }`}>
                <RadioGroupItem value="individual" className="border-border" />
                <span className="text-sm">{t('profile.individual')}</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors bg-white ${
                clientType === "company" ? 'border-primary' : 'border-border'
              }`}>
                <RadioGroupItem value="company" className="border-border" />
                <span className="text-sm">{t('profile.company')}</span>
              </label>
            </RadioGroup>
          </div>

          {/* Company info (conditional) */}
          {clientType === "company" && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">{t('profile.companyInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="companyName" className="text-sm text-foreground/70">{t('profile.companyName')}</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder={t('profile.companyNamePlaceholder')}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="legalForm" className="text-sm text-foreground/70">{t('profile.legalForm')}</Label>
                  <Input
                    id="legalForm"
                    type="text"
                    placeholder={t('profile.legalFormPlaceholder')}
                    value={legalForm}
                    onChange={(e) => setLegalForm(e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="siret" className="text-sm text-foreground/70">{t('profile.siret')}</Label>
                  <Input
                    id="siret"
                    type="text"
                    placeholder={t('profile.siretPlaceholder')}
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vatNumber" className="text-sm text-foreground/70">{t('profile.vatNumber')}</Label>
                  <Input
                    id="vatNumber"
                    type="text"
                    placeholder={t('profile.vatNumberPlaceholder')}
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="professionalEmail" className="text-sm text-foreground/70">{t('profile.professionalEmail')}</Label>
                  <Input
                    id="professionalEmail"
                    type="email"
                    placeholder={t('profile.professionalEmailPlaceholder')}
                    value={professionalEmail}
                    onChange={(e) => setProfessionalEmail(e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactPosition" className="text-sm text-foreground/70">{t('profile.contactPosition')}</Label>
                  <Input
                    id="contactPosition"
                    type="text"
                    placeholder={t('profile.contactPositionPlaceholder')}
                    value={contactPosition}
                    onChange={(e) => setContactPosition(e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Billing address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">{t('profile.billingAddress')}</h3>
            <div className="space-y-1">
              <Label htmlFor="address" className="text-sm text-foreground/70">{t('profile.address')}</Label>
              <Input
                id="address"
                type="text"
                placeholder={t('profile.addressPlaceholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saving}
                className="border-border focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="postalCode" className="text-sm text-foreground/70">{t('profile.postalCode')}</Label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder={t('profile.postalCodePlaceholder')}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  disabled={saving}
                  className="border-border focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city" className="text-sm text-foreground/70">{t('profile.city')}</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder={t('profile.cityPlaceholder')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={saving}
                  className="border-border focus:border-primary"
                />
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <Label htmlFor="country" className="text-sm text-foreground/70">{t('profile.country')}</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder={t('profile.countryPlaceholder')}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={saving}
                  className="border-border focus:border-primary"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
