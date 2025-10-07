import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  User,
  Calendar,
  FileText,
  Settings,
  Building,
  Stethoscope,
  Heart,
  Baby,
  Activity,
  UserPlus,
  ClipboardList,
  BarChart3,
  Shield,
  UserCog
} from 'lucide-react'

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth()

  // Menu items theo role
  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
      { path: '/profile', label: 'Thông tin cá nhân', icon: User }
    ]

    switch (user?.role) {
      case 'admin':
        return [
          ...commonItems,
          { path: '/admin/users', label: 'Quản lý người dùng', icon: Users },
          { path: '/admin/doctors', label: 'Quản lý bác sĩ', icon: Stethoscope },
          { path: '/admin/nurses', label: 'Quản lý y tá', icon: UserCheck },
          { path: '/admin/patients', label: 'Quản lý bệnh nhân', icon: Heart },
          { path: '/admin/departments', label: 'Quản lý khoa', icon: Building },
          { path: '/admin/rooms', label: 'Quản lý phòng', icon: Building },
          { path: '/admin/appointments', label: 'Quản lý lịch hẹn', icon: Calendar },
          { path: '/admin/reports', label: 'Báo cáo thống kê', icon: BarChart3 },
          { path: '/admin/settings', label: 'Cài đặt hệ thống', icon: Settings }
        ]

      case 'doctor':
        return [
          ...commonItems,
          { path: '/doctor/schedule', label: 'Lịch làm việc', icon: Calendar },
          { path: '/doctor/patients', label: 'Bệnh nhân', icon: Heart },
          { path: '/doctor/appointments', label: 'Lịch hẹn', icon: ClipboardList },
          { path: '/doctor/medical-records', label: 'Hồ sơ bệnh án', icon: FileText },
          { path: '/doctor/prescriptions', label: 'Đơn thuốc', icon: FileText }
        ]

      case 'nurse':
        return [
          ...commonItems,
          { path: '/nurse/schedule', label: 'Lịch làm việc', icon: Calendar },
          { path: '/nurse/patients', label: 'Chăm sóc bệnh nhân', icon: Heart },
          { path: '/nurse/vital-signs', label: 'Dấu hiệu sinh tồn', icon: Activity },
          { path: '/nurse/medications', label: 'Quản lý thuốc', icon: FileText },
          { path: '/nurse/rooms', label: 'Quản lý phòng', icon: Building }
        ]

      case 'patient':
        return [
          ...commonItems,
          { path: '/patient/appointments', label: 'Lịch hẹn của tôi', icon: Calendar },
          { path: '/patient/medical-history', label: 'Lịch sử khám bệnh', icon: FileText },
          { path: '/patient/prescriptions', label: 'Đơn thuốc', icon: FileText },
          { path: '/patient/book-appointment', label: 'Đặt lịch khám', icon: UserPlus },
          { path: '/patient/billing', label: 'Hóa đơn', icon: FileText }
        ]

      default:
        return commonItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Bệnh viện ABC</h1>
              <p className="text-xs text-gray-500">Hệ thống quản lý</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Collapse toggle */}
      <div className="absolute bottom-4 left-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {isCollapsed ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
