import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  Shield, 
  Heart,
  X
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['patient', 'doctor', 'admin'] },
  { name: 'Medical Records', href: '/medical-records', icon: FileText, roles: ['patient', 'doctor', 'admin'] },
  { name: 'My Records', href: '/my-records', icon: FileText, roles: ['patient'] },
  { name: 'Patients', href: '/patients', icon: Users, roles: ['doctor', 'admin'] },
  { name: 'Emergency Access', href: '/emergency', icon: Shield, roles: ['emergency_personnel', 'admin'] },
  { name: 'Profile', href: '/profile', icon: Settings, roles: ['patient', 'doctor', 'admin'] },
]

export default function Sidebar({ onClose }) {
  const { user } = useAuth()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-medical-100 rounded-lg">
            <Heart className="h-6 w-6 text-medical-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground">SwasthVault</h1>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'sidebar-nav-item',
                isActive && 'active'
              )
            }
            onClick={onClose}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-medical-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-medical-600">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
