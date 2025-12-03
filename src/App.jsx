import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { HospitalProvider } from './contexts/HospitalContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import OTPVerification from './pages/Auth/OTPVerification'
import Home from './pages/Home/Home'

// Admin Pages
import StaffManagement from './pages/Admin/StaffManagement/StaffManagement'
import ScheduleManagement from './pages/Admin/ScheduleManagement/ScheduleManagement'
import PatientManagement from './pages/Admin/PatientManagement/PatientManagement'
import MedicalRecords from './pages/Admin/MedicalRecords/MedicalRecords'
import MedicineManagement from './pages/Admin/MedicineManagement/MedicineManagement'
import PrescriptionManagement from './pages/Admin/PrescriptionManagement/PrescriptionManagement'
import LabTests from './pages/Admin/LabTests/LabTests'
import FinancialManagement from './pages/Admin/FinancialManagement/FinancialManagement'
import RoomManagement from './pages/Admin/RoomManagement/RoomManagement'
import UserManagement from './pages/Admin/UserManagement/UserManagement'
import Reports from './pages/Admin/Reports/Reports'
import Feedback from './pages/Admin/Feedback/Feedback'

// Doctor Pages
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorPatients from './pages/Doctor/DoctorPatients'
import DoctorPrescriptions from './pages/Doctor/DoctorPrescriptions'
import DoctorSchedule from './pages/Doctor/DoctorSchedule'
import DoctorLabTests from './pages/Doctor/DoctorLabTests'
import DoctorSurgeries from './pages/Doctor/DoctorSurgeries'
import DoctorWorkSchedule from './pages/Doctor/DoctorWorkSchedule'
import DoctorBills from './pages/Doctor/DoctorBills'
import DoctorProfile from './pages/Doctor/DoctorProfile'

// Accounting Pages
import AccountingBills from './pages/Accounting/AccountingBills'
import PaymentManagement from './pages/Accounting/PaymentManagement'
import FinancialReports from './pages/Accounting/FinancialReports'
import DebtManagement from './pages/Accounting/DebtManagement'
import ServiceFeeManagement from './pages/Accounting/ServiceFeeManagement'
import PaymentHistory from './pages/Accounting/PaymentHistory'

// Pharmacy Pages
import PharmacyDashboard from './pages/Pharmacy/PharmacyDashboard'

// Patient Pages
import PatientDashboard from './pages/Patient/PatientDashboard'
import PatientMedicalHistory from './pages/Patient/PatientMedicalHistory'
import PatientPrescriptions from './pages/Patient/PatientPrescriptions'
import PatientAppointments from './pages/Patient/PatientAppointments'
import BookAppointment from './pages/Patient/BookAppointment'
import PatientBilling from './pages/Patient/PatientBilling'

// Common Pages
import Profile from './pages/Profile'
import Settings from './pages/Settings'


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
    <div className="space-y-8">
      {/* Header with Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại!</h1>
          <p className="text-blue-100 text-lg">Tổng quan hệ thống quản lý bệnh viện</p>
        </div>
        {/* Floating Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bệnh nhân hôm nay</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
          <p className="text-sm text-gray-500 mt-1">So với hôm qua</p>
        </div>

        <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lịch hẹn</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
          <p className="text-sm text-gray-500 mt-1">Đã xác nhận</p>
        </div>

        <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-green-600 text-sm font-medium">67%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Phòng trống</h3>
          <p className="text-3xl font-bold text-yellow-600">8</p>
          <p className="text-sm text-gray-500 mt-1">Tổng 12 phòng</p>
        </div>

        <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-green-600 text-sm font-medium">Online</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bác sĩ online</h3>
          <p className="text-3xl font-bold text-purple-600">6</p>
          <p className="text-sm text-gray-500 mt-1">Đang khám</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Thêm bệnh nhân</h3>
                <p className="text-sm text-gray-600">Đăng ký mới</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Đặt lịch hẹn</h3>
                <p className="text-sm text-gray-600">Lịch khám mới</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Xem báo cáo</h3>
                <p className="text-sm text-gray-600">Thống kê</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}


// Admin Routes component
const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/admin/staff" replace />} />
      <Route path="staff" element={<StaffManagement />} />
      <Route path="schedule" element={<ScheduleManagement />} />
      <Route path="patients" element={<PatientManagement />} />
      <Route path="medical-records" element={<MedicalRecords />} />
      <Route path="medicine" element={<MedicineManagement />} />
      <Route path="prescriptions" element={<PrescriptionManagement />} />
      <Route path="lab-tests" element={<LabTests />} />
      <Route path="financial" element={<FinancialManagement />} />
      <Route path="rooms" element={<RoomManagement />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="reports" element={<Reports />} />
      <Route path="feedback" element={<Feedback />} />
    </Routes>
  )
}

// Doctor Routes component
const DoctorRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/doctor/dashboard" replace />} />
      <Route path="dashboard" element={<DoctorDashboard />} />
      <Route path="profile" element={<DoctorProfile />} />
      <Route path="patients" element={<DoctorPatients />} />
      <Route path="prescriptions" element={<DoctorPrescriptions />} />
      <Route path="schedule" element={<DoctorSchedule />} />
      <Route path="work-schedule" element={<DoctorWorkSchedule />} />
      <Route path="lab-tests" element={<DoctorLabTests />} />
      <Route path="surgeries" element={<DoctorSurgeries />} />
      <Route path="bills" element={<DoctorBills />} />
      <Route path="appointments" element={<div className="p-6"><h1 className="text-2xl font-bold">Lịch hẹn</h1></div>} />
      <Route path="medical-records" element={<div className="p-6"><h1 className="text-2xl font-bold">Hồ sơ bệnh án</h1></div>} />
    </Routes>
  )
}

// Nurse routes tạm thời bỏ, không dùng nữa

// Patient Routes component
const PatientRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/patient/dashboard" replace />} />
      <Route path="dashboard" element={<PatientDashboard />} />
      <Route path="appointments" element={<PatientAppointments />} />
      <Route path="medical-history" element={<PatientMedicalHistory />} />
      <Route path="prescriptions" element={<PatientPrescriptions />} />
      <Route path="book-appointment" element={<BookAppointment />} />
      <Route path="billing" element={<PatientBilling />} />
    </Routes>
  )
}

// Accounting Routes component
const AccountingRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/accounting/bills" replace />} />
      <Route path="bills" element={<AccountingBills />} />
      <Route path="payments" element={<PaymentManagement />} />
      <Route path="reports" element={<FinancialReports />} />
      <Route path="debts" element={<DebtManagement />} />
      <Route path="fees" element={<ServiceFeeManagement />} />
      <Route path="history" element={<PaymentHistory />} />
    </Routes>
  )
}

// Pharmacy Routes component
const PharmacyRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/pharmacy/dashboard" replace />} />
      <Route path="dashboard" element={<PharmacyDashboard />} />
      <Route path="inventory" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý kho thuốc</h1></div>} />
      <Route path="prescriptions" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản lý đơn thuốc</h1></div>} />
      <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Báo cáo dược phẩm</h1></div>} />
    </Routes>
  )
}

// App Routes component
const AppRoutes = () => {
  const { user } = useAuth()

  const getDefaultDashboardPath = () => {
    switch (user?.role) {
      case 'admin':
        return '/dashboard/admin/staff'
      case 'doctor':
        return '/dashboard/doctor/dashboard'
      case 'patient':
        return '/dashboard/patient/dashboard'
      case 'accounting':
        return '/dashboard/accounting/bills'
      case 'pharmacy':
        return '/dashboard/pharmacy/dashboard'
      default:
        return '/dashboard/overview'
    }
  }

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
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/verify-otp" 
        element={
          <PublicRoute>
            <OTPVerification />
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
        <Route index element={<Navigate to={getDefaultDashboardPath()} replace />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Admin routes */}
        <Route path="admin/*" element={<AdminRoutes />} />
        
        {/* Doctor routes */}
        <Route path="doctor/*" element={<DoctorRoutes />} />
        
        {/* Patient routes */}
        <Route path="patient/*" element={<PatientRoutes />} />
        
        {/* Accounting routes */}
        <Route path="accounting/*" element={<AccountingRoutes />} />
        
        {/* Pharmacy routes */}
        <Route path="pharmacy/*" element={<PharmacyRoutes />} />
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