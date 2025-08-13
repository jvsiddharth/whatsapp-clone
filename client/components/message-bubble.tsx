import { Check, CheckCheck } from "lucide-react"
import { formatTime } from "@/lib/utils"
import type { Message } from "@/lib/types"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isFromMe = message.from === "me"

  const getStatusIcon = () => {
    switch (message.status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-gray-400" />
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className={`flex ${isFromMe ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isFromMe ? "bg-green-500 text-white rounded-br-none" : "bg-white text-gray-900 rounded-bl-none shadow-sm"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <div
          className={`flex items-center justify-end mt-1 space-x-1 ${isFromMe ? "text-green-100" : "text-gray-500"}`}
        >
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          {isFromMe && getStatusIcon()}
        </div>
      </div>
    </div>
  )
}
