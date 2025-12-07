"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { Message, Profile, MessageAttachment } from "@/lib/types"
import {
  getProjectMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToProjectMessages
} from "@/lib/messages"
import { uploadFile, validateFile } from "@/lib/storage"
import { Loader2, Send, Paperclip, X, FileText, Image as ImageIcon, Download } from "lucide-react"

interface MessageThreadProps {
  projectId: string
  currentUser: {
    id: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    role?: string
  }
  otherParty?: Profile | null
}

export function MessageThread({ projectId, currentUser, otherParty }: MessageThreadProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      const { messages: loadedMessages } = await getProjectMessages(projectId)
      setMessages(loadedMessages)
      setLoading(false)

      // Mark messages as read
      await markMessagesAsRead(projectId, currentUser.id)
    }

    loadMessages()
  }, [projectId, currentUser.id])

  // Subscribe to new messages
  useEffect(() => {
    const subscription = subscribeToProjectMessages(projectId, (newMsg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })

      // Mark as read if not from current user
      if (newMsg.sender_id !== currentUser.id) {
        markMessagesAsRead(projectId, currentUser.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [projectId, currentUser.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() && !attachment) return

    setSending(true)
    setError("")

    const { message, error: sendError } = await sendMessage(
      projectId,
      currentUser.id,
      newMessage.trim(),
      attachment
    )

    if (sendError) {
      setError(t('messages.sendError'))
    } else if (message) {
      // Add to local state (subscription will also add it, but we want immediate feedback)
      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev
        return [...prev, message]
      })
      setNewMessage("")
      setAttachment(null)
    }

    setSending(false)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file, 'all')
    if (!validation.valid) {
      setError(validation.error || 'Fichier invalide')
      return
    }

    setUploading(true)
    setError("")

    const { data, error: uploadError } = await uploadFile(file, 'messages', projectId)

    if (uploadError) {
      setError(t('messages.uploadError'))
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier"
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }

  const getSenderName = (message: Message) => {
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

  const getSenderAvatar = (message: Message) => {
    if (message.sender_id === currentUser.id) {
      return currentUser.avatar_url
    }
    return message.sender?.avatar_url || otherParty?.avatar_url
  }

  const getSenderInitial = (message: Message) => {
    if (message.sender_id === currentUser.id) {
      return (currentUser.first_name?.[0] || 'M').toUpperCase()
    }
    if (message.sender) {
      return (message.sender.first_name?.[0] || message.sender.company_name?.[0] || 'U').toUpperCase()
    }
    return (otherParty?.first_name?.[0] || otherParty?.company_name?.[0] || 'C').toUpperCase()
  }

  const isImage = (type: string) => type.startsWith('image/')

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentDate = ''
  for (const msg of messages) {
    const msgDate = new Date(msg.created_at).toDateString()
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groupedMessages.push({ date: msg.created_at, messages: [msg] })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/50">{t('messages.noMessages')}</p>
            <p className="text-sm text-foreground/30 mt-1">{t('messages.startConversation')}</p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date separator */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-foreground/40 font-medium">
                  {formatDate(group.date)}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Messages for this date */}
              {group.messages.map((message) => {
                const isOwn = message.sender_id === currentUser.id

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8c4c4] to-[#c48b8b] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {getSenderAvatar(message) ? (
                        <img
                          src={getSenderAvatar(message)}
                          alt={getSenderName(message)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {getSenderInitial(message)}
                        </span>
                      )}
                    </div>

                    {/* Message content */}
                    <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium text-foreground/70 ${isOwn ? 'order-2' : ''}`}>
                          {getSenderName(message)}
                        </span>
                        <span className={`text-xs text-foreground/40 ${isOwn ? 'order-1' : ''}`}>
                          {formatTime(message.created_at)}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-[rgb(239,239,239)] text-foreground rounded-tr-sm'
                            : 'bg-gray-100 text-foreground rounded-tl-sm'
                        }`}
                      >
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}

                        {/* Attachment */}
                        {message.attachment && (
                          <div className={`mt-2 ${message.content ? 'pt-2 border-t border-gray-300' : ''}`}>
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
                                  isOwn ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'
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
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        {error && (
          <p className="text-sm text-red-600 mb-2">{error}</p>
        )}

        {/* Attachment preview */}
        {attachment && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg">
            {isImage(attachment.type) ? (
              <ImageIcon className="w-4 h-4 text-foreground/50" />
            ) : (
              <FileText className="w-4 h-4 text-foreground/50" />
            )}
            <span className="text-sm text-foreground/70 truncate flex-1">{attachment.name}</span>
            <button
              onClick={removeAttachment}
              className="p-1 hover:bg-gray-200 rounded"
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
            disabled={uploading || sending}
            className="shrink-0"
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
            disabled={sending || (!newMessage.trim() && !attachment)}
            className="shrink-0 bg-gray-900 hover:bg-gray-800"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
