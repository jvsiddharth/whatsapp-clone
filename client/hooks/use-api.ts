"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api"
import type { Chat, Message } from "@/lib/types"

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await apiClient.getChats()

    if (response.success && response.data) {
      setChats(response.data)
    } else {
      setError(response.error || "Failed to fetch chats")
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const updateChat = useCallback((updatedChat: Chat) => {
    setChats((prev) => prev.map((chat) => (chat.wa_id === updatedChat.wa_id ? updatedChat : chat)))
  }, [])

  const addChat = useCallback((newChat: Chat) => {
    setChats((prev) => [newChat, ...prev])
  }, [])

  return {
    chats,
    loading,
    error,
    refetch: fetchChats,
    updateChat,
    addChat,
  }
}

export function useMessages(waId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!waId) {
      setMessages([])
      return
    }

    setLoading(true)
    setError(null)

    const response = await apiClient.getMessages(waId)

    if (response.success && response.data) {
      setMessages(response.data)
    } else {
      setError(response.error || "Failed to fetch messages")
    }

    setLoading(false)
  }, [waId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const addMessage = useCallback((newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage])
  }, [])

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)))
  }, [])

  

  const sendMessage = useCallback(
    async (content: string) => {
      if (!waId) return null

      // Optimistically add message
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        wa_id: waId,
        from: "me",
        to: waId,
        content,
        timestamp: new Date().toISOString(),
        status: "sent",
        type: "text",
      }

      addMessage(tempMessage)

      const response = await apiClient.sendMessage(waId, content)

      if (response.success && response.data) {
        // Replace temp message with real message
        setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? response.data! : msg)))
        return response.data
      } else {
        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
        throw new Error(response.error || "Failed to send message")
      }
    },
    [waId, addMessage],
  )

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    addMessage,
    updateMessage,
    sendMessage,
  }
}


export function useWebSocket(url?: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return

    const ws = new WebSocket(url)

    ws.onopen = () => {
      setConnected(true)
      setError(null)
      console.log("WebSocket connected")
    }

    ws.onclose = () => {
      setConnected(false)
      console.log("WebSocket disconnected")
    }

    ws.onerror = (event) => {
      setError("WebSocket connection error")
      console.error("WebSocket error:", event)
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && connected) {
        socket.send(JSON.stringify(message))
      }
    },
    [socket, connected],
  )

  return {
    socket,
    connected,
    error,
    sendMessage,
  }
}
