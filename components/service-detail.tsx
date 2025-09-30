'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Clock, Code, Rocket, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getPath } from "@/lib/utils-path"

const servicesData = {
  "developpement-web": {
    title: "Développement Web",
    subtitle: "Applications web modernes et performantes",
    description: "Nous créons des applications web sur mesure, adaptées à vos besoins spécifiques. De la simple vitrine au système complexe, nous maîtrisons les dernières technologies pour vous offrir une solution performante et évolutive.",
    icon: Code,
    image: "/devdirect-website/modern-web-dev-workspace.png",

    whatWeOffer: [
      "Sites vitrine et portfolios",
      "Applications web complexes (SaaS, plateformes)",
      "E-commerce et marketplaces",
      "Tableaux de bord et outils de gestion",
      "Progressive Web Apps (PWA)",
      "API REST et GraphQL"
    ],

    technologies: [
      { name: "Frontend", items: ["React", "Next.js", "Vue.js", "Angular", "TypeScript", "Tailwind CSS"] },
      { name: "Backend", items: ["Node.js", "Python", "Java", "Spring Boot", "Express", "NestJS"] },
      { name: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis"] },
      { name: "Cloud & DevOps", items: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD"] }
    ],

    process: [
      {
        title: "Analyse & Planification",
        description: "Étude approfondie de vos besoins, définition du périmètre fonctionnel et technique, architecture de la solution.",
        duration: "1-2 semaines"
      },
      {
        title: "Design & Prototypage",
        description: "Création des maquettes UX/UI, validation de l'expérience utilisateur, prototypes interactifs.",
        duration: "2-3 semaines"
      },
      {
        title: "Développement",
        description: "Développement itératif avec sprints Agile, revues régulières, tests continus, intégration continue.",
        duration: "Variable selon projet"
      },
      {
        title: "Tests & QA",
        description: "Tests unitaires, tests d'intégration, tests de performance, tests utilisateurs, correction des bugs.",
        duration: "1-2 semaines"
      },
      {
        title: "Déploiement & Formation",
        description: "Mise en production, configuration des serveurs, formation de vos équipes, documentation complète.",
        duration: "1 semaine"
      },
      {
        title: "Maintenance & Support",
        description: "Support technique, corrections de bugs, mises à jour de sécurité, évolutions fonctionnelles.",
        duration: "Continu"
      }
    ],

    pricing: {
      small: {
        title: "Site Vitrine",
        price: "3 000€ - 8 000€",
        features: ["5-10 pages", "Design responsive", "CMS intégré", "SEO de base", "Formulaire de contact"]
      },
      medium: {
        title: "Application Standard",
        price: "15 000€ - 50 000€",
        features: ["Interface admin", "Gestion utilisateurs", "Base de données", "API REST", "Tests automatisés", "Déploiement"]
      },
      large: {
        title: "Plateforme Complexe",
        price: "50 000€+",
        features: ["Architecture microservices", "Haute disponibilité", "Scalabilité", "Sécurité avancée", "DevOps complet", "Support 24/7"]
      }
    },

    faqs: [
      {
        question: "Combien de temps prend le développement d'une application web ?",
        answer: "Cela dépend de la complexité du projet. Un site vitrine peut prendre 4-6 semaines, tandis qu'une application complexe peut nécessiter 3-6 mois ou plus."
      },
      {
        question: "Proposez-vous la maintenance après le développement ?",
        answer: "Oui, nous proposons des contrats de maintenance et support pour assurer le bon fonctionnement de votre application sur le long terme."
      },
      {
        question: "Puis-je apporter des modifications pendant le développement ?",
        answer: "Oui, nous travaillons en méthodologie Agile qui permet d'ajuster le projet en cours de route. Des revues régulières sont organisées pour valider l'avancement."
      },
      {
        question: "Mon application sera-t-elle responsive ?",
        answer: "Absolument ! Toutes nos applications sont développées avec une approche mobile-first et s'adaptent à tous les types d'écrans."
      }
    ]
  },
  // Add other services data here...
} as const

interface ServiceDetailProps {
  slug: string
}

export function ServiceDetail({ slug }: ServiceDetailProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const service = servicesData[slug as keyof typeof servicesData]

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service non trouvé</h1>
          <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
        </div>
      </div>
    )
  }

  const ServiceIcon = service.icon

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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <ServiceIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
            <p className="text-xl text-muted-foreground mb-8">{service.subtitle}</p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{service.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" onClick={() => window.location.href = getPath("/devis")}>
                Obtenir un devis
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = getPath("/#contact")}>
                Nous contacter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Only showing structure, full content omitted for brevity */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Content sections here */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Ce que nous proposons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.whatWeOffer.map((item, index) => (
                <Card key={index}>
                  <CardContent className="flex items-start gap-3 p-6">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Final */}
          <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à démarrer votre projet ?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Contactez-nous dès maintenant pour discuter de votre projet et obtenir un devis personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = getPath("/devis")}>
                <Rocket className="mr-2 w-5 h-5" />
                Demander un devis
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = getPath("/#contact")}>
                <Users className="mr-2 w-5 h-5" />
                Parler à un expert
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
