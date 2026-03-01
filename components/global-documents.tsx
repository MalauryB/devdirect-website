"use client"

import { useState, useEffect, useRef } from "react"
import {
  GlobalDocument,
  GlobalDocumentType,
  getGlobalDocuments,
  uploadGlobalDocument,
  deleteGlobalDocument,
  updateGlobalDocument,
  getGlobalDocumentDownloadUrl,
  uploadGlobalDocumentVersion,
  getGlobalDocumentCategories
} from "@/lib/global-documents"
import { Loader2 } from "lucide-react"
import { DocumentFilters } from "@/components/global-documents/document-filters"
import { DocumentTable } from "@/components/global-documents/document-table"
import { DocumentUploadDialog } from "@/components/global-documents/document-upload-dialog"
import { DocumentEditDialog } from "@/components/global-documents/document-edit-dialog"
import { DocumentDeleteDialog } from "@/components/global-documents/document-delete-dialog"

export function GlobalDocuments() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const versionFileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [documents, setDocuments] = useState<GlobalDocument[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<GlobalDocumentType | "all">("all")
  const [filterCategory, setFilterCategory] = useState<string | "all">("all")

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<GlobalDocument | null>(null)
  const [versionDocumentId, setVersionDocumentId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "other" as GlobalDocumentType,
    category: ""
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Load documents
  useEffect(() => {
    loadDocuments()
    loadCategories()
  }, [])

  async function loadDocuments() {
    setLoading(true)
    try {
      const { documents: docs } = await getGlobalDocuments()
      setDocuments(docs)
    } catch {
      // Error handled by state
    }
    setLoading(false)
  }

  async function loadCategories() {
    try {
      const { categories: cats } = await getGlobalDocumentCategories()
      setCategories(cats)
    } catch {
      // Error handled by state
    }
  }

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || doc.type === filterType
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  // Handle file selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, "") }))
      }
    }
  }

  // Handle version file selection
  async function handleVersionFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && versionDocumentId) {
      setUploading(true)
      const { error } = await uploadGlobalDocumentVersion(versionDocumentId, file)
      if (!error) {
        loadDocuments()
      }
      setUploading(false)
      setVersionDocumentId(null)
    }
  }

  // Upload document
  async function handleUpload() {
    if (!selectedFile) return

    setUploading(true)
    const { error } = await uploadGlobalDocument(selectedFile, {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      category: formData.category || undefined
    })

    if (!error) {
      setUploadDialogOpen(false)
      setSelectedFile(null)
      setFormData({ name: "", description: "", type: "other", category: "" })
      loadDocuments()
      loadCategories()
    }
    setUploading(false)
  }

  // Update document
  async function handleUpdate() {
    if (!selectedDocument) return

    setUploading(true)
    const { error } = await updateGlobalDocument(selectedDocument.id, {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      category: formData.category || undefined
    })

    if (!error) {
      setEditDialogOpen(false)
      setSelectedDocument(null)
      loadDocuments()
      loadCategories()
    }
    setUploading(false)
  }

  // Delete document
  async function handleDelete() {
    if (!selectedDocument) return

    setUploading(true)
    const { error } = await deleteGlobalDocument(selectedDocument.id)

    if (!error) {
      setDeleteDialogOpen(false)
      setSelectedDocument(null)
      loadDocuments()
    }
    setUploading(false)
  }

  // Download document
  async function handleDownload(doc: GlobalDocument) {
    const { url, error } = await getGlobalDocumentDownloadUrl(doc.file_path)
    if (url && !error) {
      const link = document.createElement('a')
      link.href = url
      link.download = doc.file_name
      link.click()
    }
  }

  // Open edit dialog
  function openEditDialog(doc: GlobalDocument) {
    setSelectedDocument(doc)
    setFormData({
      name: doc.name,
      description: doc.description || "",
      type: doc.type,
      category: doc.category || ""
    })
    setEditDialogOpen(true)
  }

  // Open delete dialog
  function openDeleteDialog(doc: GlobalDocument) {
    setSelectedDocument(doc)
    setDeleteDialogOpen(true)
  }

  // Upload new version
  function handleUploadVersion(doc: GlobalDocument) {
    setVersionDocumentId(doc.id)
    versionFileInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#ea4c89]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <DocumentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        categories={categories}
        onUploadClick={() => setUploadDialogOpen(true)}
      />

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        type="file"
        ref={versionFileInputRef}
        className="hidden"
        onChange={handleVersionFileSelect}
      />

      {/* Documents table */}
      <DocumentTable
        documents={filteredDocuments}
        onDownload={handleDownload}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onUploadVersion={handleUploadVersion}
        onUploadClick={() => setUploadDialogOpen(true)}
      />

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        selectedFile={selectedFile}
        onFileClick={() => fileInputRef.current?.click()}
        onSubmit={handleUpload}
        uploading={uploading}
        categories={categories}
      />

      {/* Edit Dialog */}
      <DocumentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleUpdate}
        uploading={uploading}
        categories={categories}
      />

      {/* Delete Dialog */}
      <DocumentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        uploading={uploading}
      />
    </div>
  )
}
