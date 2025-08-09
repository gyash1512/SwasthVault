import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'
import { 
  Calendar, 
  Clock, 
  User, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react'

export default function DoctorSchedulePage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('day') // day, week, month
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchSchedule()
  }, [selectedDate, viewMode])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      // Mock schedule data - in real implementation, fetch from API
      const mockAppointments = [
        {
          id: '1',
          patientName: 'John Doe',
          patientId: 'patient1',
          time: '09:00',
          duration: 30,
          type: 'consultation',
          status: 'confirmed',
          notes: 'Regular checkup',
          date: selectedDate
        },
        {
          id: '2',
          patientName: 'Jane Smith',
          patientId: 'patient2',
          time: '10:30',
          duration: 45,
          type: 'follow_up',
          status: 'confirmed',
          notes: 'Follow-up for blood pressure',
          date: selectedDate
        },
        {
          id: '3',
          patientName: 'Mike Johnson',
          patientId: 'patient3',
          time: '14:00',
          duration: 30,
          type: 'consultation',
          status: 'pending',
          notes: 'New patient consultation',
          date: selectedDate
        }
      ]
      setAppointments(mockAppointments)
    } catch (err) {
      console.error('Error fetching schedule:', err)
      error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      )
    )
    success(`Appointment ${newStatus}`)
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const getAppointmentForTime = (time) => {
    return appointments.find(apt => apt.time === time)
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
          <h1 className="text-2xl font-bold text-foreground">My Schedule</h1>
          <p className="text-muted-foreground">
            Manage your appointments and availability
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Appointment
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="medical-card">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">View</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="day">Day View</option>
                <option value="week">Week View</option>
                <option value="month">Month View</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Confirmed</h3>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Patients</h3>
              <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-medical-100 rounded-lg">
              <Calendar className="h-6 w-6 text-medical-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Available Slots</h3>
              <p className="text-2xl font-bold text-medical-600">
                {generateTimeSlots().length - appointments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule View */}
      <div className="medical-card">
        <h2 className="text-xl font-semibold mb-4">
          Schedule for {new Date(selectedDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>

        <div className="space-y-2">
          {generateTimeSlots().map(time => {
            const appointment = getAppointmentForTime(time)
            
            return (
              <div key={time} className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-20 text-sm font-medium text-muted-foreground">
                  {time}
                </div>
                
                {appointment ? (
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{appointment.patientName}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {appointment.duration} min
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-muted-foreground text-sm">
                    Available
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Appointment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Patient Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-border rounded-lg"
                  placeholder="Enter patient name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <select className="w-full p-3 border border-border rounded-lg">
                  <option value="">Select time</option>
                  {generateTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <select className="w-full p-3 border border-border rounded-lg">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select className="w-full p-3 border border-border rounded-lg">
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  rows={3}
                  className="w-full p-3 border border-border rounded-lg"
                  placeholder="Additional notes"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  success('Appointment added successfully!')
                  setShowAddModal(false)
                }}
                className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
              >
                Add Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
