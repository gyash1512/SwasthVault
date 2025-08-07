import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Heart } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-health-50 to-blue-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="p-3 bg-medical-100 rounded-xl">
            <Heart className="h-8 w-8 text-medical-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SwasthVault</h1>
        </div>
        
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Button asChild variant="medical">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
