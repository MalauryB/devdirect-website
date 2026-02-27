"use client"

import { Search, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ClientFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function ClientFilters({ searchQuery, onSearchChange }: ClientFiltersProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder={t("dashboard.clients.grid.search")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="text-foreground/60 hover:text-foreground h-9"
          >
            <X className="w-4 h-4 mr-1" />
            {t("projects.grid.clearFilters")}
          </Button>
        )}
      </div>
    </div>
  )
}
