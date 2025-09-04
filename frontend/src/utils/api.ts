import { ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://web-production-508d.up.railway.app' : 'http://localhost:4000')

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

// Helper function for authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error('Authentication required')
    }
    
    // Try to parse error message from response
    try {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    } catch (parseError) {
      // If we can't parse the response, provide a more helpful error message
      if (response.status === 400) {
        throw new Error('Bad request - please check your input and try again')
      } else if (response.status === 404) {
        throw new Error('API endpoint not found - please check the server configuration')
      } else if (response.status === 500) {
        throw new Error('Server error - please try again later')
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }
  }

  return response
}

export async function sendTranscriptToAPI(transcript: string): Promise<ApiResponse> {
  try {
    const response = await authenticatedFetch('/api/health', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      throw new Error('Please log in to use VoiceVitals')
    }
    throw new Error('Failed to connect to the analysis server')
  }
}

// Settings API functions
export async function getUserSettings() {
  try {
    const response = await authenticatedFetch('/api/settings')
    const data = await response.json()
    return data.data.settings
  } catch (error) {
    console.error('Error fetching user settings:', error)
    throw error
  }
}

export async function updateUserSettings(settings: any) {
  try {
    const response = await authenticatedFetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
    const data = await response.json()
    return data.data.settings
  } catch (error) {
    console.error('Error updating user settings:', error)
    throw error
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    console.log('🔐 Frontend: Attempting to change password');
    console.log('🔐 Frontend: API URL:', `${API_BASE_URL}/api/settings/change-password`);
    
    const response = await authenticatedFetch('/api/settings/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    
    console.log('🔐 Frontend: Response received:', response.status);
    const data = await response.json()
    console.log('🔐 Frontend: Response data:', data);
    return data
  } catch (error) {
    console.error('❌ Frontend: Error changing password:', error)
    throw error
  }
}

export async function deleteUserAccount() {
  try {
    console.log('🗑️ Frontend: Sending delete account request');
    
    const response = await authenticatedFetch('/api/settings/delete-account', {
      method: 'DELETE',
    })
    
    console.log('✅ Frontend: Delete account response received:', response.status);
    const data = await response.json()
    console.log('✅ Frontend: Delete account response data:', data);
    
    return data
  } catch (error) {
    console.error('❌ Frontend: Error deleting user account:', error)
    throw error
  }
}

export function validateTranscript(transcript: string): boolean {
  return transcript.trim().length > 0
}
