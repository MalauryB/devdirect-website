"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { LucideIcon } from "lucide-react"
import type { Project, Quote } from "@/lib/types"

interface MenuItem {
  id: string
  icon: LucideIcon
  label: string
  disabled?: boolean
}

interface DashboardSidebarProps {
  menuItems: MenuItem[]
  activeSection: string
  sidebarOpen: boolean
  sidebarExpanded: boolean
  onMenuClick: (item: MenuItem) => void
  onSidebarOpenChange: (open: boolean) => void
  onSidebarExpandedChange: (expanded: boolean) => void
  unreadCounts: Record<string, number>
  allProjects: Project[]
  allQuotes: Quote[]
  isEngineer: boolean
}

export function DashboardSidebar({
  menuItems,
  activeSection,
  sidebarOpen,
  sidebarExpanded,
  onMenuClick,
  onSidebarOpenChange,
  onSidebarExpandedChange,
  unreadCounts,
  allProjects,
  allQuotes,
  isEngineer,
}: DashboardSidebarProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => onSidebarOpenChange(false)}
        />
      )}

      {/* Sidebar - Collapsible drawer */}
      <aside
        onMouseEnter={() => onSidebarExpandedChange(true)}
        onMouseLeave={() => onSidebarExpandedChange(false)}
        className={`fixed lg:fixed inset-y-0 left-0 z-50 bg-white border-r border-border transform transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${sidebarExpanded ? "lg:w-64" : "lg:w-16"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className={`px-4 h-14 border-b border-border flex items-center ${!sidebarExpanded && !sidebarOpen ? "lg:px-3" : ""}`}>
            <div className="flex items-center justify-between w-full">
              <Link href="/" className={`text-xl font-bold logo-cubic text-foreground transition-opacity duration-200 ${!sidebarExpanded && !sidebarOpen ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : ""}`}>
                {t('name')}
              </Link>
              {/* Logo icon when collapsed */}
              <div className={`hidden ${!sidebarExpanded && !sidebarOpen ? "lg:flex" : "lg:hidden"} items-center justify-center w-10 h-10`}>
                <span className="text-xl font-bold logo-cubic text-foreground">M</span>
              </div>
              <button
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
                onClick={() => onSidebarOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Menu items */}
          <nav className={`flex-1 p-4 space-y-0.5 overflow-y-auto ${!sidebarExpanded && !sidebarOpen ? "lg:p-2" : ""}`}>
            {menuItems.map((item) => {
              const isDisabled = 'disabled' in item ? Boolean(item.disabled) : false
              // Calculate badge count based on menu item and user role
              let badgeCount = 0
              if (item.id === 'messages' && !isEngineer) {
                badgeCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
              } else if (item.id === 'overview' && isEngineer) {
                const excludedStatuses = ['cancelled', 'lost', 'closed']
                const activeProjectIds = allProjects.filter(p => !excludedStatuses.includes(p.status)).map(p => p.id)
                const unreadMessageCount = Object.entries(unreadCounts)
                  .filter(([projectId]) => activeProjectIds.includes(projectId))
                  .reduce((sum, [, count]) => sum + count, 0)
                const projectsNeedingQuotes = allProjects.filter(p =>
                  !excludedStatuses.includes(p.status) &&
                  (p.status === 'pending' || p.status === 'in_review') &&
                  !allQuotes.some(q => q.project_id === p.id)
                ).length
                const draftQuotes = allQuotes.filter(q =>
                  q.status === 'draft' &&
                  allProjects.some(p => p.id === q.project_id && !excludedStatuses.includes(p.status))
                ).length
                badgeCount = unreadMessageCount + projectsNeedingQuotes + draftQuotes
              }
              return (
                <button
                  key={item.id}
                  onClick={() => onMenuClick(item)}
                  disabled={isDisabled}
                  title={!sidebarExpanded && !sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                    !sidebarExpanded && !sidebarOpen ? "lg:justify-center lg:px-0" : ""
                  } ${
                    activeSection === item.id
                      ? "bg-muted text-foreground font-medium"
                      : isDisabled
                      ? "opacity-50 cursor-not-allowed text-muted-foreground"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {badgeCount > 0 && !sidebarExpanded && !sidebarOpen && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <span className={`flex-1 transition-opacity duration-200 ${!sidebarExpanded && !sidebarOpen ? "lg:hidden" : ""}`}>{item.label}</span>
                  {badgeCount > 0 && (sidebarExpanded || sidebarOpen) && (
                    <span className="bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                  {isDisabled && (sidebarExpanded || sidebarOpen) && (
                    <span className="text-xs text-muted-foreground">
                      {t('dashboard.comingSoon')}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Spacer for fixed sidebar on desktop */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-200 ${sidebarExpanded ? "w-64" : "w-16"}`} />
    </>
  )
}
