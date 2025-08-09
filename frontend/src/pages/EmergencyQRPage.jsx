import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  QrCode, 
  Download, 
  Share, 
  Print, 
  Shield, 
  AlertTriangle,
  Heart,
  Phone,
  User,
  Calendar,
  MapPin,
  Copy,
  CheckCircle
} from 'lucide-react'

export default function EmergencyQRPage() {
  const { user } = useAuth()
  const [qrData, setQrData] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateQRData()
  }, [user])

  const generateQRData = () => {
    if (!user) return

    const emergencyData = {
      patientId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      dateOfBirth: user.dateOfBirth,
      bloodGroup: user.bloodGroup || 'Unknown',
      allergies: user.allergies || [],
      chronicConditions: user.chronicConditions || [],
      emergencyContact: user.emergencyContact || {},
      phoneNumber: user.phoneNumber,
      address: user.address || {},
      medicalAlerts: [
        ...(user.allergies || []).map(allergy => ({
          type: 'allergy',
          description: allergy,
          severity: 'critical'
        })),
        ...(user.chronicConditions || []).map(condition => ({
          type: 'condition',
          description: condition,
          severity: 'important'
        }))
      ],
      generatedAt: new Date().toISOString(),
      version: '1.0'
    }

    // In a real implementation, this would generate an actual QR code
    const qrString = btoa(JSON.stringify(emergencyData))
    setQrData(qrString)
  }

  const handleDownload = () => {
    // In a real implementation, this would generate and download a QR code image
    const element = document.createElement('a')
    const file = new Blob([`Emergency QR Data: ${qrData}`], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `emergency-qr-${user.firstName}-${user.lastName}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Medical QR Code',
          text: 'Emergency medical information QR code',
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopy()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emergency QR Code</h1>
          <p className="text-muted-foreground">
            Quick access to critical medical information for emergency situations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Print className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="medical-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emergency-600" />
            Your Emergency QR Code
          </h2>
          
          <div className="text-center">
            {/* QR Code Placeholder - In real implementation, use a QR code library */}
            <div className="bg-white p-8 rounded-lg border-2 border-dashed border-emergency-300 mb-4 mx-auto max-w-xs">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="h-24 w-24 text-emergency-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Emergency Medical QR Code
              </p>
              <p className="text-xs text-muted-foreground">
                {user.firstName} {user.lastName}
              </p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Data'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Share className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-emergency-50 border border-emergency-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-emergency-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-emergency-800">
                <p className="font-medium mb-1">How to use in emergencies:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Show this QR code to emergency personnel</li>
                  <li>• They can scan it to access your critical medical info</li>
                  <li>• No internet required - data is embedded in the code</li>
                  <li>• Keep a printed copy in your wallet or car</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information Summary */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-medical-600" />
              Basic Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of Birth:</span>
                <span className="font-medium">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blood Group:</span>
                <span className="font-medium text-red-600">
                  {user.bloodGroup || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{user.phoneNumber || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Medical Alerts */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Medical Alerts
            </h3>
            
            <div className="space-y-3">
              {user.allergies?.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Allergies:</h4>
                  <div className="space-y-1">
                    {user.allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span className="text-sm text-red-800">{allergy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user.chronicConditions?.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-700 mb-2">Chronic Conditions:</h4>
                  <div className="space-y-1">
                    {user.chronicConditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <Heart className="h-3 w-3 text-yellow-600" />
                        <span className="text-sm text-yellow-800">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!user.allergies?.length && !user.chronicConditions?.length) && (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No medical alerts on file</p>
                  <p className="text-xs">Update your profile to add allergies or conditions</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Emergency Contact
            </h3>
            
            {user.emergencyContact?.name ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{user.emergencyContact.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relationship:</span>
                  <span className="font-medium capitalize">{user.emergencyContact.relationship}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium font-mono">{user.emergencyContact.phoneNumber}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No emergency contact set</p>
                <p className="text-xs">Add an emergency contact in your profile</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="medical-card">
        <h2 className="text-xl font-semibold mb-4">Emergency QR Code Instructions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-green-700 mb-3">For Patients:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Download and print your QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Keep a copy in your wallet, car, or bag</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Update your profile to keep information current</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Show to emergency personnel when needed</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-blue-700 mb-3">For Emergency Personnel:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Scan QR code with any QR scanner app</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Access critical medical information instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>No internet connection required</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Contact emergency contact if needed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
