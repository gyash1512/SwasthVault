import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Stethoscope,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Share,
  History
} from 'lucide-react'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingRecords: 0,
    criticalAlerts: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    fetchDoctorData()
  }, [])

  const fetchDoctorData = async () => {
    try {
      setLoading(true)
      
      // Fetch medical records where this doctor is the creator
      const recordsResponse = await fetch('/api/medical-records', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        const allRecords = recordsData.data || []
        
        // Filter records created by this doctor
        const doctorRecords = allRecords.filter(record => 
          record.doctor === user.id || record.doctor?._id === user.id
        )
        
        // Extract unique patients
        const uniquePatients = []
        const patientMap = new Map()
        
        doctorRecords.forEach(record => {
          const patientId = record.patient?._id || record.patient
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              patient: record.patient,
              lastVisit: record.visitDate,
              lastDiagnosis: record.diagnosis?.primary || 'No diagnosis',
              recordCount: 1,
              lastRecord: record
            })
            uniquePatients.push(patientMap.get(patientId))
          } else {
            const existing = patientMap.get(patientId)
            existing.recordCount++
            if (new Date(record.visitDate) > new Date(existing.lastVisit)) {
              existing.lastVisit = record.visitDate
              existing.lastDiagnosis = record.diagnosis?.primary || 'No diagnosis'
              existing.lastRecord = record
            }
          }
        })
        
        setPatients(uniquePatients)
        setRecentRecords(doctorRecords.slice(0, 10))
        
        // Calculate stats
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        
        const todayRecords = doctorRecords.filter(record => {
          const recordDate = new Date(record.visitDate)
          return recordDate >= todayStart && recordDate < todayEnd
        })
        
        const pendingRecords = doctorRecords.filter(record => 
          record.status === 'draft' || !record.status
        )
        
        const criticalAlerts = doctorRecords.filter(record => {
          // Check for critical conditions
          return record.vitalSigns?.bloodPressure?.systolic > 180 ||
                 record.emergencyInfo?.medicalAlerts?.some(alert => alert.severity === 'critical')
        })
        
        setStats({
          totalPatients: uniquePatients.length,
          todayAppointments: todayRecords.length,
          pendingRecords: pendingRecords.length,
          criticalAlerts: criticalAlerts.length
        })
      } else {
        console.error('Failed to fetch medical records')
        setPatients([])
        setRecentRecords([])
      }
      
    } catch (error) {
      console.error('Error fetching doctor data:', error)
      setPatients([])
      setRecentRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRecord = () => {
    // Navigate to create record page
    console.log('Create new medical record')
  }

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    // Navigate to patient details or open modal
  }

  const filteredPatients = patients.filter(patient =>
    patient.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastDiagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-medical-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Good morning, Dr. {user.lastName}!</h1>
            <p className="text-blue-100 mt-1">
              {user.specialization} • {stats.totalPatients} patients under your care
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">License</p>
            <p className="font-mono text-lg">{user.licenseNumber || 'MED001'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Patients</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Today's Appointments</h3>
              <p className="text-2xl font-bold text-green-600">{stats.todayAppointments}</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Records</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingRecords}</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Critical Alerts</h3>
              <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2 medical-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Patients</h2>
            <button 
              onClick={handleCreateRecord}
              className="bg-medical-600 text-white px-4 py-2 rounded-lg hover:bg-medical-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Record
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
            <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredPatients.map((patientRecord) => (
              <div key={patientRecord.patient._id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center">
                        <span className="text-medical-600 font-semibold">
                          {patientRecord.patient.firstName?.[0]}{patientRecord.patient.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {patientRecord.patient.firstName} {patientRecord.patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Age: {new Date().getFullYear() - new Date(patientRecord.patient.dateOfBirth).getFullYear()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Visit</p>
                        <p className="font-medium">{new Date(patientRecord.lastVisit).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Diagnosis</p>
                        <p className="font-medium">{patientRecord.lastDiagnosis}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewPatient(patientRecord)}
                      className="p-2 text-medical-600 hover:bg-medical-100 rounded-lg transition-colors"
                      title="View Patient"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit Record"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="View History"
                    >
                      <History className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients found</p>
                <p className="text-sm">
                  {searchTerm ? 'Try adjusting your search' : 'Your patients will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule & Quick Actions */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Today's Schedule
            </h3>
            <div className="space-y-3">
              {[
                { time: '09:00', patient: 'John Doe', type: 'Follow-up' },
                { time: '10:30', patient: 'Jane Smith', type: 'Consultation' },
                { time: '14:00', patient: 'Robert Wilson', type: 'Check-up' },
                { time: '15:30', patient: 'Mary Johnson', type: 'Emergency' }
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{appointment.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.type === 'Emergency' ? 'bg-red-100 text-red-700' :
                      appointment.type === 'Follow-up' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {appointment.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Alerts
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">High BP Alert</p>
                  <p className="text-xs text-red-600">John Doe - 180/110 mmHg</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Overdue Follow-up</p>
                  <p className="text-xs text-yellow-600">Jane Smith - 2 weeks overdue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <Plus className="h-6 w-6 text-medical-600 mb-1" />
                <span className="text-xs font-medium">New Record</span>
              </button>
              
              <button className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <Search className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-xs font-medium">Search Patient</span>
              </button>
              
              <button className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <Calendar className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-xs font-medium">Schedule</span>
              </button>
              
              <button className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-600 mb-1" />
                <span className="text-xs font-medium">Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="medical-card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            {
              action: 'Created medical record',
              patient: 'John Doe',
              time: '2 hours ago',
              type: 'create'
            },
            {
              action: 'Updated treatment plan',
              patient: 'Jane Smith',
              time: '4 hours ago',
              type: 'update'
            },
            {
              action: 'Shared record with specialist',
              patient: 'Robert Wilson',
              time: '1 day ago',
              type: 'share'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'create' ? 'bg-green-100' :
                  activity.type === 'update' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'create' && <Plus className="h-4 w-4 text-green-600" />}
                  {activity.type === 'update' && <Edit className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'share' && <Share className="h-4 w-4 text-purple-600" />}
                </div>
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">Patient: {activity.patient}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
