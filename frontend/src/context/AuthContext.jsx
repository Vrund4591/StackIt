import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)

  // Get API URL from environment variable with fallback
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
          setToken(storedToken)
          await validateToken(storedToken)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError('Failed to initialize authentication')
        logout() // Clear any invalid state
      }
    }

    initializeAuth()
  }, [])

  const validateToken = async (tokenToValidate) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(tokenToValidate)
      } else {
        // Invalid token - clear auth state
        console.warn('Token validation failed:', response.status)
        logout()
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setError('Failed to validate authentication')
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Login failed: ${response.status}`)
      }

      // Set user and token
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      
      return data.user
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, username) => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, username })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Registration failed: ${response.status}`)
      }

      // Set user and token
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      
      return data.user
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setError(null)
    localStorage.removeItem('token')
  }

  const updateUser = (updatedUser) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUser
    }))
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    API_URL
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext