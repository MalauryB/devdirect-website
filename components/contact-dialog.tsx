"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle } from "lucide-react"
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
    // TODO: Ajouter la logique d'envoi du formulaire
    console.log("Form submitted:", formData)
    setSubmitted(true)
    // Réinitialiser le formulaire
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      message: ""
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-lg font-medium text-foreground">
              Merci ! Votre demande a bien été envoyée. Nous vous recontacterons rapidement.
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
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Votre nom"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nom de votre entreprise"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Décrivez votre projet..."
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            <Send className="mr-2 w-4 h-4" />
            Envoyer la demande
          </Button>
        </form>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}
