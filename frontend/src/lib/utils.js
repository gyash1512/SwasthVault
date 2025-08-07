import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export function calculateAge(birthDate) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getInitials(firstName, lastName) {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

export function validateAadhaar(aadhaar) {
  return /^\d{12}$/.test(aadhaar)
}

export function validatePhone(phone) {
  return /^\+91[6-9]\d{9}$/.test(phone)
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function maskAadhaar(aadhaar) {
  if (!aadhaar || aadhaar.length !== 12) return aadhaar
  return `XXXX XXXX ${aadhaar.slice(-4)}`
}

export function maskPhone(phone) {
  if (!phone) return phone
  return phone.replace(/(\+91)(\d{6})(\d{4})/, '$1XXXXXX$3')
}

export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'verified':
      return 'status-active'
    case 'pending':
    case 'draft':
      return 'status-pending'
    case 'emergency':
    case 'critical':
    case 'urgent':
      return 'status-emergency'
    default:
      return 'status-pending'
  }
}

export function getPriorityColor(priority) {
  switch (priority?.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'critical':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function generateQRData(patientData) {
  return JSON.stringify({
    id: patientData.id,
    name: `${patientData.firstName} ${patientData.lastName}`,
    dob: patientData.dateOfBirth,
    bloodGroup: patientData.bloodGroup,
    allergies: patientData.allergies || [],
    emergencyContact: patientData.emergencyContact,
    timestamp: new Date().toISOString()
  })
}

export function parseQRData(qrString) {
  try {
    return JSON.parse(qrString)
  } catch (error) {
    console.error('Invalid QR data:', error)
    return null
  }
}

export function isValidQRData(data) {
  return data && 
         typeof data === 'object' && 
         data.id && 
         data.name && 
         data.timestamp
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return Promise.resolve()
    } catch (err) {
      document.body.removeChild(textArea)
      return Promise.reject(err)
    }
  }
}

export function downloadFile(data, filename, type = 'application/json') {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function getDeviceType() {
  const width = window.innerWidth
  if (width < 640) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export function isMobile() {
  return getDeviceType() === 'mobile'
}

export function isTablet() {
  return getDeviceType() === 'tablet'
}

export function isDesktop() {
  return getDeviceType() === 'desktop'
}
