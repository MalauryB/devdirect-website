"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, Clock, ExternalLink, Globe, Smartphone, Brain, Vote, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

type ProjectStatus = "completed" | "in_progress"

interface Project {
  id: string
  titleKey: string
  descriptionKey: string
  status: ProjectStatus
  tags: string[]
  icon: React.ReactNode
  images?: string[]
  url?: string
}

const projects: Project[] = [
  {
    id: "quiserapresident",
    titleKey: "portfolio.projects.quiserapresident.title",
    descriptionKey: "portfolio.projects.quiserapresident.description",
    status: "completed",
    tags: ["Next.js", "TypeScript", "Modele mathematique"],
    icon: <Vote className="w-5 h-5" />,
    images: [
      "/projects/quiserapresident-1.png",
      "/projects/quiserapresident-2.png",
      "/projects/quiserapresident-3.png",
    ],
    url: "https://www.quiserapresident.fr/",
  },
]

export default function ProjetsPage() {
  const { t } = useLanguage()

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("portfolio.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("portfolio.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} t={t} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground italic">
            {t("portfolio.comingSoon")}
          </p>
        </div>
      </div>
    </section>
  )
}

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <div className="relative w-full aspect-[16/9] bg-muted">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full h-full">
        <CarouselContent className="h-full -ml-0">
          {images.map((src, i) => (
            <CarouselItem key={i} className="pl-0 h-full">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={src}
                  alt={`${alt} - ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation arrows */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); api?.scrollPrev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
              aria-label="Image precedente"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); api?.scrollNext() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </>
        )}
      </Carousel>

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); api?.scrollTo(i) }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? "bg-white w-3" : "bg-white/50"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project, t }: { project: Project; t: (key: string) => string }) {
  const isCompleted = project.status === "completed"

  const card = (
    <div
      className={`group relative bg-white border border-border rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 ${
        isCompleted
          ? "hover:shadow-lg hover:border-primary/30 cursor-pointer"
          : "opacity-90"
      }`}
    >
      {/* Images */}
      {project.images && project.images.length > 0 ? (
        <ImageCarousel images={project.images} alt={t(project.titleKey)} />
      ) : (
        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            {project.icon}
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        {/* Status badge + icon */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              isCompleted
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isCompleted ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {t("portfolio.status.completed")}
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                {t("portfolio.status.inProgress")}
              </>
            )}
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {project.icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t(project.titleKey)}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 flex-grow">
          {t(project.descriptionKey)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Link indicator */}
        {isCompleted && project.url && (
          <div className="flex items-center gap-1.5 text-primary text-sm font-medium pt-3 border-t border-border">
            <ExternalLink className="w-3.5 h-3.5" />
            {t("portfolio.viewProject")}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </div>
  )

  if (isCompleted && project.url) {
    return (
      <a href={project.url} target="_blank" rel="noopener noreferrer">
        {card}
      </a>
    )
  }

  return card
}
