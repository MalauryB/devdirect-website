"use client"

import { FileText, Loader2, Plus, Euro, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { ProjectFormWizard } from "@/components/project-form-wizard"
import { getStatusBadgeClass } from "@/lib/dashboard-utils"
import type { Project } from "@/lib/types"

interface ClientProjectListProps {
  projects: Project[]
  projectsLoading: boolean
  showProjectForm: boolean
  editingProject: Project | null
  onShowProjectForm: (show: boolean) => void
  onSetEditingProject: (project: Project | null) => void
  onSelectProject: (project: Project) => void
  onLoadProjects: () => void
}

export function ClientProjectList({
  projects,
  projectsLoading,
  showProjectForm,
  editingProject,
  onShowProjectForm,
  onSetEditingProject,
  onSelectProject,
  onLoadProjects,
}: ClientProjectListProps) {
  const { t } = useLanguage()

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{t('projects.title')}</h2>
        {!showProjectForm && (
          <Button
            onClick={() => onShowProjectForm(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('projects.newProject')}
          </Button>
        )}
      </div>

      {showProjectForm && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6 min-h-[600px]">
          <ProjectFormWizard
            project={editingProject}
            onSuccess={() => {
              onShowProjectForm(false)
              onSetEditingProject(null)
              onLoadProjects()
            }}
            onCancel={() => {
              onShowProjectForm(false)
              onSetEditingProject(null)
            }}
          />
        </div>
      )}

      {projectsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
          <FileText className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-foreground/70 font-medium">{t('projects.noProjects')}</p>
          <p className="text-foreground/50 text-sm mt-1">{t('projects.noProjectsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-white border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {project.title || t('projects.untitled')}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.project_types?.map((type) => (
                      <span key={type} className="text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded">
                        {t(`projects.types.${type}`)}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/60 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-foreground/50">
                    {project.budget && (
                      <span className="flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        {t(`projects.budget.${project.budget}`)}
                      </span>
                    )}
                    {project.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t(`projects.deadline.${project.deadline}`)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}>
                  {t(`projects.status.${project.status}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
