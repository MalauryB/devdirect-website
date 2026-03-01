"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useContact } from "@/contexts/contact-context"

export function ContactDialog() {
  const { t } = useLanguage()
  const { isOpen, closeDialog } = useContact()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  })

  // Auto-close dialog 3 seconds after successful submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false)
        closeDialog()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [submitted, closeDialog])

  // Reset submitted state when dialog is reopened
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Contact from ${formData.name} - ${formData.company || 'N/A'}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\nCompany: ${formData.company || 'N/A'}\n\nMessage:\n${formData.message}`
    )
    window.open(`mailto:contact@nimli.fr?subject=${subject}&body=${body}`, '_blank')
    setSubmitted(true)
    setFormData({ name: "", email: "", phone: "", company: "", message: "" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-lg font-medium text-foreground">
              {t('contact.success')}
            </p>
          </div>
        ) : (
        <>
        <DialogHeader>
          <DialogTitle>{t('cta.title')}</DialogTitle>
          <DialogDescription>
            {t('cta.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-muted-foreground">
            <span className="text-red-500">*</span> {t('contact.requiredFields')}
          </p>
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5">
              {t('contact.fullName')} <span className="text-red-500">*</span>
              {formData.name.trim() && <Check className="w-3.5 h-3.5 text-green-500" />}
            </Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('contact.fullName')}
              className={formData.name.trim() ? 'border-green-300' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              Email <span className="text-red-500">*</span>
              {formData.email.trim() && <Check className="w-3.5 h-3.5 text-green-500" />}
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
              className={formData.email.trim() ? 'border-green-300' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1.5">
              {t('contact.phone')}
              <span className="text-xs text-muted-foreground font-normal">({t('contact.optional')})</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-1.5">
              {t('contact.company')}
              <span className="text-xs text-muted-foreground font-normal">({t('contact.optional')})</span>
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder={t('contact.companyPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-1.5">
              Message <span className="text-red-500">*</span>
              {formData.message.trim() && <Check className="w-3.5 h-3.5 text-green-500" />}
            </Label>
            <Textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={t('contact.messagePlaceholder')}
              rows={4}
              className={formData.message.trim() ? 'border-green-300' : ''}
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            <Send className="mr-2 w-4 h-4" />
            {t('contact.send')}
          </Button>
        </form>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}
