"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Message, Profile } from "@/lib/types"
import { MessageItem } from "./message-item"

interface MessageListProps {
  messages: Message[]
  currentUser: {
    id: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    role?: string
  }
  otherParty?: Profile | null
  onEditMessage: (messageId: string, newContent: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
}

export function MessageList({ messages, currentUser, otherParty, onEditMessage, onDeleteMessage }: MessageListProps) {
  const { t } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

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

  // Scroll to bottom helper function
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Use multiple scroll attempts to ensure we reach the bottom
      const scrollSequence = () => {
        scrollToBottom(isInitialLoad ? "instant" : "smooth")
      }

      // Immediate scroll
      scrollSequence()

      // Scroll again after a short delay to handle layout shifts
      const timer1 = setTimeout(scrollSequence, 50)

      // And one more time for good measure (handles images, etc.)
      const timer2 = setTimeout(scrollSequence, 200)

      if (isInitialLoad) {
        // Final scroll after longer delay for any async content
        const timer3 = setTimeout(() => {
          scrollToBottom("instant")
          setIsInitialLoad(false)
        }, 400)

        return () => {
          clearTimeout(timer1)
          clearTimeout(timer2)
          clearTimeout(timer3)
        }
      }

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [messages, isInitialLoad])

  // Reset initial load state when the message list is first populated
  // (e.g., when switching projects)
  useEffect(() => {
    setIsInitialLoad(true)
  }, [currentUser.id])

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

  return (
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
              <div className="flex-1 h-px bg-muted" />
              <span className="text-xs text-foreground/40 font-medium">
                {formatDate(group.date)}
              </span>
              <div className="flex-1 h-px bg-muted" />
            </div>

            {/* Messages for this date */}
            {group.messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUser.id}
                currentUser={currentUser}
                otherParty={otherParty}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
              />
            ))}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
