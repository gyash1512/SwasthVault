import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { 
  Heart, 
  Calendar, 
  Pill, 
  FileText, 
  AlertTriangle, 
  QrCode,
  Clock,
  TrendingUp,
  User,
  Phone,
  MapPin,
  Download
} from 'lucide-react'

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRecords: 0,
    upcomingAppointments: 0,
    activeMedications: 0,
    lastVisit: null
  })

  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      // Fetch patient's medical records
      const response = await fetch(`/api/medical-records/patient/${user.id}/timeline`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMedicalRecords(data.data.records || [])
        
        // Calculate stats
        const records = data.data.records || []
        setStats({
          totalRecords: records.length,
          upcomingAppointments: records.filter(r => 
            r.treatment?.nextAppointment?.date && 
            new Date(r.treatment.nextAppointment.date) > new Date()
          ).length,
          activeMedications: records.reduce((acc, record) => 
            acc + (record.treatment?.medications?.length || 0), 0
          ),
          lastVisit: records.length > 0 ? records[0].visitDate : null
        })
      }
    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateEmergencyQR = () => {
    // Generate QR code for emergency access
    const emergencyData = {
      patientId: user.id,
      bloodGroup: user.bloodGroup,
      allergies: user.allergies,
      emergencyContact: user.emergencyContact
    }
    const qrData = btoa(JSON.stringify(emergencyData))
    return qrData
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-medical-500 to-health-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.firstName}!</h1>
            <p className="text-medical-100 mt-1">
              Your health dashboard - stay informed, stay healthy
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-medical-100">Patient ID</p>
            <p className="font-mono text-lg">{user.id?.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-medical-100 rounded-lg">
              <FileText className="h-6 w-6 text-medical-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Medical Records</h3>
              <p className="text-2xl font-bold text-medical-600">{stats.totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-health-100 rounded-lg">
              <Calendar className="h-6 w-6 text-health-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Upcoming Appointments</h3>
              <p className="text-2xl font-bold text-health-600">{stats.upcomingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Active Medications</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.activeMedications}</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Last Visit</h3>
              <p className="text-sm font-bold text-green-600">
                {stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'No visits'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Medical Records */}
        <div className="lg:col-span-2 medical-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Medical Records</h2>
            <button 
              onClick={() => navigate('/medical-records')}
              className="text-medical-600 hover:text-medical-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {medicalRecords.slice(0, 5).map((record) => (
              <div key={record._id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-medical-100 text-medical-700 rounded-full text-xs font-medium">
                        {record.visitType}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        v{record.version}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground">{record.diagnosis?.primary}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{record.chiefComplaint}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.visitDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/medical-records/${record._id}`)}
                    className="p-2 text-medical-600 hover:bg-medical-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {medicalRecords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No medical records found</p>
                <p className="text-sm">Your medical history will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Emergency QR Code & Quick Actions */}
        <div className="space-y-6">
          {/* Emergency QR Code */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emergency-600" />
              Emergency QR Code
            </h3>
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-emergency-300 mb-4">
                <QrCode className="h-24 w-24 mx-auto text-emergency-600" />
                <p className="text-xs text-muted-foreground mt-2">
                  QR Code for Emergency Access
                </p>
              </div>
              <button className="w-full bg-emergency-600 text-white py-2 px-4 rounded-lg hover:bg-emergency-700 transition-colors text-sm">
                <Download className="h-4 w-4 inline mr-2" />
                Download QR Code
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Show this to emergency personnel for instant access to critical medical info
              </p>
            </div>
          </div>

          {/* Health Alerts */}
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Health Alerts
            </h3>
            <div className="space-y-3">
              {user.allergies?.map((allergy, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Allergy: {allergy}</p>
                    <p className="text-xs text-red-600">Severe reaction possible</p>
                  </div>
                </div>
              ))}
              
              {user.chronicConditions?.map((condition, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Heart className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Condition: {condition}</p>
                    <p className="text-xs text-yellow-600">Ongoing management required</p>
                  </div>
                </div>
              ))}
              
              {(!user.allergies?.length && !user.chronicConditions?.length) && (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No health alerts</p>
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
            {user.emergencyContact ? (
              <div className="space-y-2">
                <p className="font-medium">{user.emergencyContact.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.emergencyContact.relationship}
                </p>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {user.emergencyContact.phoneNumber}
                </p>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No emergency contact set</p>
                <button className="text-medical-600 hover:text-medical-700 text-sm mt-2">
                  Add Contact
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="medical-card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/appointments')}
            className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Calendar className="h-8 w-8 text-medical-600 mb-2" />
            <span className="text-sm font-medium">Book Appointment</span>
          </button>
          
          <button 
            onClick={() => navigate('/medical-records')}
            className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <FileText className="h-8 w-8 text-health-600 mb-2" />
            <span className="text-sm font-medium">View Records</span>
          </button>
          
          <button 
            onClick={() => navigate('/medications')}
            className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Pill className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Medications</span>
          </button>
          
          <button 
            onClick={() => navigate('/health-trends')}
            className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium">Health Trends</span>
          </button>
        </div>
      </div>
    </div>
  )
}
