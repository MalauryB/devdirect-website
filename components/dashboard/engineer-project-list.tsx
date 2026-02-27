"use client"

import { useState } from "react"
import { FileText, Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { getStatusBadgeClass } from "@/lib/dashboard-utils"
import type { Project } from "@/lib/types"

interface EngineerProjectListProps {
  allProjects: Project[]
  projectsLoading: boolean
  onSelectProject: (project: Project) => void
}

export function EngineerProjectList({
  allProjects,
  projectsLoading,
  onSelectProject,
}: EngineerProjectListProps) {
  const { t } = useLanguage()

  const [projectSearchQuery, setProjectSearchQuery] = useState("")
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("all")
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("all")
  const [projectClientFilter, setProjectClientFilter] = useState<string>("all")

  // Filter projects based on search and filters
  const filteredProjects = allProjects.filter((project) => {
    // Search filter
    const searchLower = projectSearchQuery.toLowerCase()
    const matchesSearch =
      !projectSearchQuery ||
      (project.title || "").toLowerCase().includes(searchLower) ||
      (project.description || "").toLowerCase().includes(searchLower) ||
      (project.profiles?.company_name || "").toLowerCase().includes(searchLower) ||
      (project.profiles?.first_name || "").toLowerCase().includes(searchLower) ||
      (project.profiles?.last_name || "").toLowerCase().includes(searchLower)

    // Status filter
    const matchesStatus =
      projectStatusFilter === "all" || project.status === projectStatusFilter

    // Type filter
    const matchesType =
      projectTypeFilter === "all" ||
      (project.project_types && project.project_types.includes(projectTypeFilter))

    // Client filter
    const matchesClient =
      projectClientFilter === "all" || project.user_id === projectClientFilter

    return matchesSearch && matchesStatus && matchesType && matchesClient
  })

  // Get unique clients for filter dropdown
  const uniqueClients = [
    ...new Map(
      allProjects.map((p) => [
        p.user_id,
        {
          id: p.user_id,
          name:
            p.profiles?.company_name ||
            `${p.profiles?.first_name || ""} ${p.profiles?.last_name || ""}`.trim() ||
            "Client",
        },
      ])
    ).values(),
  ]

  // Get unique project types for filter dropdown
  const uniqueTypes = [...new Set(allProjects.flatMap((p) => p.project_types || []))]

  const hasActiveFilters =
    projectSearchQuery ||
    projectStatusFilter !== "all" ||
    projectTypeFilter !== "all" ||
    projectClientFilter !== "all"

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t("dashboard.allProjects.title")}
          </h2>
          <p className="text-foreground/60 text-sm">
            {t("dashboard.allProjects.subtitle")}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-border rounded-xl p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              placeholder={t("projects.grid.search")}
              value={projectSearchQuery}
              onChange={(e) => setProjectSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Status Filter */}
          <select
            value={projectStatusFilter}
            onChange={(e) => setProjectStatusFilter(e.target.value)}
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary h-9"
          >
            <option value="all">{t("projects.grid.allStatuses")}</option>
            <option value="pending">{t("projects.status.pending")}</option>
            <option value="in_review">{t("projects.status.in_review")}</option>
            <option value="active">{t("projects.status.active")}</option>
            <option value="won">{t("projects.status.won")}</option>
            <option value="lost">{t("projects.status.lost")}</option>
            <option value="cancelled">{t("projects.status.cancelled")}</option>
            <option value="closed">{t("projects.status.closed")}</option>
          </select>

          {/* Type Filter */}
          <select
            value={projectTypeFilter}
            onChange={(e) => setProjectTypeFilter(e.target.value)}
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary h-9"
          >
            <option value="all">{t("projects.grid.allTypes")}</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {t(`projects.types.${type}`)}
              </option>
            ))}
          </select>

          {/* Client Filter */}
          <select
            value={projectClientFilter}
            onChange={(e) => setProjectClientFilter(e.target.value)}
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary h-9"
          >
            <option value="all">{t("projects.grid.allClients")}</option>
            {uniqueClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setProjectSearchQuery("")
                setProjectStatusFilter("all")
                setProjectTypeFilter("all")
                setProjectClientFilter("all")
              }}
              className="text-foreground/60 hover:text-foreground h-9"
            >
              <X className="w-4 h-4 mr-1" />
              {t("projects.grid.clearFilters")}
            </Button>
          )}
        </div>
      </div>

      {projectsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
        </div>
      ) : allProjects.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
          <FileText className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-foreground/70 font-medium">
            {t("dashboard.engineer.noProjects")}
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
          <Search className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-foreground/70 font-medium">
            {t("projects.grid.noResults")}
          </p>
          <p className="text-foreground/50 text-sm mt-1">
            {t("projects.grid.noResultsDesc")}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">
                  {t("projects.grid.colTitle")}
                </TableHead>
                <TableHead>{t("projects.grid.colClient")}</TableHead>
                <TableHead>{t("projects.grid.colType")}</TableHead>
                <TableHead>{t("projects.grid.colBudget")}</TableHead>
                <TableHead>{t("projects.grid.colDeadline")}</TableHead>
                <TableHead>{t("projects.grid.colCreated")}</TableHead>
                <TableHead className="text-right">
                  {t("projects.grid.colStatus")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  tabIndex={0}
                  onClick={() => onSelectProject(project)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onSelectProject(project)
                    }
                  }}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="max-w-[250px]">
                    <div className="font-medium text-foreground truncate">
                      {project.title || t("projects.untitled")}
                    </div>
                    <div
                      className="text-xs text-foreground/50 truncate mt-0.5"
                      title={project.description}
                    >
                      {project.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {project.profiles?.avatar_url ? (
                          <img
                            src={project.profiles.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-white">
                            {(
                              project.profiles?.first_name?.[0] || "C"
                            ).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {project.profiles?.company_name ||
                            `${project.profiles?.first_name || ""} ${project.profiles?.last_name || ""}`.trim() ||
                            "Client"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.project_types?.slice(0, 2).map((type) => (
                        <span
                          key={type}
                          className="text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded"
                        >
                          {t(`projects.types.${type}`)}
                        </span>
                      ))}
                      {(project.project_types?.length || 0) > 2 && (
                        <span className="text-xs text-foreground/50">
                          +{(project.project_types?.length || 0) - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/70">
                    {project.budget
                      ? t(`projects.budget.${project.budget}`)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/70">
                    {project.deadline
                      ? t(`projects.deadline.${project.deadline}`)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/50">
                    {new Date(project.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}
                    >
                      {t(`projects.status.${project.status}`)}
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
