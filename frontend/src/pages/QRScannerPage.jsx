import React, { useState } from 'react'
import { QrReader } from 'react-qr-reader'
import { 
  QrCode, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function QRScannerPage() {
  const [data, setData] = useState('No result')
  const [error, setError] = useState(null)

  const handleScan = (result, error) => {
    if (result) {
      setData(result?.text)
    }

    if (error) {
      setError(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">QR Scanner</h1>
        <p className="text-muted-foreground">
          Scan a patient's emergency QR code to access critical information
        </p>
      </div>

      <div className="medical-card">
        <div className="w-full max-w-md mx-auto">
          <QrReader
            onResult={handleScan}
            constraints={{ facingMode: 'environment' }}
            style={{ width: '100%' }}
          />
        </div>
        
        <div className="mt-6 text-center">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}
          
          {data !== 'No result' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Scan Successful
              </h3>
              <p className="text-sm text-green-800 break-all">{data}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
