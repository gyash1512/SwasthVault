import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import EmergencyDashboard from './pages/EmergencyDashboard'
import MedicalRecordsPage from './pages/MedicalRecordsPage'
import MedicationsPage from './pages/MedicationsPage'
import ProfilePage from './pages/ProfilePage'
import EmergencyAccessPage from './pages/EmergencyAccessPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import './index.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/register" 
        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route path="/emergency-access" element={<EmergencyAccessPage />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Role-based Dashboard Routes */}
        <Route 
          path="dashboard" 
          element={
            user?.role === 'patient' ? <PatientDashboard /> :
            user?.role === 'doctor' ? <DoctorDashboard /> :
            user?.role === 'emergency_personnel' ? <EmergencyDashboard /> :
            <DashboardPage />
          } 
        />
        
        {/* Common Routes */}
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        
        {/* Patient-specific Routes */}
        <Route 
          path="my-records" 
          element={
            <ProtectedRoute requiredRole="patient">
              <MedicalRecordsPage viewMode="patient" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="timeline" 
          element={
            <ProtectedRoute requiredRole="patient">
              <MedicalRecordsPage viewMode="timeline" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="medications" 
          element={
            <ProtectedRoute requiredRole="patient">
              <MedicationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="appointments" 
          element={
            <ProtectedRoute requiredRole="patient">
              <div className="p-6"><h1 className="text-2xl font-bold">Appointments</h1><p>Appointment scheduling coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="emergency-qr" 
          element={
            <ProtectedRoute requiredRole="patient">
              <div className="p-6"><h1 className="text-2xl font-bold">Emergency QR Code</h1><p>QR code generation coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="health-trends" 
          element={
            <ProtectedRoute requiredRole="patient">
              <div className="p-6"><h1 className="text-2xl font-bold">Health Trends</h1><p>Health analytics coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        
        {/* Doctor-specific Routes */}
        <Route 
          path="patients" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <MedicalRecordsPage viewMode="doctor" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="create-record" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <div className="p-6"><h1 className="text-2xl font-bold">Create Medical Record</h1><p>Record creation form coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="schedule" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <div className="p-6"><h1 className="text-2xl font-bold">Schedule</h1><p>Doctor schedule management coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="patient-search" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <div className="p-6"><h1 className="text-2xl font-bold">Patient Search</h1><p>Advanced patient search coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p>Doctor analytics dashboard coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p>User administration coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="all-records" 
          element={
            <ProtectedRoute requiredRole="admin">
              <div className="p-6"><h1 className="text-2xl font-bold">All Medical Records</h1><p>System-wide records view coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="system-analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <div className="p-6"><h1 className="text-2xl font-bold">System Analytics</h1><p>System performance analytics coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="audit-logs" 
          element={
            <ProtectedRoute requiredRole="admin">
              <div className="p-6"><h1 className="text-2xl font-bold">Audit Logs</h1><p>System audit trails coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="system-settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <div className="p-6"><h1 className="text-2xl font-bold">System Settings</h1><p>System configuration coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        
        {/* Emergency Personnel Routes */}
        <Route 
          path="emergency" 
          element={
            <ProtectedRoute requiredRole="emergency_personnel">
              <EmergencyAccessPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="emergency-access" 
          element={
            <ProtectedRoute requiredRole="emergency_personnel">
              <EmergencyAccessPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="qr-scanner" 
          element={
            <ProtectedRoute requiredRole="emergency_personnel">
              <div className="p-6"><h1 className="text-2xl font-bold">QR Scanner</h1><p>Emergency QR code scanner coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="critical-alerts" 
          element={
            <ProtectedRoute requiredRole="emergency_personnel">
              <div className="p-6"><h1 className="text-2xl font-bold">Critical Alerts</h1><p>Emergency alerts dashboard coming soon...</p></div>
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-background text-foreground">
              <AppRoutes />
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
