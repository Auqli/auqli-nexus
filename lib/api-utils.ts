/**
 * API utilities for making consistent backend requests
 */

// Get the backend URL with fallback - using a hardcoded value instead of env var
export const getBackendUrl = (): string => {
  return "https://auqli-nexus-be.onrender.com"
}

// Function to build API URLs consistently
export const buildApiUrl = (endpoint: string, queryParams: Record<string, string> = {}): string => {
  const baseUrl = getBackendUrl()
  const url = new URL(`${baseUrl}${endpoint}`)

  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value)
    }
  })

  return url.toString()
}

// Helper to make authenticated API requests
export const fetchWithAuth = async (
  endpoint: string,
  token: string,
  options: RequestInit = {},
  queryParams: Record<string, string> = {},
): Promise<Response> => {
  const url = buildApiUrl(endpoint, queryParams)

  // Merge headers with authorization
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// Function to check if running in Shopify embedded app context - removing this function
// since we don't need Shopify functionality
