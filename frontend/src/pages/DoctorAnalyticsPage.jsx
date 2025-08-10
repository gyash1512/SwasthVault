import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter
} from 'lucide-react'

export default function DoctorAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/doctors/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
      } else {
        console.error('Failed to fetch analytics data')
        setAnalyticsData(null)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setAnalyticsData(null)
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-bold text-foreground">Doctor Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your patient and practice data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medical-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <h3 className="text-2xl font-bold">{analyticsData.patientCount}</h3>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Patients</p>
              <h3 className="text-2xl font-bold">{analyticsData.newPatients}</h3>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Appointments Today</p>
              <h3 className="text-2xl font-bold">{analyticsData.appointmentsToday}</h3>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalRecords}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Diagnoses */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4">Common Diagnoses</h3>
          <div className="space-y-2">
            {analyticsData.commonDiagnoses.map((diag, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{diag.name}</span>
                <span className="font-medium">{diag.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4">Patient Demographics</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">By Age</h4>
              <div className="flex gap-2">
                {analyticsData.patientDemographics.age.map((age, index) => (
                  <div key={index} className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">{age.range}</p>
                    <p className="font-semibold">{age.count}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">By Gender</h4>
              <div className="flex gap-4">
                {analyticsData.patientDemographics.gender.map((gender, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-semibold">{gender.name}:</span>
                    <span>{gender.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
