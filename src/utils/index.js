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
