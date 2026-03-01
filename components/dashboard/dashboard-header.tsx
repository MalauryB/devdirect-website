"use client"

import { User, LogOut, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import type { UserMetadata } from "@/contexts/auth-context"

interface DashboardHeaderProps {
  user: { email?: string; user_metadata?: UserMetadata }
  displayName: string
  avatarUrl: string
  onOpenSidebar: () => void
  onProfileClick: () => void
  onSignOut: () => void
}

export function DashboardHeader({
  user,
  displayName,
  avatarUrl,
  onOpenSidebar,
  onProfileClick,
  onSignOut,
}: DashboardHeaderProps) {
  const { t } = useLanguage()

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-border px-4 h-14 flex items-center justify-between">
      <button
        className="lg:hidden p-2 hover:bg-muted rounded-md"
        onClick={onOpenSidebar}
        aria-label="Ouvrir le menu lateral"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden lg:block" />

      {/* User account dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors focus:outline-none overflow-hidden" aria-label="Menu du compte utilisateur">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.user_metadata?.first_name || user.email || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium">
                {user.user_metadata?.first_name ? user.user_metadata.first_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border border-border shadow-sm">
          <div className="px-3 py-2 border-b border-muted">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <DropdownMenuItem
            className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 py-2 flex items-center text-muted-foreground"
            onClick={onProfileClick}
          >
            <User className="w-4 h-4 mr-3 flex-shrink-0" />
            <span>{t('navigation.profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-muted" />
          <DropdownMenuItem
            className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 py-2 text-muted-foreground flex items-center"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
            <span>{t('navigation.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
