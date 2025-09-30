"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, Send } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useContact } from "@/contexts/contact-context"

export function CTA() {
  const { t } = useLanguage()
  const { isOpen, openDialog, closeDialog } = useContact()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Ajouter la logique d'envoi du formulaire
    console.log("Form submitted:", formData)
    closeDialog()
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
    <>
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t('cta.title')}</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                {t('cta.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="text-lg px-8" onClick={openDialog}>
                  <Phone className="mr-2 w-5 h-5" />
                  {t('navigation.contact')}
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" onClick={openDialog}>
                  <Mail className="mr-2 w-5 h-5" />
                  {t('cta.button')}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                {t('cta.description')}
              </div>
            </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
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
        </DialogContent>
      </Dialog>
    </>
  )
}
