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
        
        {/* Doctor-specific Routes */}
        <Route 
          path="patients" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <MedicalRecordsPage viewMode="doctor" />
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
