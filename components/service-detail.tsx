'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Clock, Code, Rocket, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useContact } from "@/contexts/contact-context"
import { getPath } from "@/lib/utils-path"
import { getImagePath } from "@/lib/assets"

const servicesData = {
  "developpement-web": {
    title: "Développement Web",
    subtitle: "Applications web modernes et performantes",
    description: "Nous créons des applications web sur mesure, adaptées à vos besoins spécifiques. De la simple vitrine au système complexe, nous maîtrisons les dernières technologies pour vous offrir une solution performante et évolutive.",
    icon: Code,
    image: "/webdev.jpg",

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

  "developpement-mobile": {
    title: "Développement Mobile",
    subtitle: "Applications natives et cross-platform",
    description: "Nous développons des applications mobiles performantes pour iOS et Android, livrées clés en main. De l'application grand public à la solution d'entreprise, nous maîtrisons les technologies natives et cross-platform pour offrir une expérience utilisateur optimale sur tous les appareils.",
    icon: Code,
    image: "/mobile.jpg",
    whatWeOffer: [
      "Applications iOS natives (Swift/SwiftUI)",
      "Applications Android natives (Kotlin/Java)",
      "Applications cross-platform (Flutter, React Native)",
      "Applications hybrides et PWA",
      "Intégration API et services backend",
      "Publication sur App Store et Google Play",
      "Maintenance et mises à jour continues"
    ],
    technologies: [
      { name: "iOS", items: ["Swift", "SwiftUI", "UIKit", "Xcode", "TestFlight"] },
      { name: "Android", items: ["Kotlin", "Java", "Jetpack Compose", "Android Studio"] },
      { name: "Cross-platform", items: ["Flutter", "React Native", "Expo"] },
      { name: "Backend & Cloud", items: ["Firebase", "AWS Amplify", "Supabase", "REST APIs"] }
    ],
    process: [
      {
        title: "Analyse & Définition",
        description: "Étude détaillée de vos besoins, définition des fonctionnalités, choix de la technologie adaptée (native vs cross-platform), architecture technique.",
        duration: "1-2 semaines"
      },
      {
        title: "Design Mobile",
        description: "Création des maquettes iOS et Android, design system mobile, prototypes interactifs, respect des guidelines Apple et Google.",
        duration: "2-3 semaines"
      },
      {
        title: "Développement",
        description: "Développement itératif avec sprints, tests sur devices réels, intégration backend, notifications push, gestion offline.",
        duration: "Variable selon projet"
      },
      {
        title: "Tests & QA",
        description: "Tests sur multiples devices et versions OS, tests de performance, tests de batterie, correction des bugs.",
        duration: "1-2 semaines"
      },
      {
        title: "Publication & Lancement",
        description: "Soumission App Store et Google Play, gestion des reviews, configuration analytics, formation de vos équipes.",
        duration: "1-2 semaines"
      },
      {
        title: "Support & Évolution",
        description: "Maintenance corrective, mises à jour OS, nouvelles fonctionnalités, support technique.",
        duration: "Continu"
      }
    ],
    pricing: {
      small: {
        title: "App Simple",
        price: "8 000€ - 20 000€",
        features: ["Cross-platform", "5-8 écrans", "Design responsive", "Backend simple", "Publication stores"]
      },
      medium: {
        title: "App Standard",
        price: "20 000€ - 50 000€",
        features: ["Fonctionnalités avancées", "Paiements in-app", "Notifications push", "Mode offline", "Analytics", "Tests complets"]
      },
      large: {
        title: "App Complexe",
        price: "50 000€+",
        features: ["Architecture complexe", "Haute performance", "Intégrations multiples", "Backend scalable", "Support 24/7"]
      }
    },
    faqs: [
      {
        question: "Native ou cross-platform : quelle approche choisir ?",
        answer: "Le développement natif (Swift/Kotlin) offre les meilleures performances et l'accès à toutes les fonctionnalités système, idéal pour les apps complexes. Le cross-platform (Flutter/React Native) permet un développement plus rapide et économique avec une base de code unique, parfait pour la majorité des projets."
      },
      {
        question: "Combien de temps pour développer une application mobile ?",
        answer: "Une application simple prend 2-3 mois, une app standard 3-6 mois, et une application complexe 6-12 mois ou plus. Nous livrons en version progressive pour que vous puissiez tester rapidement."
      },
      {
        question: "Gérez-vous la publication sur les stores ?",
        answer: "Oui, nous nous occupons de toute la procédure : création des comptes développeur, préparation des assets, soumission, et gestion des éventuels rejets jusqu'à la validation finale."
      },
      {
        question: "Proposez-vous la maintenance après le lancement ?",
        answer: "Absolument. Nous proposons des contrats de maintenance incluant corrections de bugs, mises à jour pour les nouvelles versions iOS/Android, et évolutions fonctionnelles."
      }
    ]
  },

  "iot-embarque": {
    title: "IoT & Systèmes Embarqués",
    subtitle: "Solutions connectées et systèmes intelligents",
    description: "Nous concevons et développons des solutions IoT complètes, du prototype au produit industrialisé. Firmware embarqué, objets connectés, capteurs intelligents : nous livrons des systèmes fiables et performants, testés et prêts à déployer.",
    icon: Code,
    image: "/iot.jpg",
    whatWeOffer: [
      "Firmware embarqué sur mesure (C/C++, MicroPython, Rust)",
      "Objets connectés et capteurs intelligents",
      "Solutions industrielles IoT (monitoring, contrôle)",
      "Plateformes de gestion de devices",
      "Intégration cloud (AWS IoT, Azure IoT, MQTT brokers)",
      "Consommation énergétique optimisée",
      "Sécurité des communications"
    ],
    technologies: [
      { name: "Microcontrôleurs", items: ["ESP32/ESP8266", "STM32", "Arduino", "Raspberry Pi", "nRF52"] },
      { name: "Protocoles", items: ["MQTT", "LoRaWAN", "Bluetooth LE", "Zigbee", "WiFi", "NB-IoT"] },
      { name: "Cloud & Backend", items: ["AWS IoT Core", "Azure IoT Hub", "Node-RED", "InfluxDB", "Grafana"] },
      { name: "Langages", items: ["C/C++", "MicroPython", "Rust", "Arduino Framework", "ESP-IDF"] }
    ],
    process: [
      {
        title: "Conception & Architecture",
        description: "Analyse des besoins techniques, choix du matériel, architecture système, définition des protocoles de communication, contraintes énergétiques.",
        duration: "2-3 semaines"
      },
      {
        title: "Prototypage",
        description: "Développement du prototype fonctionnel, tests de faisabilité, validation des capteurs et actuateurs, premières mesures.",
        duration: "3-4 semaines"
      },
      {
        title: "Développement Firmware",
        description: "Développement du firmware optimisé, gestion de l'énergie, protocoles de communication robustes, mode veille et récupération d'erreurs.",
        duration: "Variable selon projet"
      },
      {
        title: "Backend & Cloud",
        description: "Développement de la plateforme de gestion, APIs, stockage des données, dashboards de visualisation, alertes.",
        duration: "4-8 semaines"
      },
      {
        title: "Tests & Validation",
        description: "Tests d'endurance, tests environnementaux (température, humidité), validation de la consommation, tests de communication longue distance.",
        duration: "2-4 semaines"
      },
      {
        title: "Industrialisation",
        description: "Documentation technique complète, préparation pour la production en série, certifications si nécessaire, support au déploiement.",
        duration: "Variable"
      }
    ],
    pricing: {
      small: {
        title: "Prototype",
        price: "5 000€ - 15 000€",
        features: ["Prototype fonctionnel", "1-2 capteurs", "Communication de base", "Dashboard simple"]
      },
      medium: {
        title: "Solution Standard",
        price: "15 000€ - 40 000€",
        features: ["Firmware optimisé", "Multiple capteurs", "Cloud integration", "Consommation optimisée", "Documentation complète"]
      },
      large: {
        title: "Solution Industrielle",
        price: "40 000€+",
        features: ["Production série", "Haute fiabilité", "Sécurité avancée", "OTA updates", "Support long terme"]
      }
    },
    faqs: [
      {
        question: "Quels protocoles de communication supportez-vous ?",
        answer: "Nous maîtrisons tous les principaux protocoles IoT : MQTT pour les communications légères, LoRaWAN pour longue portée faible consommation, Bluetooth LE pour les wearables, WiFi pour le débit, Zigbee pour les réseaux mesh, et NB-IoT pour les réseaux cellulaires."
      },
      {
        question: "Comment gérez-vous la consommation énergétique ?",
        answer: "Nous optimisons chaque aspect : choix du microcontrôleur adapté, modes veille profonds, réveil intelligent, protocoles économes, et stratégies de transmission optimisées. Nous visons plusieurs mois à années d'autonomie sur batterie selon les cas d'usage."
      },
      {
        question: "Proposez-vous l'hébergement des données IoT ?",
        answer: "Oui, nous pouvons héberger votre plateforme IoT sur AWS IoT Core, Azure IoT Hub, ou sur une infrastructure privée. Nous gérons également la visualisation des données avec des outils comme Grafana."
      },
      {
        question: "Puis-je partir en production série après le prototype ?",
        answer: "Absolument. Nous concevons dès le départ avec l'industrialisation en vue. Nous vous fournissons toute la documentation technique nécessaire et pouvons vous accompagner dans le choix des fabricants."
      }
    ]
  },

  "intelligence-artificielle": {
    title: "Intelligence Artificielle",
    subtitle: "Solutions IA et Machine Learning sur mesure",
    description: "Nous intégrons l'intelligence artificielle dans vos produits et processus. Des chatbots intelligents aux modèles de ML personnalisés, nous développons des solutions IA complètes et opérationnelles, adaptées à vos besoins métiers et livrées clés en main.",
    icon: Code,
    image: "/IA.jpg",
    whatWeOffer: [
      "Intégration de LLMs (GPT, Claude, Mistral, Llama)",
      "Chatbots et assistants intelligents",
      "Traitement du langage naturel (NLP)",
      "Vision par ordinateur et reconnaissance d'images",
      "Modèles de Machine Learning personnalisés",
      "RAG (Retrieval Augmented Generation)",
      "Fine-tuning et optimisation de modèles",
      "Automatisation intelligente de processus"
    ],
    technologies: [
      { name: "LLMs & Frameworks", items: ["OpenAI GPT-4", "Anthropic Claude", "LangChain", "LlamaIndex", "Hugging Face"] },
      { name: "Machine Learning", items: ["TensorFlow", "PyTorch", "Scikit-learn", "XGBoost"] },
      { name: "Computer Vision", items: ["OpenCV", "YOLO", "Detectron2", "Roboflow"] },
      { name: "Infrastructure", items: ["Vector DBs (Pinecone, Weaviate)", "MLflow", "AWS SageMaker", "Azure ML"] }
    ],
    process: [
      {
        title: "Analyse & Cas d'usage",
        description: "Identification des cas d'usage à forte valeur ajoutée, étude de faisabilité, définition des KPIs, analyse des données disponibles.",
        duration: "1-2 semaines"
      },
      {
        title: "Préparation des Données",
        description: "Collecte, nettoyage et enrichissement des données, création de datasets d'entraînement et de test, annotation si nécessaire.",
        duration: "2-4 semaines"
      },
      {
        title: "Développement & Entraînement",
        description: "Sélection et configuration des modèles, entraînement et fine-tuning, optimisation des performances, tests d'accuracy.",
        duration: "4-8 semaines"
      },
      {
        title: "Intégration & API",
        description: "Développement des APIs, intégration dans vos systèmes existants, mise en place du pipeline MLOps, monitoring des performances.",
        duration: "3-6 semaines"
      },
      {
        title: "Tests & Validation",
        description: "Tests d'accuracy et de robustesse, validation métier, tests de charge, ajustements finaux.",
        duration: "2-3 semaines"
      },
      {
        title: "Déploiement & Monitoring",
        description: "Mise en production, monitoring continu, réentraînement périodique, support et optimisations.",
        duration: "Continu"
      }
    ],
    pricing: {
      small: {
        title: "Intégration LLM",
        price: "5 000€ - 15 000€",
        features: ["Chatbot intelligent", "Intégration GPT/Claude", "RAG simple", "Interface utilisateur"]
      },
      medium: {
        title: "ML Custom",
        price: "20 000€ - 60 000€",
        features: ["Modèle personnalisé", "Training sur vos données", "API dédiée", "Fine-tuning", "Dashboard analytics"]
      },
      large: {
        title: "Plateforme IA",
        price: "60 000€+",
        features: ["Multiple modèles", "Pipeline MLOps complet", "Auto-scaling", "Monitoring avancé", "Réentraînement automatique"]
      }
    },
    faqs: [
      {
        question: "API LLM existante vs modèle custom : que choisir ?",
        answer: "Les APIs LLM (GPT-4, Claude) sont parfaites pour les cas d'usage généraux : chatbots, résumés, génération de texte. Un modèle custom est pertinent quand vous avez des données spécifiques, des contraintes de confidentialité, ou besoin de performances optimales sur une tâche précise."
      },
      {
        question: "Combien de données sont nécessaires pour entraîner un modèle ?",
        answer: "Cela dépend du cas d'usage. Pour du fine-tuning de LLM, quelques centaines d'exemples peuvent suffire. Pour un modèle de ML classique, plusieurs milliers d'exemples sont souhaitables. Nous pouvons aussi utiliser des techniques de data augmentation."
      },
      {
        question: "Comment garantissez-vous la confidentialité de nos données ?",
        answer: "Nous pouvons déployer les modèles sur votre infrastructure privée, utiliser des modèles open-source auto-hébergés, ou configurer des APIs avec des options de confidentialité renforcées. Vos données ne sont jamais utilisées pour réentraîner les modèles publics."
      },
      {
        question: "Proposez-vous la maintenance des modèles IA ?",
        answer: "Oui, nous proposons des contrats de maintenance incluant le monitoring des performances, le réentraînement périodique avec de nouvelles données, et l'optimisation continue du modèle."
      }
    ]
  },

  "design-maquettes": {
    title: "Design & Maquettes",
    subtitle: "Expériences utilisateur mémorables",
    description: "Nous créons des interfaces intuitives et esthétiques qui ravissent vos utilisateurs. De la recherche UX aux maquettes finales prêtes pour le développement, nous livrons des designs complets et cohérents, avec tous les assets nécessaires pour une mise en production rapide.",
    icon: Code,
    image: "/maquettes.jpg",
    whatWeOffer: [
      "Recherche utilisateur et personas",
      "Architecture de l'information",
      "Wireframes et prototypes basse-fidélité",
      "Design UI haute-fidélité",
      "Design systems et composants réutilisables",
      "Prototypes interactifs cliquables",
      "Animation et micro-interactions",
      "Responsive design (mobile, tablet, desktop)",
      "Export développeur et documentation"
    ],
    technologies: [
      { name: "Design & Prototypage", items: ["Figma", "Adobe XD", "Sketch", "Framer"] },
      { name: "Illustrations", items: ["Adobe Illustrator", "Procreate", "Blender (3D)"] },
      { name: "Animation", items: ["Principle", "After Effects", "Lottie"] },
      { name: "Collaboration", items: ["FigJam", "Miro", "Notion", "Zeplin"] }
    ],
    process: [
      {
        title: "Recherche Utilisateur",
        description: "Interviews utilisateurs, analyse de la concurrence, définition des personas, parcours utilisateur (user journey), audit UX si existant.",
        duration: "1-2 semaines"
      },
      {
        title: "Architecture de l'Information",
        description: "Organisation du contenu, arborescence, flows utilisateurs, définition des interactions clés.",
        duration: "1 semaine"
      },
      {
        title: "Wireframes",
        description: "Maquettes basse-fidélité, structure des écrans, validation de l'UX, tests utilisateurs préliminaires.",
        duration: "1-2 semaines"
      },
      {
        title: "Design Visuel",
        description: "Direction artistique, moodboards, création de la charte graphique, design haute-fidélité de tous les écrans, états (hover, active, error).",
        duration: "3-5 semaines"
      },
      {
        title: "Prototypage Interactif",
        description: "Prototype cliquable, animations et transitions, micro-interactions, tests utilisateurs finaux.",
        duration: "1-2 semaines"
      },
      {
        title: "Livraison & Support",
        description: "Export des assets, création du design system, documentation pour les développeurs, support pendant l'implémentation.",
        duration: "1 semaine"
      }
    ],
    pricing: {
      small: {
        title: "Design Simple",
        price: "2 000€ - 5 000€",
        features: ["5-10 écrans", "Wireframes", "Design UI", "Responsive mobile", "Exports développeur"]
      },
      medium: {
        title: "Design Complet",
        price: "5 000€ - 15 000€",
        features: ["20-30 écrans", "Recherche UX", "Prototype interactif", "Design system light", "Tests utilisateurs", "Documentation"]
      },
      large: {
        title: "Design System",
        price: "15 000€+",
        features: ["Design system complet", "Bibliothèque composants", "Guidelines détaillées", "Multiple plateformes", "Formation équipe"]
      }
    },
    faqs: [
      {
        question: "Quelle est la différence entre UX et UI ?",
        answer: "L'UX (User Experience) concerne l'expérience globale : facilité d'utilisation, parcours utilisateur, architecture de l'information. L'UI (User Interface) est la couche visuelle : couleurs, typographie, boutons, layouts. Les deux sont complémentaires pour créer un produit réussi."
      },
      {
        question: "Livrez-vous un design system réutilisable ?",
        answer: "Oui, nous créons un design system dans Figma avec tous les composants réutilisables (boutons, inputs, cards, etc.), les variants et états, et la documentation associée. Cela accélère grandement le développement et assure la cohérence."
      },
      {
        question: "Faites-vous des tests utilisateurs ?",
        answer: "Oui, nous recommandons toujours des tests utilisateurs, au moins sur les wireframes et le prototype final. Nous pouvons recruter des testeurs ou utiliser votre panel utilisateurs. C'est le meilleur moyen de valider les choix UX."
      },
      {
        question: "Le design sera-t-il prêt pour le développement ?",
        answer: "Absolument. Nous exportons tous les assets nécessaires, créons une documentation claire avec les spacings, couleurs, et typographies, et restons disponibles pendant le développement pour assurer une implémentation fidèle."
      }
    ]
  }
} as const

interface ServiceDetailProps {
  slug: string
}

export function ServiceDetail({ slug }: ServiceDetailProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const { openDialog } = useContact()

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
            <img
              src="/nimli-logo.svg"
              alt="Nimli"
              className="h-12 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            {service.image && (
              <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-8">
                <img
                  src={getImagePath(service.image)}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="text-center">
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
                <Button size="lg" variant="outline" onClick={openDialog}>
                  Nous contacter
                </Button>
              </div>
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
              <Button size="lg" variant="outline" onClick={openDialog}>
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
