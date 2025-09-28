/**
 * Utility functions for handling asset paths with basePath support
 */

const basePath = process.env.NODE_ENV === 'production' ? '/memory-website' : ''

/**
 * Get the correct asset path considering the basePath configuration
 * @param path - Asset path relative to public directory or assets directory
 * @returns Full path with basePath prefix if needed
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // In development, return path with leading slash for public folder
  // In production, return path with basePath
  if (basePath) {
    return `${basePath}/${cleanPath}`
  } else {
    return `/${cleanPath}`
  }
}

/**
 * Get image path with fallback to placeholder
 * @param imagePath - Original image path
 * @param fallback - Fallback image path (default: placeholder.svg)
 * @returns Asset path with basePath
 */
export function getImagePath(imagePath?: string, fallback: string = 'placeholder.svg'): string {
  return getAssetPath(imagePath || fallback)
}