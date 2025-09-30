"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface ContactContextType {
  isOpen: boolean
  openDialog: () => void
  closeDialog: () => void
}

const ContactContext = createContext<ContactContextType | undefined>(undefined)

export function ContactProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openDialog = () => setIsOpen(true)
  const closeDialog = () => setIsOpen(false)

  return (
    <ContactContext.Provider value={{ isOpen, openDialog, closeDialog }}>
      {children}
    </ContactContext.Provider>
  )
}

export function useContact() {
  const context = useContext(ContactContext)
  if (context === undefined) {
    throw new Error('useContact must be used within a ContactProvider')
  }
  return context
}
