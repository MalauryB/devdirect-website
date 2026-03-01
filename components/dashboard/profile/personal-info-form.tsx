"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { ClientType } from "@/contexts/auth-context"

export interface PersonalInfoFormData {
  // Common fields
  firstName: string
  lastName: string
  phone: string
  // Engineer-specific fields
  jobTitle: string
  bio: string
  // Client-specific fields
  clientType: ClientType
  companyName: string
  legalForm: string
  professionalEmail: string
  contactPosition: string
  siret: string
  vatNumber: string
  address: string
  postalCode: string
  city: string
  country: string
}

interface PersonalInfoFormProps {
  isEngineer: boolean
  saving: boolean
  formData: PersonalInfoFormData
  onChange: (field: keyof PersonalInfoFormData, value: string) => void
}

export function PersonalInfoForm({
  isEngineer,
  saving,
  formData,
  onChange,
}: PersonalInfoFormProps) {
  const {
    firstName,
    lastName,
    phone,
    jobTitle,
    bio,
    clientType,
    companyName,
    legalForm,
    professionalEmail,
    contactPosition,
    siret,
    vatNumber,
    address,
    postalCode,
    city,
    country,
  } = formData
  const { t } = useLanguage()

  const requiredFields = isEngineer
    ? ['firstName', 'lastName'] as const
    : clientType === 'company'
      ? ['firstName', 'lastName', 'companyName', 'siret'] as const
      : ['firstName', 'lastName'] as const

  const filledRequired = requiredFields.filter(f => formData[f]?.trim()).length
  const totalRequired = requiredFields.length
  const progressPercent = totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 100

  const fieldStatus = (value: string, required: boolean) => ({
    filled: value.trim().length > 0,
    required,
    className: value.trim() ? 'border-green-300 focus:border-green-400' : required ? 'border-border focus:border-primary' : 'border-border focus:border-primary',
  })

  return (
    <>
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/70">
            {t('profile.completion')}: {filledRequired}/{totalRequired} {t('profile.requiredFieldsFilled')}
          </span>
          <span className={`font-medium ${progressPercent === 100 ? 'text-green-600' : 'text-amber-600'}`}>
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${progressPercent === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-red-500">*</span> {t('profile.requiredFieldsNote')}
        </p>
      </div>

      {/* Personal information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">{t('profile.personalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="firstName" className="text-sm text-foreground/70 flex items-center gap-1.5">
              {t('profile.firstName')} <span className="text-red-500">*</span>
              {firstName.trim() && <Check className="w-3.5 h-3.5 text-green-500" />}
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder={t('profile.firstNamePlaceholder')}
              value={firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              disabled={saving}
              className={fieldStatus(firstName, true).className}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName" className="text-sm text-foreground/70 flex items-center gap-1.5">
              {t('profile.lastName')} <span className="text-red-500">*</span>
              {lastName.trim() && <Check className="w-3.5 h-3.5 text-green-500" />}
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder={t('profile.lastNamePlaceholder')}
              value={lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              disabled={saving}
              className={fieldStatus(lastName, true).className}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-sm text-foreground/70 flex items-center gap-1.5">
            {t('profile.phone')}
            <span className="text-xs text-muted-foreground font-normal">({t('profile.optional')})</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder={t('profile.phonePlaceholder')}
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
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
            <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
              {t('profile.jobTitle')}
              <span className="text-xs text-muted-foreground font-normal">({t('profile.optional')})</span>
            </h3>
            <Input
              id="jobTitle"
              type="text"
              placeholder={t('profile.jobTitlePlaceholder')}
              value={jobTitle}
              onChange={(e) => onChange('jobTitle', e.target.value)}
              disabled={saving}
              className="border-border focus:border-primary"
            />
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
              {t('profile.bio')}
              <span className="text-xs text-muted-foreground font-normal">({t('profile.optional')})</span>
            </h3>
            <Textarea
              id="bio"
              placeholder={t('profile.bioPlaceholder')}
              value={bio}
              onChange={(e) => onChange('bio', e.target.value)}
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
              onValueChange={(value) => onChange('clientType', value)}
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
                  <Label htmlFor="companyName" className="text-sm text-foreground/70 flex items-center gap-1.5">
                    {t('profile.companyName')} <span className="text-red-500">*</span>
                    {companyName.trim() && <Check className="w-3.5 h-3.5 text-green-500" />}
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder={t('profile.companyNamePlaceholder')}
                    value={companyName}
                    onChange={(e) => onChange('companyName', e.target.value)}
                    disabled={saving}
                    className={fieldStatus(companyName, true).className}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="legalForm" className="text-sm text-foreground/70 flex items-center gap-1.5">
                    {t('profile.legalForm')}
                    <span className="text-xs text-muted-foreground font-normal">({t('profile.optional')})</span>
                  </Label>
                  <Input
                    id="legalForm"
                    type="text"
                    placeholder={t('profile.legalFormPlaceholder')}
                    value={legalForm}
                    onChange={(e) => onChange('legalForm', e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="siret" className="text-sm text-foreground/70 flex items-center gap-1.5">
                    {t('profile.siret')} <span className="text-red-500">*</span>
                    {siret.trim() && <Check className="w-3.5 h-3.5 text-green-500" />}
                  </Label>
                  <Input
                    id="siret"
                    type="text"
                    placeholder={t('profile.siretPlaceholder')}
                    value={siret}
                    onChange={(e) => onChange('siret', e.target.value)}
                    disabled={saving}
                    className={fieldStatus(siret, true).className}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vatNumber" className="text-sm text-foreground/70 flex items-center gap-1.5">
                    {t('profile.vatNumber')}
                    <span className="text-xs text-muted-foreground font-normal">({t('profile.optional')})</span>
                  </Label>
                  <Input
                    id="vatNumber"
                    type="text"
                    placeholder={t('profile.vatNumberPlaceholder')}
                    value={vatNumber}
                    onChange={(e) => onChange('vatNumber', e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="professionalEmail" className="text-sm text-foreground/70 flex items-center gap-1.5">
                    {t('profile.professionalEmail')}
                    <span className="text-xs text-muted-foreground font-normal">({t('profile.optional')})</span>
                  </Label>
                  <Input
                    id="professionalEmail"
                    type="email"
                    placeholder={t('profile.professionalEmailPlaceholder')}
                    value={professionalEmail}
                    onChange={(e) => onChange('professionalEmail', e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactPosition" className="text-sm text-foreground/70 flex items-center gap-1.5">
                    {t('profile.contactPosition')}
                    <span className="text-xs text-muted-foreground font-normal">({t('profile.optional')})</span>
                  </Label>
                  <Input
                    id="contactPosition"
                    type="text"
                    placeholder={t('profile.contactPositionPlaceholder')}
                    value={contactPosition}
                    onChange={(e) => onChange('contactPosition', e.target.value)}
                    disabled={saving}
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Billing address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
              {t('profile.billingAddress')}
              <span className="text-xs text-muted-foreground font-normal">({t('profile.optional')})</span>
            </h3>
            <div className="space-y-1">
              <Label htmlFor="address" className="text-sm text-foreground/70">{t('profile.address')}</Label>
              <Input
                id="address"
                type="text"
                placeholder={t('profile.addressPlaceholder')}
                value={address}
                onChange={(e) => onChange('address', e.target.value)}
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
                  onChange={(e) => onChange('postalCode', e.target.value)}
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
                  onChange={(e) => onChange('city', e.target.value)}
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
                  onChange={(e) => onChange('country', e.target.value)}
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
