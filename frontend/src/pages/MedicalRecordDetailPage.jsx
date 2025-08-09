import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  Heart,
  Pill,
  Activity,
  TrendingUp,
  ChevronLeft,
  Edit,
  Printer,
  Share
} from 'lucide-react'

export default function MedicalRecordDetailPage() {
  const { recordId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMedicalRecord()
  }, [recordId])

  const fetchMedicalRecord = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/medical-records-enhanced/${recordId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecord(data.data)
      }
    } catch (error) {
      console.error('Error fetching medical record:', error)
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

  if (!record) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Medical Record Not Found</h2>
        <p className="text-muted-foreground">
          The requested medical record could not be found.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-medical-600 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Records
        </button>
        
        <div className="flex gap-2">
          <button className="p-2 border rounded-lg hover:bg-muted/50">
            <Share className="h-4 w-4" />
          </button>
          <button className="p-2 border rounded-lg hover:bg-muted/50">
            <Printer className="h-4 w-4" />
          </button>
          {user.role === 'doctor' && (
            <button className="p-2 border rounded-lg hover:bg-muted/50">
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Record Details */}
      <div className="medical-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {record.diagnosis?.primary}
            </h1>
            <p className="text-muted-foreground">{record.chiefComplaint}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700`}>
            {record.visitType?.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Dr. {record.doctor?.firstName} {record.doctor?.lastName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(record.visitDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Version {record.version}</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vital Signs */}
          {record.vitalSigns && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-600" />
                Vital Signs
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <p><strong>BP:</strong> {record.vitalSigns.bloodPressure.systolic}/{record.vitalSigns.bloodPressure.diastolic} mmHg</p>
                <p><strong>Heart Rate:</strong> {record.vitalSigns.heartRate.value} bpm</p>
                <p><strong>Temperature:</strong> {record.vitalSigns.temperature.value}°{record.vitalSigns.temperature.unit === 'celsius' ? 'C' : 'F'}</p>
                <p><strong>Weight:</strong> {record.vitalSigns.weight.value} {record.vitalSigns.weight.unit}</p>
              </div>
            </div>
          )}

          {/* Medications */}
          {record.treatment?.medications?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                Medications
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {record.treatment.medications.map((med, idx) => (
                  <li key={idx}>{med.name} - {med.dosage} {med.frequency}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lab Results */}
          {record.labResults?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Lab Results
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {record.labResults.map((lab, idx) => (
                  <li key={idx}>
                    {lab.testName}: {lab.result} {lab.units} (Ref: {lab.referenceRange})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Physical Examination */}
          {record.physicalExamination && (
            <div>
              <h3 className="font-semibold mb-2">Physical Examination</h3>
              <p className="text-muted-foreground">{record.physicalExamination.general}</p>
            </div>
          )}

          {/* Treatment Plan */}
          {record.treatment?.recommendations?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Treatment Recommendations</h3>
              <ul className="list-disc list-inside space-y-1">
                {record.treatment.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
