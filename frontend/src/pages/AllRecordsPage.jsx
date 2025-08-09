import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  FileText, 
  Search, 
  Filter,
  User,
  Clock
} from 'lucide-react'

export default function AllRecordsPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchAllRecords()
  }, [])

  const fetchAllRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/medical-records', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecords(data.data)
      }
    } catch (error) {
      console.error('Error fetching all records:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.diagnosis?.primary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = 
      filterType === 'all' || 
      record.visitType === filterType

    return matchesSearch && matchesFilter
  })

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Medical Records</h1>
        <p className="text-muted-foreground">
          System-wide view of all medical records
        </p>
      </div>

      {/* Search and Filter */}
      <div className="medical-card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by patient, doctor, or diagnosis..."
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
      </div>

      {/* Records Table */}
      <div className="medical-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4">Patient</th>
              <th className="p-4">Doctor</th>
              <th className="p-4">Diagnosis</th>
              <th className="p-4">Visit Type</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(record => (
              <tr key={record._id} className="border-b border-border">
                <td className="p-4">{record.patient?.firstName} {record.patient?.lastName}</td>
                <td className="p-4">{record.doctor?.firstName} {record.doctor?.lastName}</td>
                <td className="p-4">{record.diagnosis?.primary}</td>
                <td className="p-4 capitalize">{record.visitType.replace('_', ' ')}</td>
                <td className="p-4">{new Date(record.visitDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
