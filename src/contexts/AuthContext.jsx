import React, { createContext, useContext, useState, useEffect } from 'react'

// Tạo context cho authentication
const AuthContext = createContext()

// Provider component để quản lý state authentication
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock data cho các loại user
  const mockUsers = {
    admin: {
      id: 1,
      name: 'Nguyễn Văn Admin',
      email: 'admin@hospital.com',
      role: 'admin',
      avatar: null,
      permissions: ['manage_users', 'manage_doctors', 'manage_nurses', 'view_reports', 'system_settings']
    },
    doctor: {
      id: 2,
      name: 'BS. Trần Thị Hoa',
      email: 'doctor@hospital.com',
      role: 'doctor',
      avatar: null,
      specialization: 'Tim mạch',
      department: 'Khoa Tim mạch',
      license: 'BS-2023-001'
    },
    nurse: {
      id: 3,
      name: 'Điều dưỡng Lê Văn Nam',
      email: 'nurse@hospital.com',
      role: 'nurse',
      avatar: null,
      department: 'Khoa Cấp cứu',
      license: 'DD-2023-002'
    },
    patient: {
      id: 4,
      name: 'Nguyễn Thị Lan',
      email: 'patient@email.com',
      role: 'patient',
      avatar: null,
      phone: '0123456789',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      insurance: 'BHYT-2023-003'
    }
  }

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('hospital_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // Đăng nhập
  const login = async (email, password, role) => {
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Tìm user theo role
    const userData = mockUsers[role]
    if (userData && userData.email === email) {
      setUser(userData)
      localStorage.setItem('hospital_user', JSON.stringify(userData))
      setLoading(false)
      return { success: true, user: userData }
    }
    
    setLoading(false)
    return { success: false, message: 'Thông tin đăng nhập không chính xác' }
  }

  // Đăng xuất
  const logout = () => {
    setUser(null)
    localStorage.removeItem('hospital_user')
  }

  // Cập nhật thông tin user
  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser }
    setUser(newUser)
    localStorage.setItem('hospital_user', JSON.stringify(newUser))
  }

  // Kiểm tra quyền
  const hasPermission = (permission) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.permissions && user.permissions.includes(permission)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasPermission,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider')
  }
  return context
}

export default AuthContext
