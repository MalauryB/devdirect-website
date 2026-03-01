"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { MessageAttachment } from "@/lib/types"
import { uploadFile, validateFile } from "@/lib/storage"
import { Loader2, Send, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react"

interface MessageInputProps {
  projectId: string
  onSend: (message: string, attachment: MessageAttachment | null) => Promise<void>
  disabled?: boolean
  error?: string
}

export function MessageInput({ projectId, onSend, disabled, error }: MessageInputProps) {
  const { t } = useLanguage()
  const [newMessage, setNewMessage] = useState("")
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [localError, setLocalError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayError = error || localError

  const isImage = (type: string) => type.startsWith('image/')

  const handleSend = async () => {
    if (!newMessage.trim() && !attachment) return

    setSending(true)
    setLocalError("")

    await onSend(newMessage.trim(), attachment)

    setNewMessage("")
    setAttachment(null)
    setSending(false)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file, 'all')
    if (!validation.valid) {
      setLocalError(validation.error || 'Fichier invalide')
      return
    }

    setUploading(true)
    setLocalError("")

    const { data, error: uploadError } = await uploadFile(file, 'messages', projectId)

    if (uploadError) {
      setLocalError(t('messages.uploadError'))
    } else if (data) {
      setAttachment({
        url: data.url,
        path: data.path,
        name: file.name,
        type: file.type,
        size: file.size
      })
    }

    setUploading(false)
    if (e.target) e.target.value = ''
  }

  const removeAttachment = () => {
    setAttachment(null)
  }

  return (
    <div className="border-t border-border p-4">
      {displayError && (
        <p className="text-sm text-red-600 mb-2">{displayError}</p>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-lg">
          {isImage(attachment.type) ? (
            <ImageIcon className="w-4 h-4 text-foreground/50" />
          ) : (
            <FileText className="w-4 h-4 text-foreground/50" />
          )}
          <span className="text-sm text-foreground/70 truncate flex-1">{attachment.name}</span>
          <button
            onClick={removeAttachment}
            className="p-1 hover:bg-muted rounded"
            aria-label="Retirer la piece jointe"
          >
            <X className="w-4 h-4 text-foreground/50" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || sending || disabled}
          className="shrink-0"
          aria-label="Joindre un fichier"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </Button>

        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t('messages.placeholder')}
          className="resize-none min-h-[44px] max-h-32"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />

        <Button
          onClick={handleSend}
          disabled={sending || disabled || (!newMessage.trim() && !attachment)}
          className="shrink-0 bg-primary hover:bg-primary/90"
          aria-label="Envoyer le message"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
