import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Activity,
  Server,
  Database,
  Shield,
  Clock
} from 'lucide-react'

export default function SystemAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(null)

  useEffect(() => {
    fetchSystemAnalytics()
  }, [])

  const fetchSystemAnalytics = async () => {
    try {
      setLoading(true)
      // Mock system analytics data - in real implementation, fetch from API
      const mockData = {
        totalUsers: 1258,
        totalRecords: 58432,
        activeSessions: 78,
        serverHealth: {
          status: 'OK',
          cpuUsage: '35%',
          memoryUsage: '62%'
        },
        databaseHealth: {
          status: 'OK',
          connections: 25,
          size: '2.5 GB'
        },
        apiStats: {
          totalRequests: 125432,
          errorRate: '1.2%',
          avgResponseTime: '120ms'
        },
        userGrowth: [
          { month: 'Jan', count: 150 },
          { month: 'Feb', count: 220 },
          { month: 'Mar', count: 310 },
          { month: 'Apr', count: 450 },
          { month: 'May', count: 600 },
          { month: 'Jun', count: 780 }
        ]
      }
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error fetching system analytics:', error)
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Analytics</h1>
        <p className="text-muted-foreground">
          Overview of the SwasthVault system health and usage
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medical-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalRecords}</h3>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <h3 className="text-2xl font-bold">{analyticsData.activeSessions}</h3>
            </div>
          </div>
        </div>
        <div className="medical-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Error Rate</p>
              <h3 className="text-2xl font-bold">{analyticsData.apiStats.errorRate}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Health */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4">Server Health</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-green-600">{analyticsData.serverHealth.status}</span>
            </div>
            <div className="flex justify-between">
              <span>CPU Usage:</span>
              <span className="font-medium">{analyticsData.serverHealth.cpuUsage}</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span className="font-medium">{analyticsData.serverHealth.memoryUsage}</span>
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4">Database Health</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-green-600">{analyticsData.databaseHealth.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Connections:</span>
              <span className="font-medium">{analyticsData.databaseHealth.connections}</span>
            </div>
            <div className="flex justify-between">
              <span>DB Size:</span>
              <span className="font-medium">{analyticsData.databaseHealth.size}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
