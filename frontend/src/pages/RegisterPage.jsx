import React from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-health-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-medical-100 rounded-xl">
              <Heart className="h-8 w-8 text-medical-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SwasthVault</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Registration functionality coming soon</p>
        </div>
        
        <div className="text-center">
          <Link to="/login" className="text-medical-600 hover:text-medical-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
