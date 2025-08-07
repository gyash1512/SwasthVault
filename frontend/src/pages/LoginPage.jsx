import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Heart, Shield, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    totpCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTOTP, setShowTOTP] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password, formData.totpCode)
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        if (result.message?.includes('2FA') || result.message?.includes('TOTP')) {
          setShowTOTP(true)
        }
        setError(result.message || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-health-50 to-blue-50">
      <div className="flex min-h-screen">
        {/* Left side - Hero section (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 bg-gradient-to-br from-medical-600 to-health-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
            <div className="max-w-md">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Heart className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold">SwasthVault</h1>
              </div>
              
              <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                Your Health,
                <br />
                <span className="text-blue-200">Secured & Connected</span>
              </h2>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Centralized medical history management system ensuring seamless healthcare delivery across India.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-300" />
                  <span className="text-lg">End-to-end encrypted medical records</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-green-300" />
                  <span className="text-lg">Seamless doctor-patient connectivity</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="h-6 w-6 text-green-300" />
                  <span className="text-lg">Emergency access for critical care</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-32 w-24 h-24 bg-blue-300/20 rounded-full blur-lg"></div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 lg:w-1/2 xl:w-1/3 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="p-3 bg-medical-100 rounded-xl">
                <Heart className="h-8 w-8 text-medical-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SwasthVault</h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600">
                Sign in to access your medical dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field w-full pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {showTOTP && (
                <div>
                  <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 mb-2">
                    2FA Code
                  </label>
                  <input
                    id="totpCode"
                    name="totpCode"
                    type="text"
                    value={formData.totpCode}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm text-medical-600 hover:text-medical-500"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base"
                variant="medical"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner h-5 w-5"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-medical-600 hover:text-medical-500"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/emergency-access"
                className="inline-flex items-center space-x-2 text-emergency-600 hover:text-emergency-700 font-medium"
              >
                <Shield className="h-4 w-4" />
                <span>Emergency Access</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
