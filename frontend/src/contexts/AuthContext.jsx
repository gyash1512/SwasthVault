import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext({})

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = true

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          setToken(savedToken)
          // You could verify the token with the backend here
          // For now, we'll assume it's valid
          const userData = JSON.parse(localStorage.getItem('user') || '{}')
          setUser(userData)
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password, totpCode = null) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
        totpCode
      })

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data
        
        setUser(userData)
        setToken(userToken)
        localStorage.setItem('token', userToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        return { success: true, data: response.data.data }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData)
      
      if (response.data.success) {
        const { user: newUser, token: userToken } = response.data.data
        
        setUser(newUser)
        setToken(userToken)
        localStorage.setItem('token', userToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        
        return { success: true, data: response.data.data }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const endpoint = user.role === 'patient' ? '/patients/profile' : '/doctors/profile'
      const response = await axios.put(endpoint, profileData)
      
      if (response.data.success) {
        const updatedUser = response.data.data
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        return { success: true, data: updatedUser }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Profile update error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      }
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token')

      const response = await axios.post('/auth/refresh', { refreshToken })
      
      if (response.data.success) {
        const { token: newToken } = response.data.data
        setToken(newToken)
        localStorage.setItem('token', newToken)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    isAuthenticated: !!user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isEmergencyPersonnel: user?.role === 'emergency_personnel',
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
