"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "default" | "success" | "error" | "warning"

interface Toast {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]
  onRemove: (id: string) => void 
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ 
  toast, 
  onRemove 
}: { 
  toast: Toast
  onRemove: (id: string) => void 
}) {
  const variantStyles = {
    default: "bg-white border-gray-200",
    success: "bg-success/10 border-success/20",
    error: "bg-error/10 border-error/20",
    warning: "bg-warning/10 border-warning/20",
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-fade-in",
        variantStyles[toast.variant || "default"]
      )}
    >
      <div className="flex-1">
        {toast.title && (
          <h4 className="text-sm font-semibold text-text-primary mb-1">
            {toast.title}
          </h4>
        )}
        <p className="text-sm text-text-secondary">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
