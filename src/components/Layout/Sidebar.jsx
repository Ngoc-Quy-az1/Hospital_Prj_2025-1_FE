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
  UserCog,
  Pill,
  Clock
} from 'lucide-react'

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth()

  // Menu items theo role
  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard }
    ]

    switch (user?.role) {
      case 'admin':
        return [
          ...commonItems,
          { path: '/dashboard/admin/staff', label: 'Quản lý nhân sự', icon: Users },
          { path: '/dashboard/admin/schedule', label: 'Quản lý lịch trực', icon: Calendar },
          { path: '/dashboard/admin/patients', label: 'Quản lý bệnh nhân', icon: Heart },
          { path: '/dashboard/admin/medical-records', label: 'Hồ sơ khám bệnh', icon: FileText },
          { path: '/dashboard/admin/medicine', label: 'Quản lý thuốc', icon: ClipboardList },
          { path: '/dashboard/admin/prescriptions', label: 'Quản lý đơn thuốc', icon: FileText },
          { path: '/dashboard/admin/lab-tests', label: 'Quản lý xét nghiệm', icon: Activity },
          { path: '/dashboard/admin/financial', label: 'Quản lý viện phí', icon: BarChart3 },
          { path: '/dashboard/admin/rooms', label: 'Quản lý phòng bệnh', icon: Building },
          { path: '/dashboard/admin/users', label: 'Quản lý tài khoản', icon: UserCog },
          { path: '/dashboard/admin/reports', label: 'Báo cáo thống kê', icon: BarChart3 },
          { path: '/dashboard/admin/feedback', label: 'Phản hồi & hỗ trợ', icon: Users }
        ]

      case 'doctor':
        return [
          { path: '/dashboard/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/dashboard/doctor/profile', label: 'Hồ sơ bác sĩ', icon: User },
          { path: '/dashboard/doctor/schedule', label: 'Lịch hẹn', icon: Calendar },
          { path: '/dashboard/doctor/work-schedule', label: 'Lịch trực', icon: Clock },
          { path: '/dashboard/doctor/patients', label: 'Bệnh nhân', icon: Heart },
          { path: '/dashboard/doctor/prescriptions', label: 'Đơn thuốc', icon: FileText },
          { path: '/dashboard/doctor/lab-tests', label: 'Xét nghiệm', icon: Activity },
          { path: '/dashboard/doctor/surgeries', label: 'Phẫu thuật', icon: ClipboardList },
          { path: '/dashboard/doctor/bills', label: 'Hóa đơn', icon: FileText }
        ]

      case 'patient':
        return [
          // Bệnh nhân: dùng luôn Dashboard riêng, bỏ trang chủ chung
          { path: '/dashboard/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/dashboard/patient/appointments', label: 'Lịch hẹn của tôi', icon: Calendar },
          { path: '/dashboard/patient/medical-history', label: 'Lịch sử khám bệnh', icon: FileText },
          { path: '/dashboard/patient/prescriptions', label: 'Đơn thuốc', icon: FileText },
          { path: '/dashboard/patient/book-appointment', label: 'Đặt lịch khám', icon: UserPlus },
          { path: '/dashboard/patient/billing', label: 'Hóa đơn', icon: FileText }
        ]

      case 'accounting':
        return [
          { path: '/dashboard/accounting/bills', label: 'Trang chủ', icon: LayoutDashboard },
          { path: '/dashboard/accounting/reports', label: 'Báo cáo tài chính', icon: BarChart3 },
        ]

      case 'pharmacy':
        return [
          ...commonItems,
          { path: '/dashboard/pharmacy/dashboard', label: 'Dashboard dược phẩm', icon: LayoutDashboard },
          { path: '/dashboard/pharmacy/prescriptions', label: 'Quản lý đơn thuốc', icon: FileText },
          { path: '/dashboard/pharmacy/inventory', label: 'Quản lý kho thuốc', icon: Pill },
          { path: '/dashboard/pharmacy/reports', label: 'Báo cáo dược phẩm', icon: BarChart3 }
        ]

      default:
        return commonItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex-shrink-0`}>
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
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:transform hover:scale-[1.01]'
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
