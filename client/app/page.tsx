"use client"

import { useState, useEffect } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatWindow } from "@/components/chat-window"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { useChats, useMessages, useWebSocket } from "@/hooks/use-api"
import type { Chat } from "@/lib/types"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000"

export default function WhatsAppWeb() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)

  const { chats, loading: chatsLoading, error: chatsError, updateChat, addChat } = useChats()
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    addMessage,
    updateMessage,
    sendMessage,
  } = useMessages(selectedChat?.wa_id || null)

  const { socket, connected } = useWebSocket(WS_URL)

  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case "new_message":
            addMessage(data.message)
            // Update chat's last message
            if (data.message.wa_id) {
              const chat = chats.find((c) => c.wa_id === data.message.wa_id)
              if (chat) {
                updateChat({
                  ...chat,
                  lastMessage: data.message.content,
                  lastMessageTime: data.message.timestamp,
                  unreadCount: selectedChat?.wa_id === data.message.wa_id ? 0 : chat.unreadCount + 1,
                })
              }
            }
            break

          case "message_status_update":
            updateMessage(data.messageId, { status: data.status })
            break

          case "new_chat":
            addChat(data.chat)
            break

          default:
            console.log("Unknown WebSocket message type:", data.type)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    socket.addEventListener("message", handleMessage)

    return () => {
      socket.removeEventListener("message", handleMessage)
    }
  }, [socket, addMessage, updateMessage, addChat, updateChat, chats, selectedChat])

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat)
    setIsMobileView(true)

    // Mark messages as read when opening chat
    if (chat.unreadCount > 0) {
      updateChat({ ...chat, unreadCount: 0 })
    }
  }

  const handleBackToChats = () => {
    setIsMobileView(false)
    setSelectedChat(null)
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedChat) return

    try {
      const newMessage = await sendMessage(content)

      if (newMessage) {
        // Update chat's last message
        updateChat({
          ...selectedChat,
          lastMessage: content,
          lastMessageTime: newMessage.timestamp,
        })
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      // You could show a toast notification here
    }
  }

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (chatsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ErrorMessage message={chatsError} />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full pt-10">
        <div className="w-1/3 border-r border-gray-300">
          <ChatSidebar chats={chats} selectedChat={selectedChat} onSelectChat={handleSelectChat} />
        </div>
        <div className="flex-1">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              messages={messages}
              loading={messagesLoading}
              error={messagesError}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-8 opacity-20">
                  <svg viewBox="0 0 303 172" className="w-full h-full">
                    <path
                      fill="#DDD"
                      d="M229.565 160.229c-6.429-.439-13.143-1.888-20.153-4.348-7.009-2.46-13.143-5.36-18.402-8.699-5.259-3.339-9.643-7.117-13.153-11.334-3.51-4.217-6.144-8.873-7.901-13.968-1.757-5.095-2.636-10.629-2.636-16.602 0-7.667 1.318-14.775 3.954-21.324 2.636-6.549 6.144-12.21 10.524-16.982 4.38-4.772 9.423-8.515 15.129-11.229 5.706-2.714 11.635-4.071 17.787-4.071 6.152 0 12.081 1.357 17.787 4.071 5.706 2.714 10.749 6.457 15.129 11.229 4.38 4.772 7.888 10.433 10.524 16.982 2.636 6.549 3.954 13.657 3.954 21.324 0 5.973-.879 11.507-2.636 16.602-1.757 5.095-4.391 9.751-7.901 13.968-3.51 4.217-7.894 7.995-13.153 11.334-5.259 3.339-11.393 6.239-18.402 8.699-7.01 2.46-13.724 3.909-20.153 4.348z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-light text-gray-600 mb-2">WhatsApp Web</h2>
                <p className="text-gray-500 max-w-md">
                  Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices
                  and 1 phone at the same time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full pt-10">
        {!isMobileView ? (
          <ChatSidebar chats={chats} selectedChat={selectedChat} onSelectChat={handleSelectChat} />
        ) : selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            loading={messagesLoading}
            error={messagesError}
            onSendMessage={handleSendMessage}
            onBack={handleBackToChats}
          />
        ) : null}
      </div>
    </div>
  )
}

