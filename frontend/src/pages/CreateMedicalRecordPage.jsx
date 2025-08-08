import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  FileText, 
  User, 
  Calendar, 
  Stethoscope,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  File,
  Image,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function CreateMedicalRecordPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formData, setFormData] = useState({
    patient: '',
    visitType: 'consultation',
    visitDate: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    historyOfPresentIllness: '',
    physicalExamination: {
      general: '',
      cardiovascular: '',
      respiratory: '',
      other: ''
    },
    vitalSigns: {
      temperature: { value: '', unit: 'fahrenheit' },
      bloodPressure: { systolic: '', diastolic: '' },
      heartRate: { value: '' },
      respiratoryRate: { value: '' },
      oxygenSaturation: { value: '' },
      weight: { value: '', unit: 'kg' },
      height: { value: '', unit: 'cm' }
    },
    diagnosis: {
      primary: '',
      secondary: [],
      icdCodes: []
    },
    treatment: {
      medications: [],
      recommendations: [],
      followUpInstructions: ''
    },
    hospital: {
      name: 'City General Hospital',
      address: {
        street: '123 Hospital Road',
        city: 'Healthcare City',
        state: 'Medical State',
        pincode: '123456'
      },
      registrationNumber: 'HOSP001'
    }
  })

  useEffect(() => {
    if (user?.role !== 'doctor') {
      navigate('/dashboard')
      return
    }
    fetchPatients()
  }, [user, navigate])

  useEffect(() => {
    // Pre-select patient if coming from dashboard
    if (location.state?.patientId) {
      setFormData(prev => ({
        ...prev,
        patient: location.state.patientId
      }))
    }
  }, [location.state, patients])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/users?role=patient', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPatients(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleNestedInputChange = (parent, child, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }))
  }

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        medications: [
          ...prev.treatment.medications,
          {
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
          }
        ]
      }
    }))
  }

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        medications: prev.treatment.medications.filter((_, i) => i !== index)
      }
    }))
  }

  const updateMedication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        medications: prev.treatment.medications.map((med, i) => 
          i === index ? { ...med, [field]: value } : med
        )
      }
    }))
  }

  const addRecommendation = () => {
    const recommendation = prompt('Enter recommendation:')
    if (recommendation) {
      setFormData(prev => ({
        ...prev,
        treatment: {
          ...prev.treatment,
          recommendations: [...prev.treatment.recommendations, recommendation]
        }
      }))
    }
  }

  const removeRecommendation = (index) => {
    setFormData(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        recommendations: prev.treatment.recommendations.filter((_, i) => i !== index)
      }
    }))
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploadLoading(true)

    try {
      for (const file of files) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
        
        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} has an unsupported format. Please upload images, PDFs, or documents.`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', getFileType(file.type))
        formData.append('description', getFileDescription(file.name))

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          setUploadedFiles(prev => [...prev, {
            id: Date.now() + Math.random(),
            filename: file.name,
            originalName: file.name,
            size: file.size,
            type: file.type,
            url: data.url || data.filePath,
            uploadedAt: new Date().toISOString(),
            description: getFileDescription(file.name)
          }])
        } else {
          const errorData = await response.json()
          alert(`Failed to upload ${file.name}: ${errorData.message}`)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploadLoading(false)
    }
  }

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType === 'application/pdf') return 'lab-report'
    if (mimeType.includes('word') || mimeType === 'text/plain') return 'prescription'
    return 'other'
  }

  const getFileDescription = (filename) => {
    const name = filename.toLowerCase()
    if (name.includes('lab') || name.includes('test') || name.includes('blood')) return 'Lab Report'
    if (name.includes('xray') || name.includes('x-ray') || name.includes('scan')) return 'X-Ray/Scan'
    if (name.includes('prescription') || name.includes('rx')) return 'Prescription'
    if (name.includes('report')) return 'Medical Report'
    return 'Medical Document'
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setFieldErrors({})

    // Client-side validation
    const errors = {}
    if (!formData.patient) errors.patient = 'Please select a patient'
    if (!formData.chiefComplaint.trim()) errors.chiefComplaint = 'Chief complaint is required'
    if (!formData.diagnosis.primary.trim()) errors.primaryDiagnosis = 'Primary diagnosis is required'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Please fix the errors below')
      setLoading(false)
      return
    }

    try {
      // Include uploaded files in the form data
      const recordData = {
        ...formData,
        attachments: uploadedFiles.map(file => ({
          filename: file.filename,
          originalName: file.originalName,
          url: file.url,
          type: file.type,
          size: file.size,
          description: file.description,
          uploadedAt: file.uploadedAt
        }))
      }

      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Medical record created successfully! ${uploadedFiles.length > 0 ? `${uploadedFiles.length} files attached.` : ''}`)
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        // Handle specific field errors
        if (data.errors && Array.isArray(data.errors)) {
          const errors = {}
          data.errors.forEach(err => {
            if (err.path) {
              errors[err.path] = err.msg
            }
          })
          setFieldErrors(errors)
          setError('Please fix the errors below')
        } else if (data.message) {
          // Handle specific error messages
          if (data.message.includes('Patient not found')) {
            setFieldErrors({ patient: 'Selected patient not found. Please select a valid patient.' })
            setError('Invalid patient selection')
          } else if (data.message.includes('validation')) {
            setError(`Validation Error: ${data.message}`)
          } else if (data.message.includes('permission') || data.message.includes('authorized')) {
            setError('You do not have permission to create medical records for this patient')
          } else if (data.message.includes('duplicate')) {
            setError('A similar medical record already exists for this patient and date')
          } else {
            setError(data.message)
          }
        } else {
          setError('Failed to create medical record. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error creating medical record:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'doctor') {
    return <div>Access denied. Only doctors can create medical records.</div>
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
            <h1 className="text-2xl font-bold text-foreground">Create Medical Record</h1>
            <p className="text-muted-foreground">Add a new patient consultation record</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div className="medical-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-medical-600" />
            Patient Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Patient *</label>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName} - {patient.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Visit Type *</label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="consultation">Consultation</option>
                <option value="emergency">Emergency</option>
                <option value="surgery">Surgery</option>
                <option value="follow_up">Follow-up</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="vaccination">Vaccination</option>
                <option value="checkup">Checkup</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Visit Date *</label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="medical-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-medical-600" />
            Clinical Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Chief Complaint *</label>
              <textarea
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                placeholder="Patient's main concern or reason for visit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">History of Present Illness</label>
              <textarea
                name="historyOfPresentIllness"
                value={formData.historyOfPresentIllness}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                placeholder="Detailed history of the current condition"
              />
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="medical-card">
          <h2 className="text-lg font-semibold mb-4">Vital Signs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                value={formData.vitalSigns.temperature.value}
                onChange={(e) => handleNestedInputChange('vitalSigns', 'temperature', { ...formData.vitalSigns.temperature, value: e.target.value })}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                placeholder="98.6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Blood Pressure</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.vitalSigns.bloodPressure.systolic}
                  onChange={(e) => handleNestedInputChange('vitalSigns', 'bloodPressure', { ...formData.vitalSigns.bloodPressure, systolic: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                  placeholder="120"
                />
                <span className="flex items-center">/</span>
                <input
                  type="number"
                  value={formData.vitalSigns.bloodPressure.diastolic}
                  onChange={(e) => handleNestedInputChange('vitalSigns', 'bloodPressure', { ...formData.vitalSigns.bloodPressure, diastolic: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                  placeholder="80"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
              <input
                type="number"
                value={formData.vitalSigns.heartRate.value}
                onChange={(e) => handleNestedInputChange('vitalSigns', 'heartRate', { value: e.target.value })}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                placeholder="72"
              />
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="medical-card">
          <h2 className="text-lg font-semibold mb-4">Diagnosis</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Diagnosis *</label>
              <input
                type="text"
                name="diagnosis.primary"
                value={formData.diagnosis.primary}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                placeholder="Primary diagnosis"
              />
            </div>
          </div>
        </div>

        {/* Treatment */}
        <div className="medical-card">
          <h2 className="text-lg font-semibold mb-4">Treatment</h2>
          
          <div className="space-y-6">
            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Medications</h3>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center gap-2 px-3 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Medication
                </button>
              </div>
              
              {formData.treatment.medications.map((medication, index) => (
                <div key={index} className="border border-border rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Medication Name</label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                        placeholder="e.g., Lisinopril"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Dosage</label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                        placeholder="e.g., 10mg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Frequency</label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                        placeholder="e.g., Once daily"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                        placeholder="e.g., 30 days"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Instructions</label>
                    <textarea
                      value={medication.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      rows={2}
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                      placeholder="Special instructions for taking this medication"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Recommendations</h3>
                <button
                  type="button"
                  onClick={addRecommendation}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Recommendation
                </button>
              </div>
              
              {formData.treatment.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-2">
                  <span>{recommendation}</span>
                  <button
                    type="button"
                    onClick={() => removeRecommendation(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Follow-up Instructions */}
            <div>
              <label className="block text-sm font-medium mb-2">Follow-up Instructions</label>
              <textarea
                name="treatment.followUpInstructions"
                value={formData.treatment.followUpInstructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                placeholder="Instructions for follow-up care"
              />
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="medical-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-medical-600" />
            Medical Documents & Files
          </h2>
          
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="p-3 bg-medical-100 rounded-full">
                  <Upload className="h-8 w-8 text-medical-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {uploadLoading ? 'Uploading...' : 'Upload Medical Files'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lab reports, X-rays, prescriptions, or other medical documents
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports: Images (JPG, PNG), PDF, Word documents (Max 10MB each)
                  </p>
                </div>
                {uploadLoading && (
                  <div className="loading-spinner"></div>
                )}
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Uploaded Files ({uploadedFiles.length})</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-border">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{file.originalName}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{file.description}</span>
                            <span>{formatFileSize(file.size)}</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.type.startsWith('image/') && (
                          <button
                            type="button"
                            onClick={() => window.open(file.url, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Image"
                          >
                            <Image className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Download File"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Remove File"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Type Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">File Upload Guidelines</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
                <div>
                  <p className="font-medium">📋 Lab Reports</p>
                  <p>Blood tests, urine tests, pathology reports</p>
                </div>
                <div>
                  <p className="font-medium">🩻 X-Rays & Scans</p>
                  <p>X-ray images, CT scans, MRI reports</p>
                </div>
                <div>
                  <p className="font-medium">💊 Prescriptions</p>
                  <p>Previous prescriptions, medication lists</p>
                </div>
                <div>
                  <p className="font-medium">📄 Medical Reports</p>
                  <p>Specialist reports, discharge summaries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {Object.entries(fieldErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create Medical Record'}
          </button>
        </div>
      </form>
    </div>
  )
}
