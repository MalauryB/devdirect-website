import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Smartphone, Cpu, Palette, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Globe,
    title: "Applications Web",
    description:
      "Sites vitrine, plateformes SaaS, e-commerce. Technologies modernes et performantes pour tous vos besoins digitaux.",
    image: "/modern-web-dev-workspace.png",
  },
  {
    icon: Smartphone,
    title: "Applications Mobiles",
    description: "Applications natives et cross-platform pour iOS et Android avec une expérience utilisateur optimale.",
    image: "assets/images/projects/project-3.png",
  },
  {
    icon: Cpu,
    title: "IoT & Intégrations",
    description: "Objets connectés, automatisation et intégrations système pour moderniser vos processus.",
    image: "/iot-devices-and-sensors-connected.jpg",
  },
  {
    icon: Palette,
    title: "UX/UI Design",
    description: "Conception d'interfaces utilisateur modernes, intuitives et centrées sur l'expérience utilisateur.",
    image: "/ui-ux-design-mockups-and-wireframes.jpg",
  },
]

export function Services() {
  return (
    <section id="services" className="py-20 px-4 relative overflow-hidden bg-[#141414] rounded-3xl">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
              Nos <span className="text-[#ba9fdf]">Services</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl">
              De l'idée à la réalisation, nous maîtrisons toutes les technologies pour donner vie à vos projets digitaux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="bg-white border-0 rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 rounded-t-2xl overflow-hidden">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-[#38392c] mb-2">{service.title}</CardTitle>
                <CardDescription className="text-[#7f7074] leading-relaxed text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  className="text-[#38392c] hover:text-[#ba9fdf] hover:bg-[#ba9fdf]/10 p-0 h-auto font-medium group/btn"
                >
                  More details
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
