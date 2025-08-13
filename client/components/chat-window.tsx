"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { apiClient } from "@/lib/api"
import type { Message, Chat } from "@/lib/types"

interface ChatWindowProps {
  chat: Chat | null
  onBack?: () => void
}

export function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages when chat changes
  useEffect(() => {
    if (!chat) {
      setMessages([])
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    console.log('Fetching messages for chat:', chat.wa_id)

    apiClient
      .getMessages(chat.wa_id)
      .then((res) => {
        if (!isMounted) return
        console.log('Messages API response:', res)
        if (res.success && res.data) {
          console.log('Messages data:', res.data)
          setMessages(res.data)
          setError(null)
        } else {
          console.error('Failed to load messages:', res.error)
          setError(res.error ?? "Failed to load messages")
        }
      })
      .catch((error) => {
        if (!isMounted) return
        console.error('Messages API error:', error)
        setError("An error occurred while loading messages")
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [chat])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending new message
  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || sending || !chat) return;

    setSending(true);
    setError(null);

    // Build a local message object immediately
    const tempMessage: Message = {
      message_id: `temp-${Date.now()}`, // temporary ID until WhatsApp confirms
      wa_id: chat.wa_id,
      contact_name: chat.name || "",
      direction: "outgoing",
      type: "text",
      body: newMessage.trim(),
      timestamp: new Date().toISOString(),
      phone_number_id: "",
      display_phone_number: "",
      status: "sent",
    };

    // Optimistically add to the chat
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const res = await apiClient.sendMessage(chat.wa_id, tempMessage.body);

      // If backend returns an ID, update the message
      if (res.success && res.data?.message_id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.message_id === tempMessage.message_id
              ? { ...msg, message_id: res.data.message_id }
              : msg
          )
        );
      } else if (!res.success) {
        setError(res.error ?? "Failed to send message");
      }
    } catch {
      setError("An error occurred while sending message");
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, chat]);


  // Handle Enter key press in input
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Generate a unique key for each message
  const getMessageKey = (message: Message, index: number): string => {
    // Try to use message_id first, then _id, then fallback to index with timestamp
    return message.message_id || 
           message._id || 
           `${index}-${message.timestamp}-${message.body?.slice(0, 10) || 'no-body'}`
  }

  if (!chat) {
    return (
      <div
        className="flex-1 flex items-center justify-center text-gray-500"
        role="alert"
        aria-live="polite"
      >
        Select a conversation to start chatting
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white" role="region" aria-label={`Chat with ${chat.name}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-100 border-b">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Go back"
            className="mr-2 md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage
            src={`/placeholder.svg?height=40&width=40&text=${encodeURIComponent(chat.name.charAt(0))}`}
            alt={`${chat.name} avatar`}
          />
          <AvatarFallback className="bg-green-500 text-white">
            {chat.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-gray-900 truncate">{chat.name}</h2>
          <p className="text-sm text-gray-600 truncate">{chat.phone}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" aria-label="Start video call">
            <Video className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Start phone call">
            <Phone className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2"
        style={{
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f0f0f0' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        tabIndex={0}
        aria-live="polite"
      >
        {loading ? (
          <div className="flex justify-center py-8" role="status" aria-label="Loading messages">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex justify-center py-8" role="alert" aria-live="assertive">
            <ErrorMessage message={error} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-8" role="alert" aria-live="polite">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            console.log(`Message ${index}:`, message)
            return (
            <div
              key={getMessageKey(message, index)}
              className={`flex w-full ${message.direction === "incoming" ? "justify-start" : "justify-end"} mb-2`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg break-words ${
                  message.direction === "incoming"
                    ? "bg-gray-200"
                    : "bg-green-200"
                }`}
                tabIndex={-1}
                aria-label={`${message.direction || 'unknown'} message: ${message.body || 'No content'}`}
              >
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {message.body || 'No message content'}
                </p>
                <p className="text-xs text-gray-500 mt-1 select-none">
                  {message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Unknown time'} • {message.status || 'No status'}
                </p>
              </div>
            </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex items-center p-4 bg-gray-50 border-t">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          aria-label="Add emoji"
          type="button"
        >
          <Smile className="w-5 h-5 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          aria-label="Attach file"
          type="button"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </Button>
        <div className="flex-1 relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message"
            disabled={sending}
            className="pr-12 rounded-full border-none bg-white"
            aria-label="Message input"
            spellCheck={false}
          />
          {newMessage.trim() ? (
            <Button
              onClick={handleSend}
              disabled={sending}
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
              aria-label={sending ? "Sending message" : "Send message"}
              type="button"
            >
              {sending ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8"
              aria-label="Record voice message"
              type="button"
            >
              <Mic className="w-4 h-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}