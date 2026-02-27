"use client"

import {
  User,
  FileText,
  MessageCircle,
  Euro,
  Clock,
  Target,
  Wrench,
  Monitor,
  Layers,
  Paperclip,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { Project, Profile } from "@/lib/types"
import { ProjectFileItem, ProjectImageItem } from "@/components/dashboard/project-file-items"

interface DetailSubsectionProps {
  project: Project
  onViewClientProfile: (profile: Profile) => void
}

export function DetailSubsection({ project, onViewClientProfile }: DetailSubsectionProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="p-6 space-y-8">
        {/* Client Info for Engineer */}
        <div className="flex items-center justify-between pb-4 border-b border-muted">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center shadow-sm overflow-hidden">
              {project.profiles?.avatar_url ? (
                <img
                  src={project.profiles.avatar_url}
                  alt={project.profiles.company_name || project.profiles.first_name || 'Client'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {(project.profiles?.company_name?.[0] || project.profiles?.first_name?.[0] || 'C').toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground/50 mb-0.5">{t('projects.details.client')}</h3>
              <p className="font-medium text-foreground">
                {project.profiles?.company_name || `${project.profiles?.first_name || ''} ${project.profiles?.last_name || ''}`.trim() || t('projects.details.unknownClient')}
              </p>
              {project.profiles?.email && (
                <p className="text-sm text-foreground/60">{project.profiles.email}</p>
              )}
            </div>
          </div>
          {project.profiles && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewClientProfile(project.profiles as Profile)}
            >
              <User className="w-4 h-4 mr-2" />
              {t('projects.details.viewProfile')}
            </Button>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <FileText className="w-4 h-4 text-[#6cb1bb]" />
            {t('projects.details.description')}
          </h3>
          <p className="text-foreground/70 whitespace-pre-wrap">{project.description || '-'}</p>
        </div>

        {/* Features */}
        {project.features && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Layers className="w-4 h-4 text-[#ba9fdf]" />
              {t('projects.details.features')}
            </h3>
            <p className="text-foreground/70 whitespace-pre-wrap">{project.features}</p>
          </div>
        )}

        {/* Target Audience */}
        {project.target_audience && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Target className="w-4 h-4 text-[#ea4c89]" />
              {t('projects.details.targetAudience')}
            </h3>
            <p className="text-foreground/70">{project.target_audience}</p>
          </div>
        )}

        {/* Services */}
        {project.services && project.services.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Wrench className="w-4 h-4 text-[#9c984d]" />
              {t('projects.details.services')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.services.map((service) => (
                <span key={service} className="text-sm bg-muted/50 border border-border text-foreground/70 px-3 py-1 rounded-lg">
                  {t(`projects.services.${service}`)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Platforms */}
        {project.platforms && project.platforms.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Monitor className="w-4 h-4 text-[#6cb1bb]" />
              {t('projects.details.platforms')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.platforms.map((platform) => (
                <span key={platform} className="text-sm bg-muted/50 border border-border text-foreground/70 px-3 py-1 rounded-lg">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Budget & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.budget && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Euro className="w-4 h-4 text-[#9c984d]" />
                {t('projects.details.budget')}
              </h3>
              <p className="text-foreground/70">{t(`projects.budget.${project.budget}`)}</p>
            </div>
          )}
          {project.deadline && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Clock className="w-4 h-4 text-[#ea4c89]" />
                {t('projects.details.deadline')}
              </h3>
              <p className="text-foreground/70">{t(`projects.deadline.${project.deadline}`)}</p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {project.additional_info && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <MessageCircle className="w-4 h-4 text-[#7f7074]" />
              {t('projects.details.additionalInfo')}
            </h3>
            <p className="text-foreground/70 whitespace-pre-wrap">{project.additional_info}</p>
          </div>
        )}

        {/* Attached Files */}
        {(project.specifications_file ||
          (project.design_files && project.design_files.length > 0) ||
          (project.brand_assets && project.brand_assets.length > 0) ||
          (project.inspiration_images && project.inspiration_images.length > 0) ||
          (project.other_documents && project.other_documents.length > 0)) && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Paperclip className="w-4 h-4 text-[#6cb1bb]" />
              {t('projects.details.attachedFiles')}
            </h3>
            <div className="space-y-4">
              {project.specifications_file && (
                <div>
                  <p className="text-xs text-foreground/50 mb-2">{t('projects.form.specificationsFile')}</p>
                  <ProjectFileItem file={project.specifications_file} />
                </div>
              )}
              {project.design_files && project.design_files.length > 0 && (
                <div>
                  <p className="text-xs text-foreground/50 mb-2">{t('projects.form.designFiles')}</p>
                  <div className="space-y-2">
                    {project.design_files.map((file, index) => (
                      <ProjectFileItem key={file.path || index} file={file} />
                    ))}
                  </div>
                </div>
              )}
              {project.brand_assets && project.brand_assets.length > 0 && (
                <div>
                  <p className="text-xs text-foreground/50 mb-2">{t('projects.form.brandAssets')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {project.brand_assets.map((file, index) => (
                      <ProjectImageItem key={file.path || index} file={file} />
                    ))}
                  </div>
                </div>
              )}
              {project.inspiration_images && project.inspiration_images.length > 0 && (
                <div>
                  <p className="text-xs text-foreground/50 mb-2">{t('projects.form.inspirationImages')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {project.inspiration_images.map((file, index) => (
                      <ProjectImageItem key={file.path || index} file={file} />
                    ))}
                  </div>
                </div>
              )}
              {project.other_documents && project.other_documents.length > 0 && (
                <div>
                  <p className="text-xs text-foreground/50 mb-2">{t('projects.form.otherDocuments')}</p>
                  <div className="space-y-2">
                    {project.other_documents.map((file, index) => (
                      <ProjectFileItem key={file.path || index} file={file} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
