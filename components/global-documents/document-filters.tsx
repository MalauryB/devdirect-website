"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  GlobalDocumentType,
  globalDocumentTypeLabels,
} from "@/lib/global-documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Plus,
  FolderOpen,
} from "lucide-react"

const documentTypes: GlobalDocumentType[] = [
  'template_ppt',
  'template_word',
  'template_excel',
  'email_signature',
  'branding',
  'process',
  'other'
]

interface DocumentFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterType: GlobalDocumentType | "all"
  onFilterTypeChange: (value: GlobalDocumentType | "all") => void
  filterCategory: string | "all"
  onFilterCategoryChange: (value: string) => void
  categories: string[]
  onUploadClick: () => void
}

export function DocumentFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  categories,
  onUploadClick,
}: DocumentFiltersProps) {
  const { t, language } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="flex flex-1 gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('globalDocuments.search')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type filter */}
        <Select value={filterType} onValueChange={(v) => onFilterTypeChange(v as GlobalDocumentType | "all")}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={t('globalDocuments.filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('globalDocuments.allTypes')}</SelectItem>
            {documentTypes.map(type => (
              <SelectItem key={type} value={type}>
                {globalDocumentTypeLabels[type][language]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category filter */}
        {categories.length > 0 && (
          <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <FolderOpen className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('globalDocuments.filterByCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('globalDocuments.allCategories')}</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Upload button */}
      <Button onClick={onUploadClick} className="bg-[#ea4c89] hover:bg-[#ea4c89]/90">
        <Plus className="w-4 h-4 mr-2" />
        {t('globalDocuments.upload')}
      </Button>
    </div>
  )
}
