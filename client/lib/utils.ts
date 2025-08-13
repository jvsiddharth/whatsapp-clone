import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } else if (diffInHours < 168) {
    // Less than a week
    return date.toLocaleDateString("en-US", { weekday: "short" })
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
}
