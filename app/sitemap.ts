import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://nimli.fr', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://nimli.fr/devis', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://nimli.fr/services/developpement-web', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nimli.fr/services/developpement-mobile', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nimli.fr/services/intelligence-artificielle', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nimli.fr/services/iot-embarque', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://nimli.fr/services/design-maquettes', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
