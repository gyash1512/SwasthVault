import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Settings, 
  Save,
  Bell,
  Shield,
  Database
} from 'lucide-react'

export default function SystemSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30
    },
    data: {
      retentionPolicy: 365
    }
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const [category, key] = name.split('.')
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: type === 'checkbox' ? checked : value
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Mock save settings
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Settings */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notification Settings
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="notifications.email"
                checked={settings.notifications.email}
                onChange={handleInputChange}
                className="rounded border-border"
              />
              <span>Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="notifications.sms"
                checked={settings.notifications.sms}
                onChange={handleInputChange}
                className="rounded border-border"
              />
              <span>Enable SMS Notifications</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Security Settings
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="security.twoFactorAuth"
                checked={settings.security.twoFactorAuth}
                onChange={handleInputChange}
                className="rounded border-border"
              />
              <span>Enable Two-Factor Authentication</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="security.sessionTimeout"
                value={settings.security.sessionTimeout}
                onChange={handleInputChange}
                className="w-full p-3 border border-border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Data Settings
          </h3>
          <div>
            <label className="block text-sm font-medium mb-2">
              Data Retention Policy (days)
            </label>
            <input
              type="number"
              name="data.retentionPolicy"
              value={settings.data.retentionPolicy}
              onChange={handleInputChange}
              className="w-full p-3 border border-border rounded-lg"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
