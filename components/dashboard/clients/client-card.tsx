"use client"

import { ArrowLeft, Mail, Phone, User, Building, MapPin } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { Project } from "@/lib/types"

export interface ClientInfo {
  user_id: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  phone: string
  avatar_url: string
  client_type: string
  legal_form: string
  professional_email: string
  contact_position: string
  siret: string
  vat_number: string
  address: string
  postal_code: string
  city: string
  country: string
  project_count: number
  projects: Project[]
}

interface ClientCardProps {
  client: ClientInfo
  displayName: string
  onBack: () => void
}

export function ClientCard({ client, displayName, onBack }: ClientCardProps) {
  const { t } = useLanguage()

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("dashboard.clients.backToList")}
      </button>

      {/* Client Info Card */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center shrink-0 overflow-hidden">
            {client.avatar_url ? (
              <img
                src={client.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {(
                  client.company_name?.[0] ||
                  client.first_name?.[0] ||
                  client.email?.[0] ||
                  "C"
                ).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-1">
              {displayName}
            </h2>
            {client.company_name &&
              (client.first_name || client.last_name) && (
                <p className="text-foreground/60 mb-3">
                  {`${client.first_name} ${client.last_name}`.trim()}
                </p>
              )}

            {/* Contact Info */}
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t("dashboard.clients.contactInfo")}
              </h3>
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Mail className="w-4 h-4 text-foreground/50" />
                  <a
                    href={`mailto:${client.email}`}
                    className="hover:text-foreground"
                  >
                    {client.email}
                  </a>
                </div>
              )}
              {client.professional_email && (
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Mail className="w-4 h-4 text-foreground/50" />
                  <a
                    href={`mailto:${client.professional_email}`}
                    className="hover:text-foreground"
                  >
                    {client.professional_email}
                  </a>
                  <span className="text-xs text-foreground/40">
                    ({t("profile.professionalEmail")})
                  </span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Phone className="w-4 h-4 text-foreground/50" />
                  <a
                    href={`tel:${client.phone}`}
                    className="hover:text-foreground"
                  >
                    {client.phone}
                  </a>
                </div>
              )}
              {client.contact_position && (
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <User className="w-4 h-4 text-foreground/50" />
                  {client.contact_position}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Company Info - always show for companies or if any company info exists */}
        {(client.client_type === "company" ||
          client.company_name ||
          client.legal_form ||
          client.siret ||
          client.vat_number) && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#ba9fdf]" />
              {t("projects.details.companyInfo")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-foreground/50 mb-1">
                  {t("profile.companyName")}
                </p>
                <p className="text-sm text-foreground">
                  {client.company_name || (
                    <span className="text-foreground/40 italic">
                      {t("projects.details.noPhone")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/50 mb-1">
                  {t("profile.legalForm")}
                </p>
                <p className="text-sm text-foreground">
                  {client.legal_form || (
                    <span className="text-foreground/40 italic">
                      {t("projects.details.noPhone")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/50 mb-1">
                  {t("profile.siret")}
                </p>
                <p className="text-sm text-foreground">
                  {client.siret || (
                    <span className="text-foreground/40 italic">
                      {t("projects.details.noPhone")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/50 mb-1">
                  {t("profile.vatNumber")}
                </p>
                <p className="text-sm text-foreground">
                  {client.vat_number || (
                    <span className="text-foreground/40 italic">
                      {t("projects.details.noPhone")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Billing Address - always show */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#ea4c89]" />
            {t("projects.details.billingAddress")}
          </h3>
          {client.address || client.city ? (
            <p className="text-sm text-foreground/70">
              {client.address && (
                <span>
                  {client.address}
                  <br />
                </span>
              )}
              {(client.postal_code || client.city) && (
                <span>
                  {client.postal_code} {client.city}
                  <br />
                </span>
              )}
              {client.country && (
                <span>{client.country}</span>
              )}
            </p>
          ) : (
            <p className="text-sm text-foreground/40 italic">
              {t("projects.details.noAddress")}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
