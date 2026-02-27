"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { QuoteFormData } from "@/lib/types"
import { X, Send, Loader2, Sparkles, Bot, User, PanelRightOpen } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface QuoteAIAssistantProps {
  quoteData: QuoteFormData
  onQuoteUpdate: (newData: Partial<QuoteFormData>) => void
  projectDescription?: string
  isOpen: boolean
  onToggle: () => void
  onGenerateFullQuote?: () => Promise<void>
  isGenerating?: boolean
}

export function QuoteAIAssistant({ quoteData, onQuoteUpdate, projectDescription, isOpen, onToggle, onGenerateFullQuote, isGenerating }: QuoteAIAssistantProps) {
  const { t } = useLanguage()
  const { session } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: t('quoteAI.welcome'),
        timestamp: new Date()
      }])
    }
  }, [isOpen, messages.length, t])

  const handleSubmit = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/quote-ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          message: userMessage.content,
          quoteData,
          projectDescription,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

      // Apply quote modifications if any
      if (data.modifications) {
        onQuoteUpdate(data.modifications)
      }
    } catch (error) {
      console.error("AI Assistant error:", error)
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: t('quoteAI.error'),
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Handler pour générer un devis complet
  const handleGenerateFullQuote = async () => {
    if (!onGenerateFullQuote) return

    // Ajouter un message utilisateur
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: t('quoteAI.suggestions.generateFull'),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Appeler la fonction de génération
    await onGenerateFullQuote()

    // Ajouter un message de confirmation
    setMessages(prev => [...prev, {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: t('quoteAI.generateFullSuccess'),
      timestamp: new Date()
    }])
  }

  const suggestions = [
    // Ajouter "Génère un devis complet" en premier si disponible
    ...(onGenerateFullQuote ? [t('quoteAI.suggestions.generateFull')] : []),
    t('quoteAI.suggestions.reduceDays'),
    t('quoteAI.suggestions.addTesting'),
    t('quoteAI.suggestions.increaseComplexity'),
    t('quoteAI.suggestions.addMaintenance')
  ]

  // Panneau fixe sur le côté droit de l'écran
  return (
    <div className={`fixed top-0 right-0 h-screen bg-white border-l border-border flex flex-col transition-all duration-300 z-40 ${
      isOpen ? 'w-[380px]' : 'w-0 overflow-hidden'
    }`}>
      {isOpen && (
        <>
          {/* Header */}
          <div className="bg-action text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{t('quoteAI.title')}</h3>
              <p className="text-xs text-white/80 truncate">{t('quoteAI.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onToggle()
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-primary text-white' : 'bg-action/10 text-action'
                }`}>
                  {message.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-action/10 text-action flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (show only when no messages or after welcome) */}
          {messages.length <= 1 && !isGenerating && (
            <div className="px-3 pb-2 flex-shrink-0">
              <p className="text-xs text-foreground/50 mb-1.5">{t('quoteAI.trySaying')}</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((suggestion, index) => {
                  const isGenerateFullSuggestion = onGenerateFullQuote && index === 0
                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        if (isGenerateFullSuggestion) {
                          handleGenerateFullQuote()
                        } else {
                          setInput(suggestion)
                          inputRef.current?.focus()
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                        isGenerateFullSuggestion
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                          : 'bg-muted text-foreground hover:bg-muted'
                      }`}
                    >
                      {isGenerateFullSuggestion && <Sparkles className="w-3 h-3 inline mr-1" />}
                      {suggestion}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Loading state for full quote generation */}
          {isGenerating && (
            <div className="px-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Loader2 className="w-4 h-4 animate-spin text-action" />
                {t('quoteAI.generatingFull')}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('quoteAI.placeholder')}
                className="resize-none min-h-[40px] max-h-[100px] border-border focus:border-action rounded-lg text-sm"
                rows={1}
                disabled={loading}
              />
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() || loading}
                className="bg-action hover:bg-action/90 rounded-lg px-3 h-10"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Bouton toggle exporté séparément pour placement flexible
export function QuoteAIToggleButton({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) {
  const { t } = useLanguage()

  if (isOpen) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      className="flex items-center gap-2 bg-action text-white px-3 py-2 rounded-lg shadow-md hover:bg-action/90 transition-colors"
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-medium">{t('quoteAI.title')}</span>
      <PanelRightOpen className="w-4 h-4" />
    </button>
  )
}
