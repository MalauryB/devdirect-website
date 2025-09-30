"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

export default function DevisPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    // Informations personnelles
    name: "",
    email: "",
    phone: "",
    company: "",

    // Type de projet
    projectTypes: [] as string[],

    // Services demandés
    services: [] as string[],

    // Détails du projet
    projectDescription: "",
    budget: "",
    deadline: "",

    // Besoins techniques
    platforms: [] as string[],
    hasExistingProject: "",
    existingTechnologies: "",

    // Fonctionnalités
    features: "",

    // Design
    needsDesign: "",
    hasExistingDesign: "",

    // Informations additionnelles
    targetAudience: "",
    additionalInfo: ""
  })

  const handleProjectTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter(t => t !== type)
        : [...prev.projectTypes, type]
    }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Ajouter la logique d'envoi du formulaire
    console.log("Devis submitted:", formData)
    // Rediriger vers la page d'accueil ou afficher un message de succès
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Button>
            <h1 className="text-3xl font-bold logo-cubic text-black">{t('name')}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Demande de Devis</h1>
            <p className="text-xl text-muted-foreground">
              Remplissez ce formulaire détaillé pour recevoir un devis personnalisé pour votre projet.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
                <CardDescription>Vos coordonnées pour vous recontacter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean.dupont@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Type de projet */}
            <Card>
              <CardHeader>
                <CardTitle>Type de projet</CardTitle>
                <CardDescription>Sélectionnez tous les types de projets concernés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "web", label: "Application Web" },
                    { id: "mobile", label: "Application Mobile" },
                    { id: "desktop", label: "Application Desktop" },
                    { id: "iot", label: "Solution IoT / Embarqué" },
                    { id: "ai", label: "Intelligence Artificielle / Machine Learning" },
                    { id: "design", label: "Design / Maquettes" },
                    { id: "consulting", label: "Conseil / Audit" },
                    { id: "maintenance", label: "Maintenance / Support" },
                    { id: "other", label: "Autre" }
                  ].map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.id}`}
                        checked={formData.projectTypes.includes(type.id)}
                        onCheckedChange={() => handleProjectTypeToggle(type.id)}
                      />
                      <Label htmlFor={`type-${type.id}`} className="cursor-pointer">{type.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Services demandés */}
            <Card>
              <CardHeader>
                <CardTitle>Services demandés</CardTitle>
                <CardDescription>Sélectionnez tous les services dont vous avez besoin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "development", label: "Développement" },
                    { id: "design", label: "Design / UX/UI" },
                    { id: "consulting", label: "Conseil technique" },
                    { id: "testing", label: "Tests / QA" },
                    { id: "deployment", label: "Déploiement" },
                    { id: "maintenance", label: "Maintenance" },
                    { id: "training", label: "Formation" },
                    { id: "seo", label: "SEO / Référencement" }
                  ].map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={formData.services.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <Label htmlFor={service.id} className="cursor-pointer">{service.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plateformes */}
            <Card>
              <CardHeader>
                <CardTitle>Plateformes cibles</CardTitle>
                <CardDescription>Sur quelles plateformes votre projet doit-il fonctionner ?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: "web", label: "Web" },
                    { id: "ios", label: "iOS" },
                    { id: "android", label: "Android" },
                    { id: "windows", label: "Windows" },
                    { id: "macos", label: "macOS" },
                    { id: "linux", label: "Linux" },
                    { id: "embedded", label: "Embarqué" },
                    { id: "cloud", label: "Cloud" }
                  ].map((platform) => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`platform-${platform.id}`}
                        checked={formData.platforms.includes(platform.id)}
                        onCheckedChange={() => handlePlatformToggle(platform.id)}
                      />
                      <Label htmlFor={`platform-${platform.id}`} className="cursor-pointer">{platform.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description du projet */}
            <Card>
              <CardHeader>
                <CardTitle>Description du projet</CardTitle>
                <CardDescription>Décrivez votre projet en détail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Description générale *</Label>
                  <Textarea
                    id="projectDescription"
                    required
                    value={formData.projectDescription}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    placeholder="Décrivez votre projet, ses objectifs, le contexte..."
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Fonctionnalités principales</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Listez les fonctionnalités principales souhaitées..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Public cible</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Qui sont les utilisateurs finaux ?"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Projet existant */}
            <Card>
              <CardHeader>
                <CardTitle>Projet existant</CardTitle>
                <CardDescription>Avez-vous déjà un projet en cours ?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={formData.hasExistingProject} onValueChange={(value) => setFormData({ ...formData, hasExistingProject: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="existing-no" />
                    <Label htmlFor="existing-no" className="cursor-pointer">Non, c'est un nouveau projet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="existing-yes" />
                    <Label htmlFor="existing-yes" className="cursor-pointer">Oui, j'ai déjà un projet</Label>
                  </div>
                </RadioGroup>
                {formData.hasExistingProject === "yes" && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="existingTechnologies">Technologies existantes</Label>
                    <Textarea
                      id="existingTechnologies"
                      value={formData.existingTechnologies}
                      onChange={(e) => setFormData({ ...formData, existingTechnologies: e.target.value })}
                      placeholder="Quelles technologies sont actuellement utilisées ?"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Design */}
            <Card>
              <CardHeader>
                <CardTitle>Design & Interface</CardTitle>
                <CardDescription>Informations sur le design de votre projet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Avez-vous besoin d'un design / maquettes ?</Label>
                  <RadioGroup value={formData.needsDesign} onValueChange={(value) => setFormData({ ...formData, needsDesign: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="design-yes" />
                      <Label htmlFor="design-yes" className="cursor-pointer">Oui, je n'ai pas de design</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partial" id="design-partial" />
                      <Label htmlFor="design-partial" className="cursor-pointer">Partiellement, j'ai quelques maquettes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="design-no" />
                      <Label htmlFor="design-no" className="cursor-pointer">Non, j'ai déjà tous les designs</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Budget et délais */}
            <Card>
              <CardHeader>
                <CardTitle>Budget et Délais</CardTitle>
                <CardDescription>Informations sur votre budget et vos contraintes de temps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget estimé</Label>
                    <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une fourchette" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Moins de 5 000 €</SelectItem>
                        <SelectItem value="medium">5 000 € - 15 000 €</SelectItem>
                        <SelectItem value="large">15 000 € - 50 000 €</SelectItem>
                        <SelectItem value="xlarge">Plus de 50 000 €</SelectItem>
                        <SelectItem value="flexible">Flexible / À discuter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Délai souhaité</Label>
                    <Select value={formData.deadline} onValueChange={(value) => setFormData({ ...formData, deadline: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un délai" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Moins d'1 mois</SelectItem>
                        <SelectItem value="short">1 à 3 mois</SelectItem>
                        <SelectItem value="medium">3 à 6 mois</SelectItem>
                        <SelectItem value="long">Plus de 6 mois</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations additionnelles */}
            <Card>
              <CardHeader>
                <CardTitle>Informations additionnelles</CardTitle>
                <CardDescription>Tout ce que nous devrions savoir d'autre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Autres informations</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    placeholder="Contraintes spécifiques, questions, informations importantes..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-center">
              <Button type="submit" size="lg" className="w-full md:w-auto px-12">
                <Send className="mr-2 w-4 h-4" />
                Envoyer la demande de devis
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
