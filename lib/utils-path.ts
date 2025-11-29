export function getPath(path: string) {
  return path
}

export function getImagePath(imagePath: string) {
  // Remove /devdirect-website prefix if present
  if (imagePath.startsWith('/devdirect-website')) {
    return imagePath.replace('/devdirect-website', '')
  }
  return imagePath
}
