// Environment variables configuration
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://whatsapp-clone-nijz.onrender.com/api",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "wss://whatsapp-clone-nijz.onrender.com/websocket",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
}

// Validate required environment variables
export function validateEnv() {
  const required = ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_WS_URL"]
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`)
  }
}

// Call this at startup
validateEnv()

