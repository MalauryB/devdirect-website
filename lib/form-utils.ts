/**
 * Shared form utility functions for toggling items in arrays.
 * Used by project-form, project-form-wizard, and devis page.
 */

/**
 * Toggle an item in an array: remove if present, add if absent.
 */
export function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item)
    ? array.filter(i => i !== item)
    : [...array, item]
}

/**
 * Create a form state updater that toggles an item in an array field.
 * Works with React setState pattern for form data objects.
 *
 * Usage:
 *   const handleProjectTypeToggle = createArrayToggleHandler(setFormData, 'project_types')
 *   handleProjectTypeToggle('web')
 */
export function createArrayToggleHandler<T>(
  setFormData: (updater: (prev: T) => T) => void,
  field: keyof T
) {
  return (item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: toggleArrayItem(prev[field] as string[], item),
    }))
  }
}
