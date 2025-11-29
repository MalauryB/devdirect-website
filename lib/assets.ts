/**
 * Utility functions for handling asset paths
 */

/**
 * Get the correct asset path
 * @param path - Asset path relative to public directory
 * @returns Full path with leading slash
 */
export function getAssetPath(path: string): string {
  // Remove /devdirect-website prefix if present
  if (path.startsWith('/devdirect-website')) {
    path = path.replace('/devdirect-website', '')
  }

  // Ensure leading slash
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Get image path with fallback to placeholder
 * @param imagePath - Original image path
 * @param fallback - Fallback image path (default: placeholder.svg)
 * @returns Asset path
 */
export function getImagePath(imagePath?: string, fallback: string = 'placeholder.svg'): string {
  return getAssetPath(imagePath || fallback)
}
