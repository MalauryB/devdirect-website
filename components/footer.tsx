import { Code2, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold" style={{ color: "#bda3cc" }}>
                DevDirect
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Votre équipe de développeurs expérimentés pour tous vos projets digitaux. Sans intermédiaires, à prix
              justes.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contact@devdirect.fr</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-medium mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Applications Web
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Applications Mobiles
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  IoT & Intégrations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  UX/UI Design
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-medium mb-4">Entreprise</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Notre équipe
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Processus
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DevDirect. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
