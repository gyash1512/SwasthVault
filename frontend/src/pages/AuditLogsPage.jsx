import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Activity, 
  Search, 
  Filter,
  User,
  Clock,
  FileText
} from 'lucide-react'

export default function AuditLogsPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/audit', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.data)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = 
      filterAction === 'all' || 
      log.action === filterAction

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
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all system activities and changes
        </p>
      </div>

      {/* Search and Filter */}
      <div className="medical-card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
          </div>
          
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="medical-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Action</th>
              <th className="p-4">Details</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log._id} className="border-b border-border">
                <td className="p-4">{log.user?.firstName} {log.user?.lastName}</td>
                <td className="p-4">{log.action}</td>
                <td className="p-4">{log.details}</td>
                <td className="p-4">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
