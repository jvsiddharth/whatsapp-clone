"use client"

import { AlertCircle } from "lucide-react"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
