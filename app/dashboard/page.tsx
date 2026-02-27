"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { User, FileText, MessageSquare, Euro, Info, BarChart3, Users, FolderOpen } from "lucide-react"
import { useAuth, UserRole } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { deleteProject } from "@/lib/projects"
import { deleteQuote } from "@/lib/quotes"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useDashboardNavigation } from "@/hooks/use-dashboard-navigation"
import { AboutSection } from "@/components/dashboard/about-section"
import { ClientMessagesSection } from "@/components/dashboard/client-messages-section"
import { DeleteProjectModal, ClientProfileModal, DeleteQuoteModal } from "@/components/dashboard/confirmation-modals"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EngineerProjectList } from "@/components/dashboard/engineer-project-list"
import { ClientProjectDetail } from "@/components/dashboard/client-project-detail"
import { ClientProjectList } from "@/components/dashboard/client-project-list"
import { EngineerProjectDetail } from "@/components/dashboard/engineer-project-detail"

const EngineerOverview = dynamic(() => import('@/components/dashboard/engineer-overview').then(m => ({ default: m.EngineerOverview })))
const GlobalFinances = dynamic(() => import('@/components/global-finances').then(m => ({ default: m.GlobalFinances })))
const GlobalDocuments = dynamic(() => import('@/components/global-documents').then(m => ({ default: m.GlobalDocuments })))
const ProfileSection = dynamic(() => import('@/components/dashboard/profile-section').then(m => ({ default: m.ProfileSection })))
const EngineerClients = dynamic(() => import('@/components/dashboard/engineer-clients').then(m => ({ default: m.EngineerClients })))

export default function DashboardPage() {
  const { user, session, loading, signOut, updateProfile } = useAuth()
  const { t } = useLanguage()

  const userRole: UserRole = user?.user_metadata?.role || 'client'
  const isEngineer = userRole === 'engineer'

  const nav = useDashboardNavigation({ user, loading, isEngineer })

  const data = useDashboardData({
    user,
    isEngineer,
    activeSection: nav.activeSection,
    selectedProject: nav.selectedProject,
    projectSubSection: nav.projectSubSection,
  })

  // Keep the navigation hook's project ref in sync with loaded data
  useEffect(() => {
    nav.projectListsRef.current = {
      projects: data.projects,
      allProjects: data.allProjects,
    }
  }, [data.projects, data.allProjects, nav.projectListsRef])

  const {
    mounted,
    activeSection,
    sidebarOpen, setSidebarOpen,
    sidebarExpanded, setSidebarExpanded,
    selectedProject, setSelectedProject,
    projectSubSection, setProjectSubSection,
    selectedClientId, setSelectedClientId,
    showProjectForm, setShowProjectForm,
    editingProject, setEditingProject,
    deletingProject, setDeletingProject,
    deleteLoading, setDeleteLoading,
    deletingQuote, setDeletingQuote,
    deleteQuoteLoading, setDeleteQuoteLoading,
    viewingClientProfile, setViewingClientProfile,
    navigateToSection,
    navigateToProject,
    navigateToProjectFromOverview,
    navigateToProjectFromClients,
    navigateToProjectFromFinances,
    handleEditProject,
  } = nav

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-foreground">{t('dashboard.loading')}</div>
      </div>
    )
  }

  if (!user) return null

  const displayName = user.user_metadata?.first_name || user.user_metadata?.last_name
    ? `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim()
    : user.email?.split("@")[0]
  const avatarUrl = user.user_metadata?.avatar_url || ""

  const clientMenuItems = [
    { id: "about", icon: Info, label: t('dashboard.menu.about') },
    { id: "projects", icon: FileText, label: t('dashboard.menu.projects') },
    { id: "profile", icon: User, label: t('dashboard.menu.profile') },
    { id: "messages", icon: MessageSquare, label: t('dashboard.menu.messages') },
  ]

  const engineerMenuItems = [
    { id: "overview", icon: BarChart3, label: t('dashboard.menu.overview') },
    { id: "allProjects", icon: FileText, label: t('dashboard.menu.allProjects') },
    { id: "clients", icon: Users, label: t('dashboard.menu.clients') },
    { id: "finances", icon: Euro, label: t('finances.globalTitle') },
    { id: "globalDocuments", icon: FolderOpen, label: t('globalDocuments.title') },
    { id: "profile", icon: User, label: t('dashboard.menu.profile') },
  ]

  const menuItems = isEngineer ? engineerMenuItems : clientMenuItems

  const handleDeleteProject = async () => {
    if (!deletingProject) return
    setDeleteLoading(true)
    const { error } = await deleteProject(deletingProject.id)
    if (!error) {
      setDeletingProject(null)
      setSelectedProject(null)
      data.loadProjects()
    }
    setDeleteLoading(false)
  }

  const handleDeleteQuote = async () => {
    if (!deletingQuote || !selectedProject) return
    setDeleteQuoteLoading(true)
    const { error } = await deleteQuote(deletingQuote.id)
    if (!error) {
      setDeletingQuote(null)
      data.loadQuotes(selectedProject.id)
    }
    setDeleteQuoteLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex">
      <DashboardSidebar
        menuItems={menuItems}
        activeSection={activeSection}
        sidebarOpen={sidebarOpen}
        sidebarExpanded={sidebarExpanded}
        onMenuClick={(item) => navigateToSection(item.id)}
        onSidebarOpenChange={setSidebarOpen}
        onSidebarExpandedChange={setSidebarExpanded}
        unreadCounts={data.unreadCounts}
        allProjects={data.allProjects}
        allQuotes={data.allQuotes}
        isEngineer={isEngineer}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader
          user={user}
          displayName={displayName || ''}
          avatarUrl={avatarUrl}
          onOpenSidebar={() => setSidebarOpen(true)}
          onProfileClick={() => navigateToSection("profile")}
          onSignOut={async () => { await signOut(); }}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {activeSection === "profile" && (
            <ProfileSection user={user} isEngineer={isEngineer} onUpdateProfile={updateProfile} />
          )}

          {activeSection === "projects" && (
            <div className="w-full">
              {selectedProject ? (
                <ClientProjectDetail
                  project={selectedProject}
                  user={user}
                  avatarUrl={avatarUrl}
                  userRole={userRole}
                  projectSubSection={projectSubSection}
                  onSubSectionChange={setProjectSubSection}
                  quotes={data.quotes}
                  quotesLoading={data.quotesLoading}
                  documents={data.documents}
                  documentsLoading={data.documentsLoading}
                  unreadCounts={data.unreadCounts}
                  accessToken={session?.access_token}
                  onBack={() => setSelectedProject(null)}
                  onEdit={handleEditProject}
                  onDelete={() => setDeletingProject(selectedProject)}
                  onLoadDocuments={data.loadDocuments}
                />
              ) : (
                <ClientProjectList
                  projects={data.projects}
                  projectsLoading={data.projectsLoading}
                  showProjectForm={showProjectForm}
                  editingProject={editingProject}
                  onShowProjectForm={setShowProjectForm}
                  onSetEditingProject={setEditingProject}
                  onSelectProject={(project) => navigateToProject(project, 'details')}
                  onLoadProjects={data.loadProjects}
                />
              )}
            </div>
          )}

          {activeSection === "about" && <AboutSection />}

          {activeSection === "messages" && !isEngineer && (
            <ClientMessagesSection
              projects={data.projects}
              projectsLoading={data.projectsLoading}
              selectedProject={selectedProject}
              onSelectProject={(project) => navigateToProject(project, 'messages')}
              onNavigateToProjects={() => navigateToSection('projects')}
              onViewProject={(project) => {
                navigateToSection('projects')
                setSelectedProject(project)
              }}
              user={user}
              userRole={userRole}
              unreadCounts={data.unreadCounts}
            />
          )}

          {activeSection === "overview" && isEngineer && (
            <EngineerOverview
              allProjects={data.allProjects}
              allQuotes={data.allQuotes}
              unreadCounts={data.unreadCounts}
              unreadOldestDates={data.unreadOldestDates}
              assignments={data.assignments}
              engineers={data.engineers}
              onNavigateToProject={navigateToProjectFromOverview}
              onNavigateToAllProjects={() => navigateToSection('allProjects')}
              onAssignAction={data.handleAssignAction}
              onMarkAsHandled={data.handleMarkAsHandled}
            />
          )}

          {activeSection === "allProjects" && isEngineer && (
            <div className="w-full">
              {selectedProject ? (
                <EngineerProjectDetail
                  project={selectedProject}
                  user={user}
                  session={session}
                  userRole={userRole}
                  isEngineer={isEngineer}
                  projectSubSection={projectSubSection}
                  onSubSectionChange={setProjectSubSection}
                  quotes={data.quotes}
                  quotesLoading={data.quotesLoading}
                  documents={data.documents}
                  documentsLoading={data.documentsLoading}
                  unreadCounts={data.unreadCounts}
                  engineers={data.engineers}
                  onBack={() => setSelectedProject(null)}
                  onViewClientProfile={setViewingClientProfile}
                  onSetDeletingQuote={setDeletingQuote}
                  onLoadQuotes={data.loadQuotes}
                  onLoadDocuments={data.loadDocuments}
                />
              ) : (
                <EngineerProjectList
                  allProjects={data.allProjects}
                  projectsLoading={data.projectsLoading}
                  onSelectProject={(project) => navigateToProject(project, 'details')}
                />
              )}
            </div>
          )}

          {activeSection === "clients" && isEngineer && (
            <EngineerClients
              allProjects={data.allProjects}
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
              onNavigateToProject={navigateToProjectFromClients}
            />
          )}

          {activeSection === "finances" && isEngineer && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('finances.globalTitle')}</h2>
                  <p className="text-foreground/60 text-sm">{t('finances.globalSubtitle')}</p>
                </div>
              </div>
              <GlobalFinances
                onSelectProject={(projectId) => {
                  const project = data.allProjects.find(p => p.id === projectId)
                  if (project) navigateToProjectFromFinances(project)
                }}
              />
            </div>
          )}

          {activeSection === "globalDocuments" && isEngineer && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('globalDocuments.title')}</h2>
                  <p className="text-foreground/60 text-sm">{t('globalDocuments.subtitle')}</p>
                </div>
              </div>
              <GlobalDocuments />
            </div>
          )}
        </main>
      </div>

      <DeleteProjectModal
        project={deletingProject}
        loading={deleteLoading}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeletingProject(null)}
      />
      <ClientProfileModal
        profile={viewingClientProfile}
        onClose={() => setViewingClientProfile(null)}
      />
      <DeleteQuoteModal
        quote={deletingQuote}
        loading={deleteQuoteLoading}
        onConfirm={handleDeleteQuote}
        onCancel={() => setDeletingQuote(null)}
      />
    </div>
  )
}
