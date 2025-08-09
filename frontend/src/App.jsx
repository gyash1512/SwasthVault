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
import CreateMedicalRecordPage from './pages/CreateMedicalRecordPage'
import PatientHistoryPage from './pages/PatientHistoryPage'
import MedicalRecordDetailPage from './pages/MedicalRecordDetailPage'
import ProfilePage from './pages/ProfilePage'
import AppointmentsPage from './pages/AppointmentsPage'
import EmergencyQRPage from './pages/EmergencyQRPage'
import HealthTrendsPage from './pages/HealthTrendsPage'
import DoctorSchedulePage from './pages/DoctorSchedulePage'
import PatientSearchPage from './pages/PatientSearchPage'
import DoctorAnalyticsPage from './pages/DoctorAnalyticsPage'
import UserManagementPage from './pages/UserManagementPage'
import SystemAnalyticsPage from './pages/SystemAnalyticsPage'
import AuditLogsPage from './pages/AuditLogsPage'
import SystemSettingsPage from './pages/SystemSettingsPage'
import AllRecordsPage from './pages/AllRecordsPage'
import QRScannerPage from './pages/QRScannerPage'
import CriticalAlertsPage from './pages/CriticalAlertsPage'
import EmergencyAccessPage from './pages/EmergencyAccessPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
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
        <Route path="medical-records/:recordId" element={<MedicalRecordDetailPage />} />
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
              <AppointmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="emergency-qr" 
          element={
            <ProtectedRoute requiredRole="patient">
              <EmergencyQRPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="health-trends" 
          element={
            <ProtectedRoute requiredRole="patient">
              <HealthTrendsPage />
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
              <CreateMedicalRecordPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="patient-history/:patientId" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <PatientHistoryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="schedule" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorSchedulePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="patient-search" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <PatientSearchPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorAnalyticsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="all-records" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AllRecordsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="system-analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <SystemAnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="audit-logs" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AuditLogsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="system-settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <SystemSettingsPage />
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
              <QRScannerPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="critical-alerts" 
          element={
            <ProtectedRoute requiredRole="emergency_personnel">
              <CriticalAlertsPage />
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
