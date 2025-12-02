"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { createQuote, updateQuote } from "@/lib/quotes"
import { QuoteFormData, Quote, QuoteLineItem } from "@/lib/types"
import { Loader2, Check, Plus, Trash2 } from "lucide-react"

interface QuoteFormProps {
  projectId: string
  quote?: Quote | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function QuoteForm({ projectId, quote, onSuccess, onCancel }: QuoteFormProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const isEditing = !!quote

  const [formData, setFormData] = useState<QuoteFormData>({
    line_items: quote?.line_items || [{ description: "", quantity: 1, unit_price: 0, total: 0 }],
    notes: quote?.notes || "",
    validity_days: quote?.validity_days || 30
  })

  const calculateLineTotal = (quantity: number, unitPrice: number): number => {
    return quantity * unitPrice
  }

  const calculateTotal = (items: QuoteLineItem[]): number => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const updateLineItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.line_items]
      const item = { ...newItems[index] }

      if (field === 'description') {
        item.description = value as string
      } else if (field === 'quantity') {
        item.quantity = Number(value) || 0
        item.total = calculateLineTotal(item.quantity, item.unit_price)
      } else if (field === 'unit_price') {
        item.unit_price = Number(value) || 0
        item.total = calculateLineTotal(item.quantity, item.unit_price)
      }

      newItems[index] = item
      return { ...prev, line_items: newItems }
    })
  }

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { description: "", quantity: 1, unit_price: 0, total: 0 }]
    }))
  }

  const removeLineItem = (index: number) => {
    if (formData.line_items.length <= 1) return
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    const validItems = formData.line_items.filter(item => item.description.trim() !== "")
    if (validItems.length === 0) {
      setError(t('quotes.errors.itemRequired'))
      return
    }

    setLoading(true)

    const dataToSubmit = {
      ...formData,
      line_items: validItems
    }

    let submitError: Error | null = null

    if (isEditing && quote) {
      const { error } = await updateQuote(quote.id, dataToSubmit)
      submitError = error
    } else {
      const { error } = await createQuote(projectId, dataToSubmit)
      submitError = error
    }

    if (submitError) {
      setError(isEditing ? t('quotes.errors.updateFailed') : t('quotes.errors.createFailed'))
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    }

    setLoading(false)
  }

  const total = calculateTotal(formData.line_items)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lignes du devis */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">{t('quotes.form.lineItems')} *</h3>
          <p className="text-xs text-foreground/50 mt-0.5">{t('quotes.form.lineItemsDesc')}</p>
        </div>

        <div className="space-y-3">
          {formData.line_items.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-foreground/70">{t('quotes.form.description')}</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder={t('quotes.form.descriptionPlaceholder')}
                    disabled={loading}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                {formData.line_items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-foreground/70">{t('quotes.form.quantity')}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                    disabled={loading}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div>
                  <Label className="text-xs text-foreground/70">{t('quotes.form.unitPrice')} (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                    disabled={loading}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div>
                  <Label className="text-xs text-foreground/70">{t('quotes.form.lineTotal')}</Label>
                  <Input
                    value={`${item.total.toFixed(2)} €`}
                    disabled
                    className="border-gray-200 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addLineItem}
            disabled={loading}
            className="w-full border-dashed border-gray-300 hover:border-gray-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('quotes.form.addLine')}
          </Button>
        </div>
      </div>

      {/* Total */}
      <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
        <span className="font-medium text-foreground">{t('quotes.form.total')}</span>
        <span className="text-xl font-bold text-foreground">{total.toFixed(2)} €</span>
      </div>

      {/* Validité */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t('quotes.form.validityDays')}</Label>
        <Input
          type="number"
          min="1"
          value={formData.validity_days}
          onChange={(e) => setFormData({ ...formData, validity_days: Number(e.target.value) || 30 })}
          disabled={loading}
          className="w-32 border-gray-200 focus:border-gray-400"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm text-foreground/70">{t('quotes.form.notes')}</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={t('quotes.form.notesPlaceholder')}
          rows={3}
          disabled={loading}
          className="border-gray-200 focus:border-gray-400 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {t('quotes.form.success')}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            onClick={onCancel}
            disabled={loading}
          >
            {t('quotes.form.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {isEditing ? t('quotes.form.update') : t('quotes.form.create')}
        </Button>
      </div>
    </form>
  )
}
