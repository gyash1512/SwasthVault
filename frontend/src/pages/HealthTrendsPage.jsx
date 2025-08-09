import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Thermometer,
  Droplets,
  Weight,
  Ruler,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

export default function HealthTrendsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [timeRange, setTimeRange] = useState('6months')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [trends, setTrends] = useState({
    bloodPressure: [],
    heartRate: [],
    temperature: [],
    weight: [],
    height: []
  })

  useEffect(() => {
    fetchHealthData()
  }, [timeRange])

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/medical-records?patientId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const records = data.data || []
        setMedicalRecords(records)
        processTrends(records)
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTrends = (records) => {
    const now = new Date()
    const timeRangeMs = {
      '1month': 30 * 24 * 60 * 60 * 1000,
      '3months': 90 * 24 * 60 * 60 * 1000,
      '6months': 180 * 24 * 60 * 60 * 1000,
      '1year': 365 * 24 * 60 * 60 * 1000
    }

    const cutoffDate = new Date(now.getTime() - timeRangeMs[timeRange])
    
    const filteredRecords = records.filter(record => 
      new Date(record.visitDate) >= cutoffDate
    ).sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))

    const trends = {
      bloodPressure: [],
      heartRate: [],
      temperature: [],
      weight: [],
      height: []
    }

    filteredRecords.forEach(record => {
      const date = new Date(record.visitDate).toLocaleDateString()
      
      if (record.vitalSigns?.bloodPressure?.systolic) {
        trends.bloodPressure.push({
          date,
          systolic: parseInt(record.vitalSigns.bloodPressure.systolic),
          diastolic: parseInt(record.vitalSigns.bloodPressure.diastolic),
          value: parseInt(record.vitalSigns.bloodPressure.systolic)
        })
      }
      
      if (record.vitalSigns?.heartRate?.value) {
        trends.heartRate.push({
          date,
          value: parseInt(record.vitalSigns.heartRate.value)
        })
      }
      
      if (record.vitalSigns?.temperature?.value) {
        trends.temperature.push({
          date,
          value: parseFloat(record.vitalSigns.temperature.value)
        })
      }
      
      if (record.vitalSigns?.weight?.value) {
        trends.weight.push({
          date,
          value: parseFloat(record.vitalSigns.weight.value)
        })
      }
      
      if (record.vitalSigns?.height?.value) {
        trends.height.push({
          date,
          value: parseFloat(record.vitalSigns.height.value)
        })
      }
    })

    setTrends(trends)
  }

  const calculateTrend = (data) => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 }
    
    const latest = data[data.length - 1].value
    const previous = data[data.length - 2].value
    const percentage = ((latest - previous) / previous * 100).toFixed(1)
    
    return {
      direction: latest > previous ? 'up' : latest < previous ? 'down' : 'stable',
      percentage: Math.abs(percentage)
    }
  }

  const getHealthStatus = (metric, value) => {
    switch (metric) {
      case 'bloodPressure':
        if (value < 90) return { status: 'low', color: 'text-blue-600' }
        if (value < 120) return { status: 'normal', color: 'text-green-600' }
        if (value < 140) return { status: 'elevated', color: 'text-yellow-600' }
        return { status: 'high', color: 'text-red-600' }
      
      case 'heartRate':
        if (value < 60) return { status: 'low', color: 'text-blue-600' }
        if (value <= 100) return { status: 'normal', color: 'text-green-600' }
        return { status: 'high', color: 'text-red-600' }
      
      case 'temperature':
        if (value < 97) return { status: 'low', color: 'text-blue-600' }
        if (value <= 99.5) return { status: 'normal', color: 'text-green-600' }
        if (value <= 102) return { status: 'elevated', color: 'text-yellow-600' }
        return { status: 'high', color: 'text-red-600' }
      
      default:
        return { status: 'normal', color: 'text-green-600' }
    }
  }

  const exportData = () => {
    const csvData = medicalRecords.map(record => ({
      Date: new Date(record.visitDate).toLocaleDateString(),
      'Blood Pressure': record.vitalSigns?.bloodPressure ? 
        `${record.vitalSigns.bloodPressure.systolic}/${record.vitalSigns.bloodPressure.diastolic}` : '',
      'Heart Rate': record.vitalSigns?.heartRate?.value || '',
      'Temperature': record.vitalSigns?.temperature?.value || '',
      'Weight': record.vitalSigns?.weight?.value || '',
      'Height': record.vitalSigns?.height?.value || ''
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `health-trends-${user.firstName}-${user.lastName}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
          <h1 className="text-2xl font-bold text-foreground">Health Trends</h1>
          <p className="text-muted-foreground">
            Track your health metrics and identify patterns over time
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchHealthData}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="medical-card">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <option value="all">All Metrics</option>
              <option value="bloodPressure">Blood Pressure</option>
              <option value="heartRate">Heart Rate</option>
              <option value="temperature">Temperature</option>
              <option value="weight">Weight</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        {trends.bloodPressure.length > 0 && (
          <div className="medical-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                <span className="font-medium">Blood Pressure</span>
              </div>
              {(() => {
                const trend = calculateTrend(trends.bloodPressure)
                return (
                  <div className="flex items-center gap-1">
                    {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-red-600" />}
                    {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-green-600" />}
                    <span className={`text-xs ${trend.direction === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                      {trend.percentage}%
                    </span>
                  </div>
                )
              })()}
            </div>
            <div className="text-2xl font-bold">
              {trends.bloodPressure[trends.bloodPressure.length - 1]?.systolic}/
              {trends.bloodPressure[trends.bloodPressure.length - 1]?.diastolic}
            </div>
            <div className={`text-sm ${getHealthStatus('bloodPressure', trends.bloodPressure[trends.bloodPressure.length - 1]?.systolic).color}`}>
              {getHealthStatus('bloodPressure', trends.bloodPressure[trends.bloodPressure.length - 1]?.systolic).status}
            </div>
          </div>
        )}

        {/* Heart Rate */}
        {trends.heartRate.length > 0 && (
          <div className="medical-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Heart Rate</span>
              </div>
              {(() => {
                const trend = calculateTrend(trends.heartRate)
                return (
                  <div className="flex items-center gap-1">
                    {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-red-600" />}
                    {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-green-600" />}
                    <span className={`text-xs ${trend.direction === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                      {trend.percentage}%
                    </span>
                  </div>
                )
              })()}
            </div>
            <div className="text-2xl font-bold">
              {trends.heartRate[trends.heartRate.length - 1]?.value} bpm
            </div>
            <div className={`text-sm ${getHealthStatus('heartRate', trends.heartRate[trends.heartRate.length - 1]?.value).color}`}>
              {getHealthStatus('heartRate', trends.heartRate[trends.heartRate.length - 1]?.value).status}
            </div>
          </div>
        )}

        {/* Temperature */}
        {trends.temperature.length > 0 && (
          <div className="medical-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Temperature</span>
              </div>
              {(() => {
                const trend = calculateTrend(trends.temperature)
                return (
                  <div className="flex items-center gap-1">
                    {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-red-600" />}
                    {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-green-600" />}
                    <span className={`text-xs ${trend.direction === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                      {trend.percentage}%
                    </span>
                  </div>
                )
              })()}
            </div>
            <div className="text-2xl font-bold">
              {trends.temperature[trends.temperature.length - 1]?.value}°F
            </div>
            <div className={`text-sm ${getHealthStatus('temperature', trends.temperature[trends.temperature.length - 1]?.value).color}`}>
              {getHealthStatus('temperature', trends.temperature[trends.temperature.length - 1]?.value).status}
            </div>
          </div>
        )}

        {/* Weight */}
        {trends.weight.length > 0 && (
          <div className="medical-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Weight className="h-5 w-5 text-green-600" />
                <span className="font-medium">Weight</span>
              </div>
              {(() => {
                const trend = calculateTrend(trends.weight)
                return (
                  <div className="flex items-center gap-1">
                    {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                    {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-blue-600" />}
                    <span className="text-xs text-blue-600">
                      {trend.percentage}%
                    </span>
                  </div>
                )
              })()}
            </div>
            <div className="text-2xl font-bold">
              {trends.weight[trends.weight.length - 1]?.value} kg
            </div>
            <div className="text-sm text-muted-foreground">
              Body weight
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Pressure Trend */}
        {trends.bloodPressure.length > 0 && (selectedMetric === 'all' || selectedMetric === 'bloodPressure') && (
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-red-600" />
              Blood Pressure Trend
            </h3>
            
            <div className="space-y-4">
              {trends.bloodPressure.map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{reading.systolic}/{reading.diastolic} mmHg</p>
                    <p className="text-sm text-muted-foreground">{reading.date}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getHealthStatus('bloodPressure', reading.systolic).color} bg-current bg-opacity-10`}>
                    {getHealthStatus('bloodPressure', reading.systolic).status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heart Rate Trend */}
        {trends.heartRate.length > 0 && (selectedMetric === 'all' || selectedMetric === 'heartRate') && (
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Heart Rate Trend
            </h3>
            
            <div className="space-y-4">
              {trends.heartRate.map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{reading.value} bpm</p>
                    <p className="text-sm text-muted-foreground">{reading.date}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getHealthStatus('heartRate', reading.value).color} bg-current bg-opacity-10`}>
                    {getHealthStatus('heartRate', reading.value).status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Temperature Trend */}
        {trends.temperature.length > 0 && (selectedMetric === 'all' || selectedMetric === 'temperature') && (
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              Temperature Trend
            </h3>
            
            <div className="space-y-4">
              {trends.temperature.map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{reading.value}°F</p>
                    <p className="text-sm text-muted-foreground">{reading.date}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getHealthStatus('temperature', reading.value).color} bg-current bg-opacity-10`}>
                    {getHealthStatus('temperature', reading.value).status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weight Trend */}
        {trends.weight.length > 0 && (selectedMetric === 'all' || selectedMetric === 'weight') && (
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Weight className="h-5 w-5 text-green-600" />
              Weight Trend
            </h3>
            
            <div className="space-y-4">
              {trends.weight.map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{reading.value} kg</p>
                    <p className="text-sm text-muted-foreground">{reading.date}</p>
                  </div>
                  <div className="px-2 py-1 rounded text-xs font-medium text-green-600 bg-green-100">
                    recorded
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* No Data State */}
      {medicalRecords.length === 0 && (
        <div className="medical-card text-center py-12">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Health Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Your health trends will appear here once you have medical records with vital signs
          </p>
          <p className="text-sm text-muted-foreground">
            Visit your doctor to start tracking your health metrics
          </p>
        </div>
      )}

      {/* Health Insights */}
      {medicalRecords.length > 0 && (
        <div className="medical-card">
          <h2 className="text-xl font-semibold mb-4">Health Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-green-700 mb-3">Positive Trends:</h3>
              <ul className="space-y-2 text-sm">
                {trends.bloodPressure.length > 1 && calculateTrend(trends.bloodPressure).direction === 'down' && (
                  <li className="flex items-center gap-2 text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    Blood pressure is improving
                  </li>
                )}
                {trends.heartRate.length > 1 && calculateTrend(trends.heartRate).direction === 'down' && (
                  <li className="flex items-center gap-2 text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    Heart rate is stabilizing
                  </li>
                )}
                {trends.temperature.length > 1 && calculateTrend(trends.temperature).direction === 'down' && (
                  <li className="flex items-center gap-2 text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    Temperature is normalizing
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-yellow-700 mb-3">Areas to Monitor:</h3>
              <ul className="space-y-2 text-sm">
                {trends.bloodPressure.length > 0 && trends.bloodPressure[trends.bloodPressure.length - 1]?.systolic > 140 && (
                  <li className="flex items-center gap-2 text-yellow-600">
                    <TrendingUp className="h-4 w-4" />
                    Blood pressure is elevated
                  </li>
                )}
                {trends.heartRate.length > 0 && trends.heartRate[trends.heartRate.length - 1]?.value > 100 && (
                  <li className="flex items-center gap-2 text-yellow-600">
                    <TrendingUp className="h-4 w-4" />
                    Heart rate is above normal
                  </li>
                )}
                {trends.temperature.length > 0 && trends.temperature[trends.temperature.length - 1]?.value > 99.5 && (
                  <li className="flex items-center gap-2 text-yellow-600">
                    <TrendingUp className="h-4 w-4" />
                    Temperature is elevated
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
