import { CheckCircle2, XCircle } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error'
  msg: string
}

export function Toast({ type, msg }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${
        type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
      role="alert"
    >
      {type === 'success'
        ? <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
        : <XCircle size={16} className="text-red-600 flex-shrink-0" />
      }
      {msg}
    </div>
  )
}
