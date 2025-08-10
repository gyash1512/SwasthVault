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
      
      // Fetch medical records
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
        records.forEach(record => {
          if (record.treatment?.medications) {
            record.treatment.medications.forEach(med => {
              allMedications.push({
                id: med._id || `${record._id}-${med.name}`, // Use _id if available, otherwise generate
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions || 'Take as prescribed',
                startDate: med.startDate ? new Date(med.startDate).toISOString().split('T')[0] : new Date(record.visitDate).toISOString().split('T')[0],
                endDate: med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : null,
                status: med.endDate && new Date(med.endDate) < new Date() ? 'completed' : 'active', // Simple status based on end date
                prescribedBy: `Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}`,
                purpose: record.diagnosis?.primary || 'Medical treatment',
                recordId: record._id,
                visitDate: record.visitDate
              })
            })
          }
        })
        
        // Filter out duplicates (same medication, dosage, and doctor) and sort by start date
        const uniqueMedications = []
        const seen = new Set()
        allMedications.forEach(med => {
          const identifier = `${med.name}-${med.dosage}-${med.prescribedBy}`
          if (!seen.has(identifier)) {
            uniqueMedications.push(med)
            seen.add(identifier)
          }
        })
        
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
    // Adherence is not calculated from backend, so this is dummy
    return 'text-gray-600'
  }

  const formatNextDose = (nextDose) => {
    // Next dose is not calculated from backend, so this is dummy
    return 'N/A'
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
            N/A
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
          <p className="text-2xl font-bold text-yellow-600">N/A</p>
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
                  {/* <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span className={getAdherenceColor(medication.adherence)}>
                      {medication.adherence}% adherence
                    </span>
                  </span> */}
                  </div>

                  {medication.instructions && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Info className="h-4 w-4 inline mr-1" />
                        {medication.instructions}
                      </p>
                    </div>
                  )}

                  {/* Removed nextDose calculation as it's complex without a dedicated backend */}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => alert('View details functionality coming soon!')}
                  className="p-2 text-medical-600 hover:bg-medical-100 rounded-lg transition-colors" 
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => alert('Edit functionality coming soon!')}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => alert('Set reminder functionality coming soon!')}
                  className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors" 
                  title="Set Reminder"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => alert('Remove functionality coming soon!')}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                  title="Remove"
                >
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
          {medications.filter(med => med.status === 'active').map((medication, index) => {
            // Simplified schedule for demo purposes
            const scheduleTimes = ['08:00', '14:00', '20:00']; // Example times
            
            return scheduleTimes.map((time, timeIndex) => {
              const now = new Date();
              const [hours, minutes] = time.split(':');
              const scheduleTime = new Date();
              scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              
              let status = 'upcoming';
              if (scheduleTime < now) {
                status = Math.random() > 0.5 ? 'taken' : 'pending'; // Random for demo
              }
              
              return (
                <div key={`${index}-${timeIndex}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'taken' ? 'bg-green-500' :
                      status === 'pending' ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="font-medium">{medication.name} {medication.dosage}</p>
                      <p className="text-sm text-muted-foreground">{time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {status === 'pending' && (
                      <button 
                        onClick={() => alert(`Marked ${medication.name} as taken for ${time}`)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Mark Taken
                      </button>
                    )}
                    {status === 'upcoming' && (
                      <button 
                        onClick={() => alert(`Reminder set for ${medication.name} at ${time}`)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Set Reminder
                      </button>
                    )}
                    {status === 'taken' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                        ✓ Taken
                      </span>
                    )}
                  </div>
                </div>
              );
            });
          }).flat()}
          
          {medications.filter(med => med.status === 'active').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active medications scheduled for today</p>
              <p className="text-sm">Your medication schedule will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
