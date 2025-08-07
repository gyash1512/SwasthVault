import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  Edit, 
  Share, 
  History,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Heart,
  Pill,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

export default function MedicalRecordsPage({ viewMode = 'patient' }) {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versionHistory, setVersionHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [expandedRecord, setExpandedRecord] = useState(null)

  useEffect(() => {
    fetchMedicalRecords()
  }, [viewMode])

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true)
      let endpoint = ''
      
      if (viewMode === 'patient') {
        endpoint = `/api/medical-records-enhanced/patient/${user.id}/timeline`
      } else if (viewMode === 'doctor') {
        endpoint = '/api/doctors/patients'
      } else {
        endpoint = `/api/medical-records-enhanced/patient/${user.id}/timeline`
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecords(data.data?.records || data.data || [])
      }
    } catch (error) {
      console.error('Error fetching medical records:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVersionHistory = async (recordId) => {
    try {
      const response = await fetch(`/api/medical-records-enhanced/${recordId}/versions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setVersionHistory(data.data.versionHistory || [])
        setShowVersionHistory(true)
      }
    } catch (error) {
      console.error('Error fetching version history:', error)
    }
  }

  const handleViewRecord = (record) => {
    setSelectedRecord(record)
    setExpandedRecord(expandedRecord === record._id ? null : record._id)
  }

  const handleViewVersionHistory = (record) => {
    fetchVersionHistory(record._id)
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.diagnosis?.primary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = 
      filterType === 'all' || 
      record.visitType === filterType

    return matchesSearch && matchesFilter
  })

  const getVersionBadgeColor = (version) => {
    if (version === 1) return 'bg-green-100 text-green-700'
    if (version <= 3) return 'bg-blue-100 text-blue-700'
    return 'bg-purple-100 text-purple-700'
  }

  const getVisitTypeColor = (visitType) => {
    switch (visitType) {
      case 'emergency': return 'bg-red-100 text-red-700'
      case 'consultation': return 'bg-blue-100 text-blue-700'
      case 'follow_up': return 'bg-green-100 text-green-700'
      case 'surgery': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
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
          <h1 className="text-2xl font-bold text-foreground">
            {viewMode === 'patient' ? 'My Medical Records' : 
             viewMode === 'doctor' ? 'Patient Records' : 'Medical Records'}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'patient' ? 'Your complete medical history with version control' :
             'Manage and view patient medical records'}
          </p>
        </div>
        
        {viewMode === 'doctor' && (
          <button className="bg-medical-600 text-white px-4 py-2 rounded-lg hover:bg-medical-700 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Record
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="medical-card">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search records by diagnosis, complaint, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow_up">Follow-up</option>
            <option value="emergency">Emergency</option>
            <option value="surgery">Surgery</option>
            <option value="checkup">Check-up</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <FileText className="h-5 w-5 text-medical-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="font-semibold">{records.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <History className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Versions</p>
              <p className="font-semibold">{records.reduce((acc, r) => acc + (r.version || 1), 0)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <User className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Doctors</p>
              <p className="font-semibold">{new Set(records.map(r => r.doctor?._id)).size}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Last Visit</p>
              <p className="font-semibold text-sm">
                {records.length > 0 ? new Date(records[0].visitDate).toLocaleDateString() : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Records Timeline */}
      <div className="space-y-4">
        {filteredRecords.map((record, index) => (
          <div key={record._id} className="medical-card">
            {/* Record Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-medical-600" />
                  </div>
                  {index < filteredRecords.length - 1 && (
                    <div className="w-0.5 h-16 bg-border mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitTypeColor(record.visitType)}`}>
                      {record.visitType?.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionBadgeColor(record.version)}`}>
                      v{record.version || 1}
                    </span>
                    {record.isEmergencyAccessible && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Emergency Access
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {record.diagnosis?.primary || 'No diagnosis'}
                  </h3>
                  <p className="text-muted-foreground mb-2">{record.chiefComplaint}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(record.visitDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(record.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewRecord(record)}
                  className="p-2 text-medical-600 hover:bg-medical-100 rounded-lg transition-colors"
                  title="View Details"
                >
                  {expandedRecord === record._id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => handleViewVersionHistory(record)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Version History"
                >
                  <History className="h-4 w-4" />
                </button>
                {viewMode === 'doctor' && (
                  <button 
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Edit Record"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                <button 
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Share Record"
                >
                  <Share className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expanded Record Details */}
            {expandedRecord === record._id && (
              <div className="border-t border-border pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Vital Signs */}
                  {record.vitalSigns && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-red-600" />
                        Vital Signs
                      </h4>
                      <div className="space-y-1 text-sm">
                        {record.vitalSigns.bloodPressure && (
                          <p>BP: {record.vitalSigns.bloodPressure.systolic}/{record.vitalSigns.bloodPressure.diastolic} mmHg</p>
                        )}
                        {record.vitalSigns.heartRate && (
                          <p>Heart Rate: {record.vitalSigns.heartRate.value} bpm</p>
                        )}
                        {record.vitalSigns.temperature && (
                          <p>Temperature: {record.vitalSigns.temperature.value}°{record.vitalSigns.temperature.unit === 'celsius' ? 'C' : 'F'}</p>
                        )}
                        {record.vitalSigns.weight && (
                          <p>Weight: {record.vitalSigns.weight.value} {record.vitalSigns.weight.unit}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {record.treatment?.medications?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-600" />
                        Medications
                      </h4>
                      <div className="space-y-1 text-sm">
                        {record.treatment.medications.slice(0, 3).map((med, idx) => (
                          <p key={idx}>{med.name} - {med.dosage} {med.frequency}</p>
                        ))}
                        {record.treatment.medications.length > 3 && (
                          <p className="text-muted-foreground">+{record.treatment.medications.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lab Results */}
                  {record.labResults?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Lab Results
                      </h4>
                      <div className="space-y-1 text-sm">
                        {record.labResults.slice(0, 2).map((lab, idx) => (
                          <div key={idx}>
                            <p className="font-medium">{lab.testName}</p>
                            <p className="text-muted-foreground">{new Date(lab.testDate).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Allergies & Alerts */}
                {record.allergies?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="font-medium flex items-center gap-2 text-red-800 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Allergies & Alerts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {record.allergies.map((allergy, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                          {allergy.allergen} ({allergy.severity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Physical Examination */}
                {record.physicalExamination && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Physical Examination</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Object.entries(record.physicalExamination).map(([system, finding]) => (
                        finding && (
                          <div key={system}>
                            <p className="font-medium capitalize">{system.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-muted-foreground">{finding}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment Plan */}
                {record.treatment?.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Treatment Recommendations</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {record.treatment.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-muted-foreground">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="medical-card text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No medical records found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your medical records will appear here as they are created'}
            </p>
          </div>
        )}
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Version History</h3>
              <button 
                onClick={() => setShowVersionHistory(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {versionHistory.map((version) => (
                <div key={version.version} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Version {version.version}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(version.modifiedDate).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Modified by: {version.modifiedBy?.firstName} {version.modifiedBy?.lastName}
                  </p>
                  <p className="text-sm">{version.changeReason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
