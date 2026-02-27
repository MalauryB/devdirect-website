"use client"

import { useLanguage } from "@/contexts/language-context"
import { getStatusBadgeClass } from "@/lib/dashboard-utils"
import type { Project } from "@/lib/types"

interface ClientProjectListSectionProps {
  projects: Project[]
  projectCount: number
  onProjectClick: (project: Project) => void
}

export function ClientProjectListSection({
  projects,
  projectCount,
  onProjectClick,
}: ClientProjectListSectionProps) {
  const { t } = useLanguage()

  return (
    <>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t("dashboard.clients.clientProjects")} (
        {projectCount})
      </h3>
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectClick(project)}
            className="bg-white border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">
                  {project.title || t("projects.untitled")}
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.project_types?.map((type) => (
                    <span
                      key={type}
                      className="text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded"
                    >
                      {t(`projects.types.${type}`)}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-foreground/60 line-clamp-2">
                  {project.description}
                </p>
              </div>
              <span
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}
              >
                {t(`projects.status.${project.status}`)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
