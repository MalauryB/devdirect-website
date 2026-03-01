"use client"

import { useState } from "react"
import {
  FileText,
  Loader2,
  Receipt,
  X,
  Plus,
  Pencil,
  Trash2,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { UserRole, type UserMetadata } from "@/contexts/auth-context"
import { Project, Quote, Profile } from "@/lib/types"
import { getQuoteStatusBadgeClass, formatCurrency } from "@/lib/dashboard-utils"
import { QuoteForm } from "@/components/quote-form"
import { exportQuoteToExcel, calculateQuoteData } from "@/lib/quote-export"
import { exportQuoteToPdf } from "@/lib/quote-pdf-export"

interface QuotesSubsectionProps {
  project: Project
  user: { id: string; email?: string; user_metadata?: UserMetadata }
  session: { access_token?: string } | null
  userRole: UserRole
  isEngineer: boolean
  quotes: Quote[]
  quotesLoading: boolean
  onSetDeletingQuote: (quote: Quote) => void
  onLoadQuotes: (projectId: string) => void
}

export function QuotesSubsection({
  project,
  user,
  session,
  userRole,
  isEngineer,
  quotes,
  quotesLoading,
  onSetDeletingQuote,
  onLoadQuotes,
}: QuotesSubsectionProps) {
  const { t } = useLanguage()
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <Receipt className="w-5 h-5 text-[#9c984d]" />
          {showQuoteForm
            ? (editingQuote?.name || t('quotes.newQuote'))
            : t('quotes.title')
          }
        </h3>
        {showQuoteForm ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowQuoteForm(false)
              setEditingQuote(null)
            }}
            className="text-foreground/50 hover:text-foreground"
            aria-label="Fermer le formulaire de devis"
          >
            <X className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => {
              setEditingQuote(null)
              setShowQuoteForm(true)
            }}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('quotes.newQuote')}
          </Button>
        )}
      </div>

      {showQuoteForm && (
        <div className="p-4 border-b border-border bg-muted/50">
          <QuoteForm
            projectId={project.id}
            project={project}
            quote={editingQuote}
            onSuccess={() => {
              setShowQuoteForm(false)
              setEditingQuote(null)
              onLoadQuotes(project.id)
            }}
            onCancel={() => {
              setShowQuoteForm(false)
              setEditingQuote(null)
            }}
          />
        </div>
      )}

      {!showQuoteForm && (
        quotesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
            <p className="text-foreground/50">{t('quotes.noQuotes')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {quotes.map((quote) => {
              const quoteData = calculateQuoteData(quote)
              return (
              <div key={quote.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">
                      {quote.name || `${t('quotes.version')} ${quote.version}`}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getQuoteStatusBadgeClass(quote.status)}`}>
                      {t(`quotes.status.${quote.status}`)}
                    </span>
                    <span className="text-sm font-semibold text-[#d4a5a5]">
                      {formatCurrency(quoteData.totalTTC)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Export buttons - always visible */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportQuoteToExcel(quote, project?.title)}
                      title={t('quotes.exportExcel')}
                      aria-label="Exporter en Excel"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportQuoteToPdf(quote, project, user?.user_metadata as Profile | undefined, undefined, session?.access_token)}
                      title={t('quotes.exportPdf')}
                      aria-label="Exporter en PDF"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    {quote.status === 'draft' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingQuote(quote)
                            setShowQuoteForm(true)
                          }}
                          aria-label="Modifier le devis"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSetDeletingQuote(quote)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          aria-label="Supprimer le devis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )
      )}
    </div>
  )
}
