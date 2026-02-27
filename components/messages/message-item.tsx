"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { Message, Profile } from "@/lib/types"
import { FileText, Download, MoreVertical, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MessageItemProps {
  message: Message
  isOwn: boolean
  currentUser: {
    id: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    role?: string
  }
  otherParty?: Profile | null
  onEdit: (messageId: string, newContent: string) => Promise<void>
  onDelete: (messageId: string) => Promise<void>
}

export function MessageItem({ message, isOwn, currentUser, otherParty, onEdit, onDelete }: MessageItemProps) {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  const isDeleted = message.is_deleted

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditContent(message.content)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent("")
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return
    await onEdit(message.id, editContent.trim())
    setIsEditing(false)
    setEditContent("")
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const getSenderName = () => {
    if (message.sender_id === currentUser.id) {
      return "Vous"
    }
    if (message.sender) {
      const name = `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim()
      return name || message.sender.company_name || 'Utilisateur'
    }
    return otherParty
      ? `${otherParty.first_name || ''} ${otherParty.last_name || ''}`.trim() || otherParty.company_name || 'Client'
      : 'Utilisateur'
  }

  const getSenderAvatar = () => {
    if (message.sender_id === currentUser.id) {
      return currentUser.avatar_url
    }
    return message.sender?.avatar_url || otherParty?.avatar_url
  }

  const getSenderInitial = () => {
    if (message.sender_id === currentUser.id) {
      return (currentUser.first_name?.[0] || 'M').toUpperCase()
    }
    if (message.sender) {
      return (message.sender.first_name?.[0] || message.sender.company_name?.[0] || 'U').toUpperCase()
    }
    return (otherParty?.first_name?.[0] || otherParty?.company_name?.[0] || 'C').toUpperCase()
  }

  const isImage = (type: string) => type.startsWith('image/')

  const avatarUrl = getSenderAvatar()
  const senderName = getSenderName()
  const senderInitial = getSenderInitial()

  return (
    <div
      className={`flex gap-3 mb-4 group ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={senderName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-white">
            {senderInitial}
          </span>
        )}
      </div>

      {/* Message content */}
      <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium text-foreground/70 ${isOwn ? 'order-2' : ''}`}>
            {senderName}
          </span>
          <span className={`text-xs text-foreground/40 ${isOwn ? 'order-1' : ''}`}>
            {formatTime(message.created_at)}
          </span>
          {/* Actions menu - only for own messages */}
          {isOwn && !isDeleted && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded ${isOwn ? 'order-0' : 'order-3'}`}>
                  <MoreVertical className="w-3 h-3 text-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                <DropdownMenuItem onClick={handleStartEdit}>
                  <Pencil className="w-3 h-3 mr-2" />
                  {t('messages.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(message.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  {t('messages.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-2 ${
            isDeleted
              ? 'bg-muted text-foreground/40'
              : isOwn
                ? 'bg-[rgb(239,239,239)] text-foreground rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm'
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  {t('common.cancel')}
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          ) : isDeleted ? (
            <p className="text-sm italic line-through">{message.content}</p>
          ) : message.content ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : null}

          {/* Attachment */}
          {message.attachment && (
            <div className={`mt-2 ${message.content ? 'pt-2 border-t border-border' : ''}`}>
              {isImage(message.attachment.type) ? (
                <a
                  href={message.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={message.attachment.url}
                    alt={message.attachment.name}
                    className="max-w-full rounded-lg max-h-48 object-cover"
                  />
                </a>
              ) : (
                <a
                  href={message.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    isOwn ? 'bg-muted hover:bg-muted' : 'bg-muted hover:bg-muted'
                  } transition-colors`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-xs truncate flex-1">{message.attachment.name}</span>
                  <Download className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
