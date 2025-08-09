import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  Shield, 
  Heart,
  X,
  Stethoscope,
  Activity,
  TrendingUp,
  QrCode,
  UserPlus,
  Search,
  Bell,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

const getNavigationForRole = (role) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['patient', 'doctor', 'admin', 'emergency_personnel'] },
    { name: 'Profile', href: '/profile', icon: Settings, roles: ['patient', 'doctor', 'admin', 'emergency_personnel'] },
  ]

  const roleSpecificNavigation = {
    patient: [
      { name: 'My Medical Records', href: '/medical-records', icon: FileText },
      { name: 'Health Timeline', href: '/timeline', icon: Activity },
      { name: 'Medications', href: '/medications', icon: Heart },
      { name: 'Appointments', href: '/appointments', icon: Calendar },
      { name: 'Emergency QR', href: '/emergency-qr', icon: QrCode },
      { name: 'Health Trends', href: '/health-trends', icon: TrendingUp },
    ],
    doctor: [
      { name: 'My Patients', href: '/patients', icon: Users },
      { name: 'Medical Records', href: '/medical-records', icon: FileText },
      { name: 'Create Record', href: '/create-record', icon: UserPlus },
      { name: 'Schedule', href: '/schedule', icon: Calendar },
      { name: 'Patient Search', href: '/patient-search', icon: Search },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
    admin: [
      { name: 'All Users', href: '/users', icon: Users },
      { name: 'All Records', href: '/all-records', icon: FileText },
      { name: 'System Analytics', href: '/system-analytics', icon: BarChart3 },
      { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
      { name: 'Settings', href: '/system-settings', icon: Settings },
    ],
    emergency_personnel: [
      { name: 'Emergency Access', href: '/emergency-access', icon: Shield },
      { name: 'QR Scanner', href: '/qr-scanner', icon: QrCode },
      { name: 'Critical Alerts', href: '/critical-alerts', icon: Bell },
    ]
  }

  return [
    ...baseNavigation,
    ...(roleSpecificNavigation[role] || [])
  ]
}

export default function Sidebar({ onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const navigation = getNavigationForRole(user?.role)

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return Stethoscope
      case 'patient': return Heart
      case 'admin': return Settings
      case 'emergency_personnel': return Shield
      default: return Heart
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
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-medical-100 rounded-lg">
            <Heart className="h-6 w-6 text-medical-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SwasthVault</h1>
            <p className="text-xs text-muted-foreground">Medical Records System</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Role Badge */}
      <div className="p-4 border-b border-border">
        <div className={`flex items-center gap-3 p-3 rounded-lg ${getRoleColor(user?.role)}`}>
          <RoleIcon className="h-5 w-5" />
          <div>
            <p className="font-medium text-sm capitalize">
              {user?.role?.replace('_', ' ')} Portal
            </p>
            <p className="text-xs opacity-75">
              {user?.specialization || 'Healthcare Professional'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive 
                  ? 'bg-medical-100 text-medical-700 border border-medical-200' 
                  : 'text-muted-foreground'
              )
            }
            onClick={onClose}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </p>
          
          {user?.role === 'patient' && (
            <button 
              onClick={() => {
                navigate('/emergency-qr')
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emergency-600 hover:bg-emergency-50 rounded-lg transition-colors"
            >
              <Shield className="h-4 w-4" />
              Emergency Access
            </button>
          )}
          
          {user?.role === 'doctor' && (
            <button 
              onClick={() => {
                navigate('/create-record')
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-medical-600 hover:bg-medical-50 rounded-lg transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              New Patient Record
            </button>
          )}
          
          {user?.role === 'emergency_personnel' && (
            <button 
              onClick={() => {
                navigate('/qr-scanner')
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </button>
          )}
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(user?.role)}`}>
            <span className="text-sm font-semibold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
