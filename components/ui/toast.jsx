import * as React from "react"
import { cn } from "../../lib/utils"
import { X, CheckCircle, XCircle } from "lucide-react"

const ToastContext = React.createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback((message, type = "success") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function Toast({ toast, onClose }) {
  const isSuccess = toast.type === "success"

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[400px] animate-in slide-in-from-top-full",
        isSuccess
          ? "bg-green-900/90 border border-green-700 text-green-100"
          : "bg-red-900/90 border border-red-700 text-red-100"
      )}
    >
      {isSuccess ? (
        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
      )}
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export { Toast }
