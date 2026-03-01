"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { UserMetadata } from "@/contexts/auth-context"
import { uploadFile, validateFile } from "@/lib/storage"
import { updateProfileAvatarUrl } from "@/lib/supabase"
import { AvatarUploader } from "@/components/dashboard/profile/avatar-uploader"
import { PersonalInfoForm, PersonalInfoFormData } from "@/components/dashboard/profile/personal-info-form"
import { CompanySettingsForm, CompanySettings } from "@/components/dashboard/profile/company-settings-form"
import { SkillsManager } from "@/components/dashboard/profile/skills-manager"

interface ProfileSectionUser {
  id: string
  email?: string
  user_metadata?: UserMetadata
}

interface ProfileSectionProps {
  user: ProfileSectionUser
  isEngineer: boolean
  onUpdateProfile: (metadata: UserMetadata) => Promise<{ error: Error | null }>
}

export function ProfileSection({ user, isEngineer, onUpdateProfile }: ProfileSectionProps) {
  const { t } = useLanguage()

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    jobTitle: "",
    bio: "",
    clientType: "individual",
    companyName: "",
    legalForm: "",
    professionalEmail: "",
    contactPosition: "",
    siret: "",
    vatNumber: "",
    address: "",
    postalCode: "",
    city: "",
    country: "France",
  })
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileInitialized, setProfileInitialized] = useState(false)
  const [skills, setSkills] = useState<string[]>([])

  // Company settings ref for form submission (managed internally by CompanySettingsForm)
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "Nimli",
    address: "",
    siret: "",
    email: "contact@nimli.fr",
    phone: "",
    vat: "",
  })

  useEffect(() => {
    // Only initialize profile once to avoid resetting form values when user reference changes
    if (user?.user_metadata && !profileInitialized) {
      setPersonalInfo({
        firstName: user.user_metadata.first_name || "",
        lastName: user.user_metadata.last_name || "",
        phone: user.user_metadata.phone || "",
        jobTitle: user.user_metadata.job_title || "",
        bio: user.user_metadata.bio || "",
        clientType: user.user_metadata.client_type || "individual",
        companyName: user.user_metadata.company_name || "",
        legalForm: user.user_metadata.legal_form || "",
        professionalEmail: user.user_metadata.professional_email || "",
        contactPosition: user.user_metadata.contact_position || "",
        siret: user.user_metadata.siret || "",
        vatNumber: user.user_metadata.vat_number || "",
        address: user.user_metadata.address || "",
        postalCode: user.user_metadata.postal_code || "",
        city: user.user_metadata.city || "",
        country: user.user_metadata.country || "France",
      })
      setAvatarUrl(user.user_metadata.avatar_url || "")
      setSkills(user.user_metadata.skills || [])
      setProfileInitialized(true)
    }
  }, [user, profileInitialized])

  const handlePersonalInfoChange = useCallback((field: keyof PersonalInfoFormData, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleCompanySettingsChange = useCallback((settings: CompanySettings) => {
    setCompanySettings(settings)
  }, [])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setProfileError("")
    setProfileSuccess(false)

    const metadata: UserMetadata = {
      first_name: personalInfo.firstName,
      last_name: personalInfo.lastName,
      phone: personalInfo.phone,
      client_type: personalInfo.clientType,
      company_name: personalInfo.companyName,
      legal_form: personalInfo.legalForm,
      professional_email: personalInfo.professionalEmail,
      contact_position: personalInfo.contactPosition,
      siret: personalInfo.siret,
      vat_number: personalInfo.vatNumber,
      address: personalInfo.address,
      postal_code: personalInfo.postalCode,
      city: personalInfo.city,
      country: personalInfo.country,
      // Engineer-specific fields
      job_title: personalInfo.jobTitle,
      bio: personalInfo.bio,
      skills: skills,
    }

    const { error: updateError } = await onUpdateProfile(metadata)

    if (updateError) {
      setProfileError(t('profile.error'))
    } else {
      // Save company settings to localStorage (engineers only)
      if (isEngineer) {
        localStorage.setItem('nimli_company_settings', JSON.stringify(companySettings))
      }
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }

    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file, 'images')
    if (!validation.valid) {
      setProfileError(validation.error || 'Fichier invalide')
      return
    }

    setAvatarUploading(true)
    setProfileError("")

    const { data, error } = await uploadFile(file, 'avatars', 'profile')

    if (error) {
      setProfileError(`${t('profile.avatarError')}: ${error.message}`)
    } else if (data && user) {
      setAvatarUrl(data.url)
      // Save avatar URL to auth.users metadata
      const { error: updateError } = await onUpdateProfile({ avatar_url: data.url })
      if (updateError) {
        setProfileError(t('profile.error'))
      }
      // Also update the profiles table for other users to see
      await updateProfileAvatarUrl(user.id, data.url)
    }

    setAvatarUploading(false)
    if (e.target) e.target.value = ''
  }


  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-foreground mb-6">{t('profile.title')}</h2>
      <form onSubmit={handleProfileSubmit} className="space-y-8">
        {/* Avatar */}
        <AvatarUploader
          avatarUrl={avatarUrl}
          uploading={avatarUploading}
          disabled={saving}
          onUpload={handleAvatarUpload}
        />

        {/* Personal info + role-specific fields */}
        <PersonalInfoForm
          isEngineer={isEngineer}
          saving={saving}
          formData={personalInfo}
          onChange={handlePersonalInfoChange}
        />

        {/* Engineer-only: Skills */}
        {isEngineer && (
          <SkillsManager
            skills={skills}
            onSkillsChange={setSkills}
            disabled={saving}
          />
        )}

        {/* Engineer-only: Company Settings */}
        {isEngineer && (
          <CompanySettingsForm
            saving={saving}
            onSettingsChange={handleCompanySettingsChange}
          />
        )}

        {profileError && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
            {profileError}
          </p>
        )}

        {profileSuccess && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" />
            {t('profile.success')}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white"
          disabled={saving}
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('profile.save')}
        </Button>
      </form>
    </div>
  )
}
