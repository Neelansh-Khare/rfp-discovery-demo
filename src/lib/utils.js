import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Simple utility file with createPageUrl function
export function createPageUrl(pageName) {
  const routes = {
    'Dashboard': '/',
    'Opportunities': '/opportunities',
    'Pipeline': '/pipeline',
    'Profile': '/profile'
  }
  return routes[pageName] || '/'
}
