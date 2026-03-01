import type { Profile } from './profile'

// Types de documents de projet
export type ProjectDocumentType =
  | 'signed_quote'      // Devis signe
  | 'contract'          // Contrat
  | 'invoice'           // Facture
  | 'kickoff'           // Kick-off
  | 'steering_committee' // Comite de suivi
  | 'documentation'     // Documentation technique
  | 'specification'     // Cahier des charges
  | 'planning'          // Planning previsionnel
  | 'mockup'            // Maquette
  | 'deliverable'       // Livrable
  | 'other'             // Autre

export interface ProjectDocument {
  id: string
  project_id: string
  uploaded_by: string
  name: string
  description: string | null
  type: ProjectDocumentType
  file_path: string
  file_name: string
  file_size: number
  file_type: string // MIME type
  // Versioning
  version: number
  parent_id: string | null // ID du document original (null si c'est la v1)
  is_latest: boolean // true si c'est la derniere version
  created_at: string
  updated_at: string
  // Relations (joined)
  uploader?: Profile
  // Versions liees (pour affichage)
  versions?: ProjectDocument[]
}
