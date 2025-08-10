import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Video,
  FileText
} from 'lucide-react'

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data || [])
      } else {
        console.error('Failed to fetch appointments')
        setAppointments([])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/users?role=doctor', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.hospital.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isUpcoming = (date) => {
    return new Date(date) > new Date()
  }

  const handleBookAppointment = () => {
    setSelectedAppointment(null) // Clear any previously selected appointment for reschedule
    setShowBookModal(true)
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        })

        if (response.ok) {
          alert('Appointment cancelled successfully!')
          fetchAppointments() // Refresh the list
        } else {
          const errorData = await response.json()
          alert(`Failed to cancel appointment: ${errorData.message}`)
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        alert('An error occurred while cancelling the appointment.')
      }
    }
  }

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowBookModal(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const doctorId = form.doctor.value
    const date = form.date.value
    const time = form.time.value
    const reason = form.reason.value

    if (!doctorId || !date || !time || !reason) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      let response
      if (selectedAppointment) {
        // Reschedule existing appointment
        response = await fetch(`/api/appointments/${selectedAppointment._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ doctor: doctorId, date, time, reason, status: 'pending' })
        })
      } else {
        // Book new appointment
        response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ patient: user.id, doctor: doctorId, date, time, reason })
        })
      }

      if (response.ok) {
        alert(`Appointment ${selectedAppointment ? 'rescheduled' : 'booked'} successfully!`)
        setShowBookModal(false)
        setSelectedAppointment(null)
        fetchAppointments() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(`Failed to ${selectedAppointment ? 'reschedule' : 'book'} appointment: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error submitting appointment:', error)
      alert('An error occurred. Please try again.')
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
          <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground">
            Manage your medical appointments and consultations
          </p>
        </div>
        <button 
          onClick={handleBookAppointment}
          className="bg-medical-600 text-white px-4 py-2 rounded-lg hover:bg-medical-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Upcoming</h3>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'confirmed' && isUpcoming(a.date)).length}
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
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              <p className="text-2xl font-bold text-blue-600">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Cancelled</h3>
              <p className="text-2xl font-bold text-red-600">
                {appointments.filter(a => a.status === 'cancelled').length}
              </p>
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
              placeholder="Search appointments..."
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
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="medical-card">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-medical-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-medical-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {appointment.doctor.name}
                    </h3>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-medium">{formatDate(appointment.date)}</p>
                      <p className="text-sm text-muted-foreground">{appointment.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="font-medium">{appointment.doctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hospital</p>
                      <p className="font-medium">{appointment.hospital}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {appointment.visitType.replace('_', ' ')}
                    </span>
                    {appointment.notes && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {appointment.notes}
                      </span>
                    )}
                  </div>

                  {appointment.diagnosis && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Diagnosis:</strong> {appointment.diagnosis}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {isUpcoming(appointment.date) && appointment.status !== 'cancelled' && (
                  <>
                    <button 
                      onClick={() => handleRescheduleAppointment(appointment)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                      title="Reschedule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                      title="Cancel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" 
                      title="Video Call"
                    >
                      <Video className="h-4 w-4" />
                    </button>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <button 
                    className="p-2 text-medical-600 hover:bg-medical-100 rounded-lg transition-colors" 
                    title="View Records"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="medical-card text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'You have no appointments scheduled'}
            </p>
            <button 
              onClick={handleBookAppointment}
              className="bg-medical-600 text-white px-4 py-2 rounded-lg hover:bg-medical-700 transition-colors"
            >
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAppointment ? 'Reschedule Appointment' : 'Book New Appointment'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Doctor</label>
                <select 
                  name="doctor" 
                  defaultValue={selectedAppointment?.doctor?._id}
                  required
                  className="w-full p-3 border border-border rounded-lg"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedAppointment?.date ? new Date(selectedAppointment.date).toISOString().split('T')[0] : ''}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full p-3 border border-border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Time</label>
                <input
                  type="time"
                  name="time"
                  defaultValue={selectedAppointment?.time || ''}
                  required
                  className="w-full p-3 border border-border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                <textarea
                  name="reason"
                  rows={3}
                  defaultValue={selectedAppointment?.reason || ''}
                  required
                  className="w-full p-3 border border-border rounded-lg"
                  placeholder="Describe your symptoms or reason for consultation"
                />
              </div>
            
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookModal(false)
                    setSelectedAppointment(null)
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
                >
                  {selectedAppointment ? 'Reschedule' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
