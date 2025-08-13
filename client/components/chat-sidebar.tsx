"use client"

import { Search, MoreVertical, MessageCircle, Users, Archive } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"
import type { Chat } from "@/lib/types"

interface ChatSidebarProps {
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
}

export function ChatSidebar({ chats, selectedChat, onSelectChat }: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/placeholder.svg?height=40&width=40&text=Me" />
          <AvatarFallback>Me</AvatarFallback>
        </Avatar>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="w-10 h-10">
            <Users className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10">
            <Archive className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10">
            <MessageCircle className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-gray-50 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search or start new chat" className="pl-10 bg-white border-none rounded-lg" />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.wa_id}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
              selectedChat?.wa_id === chat.wa_id ? "bg-gray-100" : ""
            }`}
          >
            <Avatar className="w-12 h-12 mr-3">
              <AvatarImage src={`/placeholder.svg?height=48&width=48&text=${chat.name.charAt(0)}`} />
              <AvatarFallback className="bg-green-500 text-white">{chat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime)}</span>
              </div>
              <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
            </div>
            {chat.unreadCount > 0 && (
              <div className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {chat.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
