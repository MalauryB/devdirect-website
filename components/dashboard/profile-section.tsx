"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { UserMetadata, ClientType } from "@/contexts/auth-context"
import { uploadFile, validateFile } from "@/lib/storage"
import { updateProfileAvatarUrl } from "@/lib/supabase"
import { AvatarUploader } from "@/components/dashboard/profile/avatar-uploader"
import { PersonalInfoForm } from "@/components/dashboard/profile/personal-info-form"
import { CompanySettingsForm, CompanySettings } from "@/components/dashboard/profile/company-settings-form"
import { SkillsManager } from "@/components/dashboard/profile/skills-manager"

interface ProfileSectionProps {
  user: any // Supabase User
  isEngineer: boolean
  onUpdateProfile: (metadata: UserMetadata) => Promise<{ error: any }>
}

export function ProfileSection({ user, isEngineer, onUpdateProfile }: ProfileSectionProps) {
  const { t } = useLanguage()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [clientType, setClientType] = useState<ClientType>("individual")
  const [companyName, setCompanyName] = useState("")
  const [legalForm, setLegalForm] = useState("")
  const [professionalEmail, setProfessionalEmail] = useState("")
  const [contactPosition, setContactPosition] = useState("")
  const [siret, setSiret] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("France")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileInitialized, setProfileInitialized] = useState(false)
  // Engineer-specific profile fields
  const [jobTitle, setJobTitle] = useState("")
  const [bio, setBio] = useState("")
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
      setFirstName(user.user_metadata.first_name || "")
      setLastName(user.user_metadata.last_name || "")
      setPhone(user.user_metadata.phone || "")
      setClientType(user.user_metadata.client_type || "individual")
      setCompanyName(user.user_metadata.company_name || "")
      setLegalForm(user.user_metadata.legal_form || "")
      setProfessionalEmail(user.user_metadata.professional_email || "")
      setContactPosition(user.user_metadata.contact_position || "")
      setSiret(user.user_metadata.siret || "")
      setVatNumber(user.user_metadata.vat_number || "")
      setAddress(user.user_metadata.address || "")
      setPostalCode(user.user_metadata.postal_code || "")
      setCity(user.user_metadata.city || "")
      setCountry(user.user_metadata.country || "France")
      setAvatarUrl(user.user_metadata.avatar_url || "")
      // Engineer-specific fields
      setJobTitle(user.user_metadata.job_title || "")
      setBio(user.user_metadata.bio || "")
      setSkills(user.user_metadata.skills || [])
      setProfileInitialized(true)
    }
  }, [user, profileInitialized])

  const handleCompanySettingsChange = useCallback((settings: CompanySettings) => {
    setCompanySettings(settings)
  }, [])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setProfileError("")
    setProfileSuccess(false)

    const metadata: UserMetadata = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      client_type: clientType,
      company_name: companyName,
      legal_form: legalForm,
      professional_email: professionalEmail,
      contact_position: contactPosition,
      siret: siret,
      vat_number: vatNumber,
      address: address,
      postal_code: postalCode,
      city: city,
      country: country,
      // Engineer-specific fields
      job_title: jobTitle,
      bio: bio,
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
      console.error('Upload error:', error)
      setProfileError(`${t('profile.avatarError')}: ${error.message}`)
    } else if (data && user) {
      console.log('Avatar uploaded:', data.url)
      setAvatarUrl(data.url)
      // Save avatar URL to auth.users metadata
      const { error: updateError } = await onUpdateProfile({ avatar_url: data.url })
      if (updateError) {
        setProfileError(t('profile.error'))
      }
      // Also update the profiles table for other users to see
      const { error: profileError } = await updateProfileAvatarUrl(user.id, data.url)
      if (profileError) {
        console.error('Failed to update profiles table:', profileError)
      }
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
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          phone={phone}
          setPhone={setPhone}
          jobTitle={jobTitle}
          setJobTitle={setJobTitle}
          bio={bio}
          setBio={setBio}
          clientType={clientType}
          setClientType={setClientType}
          companyName={companyName}
          setCompanyName={setCompanyName}
          legalForm={legalForm}
          setLegalForm={setLegalForm}
          professionalEmail={professionalEmail}
          setProfessionalEmail={setProfessionalEmail}
          contactPosition={contactPosition}
          setContactPosition={setContactPosition}
          siret={siret}
          setSiret={setSiret}
          vatNumber={vatNumber}
          setVatNumber={setVatNumber}
          address={address}
          setAddress={setAddress}
          postalCode={postalCode}
          setPostalCode={setPostalCode}
          city={city}
          setCity={setCity}
          country={country}
          setCountry={setCountry}
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
