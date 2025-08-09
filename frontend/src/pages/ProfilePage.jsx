import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Heart,
  Stethoscope,
  Edit,
  Save,
  Camera,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    bloodGroup: '',
    allergies: [],
    chronicConditions: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    specialization: '',
    licenseNumber: '',
    hospitalAffiliation: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || ''
        },
        bloodGroup: user.bloodGroup || '',
        allergies: user.allergies || [],
        chronicConditions: user.chronicConditions || [],
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          relationship: user.emergencyContact?.relationship || '',
          phoneNumber: user.emergencyContact?.phoneNumber || ''
        },
        specialization: user.specialization || '',
        licenseNumber: user.licenseNumber || '',
        hospitalAffiliation: user.hospitalAffiliation || ''
      })
    }
  }, [user])

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

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        success('Profile updated successfully!')
        setEditing(false)
        // Update the auth context with new user data
        if (updateProfile) {
          updateProfile(data.data)
        }
      } else {
        error(data.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return Stethoscope
      case 'patient': return Heart
      case 'admin': return Shield
      case 'emergency_personnel': return Shield
      default: return User
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return 'text-blue-600 bg-blue-100'
      case 'patient': return 'text-medical-600 bg-medical-100'
      case 'admin': return 'text-purple-600 bg-purple-100'
      case 'emergency_personnel': return 'text-red-600 bg-red-100'
      default: return 'text-medical-600 bg-medical-100'
    }
  }

  const RoleIcon = getRoleIcon(user?.role)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
        >
          <Edit className="h-4 w-4" />
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>


      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Header */}
        <div className="medical-card">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-medical-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-medical-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-white border border-border rounded-full shadow-sm hover:bg-muted transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
                  <RoleIcon className="h-4 w-4" />
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.specialization && (
                <p className="text-sm text-muted-foreground">{user.specialization}</p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-medical-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true} // Email should not be editable
                className="w-full p-3 border border-border rounded-lg bg-muted cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-medical-600" />
            Address Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">PIN Code</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Medical Information (for patients) */}
        {user?.role === 'patient' && (
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-medical-600" />
              Medical Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Known Allergies</label>
                <input
                  type="text"
                  value={formData.allergies.join(', ')}
                  onChange={(e) => handleArrayInput('allergies', e.target.value)}
                  disabled={!editing}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Comma separated"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Chronic Conditions</label>
                <input
                  type="text"
                  value={formData.chronicConditions.join(', ')}
                  onChange={(e) => handleArrayInput('chronicConditions', e.target.value)}
                  disabled={!editing}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Comma separated"
                />
              </div>
            </div>
          </div>
        )}

        {/* Professional Information (for doctors) */}
        {user?.role === 'doctor' && (
          <div className="medical-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-medical-600" />
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  disabled={true} // License should not be editable
                  className="w-full p-3 border border-border rounded-lg bg-muted cursor-not-allowed"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Hospital Affiliation</label>
                <input
                  type="text"
                  name="hospitalAffiliation"
                  value={formData.hospitalAffiliation}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-medical-600" />
            Emergency Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contact Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Relationship</label>
              <select
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="">Select Relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="emergencyContact.phoneNumber"
                value={formData.emergencyContact.phoneNumber}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {editing && (
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
