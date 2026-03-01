"use client"

import {
  Loader2,
  Receipt,
  Download,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { Project, Quote } from "@/lib/types"
import { formatCurrency, getQuoteStatusBadgeClass } from "@/lib/dashboard-utils"
import { exportQuoteToExcel, calculateQuoteData } from "@/lib/quote-export"
import { exportQuoteToPdf } from "@/lib/quote-pdf-export"

interface QuotesSubsectionProps {
  quotes: Quote[]
  quotesLoading: boolean
  project: Project
  accessToken?: string
}

export function QuotesSubsection({ quotes, quotesLoading, project, accessToken }: QuotesSubsectionProps) {
  const { t } = useLanguage()

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
                      onClick={() => exportQuoteToPdf(quote, project, undefined, undefined, accessToken)}
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
