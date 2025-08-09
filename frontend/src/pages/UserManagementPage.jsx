import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Users, 
  Search, 
  Filter,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  MoreVertical
} from 'lucide-react'

export default function UserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = 
      filterRole === 'all' || 
      u.role === filterRole

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users in the SwasthVault system
          </p>
        </div>
        <button 
          onClick={() => alert('Add user functionality coming soon!')}
          className="bg-medical-600 text-white px-4 py-2 rounded-lg hover:bg-medical-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="medical-card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
            <option value="emergency_personnel">Emergency Personnel</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="medical-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id} className="border-b border-border">
                <td className="p-4">{u.firstName} {u.lastName}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4 capitalize">{u.role.replace('_', ' ')}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Active
                  </span>
                </td>
                <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert(`Editing user ${u.firstName} ${u.lastName}`)}
                      className="p-1 hover:bg-muted rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => alert(`Deleting user ${u.firstName} ${u.lastName}`)}
                      className="p-1 hover:bg-muted rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
