import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  AlertTriangle,
  Clock,
  Download,
  Eye,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function PatientHistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { patientId } = useParams()
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState(null)
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [expandedRecord, setExpandedRecord] = useState(null)

  useEffect(() => {
    if (user?.role !== 'doctor') {
      navigate('/dashboard')
      return
    }
    if (patientId) {
      fetchPatientHistory()
    }
  }, [user, navigate, patientId])

  useEffect(() => {
    filterRecords()
  }, [records, searchTerm, filterType])

  const fetchPatientHistory = async () => {
    try {
      setLoading(true)
      
      // Fetch patient details
      const patientResponse = await fetch(`/api/users/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (patientResponse.ok) {
        const patientData = await patientResponse.json()
        setPatient(patientData.data)
      }
      
      // Fetch patient's medical records
      const recordsResponse = await fetch(`/api/medical-records?patientId=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        setRecords(recordsData.data || [])
      } else {
        console.error('Failed to fetch medical records')
        setRecords([])
      }
      
    } catch (error) {
      console.error('Error fetching patient history:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = records

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis?.primary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.treatment?.medications?.some(med => 
          med.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filter by visit type
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.visitType === filterType)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))

    setFilteredRecords(filtered)
  }

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId)
  }

  const getVisitTypeColor = (visitType) => {
    switch (visitType) {
      case 'emergency': return 'bg-red-100 text-red-700'
      case 'surgery': return 'bg-purple-100 text-purple-700'
      case 'follow_up': return 'bg-blue-100 text-blue-700'
      case 'consultation': return 'bg-green-100 text-green-700'
      case 'diagnostic': return 'bg-yellow-100 text-yellow-700'
      case 'vaccination': return 'bg-indigo-100 text-indigo-700'
      case 'checkup': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">Patient not found</h3>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-medical-600 hover:text-medical-700"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patient Medical History</h1>
            <p className="text-muted-foreground">Complete medical records and timeline</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4" />
          Export History
        </button>
      </div>

      {/* Patient Information Card */}
      <div className="medical-card">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center">
              <span className="text-medical-600 font-bold text-xl">
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{calculateAge(patient.dateOfBirth)} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{patient.bloodGroup || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{patient.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Patient ID</p>
            <p className="font-mono text-sm">{patient._id}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="medical-card">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search records by complaint, diagnosis, or medication..."
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
            <option value="all">All Visits</option>
            <option value="consultation">Consultation</option>
            <option value="emergency">Emergency</option>
            <option value="surgery">Surgery</option>
            <option value="follow_up">Follow-up</option>
            <option value="diagnostic">Diagnostic</option>
            <option value="vaccination">Vaccination</option>
            <option value="checkup">Checkup</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </div>

      {/* Medical Records Timeline */}
      <div className="space-y-4">
        {filteredRecords.map((record, index) => (
          <div key={record._id} className="medical-card">
            {/* Record Header */}
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleRecordExpansion(record._id)}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-medical-600 rounded-full"></div>
                  {index < filteredRecords.length - 1 && (
                    <div className="w-0.5 h-16 bg-border mt-2"></div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{record.chiefComplaint}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitTypeColor(record.visitType)}`}>
                      {record.visitType.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(record.visitDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {record.diagnosis?.primary}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                {expandedRecord === record._id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Expanded Record Details */}
            {expandedRecord === record._id && (
              <div className="mt-6 pt-6 border-t border-border space-y-6">
                {/* Clinical Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* History and Examination */}
                  <div className="space-y-4">
                    {record.historyOfPresentIllness && (
                      <div>
                        <h4 className="font-medium mb-2">History of Present Illness</h4>
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                          {record.historyOfPresentIllness}
                        </p>
                      </div>
                    )}
                    
                    {record.physicalExamination && (
                      <div>
                        <h4 className="font-medium mb-2">Physical Examination</h4>
                        <div className="space-y-2 text-sm">
                          {record.physicalExamination.general && (
                            <p><span className="font-medium">General:</span> {record.physicalExamination.general}</p>
                          )}
                          {record.physicalExamination.cardiovascular && (
                            <p><span className="font-medium">Cardiovascular:</span> {record.physicalExamination.cardiovascular}</p>
                          )}
                          {record.physicalExamination.respiratory && (
                            <p><span className="font-medium">Respiratory:</span> {record.physicalExamination.respiratory}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vital Signs */}
                  {record.vitalSigns && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Vital Signs
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {record.vitalSigns.temperature?.value && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-muted-foreground">Temperature</p>
                            <p className="font-medium">{record.vitalSigns.temperature.value}°F</p>
                          </div>
                        )}
                        {record.vitalSigns.bloodPressure?.systolic && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-muted-foreground">Blood Pressure</p>
                            <p className="font-medium">{record.vitalSigns.bloodPressure.systolic}/{record.vitalSigns.bloodPressure.diastolic} mmHg</p>
                          </div>
                        )}
                        {record.vitalSigns.heartRate?.value && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-muted-foreground">Heart Rate</p>
                            <p className="font-medium">{record.vitalSigns.heartRate.value} bpm</p>
                          </div>
                        )}
                        {record.vitalSigns.weight?.value && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-muted-foreground">Weight</p>
                            <p className="font-medium">{record.vitalSigns.weight.value} {record.vitalSigns.weight.unit}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Diagnosis */}
                <div>
                  <h4 className="font-medium mb-2">Diagnosis</h4>
                  <div className="space-y-2">
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Primary: {record.diagnosis?.primary}</p>
                    </div>
                    {record.diagnosis?.secondary?.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">
                          Secondary: {record.diagnosis.secondary.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Treatment */}
                {record.treatment && (
                  <div className="space-y-4">
                    {/* Medications */}
                    {record.treatment.medications?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          Medications Prescribed
                        </h4>
                        <div className="space-y-3">
                          {record.treatment.medications.map((medication, medIndex) => (
                            <div key={medIndex} className="border border-border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium">{medication.name}</h5>
                                  <p className="text-sm text-muted-foreground">
                                    {medication.dosage} - {medication.frequency}
                                  </p>
                                  {medication.duration && (
                                    <p className="text-sm text-muted-foreground">Duration: {medication.duration}</p>
                                  )}
                                  {medication.instructions && (
                                    <p className="text-sm text-blue-600 mt-1">{medication.instructions}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {record.treatment.recommendations?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {record.treatment.recommendations.map((recommendation, recIndex) => (
                            <li key={recIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-medical-600 rounded-full mt-2 flex-shrink-0"></span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Follow-up Instructions */}
                    {record.treatment.followUpInstructions && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Follow-up Instructions
                        </h4>
                        <p className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          {record.treatment.followUpInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Lab Results */}
                {record.labResults?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Lab Results</h4>
                    <div className="space-y-3">
                      {record.labResults.map((lab, labIndex) => (
                        <div key={labIndex} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{lab.testName}</h5>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(lab.testDate)}
                            </span>
                          </div>
                          {lab.results?.map((result, resultIndex) => (
                            <div key={resultIndex} className="flex items-center justify-between py-1">
                              <span className="text-sm">{result.parameter}</span>
                              <span className={`text-sm font-medium ${
                                result.status === 'abnormal' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {result.value} {result.unit}
                              </span>
                            </div>
                          ))}
                          {lab.interpretation && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              {lab.interpretation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Files */}
                {record.attachments?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Attached Medical Files ({record.attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {record.attachments.map((attachment, attachIndex) => (
                        <div key={attachIndex} className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                {attachment.type?.startsWith('image/') ? (
                                  <FileText className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <FileText className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">
                                  {attachment.originalName || attachment.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {attachment.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span>{formatFileSize(attachment.size)}</span>
                                  <span>{formatDate(attachment.uploadedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {attachment.type?.startsWith('image/') && (
                                <button
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  title="View Image"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => window.open(attachment.url, '_blank')}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Download File"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                : 'This patient has no medical records yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
