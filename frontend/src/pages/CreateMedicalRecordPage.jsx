import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  User, 
  Calendar, 
  Stethoscope,
  Save,
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react'

export default function CreateMedicalRecordPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('Medical record created successfully!')
        navigate('/dashboard')
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error creating medical record:', error)
      alert('Failed to create medical record')
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
