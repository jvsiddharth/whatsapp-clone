export interface Message {
  id: string
  wa_id: string
  from: string
  to: string
  content: string
  timestamp: string
  status: "sent" | "delivered" | "read"
  type: "text" | "image" | "document" | "audio"
}

export interface Chat {
  wa_id: string
  name: string
  phone: string
  lastMessage: string
  lastMessageTime: string
  lastSeen: string
  unreadCount: number
  avatar?: string
}
