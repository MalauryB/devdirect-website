export function getBasePath() {
  return process.env.NODE_ENV === 'production' ? '/devdirect-website' : ''
}

export function getPath(path: string) {
  const basePath = getBasePath()
  return `${basePath}${path}`
}

export function getImagePath(imagePath: string) {
  // Si le chemin contient déjà le basePath en production, on le retourne tel quel
  if (process.env.NODE_ENV === 'production' && imagePath.startsWith('/devdirect-website')) {
    return imagePath
  }

  // En local, on enlève le basePath s'il existe
  if (process.env.NODE_ENV !== 'production' && imagePath.startsWith('/devdirect-website')) {
    return imagePath.replace('/devdirect-website', '')
  }

  // Sinon on applique le basePath si nécessaire
  const basePath = getBasePath()
  return `${basePath}${imagePath}`
}
