import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  User, 
  Calendar,
  Phone,
  MapPin,
  Heart,
  AlertTriangle,
  Eye,
  FileText,
  Clock,
  Download
} from 'lucide-react'

export default function PatientSearchPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    bloodGroup: '',
    gender: '',
    ageRange: '',
    hasAllergies: false,
    hasChronicConditions: false
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [searchTerm, filters])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      // Mock patient data - in real implementation, fetch from API
      const mockPatients = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phoneNumber: '+91-9876543210',
          dateOfBirth: '1985-06-15',
          gender: 'male',
          bloodGroup: 'O+',
          allergies: ['Penicillin', 'Peanuts'],
          chronicConditions: ['Hypertension'],
          address: {
            city: 'Mumbai',
            state: 'Maharashtra'
          },
          lastVisit: '2024-01-15',
          totalVisits: 5
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@email.com',
          phoneNumber: '+91-9876543211',
          dateOfBirth: '1990-03-22',
          gender: 'female',
          bloodGroup: 'A+',
          allergies: [],
          chronicConditions: ['Diabetes'],
          address: {
            city: 'Delhi',
            state: 'Delhi'
          },
          lastVisit: '2024-02-10',
          totalVisits: 8
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@email.com',
          phoneNumber: '+91-9876543212',
          dateOfBirth: '1978-11-08',
          gender: 'male',
          bloodGroup: 'B+',
          allergies: ['Shellfish'],
          chronicConditions: [],
          address: {
            city: 'Bangalore',
            state: 'Karnataka'
          },
          lastVisit: '2024-01-28',
          totalVisits: 3
        }
      ]

      // Apply filters
      let filteredPatients = mockPatients

      if (searchTerm) {
        filteredPatients = filteredPatients.filter(patient =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phoneNumber.includes(searchTerm)
        )
      }

      if (filters.bloodGroup) {
        filteredPatients = filteredPatients.filter(patient => patient.bloodGroup === filters.bloodGroup)
      }

      if (filters.gender) {
        filteredPatients = filteredPatients.filter(patient => patient.gender === filters.gender)
      }

      if (filters.hasAllergies) {
        filteredPatients = filteredPatients.filter(patient => patient.allergies.length > 0)
      }

      if (filters.hasChronicConditions) {
        filteredPatients = filteredPatients.filter(patient => patient.chronicConditions.length > 0)
      }

      setPatients(filteredPatients)
    } catch (err) {
      console.error('Error fetching patients:', err)
      error('Failed to load patients')
    } finally {
      setLoading(false)
    }
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

  const handleViewPatient = (patientId) => {
    navigate(`/patient-history/${patientId}`)
  }

  const handleExportData = () => {
    const csvData = patients.map(patient => ({
      Name: `${patient.firstName} ${patient.lastName}`,
      Email: patient.email,
      Phone: patient.phoneNumber,
      Age: calculateAge(patient.dateOfBirth),
      Gender: patient.gender,
      'Blood Group': patient.bloodGroup,
      'Last Visit': patient.lastVisit,
      'Total Visits': patient.totalVisits,
      City: patient.address.city,
      State: patient.address.state
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patients-search-results.csv`
    a.click()
    URL.revokeObjectURL(url)
    success('Patient data exported successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Search</h1>
          <p className="text-muted-foreground">
            Search and filter patients across the system
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportData}
            disabled={patients.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Results
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="medical-card">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={filters.bloodGroup}
              onChange={(e) => setFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <option value="">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
            </button>

            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({
                  bloodGroup: '',
                  gender: '',
                  ageRange: '',
                  hasAllergies: false,
                  hasChronicConditions: false
                })
              }}
              className="px-4 py-2 text-medical-600 hover:bg-medical-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasAllergies}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasAllergies: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Has Allergies</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasChronicConditions}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasChronicConditions: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Has Chronic Conditions</span>
                </label>
              </div>

              <select
                value={filters.ageRange}
                onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="">All Ages</option>
                <option value="0-18">0-18 years</option>
                <option value="19-35">19-35 years</option>
                <option value="36-50">36-50 years</option>
                <option value="51-65">51-65 years</option>
                <option value="65+">65+ years</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="medical-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Search Results</h3>
            <p className="text-muted-foreground">
              Found {patients.length} patient{patients.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          {loading && (
            <div className="loading-spinner"></div>
          )}
        </div>
      </div>

      {/* Patient Results */}
      <div className="space-y-4">
        {patients.map((patient) => (
          <div key={patient.id} className="medical-card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-medical-600">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <span className="px-2 py-1 bg-medical-100 text-medical-700 rounded-full text-xs font-medium">
                      {patient.bloodGroup}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {calculateAge(patient.dateOfBirth)} years, {patient.gender}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {patient.phoneNumber}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {patient.address.city}, {patient.address.state}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Medical Alerts */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {patient.allergies.length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span className="text-red-800">
                          {patient.allergies.length} allerg{patient.allergies.length === 1 ? 'y' : 'ies'}
                        </span>
                      </div>
                    )}
                    
                    {patient.chronicConditions.length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <Heart className="h-3 w-3 text-yellow-600" />
                        <span className="text-yellow-800">
                          {patient.chronicConditions.length} chronic condition{patient.chronicConditions.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Total visits: {patient.totalVisits}</span>
                    <span>Patient ID: {patient.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewPatient(patient.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors text-sm"
                >
                  <Eye className="h-4 w-4" />
                  View History
                </button>
                <button
                  onClick={() => navigate(`/create-record?patientId=${patient.id}`)}
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                >
                  <FileText className="h-4 w-4" />
                  New Record
                </button>
              </div>
            </div>
          </div>
        ))}

        {patients.length === 0 && !loading && (
          <div className="medical-card text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search criteria or filters' 
                : 'Start by searching for a patient name, email, or phone number'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
