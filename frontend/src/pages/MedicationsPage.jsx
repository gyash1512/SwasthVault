import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Pill, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Search,
  Filter,
  Bell,
  Info,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'

export default function MedicationsPage() {
  const { user } = useAuth()
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      setLoading(true)
      
      // Test authentication first
      console.log('Testing authentication...')
      const testResponse = await fetch('/api/medical-records-enhanced/test', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (testResponse.ok) {
        const testData = await testResponse.json()
        console.log('Auth test successful:', testData)
      } else {
        console.error('Auth test failed:', testResponse.status, testResponse.statusText)
      }
      
      // Try to fetch medical records
      let response = await fetch(`/api/medical-records?patientId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const records = data.data?.records || []
        
        // Extract medications from all medical records
        const allMedications = []
        let medicationId = 1
        
        records.forEach(record => {
          if (record.treatment?.medications) {
            record.treatment.medications.forEach(med => {
              // Calculate status based on dates
              const startDate = new Date(med.startDate || record.visitDate)
              const endDate = med.endDate ? new Date(med.endDate) : null
              const now = new Date()
              
              let status = 'active'
              if (endDate && endDate < now) {
                status = 'completed'
              }
              
              // Calculate next dose
              let nextDose = null
              if (status === 'active') {
                const nextDoseDate = new Date()
                nextDoseDate.setHours(8, 0, 0, 0) // Default to 8 AM
                if (nextDoseDate < now) {
                  nextDoseDate.setDate(nextDoseDate.getDate() + 1)
                }
                nextDose = nextDoseDate.toISOString()
              }
              
              allMedications.push({
                id: medicationId++,
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions || 'Take as prescribed',
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate ? endDate.toISOString().split('T')[0] : null,
                status: status,
                prescribedBy: `Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}`,
                purpose: record.diagnosis?.primary || 'Medical treatment',
                sideEffects: [],
                nextDose: nextDose,
                adherence: Math.floor(Math.random() * 30) + 70, // Random adherence 70-100%
                recordId: record._id,
                visitDate: record.visitDate
              })
            })
          }
        })
        
        // Remove duplicates and sort by start date
        const uniqueMedications = allMedications.reduce((acc, current) => {
          const existing = acc.find(med => 
            med.name === current.name && 
            med.dosage === current.dosage
          )
          if (!existing) {
            acc.push(current)
          } else if (new Date(current.startDate) > new Date(existing.startDate)) {
            // Keep the more recent prescription
            const index = acc.indexOf(existing)
            acc[index] = current
          }
          return acc
        }, [])
        
        setMedications(uniqueMedications.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)))
      } else {
        console.error('Failed to fetch medical records')
        setMedications([])
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
      setMedications([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || med.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'discontinued': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAdherenceColor = (adherence) => {
    if (adherence >= 90) return 'text-green-600'
    if (adherence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatNextDose = (nextDose) => {
    if (!nextDose) return 'No upcoming dose'
    const date = new Date(nextDose)
    const now = new Date()
    const diffHours = Math.ceil((date - now) / (1000 * 60 * 60))
    
    if (diffHours < 0) return 'Overdue'
    if (diffHours < 24) return `In ${diffHours} hours`
    return date.toLocaleDateString()
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
          <h1 className="text-2xl font-bold text-foreground">My Medications</h1>
          <p className="text-muted-foreground">
            Track your medications, dosages, and adherence
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-medical-600 text-white px-4 py-2 rounded-lg hover:bg-medical-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medication
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-medical-100 rounded-lg">
              <Pill className="h-6 w-6 text-medical-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Active Medications</h3>
              <p className="text-2xl font-bold text-medical-600">
                {medications.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Adherence Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(medications.reduce((acc, m) => acc + m.adherence, 0) / medications.length)}%
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Next Dose</h3>
              <p className="text-sm font-bold text-blue-600">
                {formatNextDose(medications.find(m => m.status === 'active')?.nextDose)}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Alerts</h3>
              <p className="text-2xl font-bold text-yellow-600">2</p>
            </div>
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
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-4">
        {filteredMedications.map((medication) => (
          <div key={medication.id} className="medical-card">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-medical-100 rounded-lg">
                  <Pill className="h-6 w-6 text-medical-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {medication.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(medication.status)}`}>
                      {medication.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Dosage & Frequency</p>
                      <p className="font-medium">{medication.dosage} - {medication.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium">{medication.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prescribed by</p>
                      <p className="font-medium">{medication.prescribedBy}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Started: {new Date(medication.startDate).toLocaleDateString()}
                    </span>
                    {medication.endDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ends: {new Date(medication.endDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span className={getAdherenceColor(medication.adherence)}>
                        {medication.adherence}% adherence
                      </span>
                    </span>
                  </div>

                  {medication.instructions && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Info className="h-4 w-4 inline mr-1" />
                        {medication.instructions}
                      </p>
                    </div>
                  )}

                  {medication.nextDose && medication.status === 'active' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Next dose: {formatNextDose(medication.nextDose)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 text-medical-600 hover:bg-medical-100 rounded-lg transition-colors" title="View Details">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors" title="Set Reminder">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMedications.length === 0 && (
          <div className="medical-card text-center py-12">
            <Pill className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No medications found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your medications will appear here when prescribed'}
            </p>
          </div>
        )}
      </div>

      {/* Medication Reminders */}
      <div className="medical-card">
        <h2 className="text-xl font-semibold mb-4">Today's Medication Schedule</h2>
        <div className="space-y-3">
          {[
            { time: '08:00', medication: 'Lisinopril 10mg', status: 'taken' },
            { time: '12:00', medication: 'Vitamin D 1000IU', status: 'pending' },
            { time: '20:00', medication: 'Atorvastatin 20mg', status: 'upcoming' }
          ].map((reminder, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  reminder.status === 'taken' ? 'bg-green-500' :
                  reminder.status === 'pending' ? 'bg-yellow-500' :
                  'bg-gray-300'
                }`}></div>
                <div>
                  <p className="font-medium">{reminder.medication}</p>
                  <p className="text-sm text-muted-foreground">{reminder.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {reminder.status === 'pending' && (
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                    Mark Taken
                  </button>
                )}
                {reminder.status === 'upcoming' && (
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                    Set Reminder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
