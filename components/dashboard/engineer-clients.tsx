"use client"

import { useState, useMemo } from "react"
import { Search, FileText, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { Project } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClientCard, type ClientInfo } from "@/components/dashboard/clients/client-card"
import { ClientFilters } from "@/components/dashboard/clients/client-filters"
import { ClientProjectListSection } from "@/components/dashboard/clients/client-project-list-section"

export type { ClientInfo }

export interface EngineerClientsProps {
  allProjects: Project[]
  selectedClientId: string | null
  onSelectClient: (clientId: string | null) => void
  onNavigateToProject: (project: Project) => void
}
export function EngineerClients({
  allProjects,
  selectedClientId,
  onSelectClient,
  onNavigateToProject,
}: EngineerClientsProps) {
  const { t } = useLanguage()
  const [clientSearchQuery, setClientSearchQuery] = useState("")

  // Calculate unique clients from allProjects with their profile info
  const clients = useMemo(() => {
    const clientMap = new Map<string, ClientInfo>()

    allProjects.forEach((project) => {
      const existing = clientMap.get(project.user_id)
      if (existing) {
        existing.project_count++
        existing.projects.push(project)
      } else {
        const profile = project.profiles
        clientMap.set(project.user_id, {
          user_id: project.user_id,
          email: profile?.email || "",
          first_name: profile?.first_name || "",
          last_name: profile?.last_name || "",
          company_name: profile?.company_name || "",
          phone: profile?.phone || "",
          avatar_url: profile?.avatar_url || "",
          client_type: profile?.client_type || "individual",
          legal_form: profile?.legal_form || "",
          professional_email: profile?.professional_email || "",
          contact_position: profile?.contact_position || "",
          siret: profile?.siret || "",
          vat_number: profile?.vat_number || "",
          address: profile?.address || "",
          postal_code: profile?.postal_code || "",
          city: profile?.city || "",
          country: profile?.country || "",
          project_count: 1,
          projects: [project],
        })
      }
    })

    return Array.from(clientMap.values())
  }, [allProjects])

  // Get client display name
  const getClientDisplayName = (client: ClientInfo) => {
    if (client.company_name) return client.company_name
    if (client.first_name || client.last_name) {
      return `${client.first_name} ${client.last_name}`.trim()
    }
    if (client.email) return client.email.split("@")[0]
    return t("dashboard.clients.unknownClient")
  }
  // If a client is selected, show their detail view
  if (selectedClientId) {
    const selectedClient = clients.find((c) => c.user_id === selectedClientId)
    if (!selectedClient) {
      onSelectClient(null)
      return null
    }

    return (
      <div className="w-full">
        <ClientCard
          client={selectedClient}
          displayName={getClientDisplayName(selectedClient)}
          onBack={() => onSelectClient(null)}
        />
        <ClientProjectListSection
          projects={selectedClient.projects}
          projectCount={selectedClient.project_count}
          onProjectClick={onNavigateToProject}
        />
      </div>
    )
  }
  // Show client list with DataGrid
  const filteredClients = clients.filter((client) => {
    if (!clientSearchQuery) return true
    const searchLower = clientSearchQuery.toLowerCase()
    return (
      (client.company_name || "").toLowerCase().includes(searchLower) ||
      (client.first_name || "").toLowerCase().includes(searchLower) ||
      (client.last_name || "").toLowerCase().includes(searchLower) ||
      (client.email || "").toLowerCase().includes(searchLower) ||
      (client.phone || "").toLowerCase().includes(searchLower)
    )
  })

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t("dashboard.clients.title")}
          </h2>
          <p className="text-foreground/60 text-sm">
            {t("dashboard.clients.subtitle")}
          </p>
        </div>
      </div>

      {/* Search */}
      <ClientFilters
        searchQuery={clientSearchQuery}
        onSearchChange={setClientSearchQuery}
      />
      {clients.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
          <Users className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-foreground/70 font-medium">
            {t("dashboard.clients.noClients")}
          </p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
          <Search className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-foreground/70 font-medium">
            {t("dashboard.clients.grid.noResults")}
          </p>
          <p className="text-foreground/50 text-sm mt-1">
            {t("dashboard.clients.grid.noResultsDesc")}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">
                  {t("dashboard.clients.grid.colClient")}
                </TableHead>
                <TableHead>
                  {t("dashboard.clients.grid.colEmail")}
                </TableHead>
                <TableHead>
                  {t("dashboard.clients.grid.colPhone")}
                </TableHead>
                <TableHead className="text-right">
                  {t("dashboard.clients.grid.colProjects")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.user_id}
                  onClick={() => onSelectClient(client.user_id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {client.avatar_url ? (
                          <img
                            src={client.avatar_url}
                            alt={getClientDisplayName(client)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {(
                              client.company_name?.[0] ||
                              client.first_name?.[0] ||
                              client.email?.[0] ||
                              "C"
                            ).toUpperCase()}
                          </span>
                        )}
                      </div>                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {getClientDisplayName(client)}
                        </div>
                        {client.company_name &&
                          (client.first_name || client.last_name) && (
                            <div className="text-xs text-foreground/50 truncate">
                              {`${client.first_name} ${client.last_name}`.trim()}
                            </div>
                          )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/70">
                    {client.email || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/70">
                    {client.phone || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-sm text-foreground/70">
                      <FileText className="w-4 h-4" />
                      {client.project_count}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
