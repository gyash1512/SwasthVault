import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Heart, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Users
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    aadhaarNumber: '',
    
    // Role Selection
    role: 'patient',
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    
    // Medical Information (for patients)
    bloodGroup: '',
    allergies: [],
    chronicConditions: [],
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    
    // Doctor-specific fields
    specialization: '',
    licenseNumber: '',
    hospitalAffiliation: '',
    
    // Terms and Privacy
    agreeToTerms: false,
    agreeToPrivacy: false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && 
               formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword
      case 2:
        return formData.phoneNumber && formData.dateOfBirth && formData.gender && 
               formData.aadhaarNumber
      case 3:
        return formData.address.street && formData.address.city && 
               formData.address.state && formData.address.pincode
      case 4:
        if (formData.role === 'doctor') {
          return formData.specialization && formData.licenseNumber
        }
        return true
      case 5:
        return formData.agreeToTerms && formData.agreeToPrivacy
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
      setError('')
    } else {
      setError('Please fill in all required fields correctly')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(5)) {
      setError('Please complete all required fields and agree to terms')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      const registrationData = {
        ...formData,
        allergies: formData.allergies.length > 0 ? formData.allergies : undefined,
        chronicConditions: formData.chronicConditions.length > 0 ? formData.chronicConditions : undefined
      }
      
      delete registrationData.confirmPassword
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Registration successful! Please login with your credentials.')
        setError('')
        setFieldErrors({})
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        // Handle specific field errors
        if (data.errors && Array.isArray(data.errors)) {
          const errors = {}
          data.errors.forEach(err => {
            if (err.path) {
              errors[err.path] = err.msg
            }
          })
          setFieldErrors(errors)
          setError('Please fix the errors below')
        } else if (data.message) {
          // Handle specific error messages
          if (data.message.includes('email') && data.message.includes('already exists')) {
            setFieldErrors({ email: 'This email is already registered. Please use a different email or try logging in.' })
            setError('Email already exists')
          } else if (data.message.includes('aadhaar') && data.message.includes('already exists')) {
            setFieldErrors({ aadhaarNumber: 'This Aadhaar number is already registered.' })
            setError('Aadhaar number already exists')
          } else if (data.message.includes('phone') && data.message.includes('already exists')) {
            setFieldErrors({ phoneNumber: 'This phone number is already registered.' })
            setError('Phone number already exists')
          } else if (data.message.includes('license') && data.message.includes('already exists')) {
            setFieldErrors({ licenseNumber: 'This license number is already registered.' })
            setError('License number already exists')
          } else {
            setError(data.message)
          }
        } else {
          setError('Registration failed. Please try again.')
        }
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent ${
                    fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <Heart className="h-5 w-5 text-medical-600 mr-2" />
                  <span>Patient</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={formData.role === 'doctor'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Doctor</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">Contact & Identity</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhaar Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="1234 5678 9012"
                  maxLength="12"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">Address Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="123 Main Street"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="Mumbai"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="Maharashtra"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                placeholder="400001"
                maxLength="6"
                required
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-gray-900">Emergency Contact</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="Emergency contact name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <select
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phoneNumber"
                    value={formData.emergencyContact.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">
              {formData.role === 'doctor' ? 'Professional Information' : 'Medical Information'}
            </h3>
            
            {formData.role === 'doctor' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="Cardiology, Internal Medicine, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="MED123456"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital Affiliation
                  </label>
                  <input
                    type="text"
                    name="hospitalAffiliation"
                    value={formData.hospitalAffiliation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="City General Hospital"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Known Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.allergies.join(', ')}
                    onChange={(e) => handleArrayInput('allergies', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="Penicillin, Shellfish, etc. (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple allergies with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chronic Conditions
                  </label>
                  <input
                    type="text"
                    value={formData.chronicConditions.join(', ')}
                    onChange={(e) => handleArrayInput('chronicConditions', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="Diabetes, Hypertension, etc. (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple conditions with commas</p>
                </div>
              </>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">Terms & Privacy</h3>
            
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the <Link to="/terms" className="text-medical-600 hover:text-medical-500">Terms of Service</Link> and understand that my medical information will be stored securely and used only for healthcare purposes.
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                  required
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the <Link to="/privacy" className="text-medical-600 hover:text-medical-500">Privacy Policy</Link> and consent to the processing of my personal and medical data.
                </span>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Your data is secure</p>
                  <p>SwasthVault uses industry-standard encryption and security measures to protect your medical information. Your data will only be accessible to authorized healthcare providers.</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Registration Summary:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• Name: {formData.firstName} {formData.lastName}</p>
                <p>• Email: {formData.email}</p>
                <p>• Role: {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</p>
                <p>• Phone: {formData.phoneNumber}</p>
                {formData.role === 'doctor' && (
                  <p>• Specialization: {formData.specialization}</p>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-health-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-medical-100 rounded-xl">
              <Heart className="h-8 w-8 text-medical-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SwasthVault</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Join the future of healthcare management</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-medical-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-medical-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-6 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-medical-600 hover:text-medical-500 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
