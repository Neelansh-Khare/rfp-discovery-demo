import * as React from "react"

// Simple toast hook for demo purposes
export function useToast() {
  return {
    toast: ({ title, description }) => {
      alert(`${title}\n${description || ''}`)
    }
  }
}
