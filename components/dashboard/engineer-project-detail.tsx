"use client"

import { useMemo } from "react"
import {
  User,
  FileText,
  MessageCircle,
  ArrowLeft,
  Receipt,
  FolderOpen,
  Euro,
  Clock,
  Flag,
  FileSignature
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { UserRole, type UserMetadata } from "@/contexts/auth-context"
import { Project, Quote, Profile, ProjectDocument, CurrentUser } from "@/lib/types"
import { getStatusBadgeClass } from "@/lib/dashboard-utils"
import { MessageThread } from "@/components/message-thread"
import { TimeTracking } from "@/components/time-tracking"
import { ProjectRoadmap } from "@/components/project-roadmap"
import { ProjectContracts } from "@/components/project-contracts"
import { ProjectFinances } from "@/components/project-finances"
import { loadCompanySettings } from "@/lib/company-settings"
import { DetailSubsection } from "@/components/dashboard/shared/detail-subsection"
import { QuotesSubsection } from "@/components/dashboard/shared/quotes-subsection"
import { DocumentsSubsection } from "@/components/dashboard/shared/documents-subsection"
import type { SubSection } from "@/hooks/use-dashboard-navigation"

interface EngineerProjectDetailProps {
  project: Project
  user: { id: string; email?: string; user_metadata?: UserMetadata }
  session: { access_token?: string } | null
  userRole: UserRole
  isEngineer: boolean
  projectSubSection: SubSection
  onSubSectionChange: (sub: SubSection) => void
  quotes: Quote[]
  quotesLoading: boolean
  documents: ProjectDocument[]
  documentsLoading: boolean
  unreadCounts: Record<string, number>
  engineers: Partial<Profile>[]
  onBack: () => void
  onViewClientProfile: (profile: Profile) => void
  onSetDeletingQuote: (quote: Quote) => void
  onLoadQuotes: (projectId: string) => void
  onLoadDocuments: (projectId: string) => void
}

export function EngineerProjectDetail({
  project,
  user,
  session,
  userRole,
  isEngineer,
  projectSubSection,
  onSubSectionChange,
  quotes,
  quotesLoading,
  documents,
  documentsLoading,
  unreadCounts,
  engineers,
  onBack,
  onViewClientProfile,
  onSetDeletingQuote,
  onLoadQuotes,
  onLoadDocuments,
}: EngineerProjectDetailProps) {
  const { t } = useLanguage()
  const companySettings = useMemo(() => loadCompanySettings(), [])
  const currentUser: CurrentUser = useMemo(() => ({
    id: user?.id || '',
    first_name: user?.user_metadata?.first_name,
    last_name: user?.user_metadata?.last_name,
    avatar_url: user?.user_metadata?.avatar_url,
    role: userRole,
  }), [user?.id, user?.user_metadata?.first_name, user?.user_metadata?.last_name, user?.user_metadata?.avatar_url, userRole])

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
          {/* Messages - most used */}
          <button
            onClick={() => onSubSectionChange('messages')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
              projectSubSection === 'messages'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-4 h-4" />
              {project && unreadCounts[project.id] > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            {t('messages.title')}
            {project && unreadCounts[project.id] > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {unreadCounts[project.id]}
              </span>
            )}
          </button>
          {/* Roadmap */}
          <button
            onClick={() => onSubSectionChange('roadmap')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
              projectSubSection === 'roadmap'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <Flag className="w-4 h-4" />
            {t('roadmap.title')}
          </button>
          {/* Time tracking */}
          <button
            onClick={() => onSubSectionChange('time')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
              projectSubSection === 'time'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            {t('timeTracking.title')}
          </button>
          {/* Finances */}
          <button
            onClick={() => onSubSectionChange('finances')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
              projectSubSection === 'finances'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <Euro className="w-4 h-4" />
            {t('finances.title')}
          </button>
          {/* Quotes */}
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
          {/* Contracts */}
          <button
            onClick={() => onSubSectionChange('contracts')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
              projectSubSection === 'contracts'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            {t('contracts.title')}
          </button>
          {/* Documents */}
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
          </button>
          {/* Details - least used */}
          <button
            onClick={() => onSubSectionChange('details')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mt-1 ${
              projectSubSection === 'details'
                ? 'bg-white border border-border text-foreground font-medium shadow-sm'
                : 'text-foreground/70 hover:bg-white hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('projects.subSections.details')}
          </button>
        </nav>
      </div>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${projectSubSection === 'messages' ? 'overflow-hidden' : 'p-4 lg:p-6 overflow-auto'}`}>
        {/* Project Header - always visible */}
        <div className="bg-white border border-border rounded-xl overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Client avatar or initials */}
                <button
                  onClick={() => project.profiles && onViewClientProfile(project.profiles as Profile)}
                  className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center shadow-sm overflow-hidden hover:ring-2 hover:ring-[#c48b8b] hover:ring-offset-2 transition-all cursor-pointer"
                  title={t('projects.details.viewProfile')}
                >
                  {project.profiles?.avatar_url ? (
                    <img
                      src={project.profiles.avatar_url}
                      alt={project.profiles.company_name || project.profiles.first_name || 'Client'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {(project.profiles?.company_name?.[0] || project.profiles?.first_name?.[0] || 'C').toUpperCase()}
                    </span>
                  )}
                </button>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {project.title || t('projects.untitled')}
                  </h2>
                  <button
                    onClick={() => project.profiles && onViewClientProfile(project.profiles as Profile)}
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors mb-2 flex items-center gap-1"
                  >
                    <User className="w-3 h-3" />
                    {project.profiles?.company_name || `${project.profiles?.first_name || ''} ${project.profiles?.last_name || ''}`.trim() || t('projects.details.unknownClient')}
                  </button>
                  <div className="flex flex-wrap gap-2 mb-2">
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
              <span className={`shrink-0 text-sm px-3 py-1.5 rounded-full font-medium ${getStatusBadgeClass(project.status)}`}>
                {t(`projects.status.${project.status}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Details Sub-Section */}
        {projectSubSection === 'details' && (
          <DetailSubsection
            project={project}
            onViewClientProfile={onViewClientProfile}
          />
        )}

        {/* Quotes Sub-Section */}
        {projectSubSection === 'quotes' && (
          <QuotesSubsection
            project={project}
            user={user}
            session={session}
            userRole={userRole}
            isEngineer={isEngineer}
            quotes={quotes}
            quotesLoading={quotesLoading}
            onDeleteQuote={onSetDeletingQuote}
            onLoadQuotes={onLoadQuotes}
          />
        )}

        {/* Messages Section */}
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
                otherParty={project.profiles}
              />
            </div>
          </>
        )}

        {/* Documents Section */}
        {projectSubSection === 'documents' && (
          <DocumentsSubsection
            project={project}
            isEngineer={isEngineer}
            documents={documents}
            documentsLoading={documentsLoading}
            onLoadDocuments={onLoadDocuments}
          />
        )}

        {/* Time Tracking Section */}
        {projectSubSection === 'time' && (
          <div className="bg-white border border-border rounded-xl p-6">
            <TimeTracking
              projectId={project.id}
              currentUser={currentUser}
              isEngineer={isEngineer}
            />
          </div>
        )}

        {/* Roadmap Section */}
        {projectSubSection === 'roadmap' && (
          <div className="bg-white border border-border rounded-xl p-6">
            <ProjectRoadmap
              project={project}
              currentUser={currentUser}
              isEngineer={isEngineer}
              engineers={engineers}
            />
          </div>
        )}

        {/* Contracts Section */}
        {projectSubSection === 'contracts' && (
          <div className="bg-white border border-border rounded-xl p-6">
            <ProjectContracts
              project={project}
              quotes={quotes}
              client={project.profiles as Profile | undefined}
              isEngineer={isEngineer}
              provider={companySettings}
            />
          </div>
        )}

        {/* Finances Section */}
        {projectSubSection === 'finances' && (
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Euro className="w-5 h-5 text-[#ea4c89]" />
              <h2 className="text-lg font-semibold text-foreground">{t('finances.title')}</h2>
            </div>
            <p className="text-sm text-foreground/50 mb-6">{t('finances.subtitle')}</p>
            <ProjectFinances
              project={project}
              isEngineer={isEngineer}
              onNavigateToContracts={() => onSubSectionChange('contracts')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
