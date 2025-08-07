import React from 'react'
import { Heart, Users, FileText, Shield } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-responsive font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your SwasthVault system</p>
      </div>

      <div className="responsive-grid">
        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-medical-100 rounded-lg">
              <Heart className="h-6 w-6 text-medical-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Health Records</h3>
              <p className="text-2xl font-bold text-medical-600">1,234</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-health-100 rounded-lg">
              <Users className="h-6 w-6 text-health-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Active Patients</h3>
              <p className="text-2xl font-bold text-health-600">567</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Documents</h3>
              <p className="text-2xl font-bold text-blue-600">2,890</p>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center">
            <div className="p-3 bg-emergency-100 rounded-lg">
              <Shield className="h-6 w-6 text-emergency-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Emergency Access</h3>
              <p className="text-2xl font-bold text-emergency-600">24/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="medical-card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="font-medium">New medical record added</p>
              <p className="text-sm text-muted-foreground">Patient: John Doe</p>
            </div>
            <span className="text-sm text-muted-foreground">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="font-medium">Emergency access granted</p>
              <p className="text-sm text-muted-foreground">Hospital: City General</p>
            </div>
            <span className="text-sm text-muted-foreground">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="font-medium">Document uploaded</p>
              <p className="text-sm text-muted-foreground">Lab Report - Blood Test</p>
            </div>
            <span className="text-sm text-muted-foreground">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}
