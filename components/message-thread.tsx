"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Message, Profile, MessageAttachment } from "@/lib/types"
import {
  getProjectMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToProjectMessages,
  updateMessage,
  softDeleteMessage,
  hardDeleteMessage
} from "@/lib/messages"
import { getSignedUrl } from "@/lib/storage"
import { Loader2 } from "lucide-react"
import { MessageList } from "@/components/messages/message-list"
import { MessageInput } from "@/components/messages/message-input"

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
  const [error, setError] = useState("")
  const isEngineer = currentUser.role === 'engineer'

  // Load messages and refresh signed URLs for attachments
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      const { messages: loadedMessages } = await getProjectMessages(projectId)

      // Refresh signed URLs for messages with attachments
      const messagesWithRefreshedUrls = await Promise.all(
        loadedMessages.map(async (msg) => {
          if (msg.attachment?.path) {
            const { url } = await getSignedUrl('messages', msg.attachment.path)
            if (url) {
              return {
                ...msg,
                attachment: { ...msg.attachment, url }
              }
            }
          }
          return msg
        })
      )

      setMessages(messagesWithRefreshedUrls)
      setLoading(false)

      // Mark messages as read
      await markMessagesAsRead(projectId, currentUser.id)
    }

    loadMessages()
  }, [projectId, currentUser.id])

  // Subscribe to new messages
  useEffect(() => {
    const subscription = subscribeToProjectMessages(projectId, async (newMsg) => {
      // Refresh signed URL if message has attachment
      let messageToAdd = newMsg
      if (newMsg.attachment?.path) {
        const { url } = await getSignedUrl('messages', newMsg.attachment.path)
        if (url) {
          messageToAdd = {
            ...newMsg,
            attachment: { ...newMsg.attachment, url }
          }
        }
      }

      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === messageToAdd.id)) return prev
        return [...prev, messageToAdd]
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

  const handleSend = async (content: string, attachment: MessageAttachment | null) => {
    setError("")

    const { message, error: sendError } = await sendMessage(
      projectId,
      currentUser.id,
      content,
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
    }
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const { message: updatedMessage, error: updateError } = await updateMessage(messageId, newContent)
    if (!updateError && updatedMessage) {
      setMessages(prev => prev.map(m => m.id === messageId ? updatedMessage : m))
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (isEngineer) {
      // Engineer can hard delete
      const { error: deleteError } = await hardDeleteMessage(messageId)
      if (!deleteError) {
        setMessages(prev => prev.filter(m => m.id !== messageId))
      }
    } else {
      // Client can only soft delete
      const { error: deleteError } = await softDeleteMessage(messageId)
      if (!deleteError) {
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, is_deleted: true, deleted_at: new Date().toISOString() } : m
        ))
      }
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
      <MessageList
        messages={messages}
        currentUser={currentUser}
        otherParty={otherParty}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
      />
      <MessageInput
        projectId={projectId}
        onSend={handleSend}
        error={error}
      />
    </div>
  )
}
