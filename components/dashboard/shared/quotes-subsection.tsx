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
  Download,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { UserRole } from "@/contexts/auth-context"
import type { Project, Quote, Profile } from "@/lib/types"
import { getQuoteStatusBadgeClass, formatCurrency } from "@/lib/dashboard-utils"
import { QuoteForm } from "@/components/quote-form"
import { exportQuoteToExcel, calculateQuoteData } from "@/lib/quote-export"
import { exportQuoteToPdf } from "@/lib/quote-pdf-export"

interface QuotesSubsectionProps {
  project: Project
  quotes: Quote[]
  quotesLoading: boolean
  isEngineer: boolean
  accessToken?: string
  // Engineer-only props
  user?: { id: string; email?: string; user_metadata?: any }
  session?: { access_token?: string } | null
  userRole?: UserRole
  onDeleteQuote?: (quote: Quote) => void
  onLoadQuotes?: (projectId: string) => void
}

export function QuotesSubsection({
  project,
  quotes,
  quotesLoading,
  isEngineer,
  accessToken,
  user,
  session,
  userRole,
  onDeleteQuote,
  onLoadQuotes,
}: QuotesSubsectionProps) {
  const { t } = useLanguage()
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)

  // Resolve the access token from either prop source
  const resolvedAccessToken = accessToken || session?.access_token

  // Engineer view: full CRUD with card wrapper
  if (isEngineer) {
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
                onLoadQuotes?.(project.id)
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
                      {/* Export buttons */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportQuoteToExcel(quote, project?.title)}
                        title={t('quotes.exportExcel')}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportQuoteToPdf(quote, project, user?.user_metadata as Profile | undefined, undefined, resolvedAccessToken)}
                        title={t('quotes.exportPdf')}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {/* Edit/Delete - engineer only, draft quotes only */}
                      {quote.status === 'draft' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingQuote(quote)
                              setShowQuoteForm(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {onDeleteQuote && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteQuote(quote)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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

  // Client view: read-only with export buttons
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">{t('projects.subSections.quotes')}</h3>
          <p className="text-sm text-foreground/50">{t('quotes.clientSubtitle')}</p>
        </div>
      </div>

      {quotesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 border border-border rounded-xl">
          <Receipt className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-foreground/70 font-medium">{t('quotes.noQuotes')}</p>
          <p className="text-foreground/50 text-sm mt-1">{t('quotes.noQuotesClientDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => {
            const quoteData = calculateQuoteData(quote)
            return (
              <div
                key={quote.id}
                className="bg-white border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{quote.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getQuoteStatusBadgeClass(quote.status)}`}>
                        {t(`quotes.status.${quote.status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60 mb-3">
                      {t('quotes.createdAt')}: {new Date(quote.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-foreground/70">
                        <strong>{quoteData.totalDays}</strong> {t('quotes.days')}
                      </span>
                      <span className="text-foreground font-semibold">
                        {formatCurrency(quoteData.totalTTC)} TTC
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Download PDF */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportQuoteToPdf(quote, project, undefined, undefined, resolvedAccessToken)}
                      title={t('quotes.downloadPdf')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {/* Download Excel */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportQuoteToExcel(quote, project?.title)}
                      title={t('quotes.downloadExcel')}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
