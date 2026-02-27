export interface CompanySettings {
  name: string
  address: string
  siret: string
  email: string
  phone: string
  vat: string
}

const defaultSettings: CompanySettings = {
  name: "Nimli",
  address: "",
  siret: "",
  email: "contact@nimli.fr",
  phone: "",
  vat: "",
}

export function loadCompanySettings(): CompanySettings {
  if (typeof window === 'undefined') return defaultSettings
  const saved = localStorage.getItem('nimli_company_settings')
  if (!saved) return defaultSettings
  try {
    const parsed = JSON.parse(saved)
    if (typeof parsed !== 'object' || parsed === null) return defaultSettings
    return {
      name: typeof parsed.name === 'string' ? parsed.name : defaultSettings.name,
      address: typeof parsed.address === 'string' ? parsed.address : defaultSettings.address,
      siret: typeof parsed.siret === 'string' ? parsed.siret : defaultSettings.siret,
      email: typeof parsed.email === 'string' ? parsed.email : defaultSettings.email,
      phone: typeof parsed.phone === 'string' ? parsed.phone : defaultSettings.phone,
      vat: typeof parsed.vat === 'string' ? parsed.vat : defaultSettings.vat,
    }
  } catch {
    return defaultSettings
  }
}
