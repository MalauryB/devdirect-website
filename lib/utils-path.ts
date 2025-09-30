export function getBasePath() {
  return process.env.NODE_ENV === 'production' ? '/devdirect-website' : ''
}

export function getPath(path: string) {
  const basePath = getBasePath()
  return `${basePath}${path}`
}
