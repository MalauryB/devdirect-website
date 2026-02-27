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
    const settings = JSON.parse(saved)
    return { ...defaultSettings, ...settings }
  } catch {
    return defaultSettings
  }
}
