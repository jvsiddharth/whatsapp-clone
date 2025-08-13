const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface WebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        messages?: Array<{
          from: string
          msg_id: string
          timestamp: string
          text?: { body: string }
          type: string
        }>
        statuses?: Array<{
          id: string
          status: "sent" | "delivered" | "read"
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

type Chat = {}

type Message = {}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }


 
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const contentType = response.headers.get("content-type");
      let data: any = null;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else if (contentType?.includes("text/")) {
        data = await response.text();
      }

      // Always return structured result instead of throwing for non-200
      if (response.ok) {
        return { success: true, data: data as T };
      } else {
        return {
          success: false,
          error: typeof data === "string" ? data : data?.error || `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }


  // Get all chats/conversations
  async getChats(): Promise<ApiResponse<Chat[]>> {
    return this.request<Chat[]>("/conversations/")
  }

  // Get messages for a specific chat
  async getMessages(waId: string): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>(`/messages/${waId}`)
  }

  // Send a new message

  async sendMessage(waId: string, content: string): Promise<ApiResponse<Message>> {
  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000);

  const payload = {
    payload_type: "whatsapp_webhook",
    _id: `conv2-msg1-user`, // or dynamically generate if needed
    metaData: {
      entry: [
        {
          changes: [
            {
              field: "messages",
              value: {
                contacts: [
                  {
                    profile: { name: "" }, // fill name if available
                    wa_id: waId
                  }
                ],
                messages: [
                  {
                    from: waId,
                    msg_id: `client-${Date.now()}`, // unique message id
                    timestamp: `${timestamp}`,
                    text: { body: content },
                    type: "text"
                  }
                ],
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "",  // your WA number
                  phone_number_id: ""        // your WA phone number ID
                }
              }
            }
          ],
          id: "" // your WA business account ID if applicable
        }
      ],
      gs_app_id: "conv2-app",
      object: "whatsapp_business_account"
    },
    createdAt: now.toISOString().replace("T", " ").split(".")[0],
    startedAt: now.toISOString().replace("T", " ").split(".")[0],
    completedAt: now.toISOString().replace("T", " ").split(".")[0],
    executed: true
  };

  return this.request<Message>("/webhook", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

  // Process webhook payload (for testing)
  async processWebhook(payload: WebhookPayload): Promise<ApiResponse<any>> {
    return this.request("/webhook", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  // Get chat statistics
  async getChatStats(): Promise<
    ApiResponse<{
      totalChats: number
      totalMessages: number
      unreadCount: number
    }>
  > {
    return this.request("/stats")
  }

  // Search messages
  async searchMessages(query: string): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>(`/search?q=${encodeURIComponent(query)}`)
  }

  // Mark messages as read
  async markAsRead(waId: string, messageIds: string[]): Promise<ApiResponse<void>> {
    return this.request("/messages/read", {
      method: "PUT",
      body: JSON.stringify({
        wa_id: waId,
        message_ids: messageIds,
      }),
    })
  }
}

export const apiClient = new ApiClient()
