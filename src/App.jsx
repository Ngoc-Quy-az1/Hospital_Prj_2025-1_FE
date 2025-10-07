import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { HospitalProvider } from './contexts/HospitalContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Home from './pages/Home/Home'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

// Dashboard Overview component
const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bệnh nhân hôm nay</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lịch hẹn</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Phòng trống</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bác sĩ online</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">6</p>
        </div>
      </div>
    </div>
  )
}

// Profile component
const Profile = () => {
  const { user } = useAuth()
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">Vai trò: {user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Admin Routes component
const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/admin/users" replace />} />
      <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý người dùng</h1></div>} />
      <Route path="doctors" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý bác sĩ</h1></div>} />
      <Route path="nurses" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý y tá</h1></div>} />
      <Route path="patients" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý bệnh nhân</h1></div>} />
      <Route path="departments" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý khoa</h1></div>} />
      <Route path="rooms" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý phòng</h1></div>} />
      <Route path="appointments" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý lịch hẹn</h1></div>} />
      <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Báo cáo thống kê</h1></div>} />
      <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Cài đặt hệ thống</h1></div>} />
    </Routes>
  )
}

// Simple Doctor Routes component
const DoctorRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/doctor/schedule" replace />} />
      <Route path="schedule" element={<div className="p-6"><h1 className="text-2xl font-bold">Lịch làm việc</h1></div>} />
      <Route path="patients" element={<div className="p-6"><h1 className="text-2xl font-bold">Bệnh nhân</h1></div>} />
      <Route path="appointments" element={<div className="p-6"><h1 className="text-2xl font-bold">Lịch hẹn</h1></div>} />
      <Route path="medical-records" element={<div className="p-6"><h1 className="text-2xl font-bold">Hồ sơ bệnh án</h1></div>} />
      <Route path="prescriptions" element={<div className="p-6"><h1 className="text-2xl font-bold">Đơn thuốc</h1></div>} />
    </Routes>
  )
}

// Simple Nurse Routes component
const NurseRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/nurse/schedule" replace />} />
      <Route path="schedule" element={<div className="p-6"><h1 className="text-2xl font-bold">Lịch làm việc</h1></div>} />
      <Route path="patients" element={<div className="p-6"><h1 className="text-2xl font-bold">Chăm sóc bệnh nhân</h1></div>} />
      <Route path="vital-signs" element={<div className="p-6"><h1 className="text-2xl font-bold">Dấu hiệu sinh tồn</h1></div>} />
      <Route path="medications" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý thuốc</h1></div>} />
      <Route path="rooms" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý phòng</h1></div>} />
    </Routes>
  )
}

// Simple Patient Routes component
const PatientRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/patient/appointments" replace />} />
      <Route path="appointments" element={<div className="p-6"><h1 className="text-2xl font-bold">Lịch hẹn của tôi</h1></div>} />
      <Route path="medical-history" element={<div className="p-6"><h1 className="text-2xl font-bold">Lịch sử khám bệnh</h1></div>} />
      <Route path="prescriptions" element={<div className="p-6"><h1 className="text-2xl font-bold">Đơn thuốc</h1></div>} />
      <Route path="book-appointment" element={<div className="p-6"><h1 className="text-2xl font-bold">Đặt lịch khám</h1></div>} />
      <Route path="billing" element={<div className="p-6"><h1 className="text-2xl font-bold">Hóa đơn</h1></div>} />
    </Routes>
  )
}

// App Routes component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard routes */}
        <Route index element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Admin routes */}
        <Route path="admin/*" element={<AdminRoutes />} />
        
        {/* Doctor routes */}
        <Route path="doctor/*" element={<DoctorRoutes />} />
        
        {/* Nurse routes */}
        <Route path="nurse/*" element={<NurseRoutes />} />
        
        {/* Patient routes */}
        <Route path="patient/*" element={<PatientRoutes />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main App component
const App = () => {
  return (
    <AuthProvider>
      <HospitalProvider>
        <AppRoutes />
      </HospitalProvider>
    </AuthProvider>
  )
}

export default App