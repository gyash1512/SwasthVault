import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  AlertTriangle, 
  Bell,
  User,
  Clock
} from 'lucide-react'

export default function CriticalAlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCriticalAlerts()
  }, [])

  const fetchCriticalAlerts = async () => {
    try {
      setLoading(true)
      // Mock critical alerts data - in real implementation, fetch from API
      const mockAlerts = [
        {
          _id: '1',
          patient: {
            _id: 'patient1',
            firstName: 'John',
            lastName: 'Doe'
          },
          message: 'Severe allergic reaction to Penicillin reported',
          timestamp: new Date().toISOString(),
          severity: 'critical'
        },
        {
          _id: '2',
          patient: {
            _id: 'patient2',
            firstName: 'Jane',
            lastName: 'Smith'
          },
          message: 'Unusually high blood pressure detected: 180/120 mmHg',
          timestamp: new Date().toISOString(),
          severity: 'high'
        }
      ]
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Error fetching critical alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Critical Alerts</h1>
        <p className="text-muted-foreground">
          Real-time critical alerts for emergency situations
        </p>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert._id} className={`medical-card ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{alert.message}</p>
                <div className="flex items-center gap-4 text-sm mt-2">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {alert.patient.firstName} {alert.patient.lastName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
