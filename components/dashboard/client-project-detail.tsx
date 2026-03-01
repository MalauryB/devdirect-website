"use client"

import {
  FileText,
  MessageCircle,
  ArrowLeft,
  Receipt,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import type { Project, Quote, ProjectDocument, CurrentUser } from "@/lib/types"
import type { UserRole } from "@/contexts/auth-context"
import { getStatusBadgeClass } from "@/lib/dashboard-utils"
import { MessageThread } from "@/components/message-thread"
import { DetailSubsection } from "@/components/dashboard/shared/detail-subsection"
import { QuotesSubsection } from "@/components/dashboard/client-detail/quotes-subsection"
import { DocumentsSubsection } from "@/components/dashboard/shared/documents-subsection"
import type { SubSection } from "@/hooks/use-dashboard-navigation"

interface ClientProjectDetailProps {
  project: Project
  user: { id: string; email?: string; user_metadata?: any }
  avatarUrl: string
  userRole: UserRole
  projectSubSection: SubSection
  onSubSectionChange: (sub: SubSection) => void
  quotes: Quote[]
  quotesLoading: boolean
  documents: ProjectDocument[]
  documentsLoading: boolean
  unreadCounts: Record<string, number>
  accessToken?: string
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onLoadDocuments: (projectId: string) => void
}

export function ClientProjectDetail({
  project,
  user,
  avatarUrl,
  userRole,
  projectSubSection,
  onSubSectionChange,
  quotes,
  quotesLoading,
  documents,
  documentsLoading,
  unreadCounts,
  accessToken,
  onBack,
  onEdit,
  onDelete,
  onLoadDocuments,
}: ClientProjectDetailProps) {
  const { t } = useLanguage()
  const currentUser: CurrentUser = {
    id: user?.id || '',
    first_name: user?.user_metadata?.first_name,
    last_name: user?.user_metadata?.last_name,
    avatar_url: user?.user_metadata?.avatar_url,
    role: userRole,
  }

  return (
    <div className={`flex gap-0 -m-4 lg:-m-6 ${projectSubSection === 'messages' ? 'h-[calc(100vh-65px)]' : 'min-h-[calc(100vh-65px)]'}`}>
      {/* Secondary sidebar for project sub-sections */}
      <div className="w-48 bg-muted/50 border-r border-border flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <button
            onClick={() => onBack()}
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('projects.details.back')}
          </button>
        </div>
        <nav className="p-2">
          <button
            onClick={() => onSubSectionChange('details')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
              projectSubSection === 'details'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('projects.subSections.details')}
          </button>
          <button
            onClick={() => onSubSectionChange('quotes')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
              projectSubSection === 'quotes'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <Receipt className="w-4 h-4" />
            {t('projects.subSections.quotes')}
            {quotes.length > 0 && (
              <span className="ml-auto text-xs bg-muted text-foreground/70 px-1.5 py-0.5 rounded">
                {quotes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => onSubSectionChange('messages')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
              projectSubSection === 'messages'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-4 h-4" />
              {unreadCounts[project.id] > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            {t('messages.title')}
            {unreadCounts[project.id] > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {unreadCounts[project.id]}
              </span>
            )}
          </button>
          <button
            onClick={() => onSubSectionChange('documents')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
              projectSubSection === 'documents'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            {t('documents.title')}
            {documents.length > 0 && (
              <span className="ml-auto text-xs bg-muted text-foreground/70 px-1.5 py-0.5 rounded">
                {documents.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${projectSubSection === 'messages' ? 'overflow-hidden' : 'p-4 lg:p-6 overflow-auto'}`}>
        {/* Project Header - visible only in details section */}
        {projectSubSection === 'details' && (
          <div className="bg-white border border-border rounded-xl overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* User avatar or initials */}
                  <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center shadow-sm overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.user_metadata?.first_name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {(user.user_metadata?.first_name?.[0] || 'U').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {project.title || t('projects.untitled')}
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.project_types?.map((type) => (
                        <span key={type} className="text-sm bg-muted text-foreground/70 px-3 py-1 rounded-full">
                          {t(`projects.types.${type}`)}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-foreground/50">
                      {t('projects.details.createdAt')}: {new Date(project.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 text-sm px-3 py-1.5 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}>
                    {t(`projects.status.${project.status}`)}
                  </span>
                  {project.status === 'pending' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-50">
                        <DropdownMenuItem onClick={onEdit}>
                          <Pencil className="w-4 h-4 mr-2" />
                          {t('projects.actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete()}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('projects.actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Sub-Section */}
        {projectSubSection === 'details' && (
          <DetailSubsection project={project} />
        )}

        {/* Quotes Sub-Section (Client view - read only) */}
        {projectSubSection === 'quotes' && (
          <QuotesSubsection
            quotes={quotes}
            quotesLoading={quotesLoading}
            project={project}
            accessToken={accessToken}
          />
        )}

        {/* Messages Sub-Section */}
        {projectSubSection === 'messages' && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border bg-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold text-foreground">{project.title || t('projects.untitled')}</h3>
                <p className="text-sm text-foreground/50">{t('messages.conversationWith')}</p>
              </div>
            </div>
            {/* Message thread */}
            <div className="flex-1 bg-muted/50 overflow-hidden">
              <MessageThread
                projectId={project.id}
                currentUser={currentUser}
              />
            </div>
          </>
        )}

        {/* Documents Sub-Section */}
        {projectSubSection === 'documents' && (
          <DocumentsSubsection
            project={project}
            isEngineer={false}
            documents={documents}
            documentsLoading={documentsLoading}
            onLoadDocuments={onLoadDocuments}
          />
        )}
      </div>
    </div>
  )
}
