import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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

      // Fetch all patients
      const patientsResponse = await fetch('/api/users?role=patient', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      let allPatients = []
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json()
        allPatients = patientsData.data || []
      } else {
        console.error('Failed to fetch all patients')
      }

      // Fetch medical records created by this doctor
      const recordsResponse = await fetch('/api/medical-records', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      let doctorRecords = []
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        // Filter records created by this doctor
        doctorRecords = (recordsData.data || []).filter(record =>
          record.doctor?._id === user.id
        )
        setRecentRecords(doctorRecords.slice(0, 10))
      } else {
        console.error('Failed to fetch medical records')
      }

      // Map patients with their latest record info
      const patientsWithRecordInfo = allPatients.map(patient => {
        const patientRecords = doctorRecords.filter(record =>
          record.patient?._id === patient._id
        ).sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)) // Sort by most recent

        const lastRecord = patientRecords.length > 0 ? patientRecords[0] : null

        return {
          patient: patient,
          lastVisit: lastRecord ? lastRecord.visitDate : null,
          lastDiagnosis: lastRecord ? lastRecord.diagnosis?.primary : 'No diagnosis',
          recordCount: patientRecords.length,
          lastRecord: lastRecord
        }
      })

      setPatients(patientsWithRecordInfo)

      // Calculate stats
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

      const todayAppointments = doctorRecords.filter(record => {
        const recordDate = new Date(record.visitDate)
        return recordDate >= todayStart && recordDate < todayEnd
      }).length

      const pendingRecords = doctorRecords.filter(record =>
        record.status === 'draft' || !record.status
      ).length

      const criticalAlerts = doctorRecords.filter(record => {
        // Check for critical conditions based on vital signs or emergency info
        return record.vitalSigns?.bloodPressure?.systolic > 180 ||
               record.emergencyInfo?.medicalAlerts?.some(alert => alert.severity === 'critical')
      }).length

      setStats({
        totalPatients: allPatients.length, // Total registered patients
        todayAppointments: todayAppointments,
        pendingRecords: pendingRecords,
        criticalAlerts: criticalAlerts
      })

    } catch (error) {
      console.error('Error fetching doctor data:', error)
      setPatients([])
      setRecentRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRecord = (patientId = null) => {
    if (patientId) {
      navigate('/create-record', { state: { patientId: patientId } })
    } else {
      navigate('/create-record')
    }
  }

  const handleViewPatient = (patientData) => {
    // patientData here is the combined object from `patients` state
    navigate(`/patient-history/${patientData.patient._id}`)
  }

  const handleEditRecord = (patientData) => {
    // Navigate to create record page with patientId pre-filled
    handleCreateRecord(patientData.patient._id)
  }

  const handleViewHistory = (patientId) => {
    navigate(`/patient-history/${patientId}`)
  }

  const filteredPatients = patients.filter(patientInfo => {
    const patient = patientInfo.patient; // Access the nested patient object
    return (
      patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientInfo.lastDiagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
                      onClick={() => handleEditRecord(patientRecord)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit Record"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleViewHistory(patientRecord.patient._id)}
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
              {recentRecords.filter(record => {
                const today = new Date();
                const recordDate = new Date(record.visitDate);
                return recordDate.toDateString() === today.toDateString();
              }).slice(0, 4).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{record.patient?.firstName} {record.patient?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{record.visitType.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{new Date(record.visitDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      record.visitType === 'emergency' ? 'bg-red-100 text-red-700' :
                      record.visitType === 'follow_up' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {record.visitType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
              {recentRecords.filter(record => {
                const today = new Date();
                const recordDate = new Date(record.visitDate);
                return recordDate.toDateString() === today.toDateString();
              }).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Alerts
            </h3>
            <div className="space-y-3">
              {recentRecords.filter(record => {
                // Check for critical vital signs
                return record.vitalSigns?.bloodPressure?.systolic > 180 ||
                       record.vitalSigns?.bloodPressure?.systolic < 90 ||
                       record.vitalSigns?.temperature?.value > 102 ||
                       record.vitalSigns?.heartRate?.value > 120 ||
                       record.vitalSigns?.heartRate?.value < 50
              }).slice(0, 3).map((record, index) => {
                const getCriticalAlert = (record) => {
                  if (record.vitalSigns?.bloodPressure?.systolic > 180) {
                    return {
                      type: 'High Blood Pressure',
                      value: `${record.vitalSigns.bloodPressure.systolic}/${record.vitalSigns.bloodPressure.diastolic} mmHg`,
                      severity: 'critical'
                    }
                  }
                  if (record.vitalSigns?.temperature?.value > 102) {
                    return {
                      type: 'High Fever',
                      value: `${record.vitalSigns.temperature.value}°F`,
                      severity: 'warning'
                    }
                  }
                  if (record.vitalSigns?.heartRate?.value > 120) {
                    return {
                      type: 'Tachycardia',
                      value: `${record.vitalSigns.heartRate.value} bpm`,
                      severity: 'warning'
                    }
                  }
                  return {
                    type: 'Abnormal Vitals',
                    value: 'Review required',
                    severity: 'warning'
                  }
                }
                
                const alert = getCriticalAlert(record)
                
                return (
                  <div key={index} className={`flex items-center gap-3 p-3 border rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                      }`}>{alert.type}</p>
                      <p className={`text-xs ${
                        alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {record.patient?.firstName} {record.patient?.lastName} - {alert.value}
                      </p>
                    </div>
                  </div>
                )
              })}
              
              {/* Check for overdue follow-ups */}
              {recentRecords.filter(record => {
                if (!record.treatment?.nextAppointment?.date) return false
                const appointmentDate = new Date(record.treatment.nextAppointment.date)
                const today = new Date()
                return appointmentDate < today
              }).slice(0, 2).map((record, index) => (
                <div key={`overdue-${index}`} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Overdue Follow-up</p>
                    <p className="text-xs text-orange-600">
                      {record.patient?.firstName} {record.patient?.lastName} - 
                      {Math.ceil((new Date() - new Date(record.treatment.nextAppointment.date)) / (1000 * 60 * 60 * 24))} days overdue
                    </p>
                  </div>
                </div>
              ))}
              
              {recentRecords.filter(record => {
                return record.vitalSigns?.bloodPressure?.systolic > 180 ||
                       record.vitalSigns?.temperature?.value > 102 ||
                       record.vitalSigns?.heartRate?.value > 120 ||
                       (record.treatment?.nextAppointment?.date && new Date(record.treatment.nextAppointment.date) < new Date())
              }).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No critical alerts</p>
                  <p className="text-xs">All patients stable</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleCreateRecord}
                className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-6 w-6 text-medical-600 mb-1" />
                <span className="text-xs font-medium">New Record</span>
              </button>
              
              <button 
                onClick={() => document.querySelector('input[placeholder="Search patients..."]')?.focus()}
                className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Search className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-xs font-medium">Search Patient</span>
              </button>
              
              <button 
                onClick={() => {
                  const todayRecords = recentRecords.filter(record => {
                    const today = new Date();
                    const recordDate = new Date(record.visitDate);
                    return recordDate.toDateString() === today.toDateString();
                  });
                  if (todayRecords.length > 0) {
                    alert(`You have ${todayRecords.length} appointments today`);
                  } else {
                    alert('No appointments scheduled for today');
                  }
                }}
                className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Calendar className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-xs font-medium">Schedule</span>
              </button>
              
              <button 
                onClick={() => {
                  alert(`Analytics Summary:\n• Total Patients: ${stats.totalPatients}\n• Today's Appointments: ${stats.todayAppointments}\n• Pending Records: ${stats.pendingRecords}\n• Critical Alerts: ${stats.criticalAlerts}`);
                }}
                className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
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
          {recentRecords.slice(0, 5).map((record, index) => {
            const getTimeAgo = (date) => {
              const now = new Date()
              const recordDate = new Date(date)
              const diffInHours = Math.floor((now - recordDate) / (1000 * 60 * 60))
              
              if (diffInHours < 1) return 'Just now'
              if (diffInHours < 24) return `${diffInHours} hours ago`
              const diffInDays = Math.floor(diffInHours / 24)
              if (diffInDays === 1) return '1 day ago'
              return `${diffInDays} days ago`
            }

            const getActivityType = (record) => {
              const recordAge = new Date() - new Date(record.createdAt)
              const isNew = recordAge < 24 * 60 * 60 * 1000 // Less than 24 hours
              
              if (isNew) return 'create'
              if (record.version > 1) return 'update'
              return 'view'
            }

            const activityType = getActivityType(record)
            
            return (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activityType === 'create' ? 'bg-green-100' :
                    activityType === 'update' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {activityType === 'create' && <Plus className="h-4 w-4 text-green-600" />}
                    {activityType === 'update' && <Edit className="h-4 w-4 text-blue-600" />}
                    {activityType === 'view' && <Eye className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div>
                    <p className="font-medium">
                      {activityType === 'create' ? 'Created medical record' :
                       activityType === 'update' ? 'Updated medical record' :
                       'Accessed medical record'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Patient: {record.patient?.firstName} {record.patient?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.visitType.replace('_', ' ')} - {record.diagnosis?.primary}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{getTimeAgo(record.createdAt)}</span>
              </div>
            )
          })}
          
          {recentRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Your recent medical records will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
