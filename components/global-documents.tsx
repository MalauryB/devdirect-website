"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/language-context"
import {
  GlobalDocument,
  GlobalDocumentType,
  globalDocumentTypeLabels,
  getGlobalDocuments,
  uploadGlobalDocument,
  deleteGlobalDocument,
  updateGlobalDocument,
  getGlobalDocumentDownloadUrl,
  uploadGlobalDocumentVersion,
  getGlobalDocumentCategories
} from "@/lib/global-documents"
import { getFileIcon, formatFileSize } from "@/lib/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Upload,
  Download,
  Trash2,
  MoreHorizontal,
  FileText,
  Loader2,
  Search,
  Filter,
  Plus,
  Edit,
  RefreshCw,
  FolderOpen
} from "lucide-react"

export function GlobalDocuments() {
  const { t, language } = useLanguage()
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
      const { documents: docs, error } = await getGlobalDocuments()
      if (error) {
        console.error('Error loading global documents:', error)
      }
      setDocuments(docs)
    } catch (err) {
      console.error('Exception loading global documents:', err)
    }
    setLoading(false)
  }

  async function loadCategories() {
    try {
      const { categories: cats, error } = await getGlobalDocumentCategories()
      if (error) {
        console.error('Error loading categories:', error)
      }
      setCategories(cats)
    } catch (err) {
      console.error('Exception loading categories:', err)
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

  const documentTypes: GlobalDocumentType[] = [
    'template_ppt',
    'template_word',
    'template_excel',
    'email_signature',
    'branding',
    'process',
    'other'
  ]

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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('globalDocuments.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type filter */}
          <Select value={filterType} onValueChange={(v) => setFilterType(v as GlobalDocumentType | "all")}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('globalDocuments.filterByType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('globalDocuments.allTypes')}</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {globalDocumentTypeLabels[type][language]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category filter */}
          {categories.length > 0 && (
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <FolderOpen className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('globalDocuments.filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('globalDocuments.allCategories')}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Upload button */}
        <Button onClick={() => setUploadDialogOpen(true)} className="bg-[#ea4c89] hover:bg-[#ea4c89]/90">
          <Plus className="w-4 h-4 mr-2" />
          {t('globalDocuments.upload')}
        </Button>
      </div>

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
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t('globalDocuments.noDocuments')}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {t('globalDocuments.noDocumentsDescription')}
          </p>
          <Button onClick={() => setUploadDialogOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            {t('globalDocuments.uploadFirst')}
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t('globalDocuments.name')}</TableHead>
                <TableHead>{t('globalDocuments.type')}</TableHead>
                <TableHead>{t('globalDocuments.category')}</TableHead>
                <TableHead>{t('globalDocuments.size')}</TableHead>
                <TableHead>{t('globalDocuments.version')}</TableHead>
                <TableHead>{t('globalDocuments.uploadedBy')}</TableHead>
                <TableHead>{t('globalDocuments.date')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{doc.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground/70">
                      {globalDocumentTypeLabels[doc.type][language]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {doc.category ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {doc.category}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFileSize(doc.file_size)}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">v{doc.version}</span>
                  </TableCell>
                  <TableCell>
                    {doc.uploader ? (
                      <span className="text-sm">
                        {doc.uploader.first_name} {doc.uploader.last_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(doc.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-50">
                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                          <Download className="w-4 h-4 mr-2" />
                          {t('globalDocuments.download')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUploadVersion(doc)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {t('globalDocuments.uploadVersion')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(doc)}>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('globalDocuments.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(doc)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('globalDocuments.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('globalDocuments.uploadTitle')}</DialogTitle>
            <DialogDescription>{t('globalDocuments.uploadDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#ea4c89] transition-colors"
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{getFileIcon(selectedFile.type)}</span>
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t('globalDocuments.dropOrClick')}</p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label>{t('globalDocuments.documentName')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('globalDocuments.namePlaceholder')}
                />
              </div>

              <div>
                <Label>{t('globalDocuments.description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('globalDocuments.descriptionPlaceholder')}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t('globalDocuments.type')}</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as GlobalDocumentType }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {globalDocumentTypeLabels[type][language]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('globalDocuments.category')}</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder={t('globalDocuments.categoryPlaceholder')}
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !formData.name || uploading}
              className="bg-[#ea4c89] hover:bg-[#ea4c89]/90"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {t('globalDocuments.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('globalDocuments.editTitle')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t('globalDocuments.documentName')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>{t('globalDocuments.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('globalDocuments.type')}</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as GlobalDocumentType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {globalDocumentTypeLabels[type][language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('globalDocuments.category')}</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  list="categories-edit"
                />
                <datalist id="categories-edit">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name || uploading}
              className="bg-[#ea4c89] hover:bg-[#ea4c89]/90"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('globalDocuments.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('globalDocuments.deleteDescription')}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={uploading}
              variant="destructive"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('globalDocuments.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
