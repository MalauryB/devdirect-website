"use client"

import { useLanguage } from "@/contexts/language-context"
import { ProjectFormData, ProjectFile } from "@/lib/types"
import { FileUpload } from "@/components/file-upload"

interface StepFilesProps {
  formData: ProjectFormData
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>
}

export function StepFiles({ formData, setFormData }: StepFilesProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('projectWizard.files.title')}</h2>
        <p className="text-foreground/60">{t('projectWizard.files.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <FileUpload
          bucket="projects"
          folder="specifications"
          accept="documents"
          value={formData.specifications_file}
          onChange={(file) => setFormData({ ...formData, specifications_file: file as ProjectFile | null })}
          label={t('projects.form.specificationsFile')}
          description={t('projects.form.specificationsFileDesc')}
        />
        <FileUpload
          bucket="projects"
          folder="designs"
          accept="all"
          multiple
          value={formData.design_files}
          onChange={(files) => setFormData({ ...formData, design_files: files as ProjectFile[] | null })}
          label={t('projects.form.designFiles')}
          description={t('projects.form.designFilesDesc')}
        />
        <FileUpload
          bucket="projects"
          folder="other"
          accept="all"
          multiple
          value={formData.other_documents}
          onChange={(files) => setFormData({ ...formData, other_documents: files as ProjectFile[] | null })}
          label={t('projects.form.otherDocuments')}
          description={t('projects.form.otherDocumentsDesc')}
        />
      </div>
    </div>
  )
}
