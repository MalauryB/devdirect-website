"use client"

import { FileText, MessageSquare, MessageCircle, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { MessageThread } from "@/components/message-thread"
import { getStatusBadgeClass } from "@/lib/dashboard-utils"
import type { Project } from "@/lib/types"
import type { UserRole } from "@/contexts/auth-context"

interface ClientMessagesSectionProps {
  projects: Project[]
  projectsLoading: boolean
  selectedProject: Project | null
  onSelectProject: (project: Project) => void
  onNavigateToProjects: () => void
  onViewProject: (project: Project) => void
  user: { id: string; user_metadata?: any }
  userRole: UserRole
  unreadCounts: Record<string, number>
}

export function ClientMessagesSection({
  projects,
  projectsLoading,
  selectedProject,
  onSelectProject,
  onNavigateToProjects,
  onViewProject,
  user,
  userRole,
}: ClientMessagesSectionProps) {
  const { t } = useLanguage()

  return (
    <div className="flex gap-0 -m-4 lg:-m-6 h-[calc(100vh-65px)]">
      {/* Secondary sidebar for projects */}
      <div className="w-56 bg-muted/50 border-r border-border flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{t('messages.title')}</h2>
          <p className="text-xs text-foreground/50 mt-1">{t('messages.sectionDescription')}</p>
        </div>

        {projectsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-foreground/50" />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-foreground/50 mb-3">{t('messages.noProjects')}</p>
            <Button
              onClick={onNavigateToProjects}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('projects.newProject')}
            </Button>
          </div>
        ) : (
          <nav className="p-2 flex-1 overflow-y-auto">
            <p className="text-xs font-medium text-foreground/40 uppercase tracking-wide px-2 mb-2">
              {t('messages.selectProject')}
            </p>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-colors mb-1 ${
                  selectedProject?.id === project.id
                    ? 'bg-white border border-border text-foreground'
                    : 'text-foreground/70 hover:bg-white hover:text-foreground'
                }`}
              >
                <MessageCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  selectedProject?.id === project.id ? 'text-[#6cb1bb]' : ''
                }`} />
                <div className="flex-1 min-w-0">
                  <span className="block font-medium truncate">
                    {project.title || t('projects.untitled')}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBadgeClass(project.status)}`}>
                    {t(`projects.status.${project.status}`)}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedProject ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border bg-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{selectedProject.title || t('projects.untitled')}</h3>
                <p className="text-sm text-foreground/50">{t('messages.conversationWith')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProject(selectedProject)}
                className="text-foreground/70"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('messages.viewProject')}
              </Button>
            </div>
            {/* Message thread */}
            <div className="flex-1 bg-muted/50 overflow-hidden">
              <MessageThread
                projectId={selectedProject.id}
                currentUser={{
                  id: user?.id || '',
                  first_name: user?.user_metadata?.first_name,
                  last_name: user?.user_metadata?.last_name,
                  avatar_url: user?.user_metadata?.avatar_url,
                  role: userRole
                }}
                otherParty={null}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/50">{t('messages.selectToView')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
