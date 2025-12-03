import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, apiClient } from '../services/api'

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
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      const savedUser = localStorage.getItem('hospital_user')
      
      if (token && refreshToken && savedUser) {
        try {
          // Thử decode token để kiểm tra xem token còn hạn không
          const decodedToken = decodeJWT(token)
          const currentTime = Date.now() / 1000
          
          // Nếu token chưa hết hạn, không cần refresh
          if (decodedToken && decodedToken.exp && decodedToken.exp > currentTime) {
            console.log('Token còn hợp lệ, không cần refresh')
            const savedUserData = JSON.parse(savedUser)
            setUser(savedUserData)
            apiClient.setToken(token)
          } else {
            // Token đã hết hạn, cần refresh
            console.log('Token đã hết hạn, đang refresh...')
            const response = await authAPI.refresh(refreshToken)
            if (response.accessToken) {
              // Decode JWT mới để lấy role mới nhất
              const newDecodedToken = decodeJWT(response.accessToken)
              const savedUserData = JSON.parse(savedUser)
              
              // Cập nhật role từ JWT nếu có
              if (newDecodedToken?.role) {
                savedUserData.role = mapRoleFromDB(newDecodedToken.role)
              }
              
              setUser(savedUserData)
              apiClient.setToken(response.accessToken)
              localStorage.setItem('token', response.accessToken)
              localStorage.setItem('refreshToken', response.refreshToken)
              localStorage.setItem('hospital_user', JSON.stringify(savedUserData))
            } else {
              // Refresh failed, nhưng không xóa ngay - để user vẫn có thể tiếp tục
              console.log('Refresh token failed, nhưng giữ user đăng nhập với token cũ')
              const savedUserData = JSON.parse(savedUser)
              setUser(savedUserData)
              apiClient.setToken(token)
            }
          }
        } catch (error) {
          console.error('Token verification failed:', error)
          // Không xóa ngay, chỉ log error
          const savedUserData = JSON.parse(savedUser)
          setUser(savedUserData)
          apiClient.setToken(token)
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  // Hàm decode JWT để lấy thông tin user
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return null
    }
  }

  // Hàm mapping role từ database sang frontend
  const mapRoleFromDB = (dbRole) => {
    const roleMapping = {
      'Admins': 'admin',
      'bo_phan_tai_chinh': 'accounting',
      'bacsi': 'doctor',
      // 'yta': 'nurse', // Tạm thời không dùng role điều dưỡng trên frontend
      'benhnhan': 'patient',
      'nhanvien': 'nhanvien'
    }
    return roleMapping[dbRole] || dbRole.toLowerCase()
  }

  // Đăng nhập
  const login = async (identifier, password) => {
    setLoading(true)
    
    try {
      // Call real API với identifier (username/email/phone)
      const response = await authAPI.login({ identifier, password })
      console.log('Login API response:', response) // Debug log
      
      if (response.accessToken && response.refreshToken) {
        // Lưu tokens
        localStorage.setItem('token', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        apiClient.setToken(response.accessToken)
        
        // Lấy thông tin user từ API response (backend đã trả về đầy đủ)
        const userFromAPI = response.user
        console.log('User from API:', userFromAPI) // Debug log
        
        let userData
        if (userFromAPI) {
          // Sử dụng thông tin từ API
          userData = {
            id: userFromAPI.id,
            name: userFromAPI.name || userFromAPI.username,
            email: userFromAPI.email || identifier,
            role: mapRoleFromDB(userFromAPI.role), // Map role từ DB sang frontend
            avatar: null
          }
        } else {
          // Fallback: Decode JWT nếu API không trả về user info
          const decodedToken = decodeJWT(response.accessToken)
          console.log('Decoded token:', decodedToken) // Debug log
          
          userData = {
            id: decodedToken?.sub || 1,
            name: decodedToken?.sub || identifier,
            email: identifier.includes('@') ? identifier : 'user@example.com',
            role: mapRoleFromDB(decodedToken?.role || 'patient'),
            avatar: null
          }
        }
        
        console.log('Final user data:', userData) // Debug log
        
        setUser(userData)
        localStorage.setItem('hospital_user', JSON.stringify(userData))
        setLoading(false)
        return { success: true, user: userData }
      } else {
        setLoading(false)
        return { success: false, message: 'Đăng nhập thất bại' }
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
      return { success: false, message: error.message || 'Đăng nhập thất bại' }
    }
  }

  // Đăng xuất
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      apiClient.setToken(null)
      localStorage.removeItem('hospital_user')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }

  // Đăng ký
  const register = async (userData) => {
    setLoading(true)
    
    try {
      const response = await authAPI.register(userData)
      console.log('Register API response:', response) // Debug log
      console.log('Response type:', typeof response) // Debug log
      console.log('Response length:', response?.length) // Debug log
      
      // API trả về string "Register successfully and OTP sent to email"
      if (response === "Register successfully and OTP sent to email") {
        console.log('✅ Exact match success')
        setLoading(false)
        return { success: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.' }
      } else if (response && typeof response === 'string' && response.includes('successfully')) {
        console.log('✅ Contains successfully')
        setLoading(false)
        return { success: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.' }
      } else if (response && response.success) {
        console.log('✅ Object success')
        setLoading(false)
        return { success: true, message: response.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.' }
      } else if (response && response.status === 200) {
        console.log('✅ Status 200 success')
        setLoading(false)
        return { success: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.' }
      } else {
        console.log('❌ No success condition met')
        setLoading(false)
        return { success: false, message: 'Đăng ký thất bại' }
      }
    } catch (error) {
      console.error('Register error:', error)
      setLoading(false)
      return { success: false, message: error.message || 'Đăng ký thất bại' }
    }
  }

  // Xác thực OTP
  const verifyOTP = async (email, otp) => {
    setLoading(true)
    
    try {
      console.log('Calling verifyOTP API with:', { email, otp }) // Debug log
      const response = await authAPI.verifyOTP({ email, otp })
      console.log('Verify OTP API response:', response) // Debug log
      console.log('Response type:', typeof response) // Debug log
      console.log('Response length:', response?.length) // Debug log
      
      // API trả về string "Account activated successfully"
      if (response === "Account activated successfully") {
        console.log('✅ Exact match success')
        setLoading(false)
        return { success: true, message: 'Tài khoản đã được kích hoạt thành công!' }
      } else if (response && typeof response === 'string' && response.includes('successfully')) {
        console.log('✅ Contains successfully')
        setLoading(false)
        return { success: true, message: 'Tài khoản đã được kích hoạt thành công!' }
      } else if (response && response.status === 200) {
        console.log('✅ Status 200 success')
        setLoading(false)
        return { success: true, message: 'Tài khoản đã được kích hoạt thành công!' }
      } else {
        console.log('❌ No success condition met')
        setLoading(false)
        return { success: false, message: 'Xác thực OTP thất bại' }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setLoading(false)
      return { success: false, message: error.message || 'Xác thực OTP thất bại' }
    }
  }

  // Gửi lại OTP
  const resendOTP = async (email) => {
    setLoading(true)
    
    try {
      const response = await authAPI.resendOTP(email)
      console.log('Resend OTP API response:', response) // Debug log
      
      // API trả về string "New OTP sent to your email"
      if (response === "New OTP sent to your email") {
        setLoading(false)
        return { success: true, message: 'OTP mới đã được gửi đến email của bạn!' }
      } else if (response && typeof response === 'string' && response.includes('sent')) {
        setLoading(false)
        return { success: true, message: 'OTP mới đã được gửi đến email của bạn!' }
      } else {
        setLoading(false)
        return { success: false, message: 'Gửi lại OTP thất bại' }
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setLoading(false)
      return { success: false, message: error.message || 'Gửi lại OTP thất bại' }
    }
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

  // Debug OTP (Development only)
  const debugOTP = async (email) => {
    try {
      const response = await authAPI.debugOTP(email)
      console.log('Debug OTP response:', response)
      return response
    } catch (error) {
      console.error('Debug OTP error:', error)
      return null
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    verifyOTP,
    resendOTP,
    debugOTP,
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
