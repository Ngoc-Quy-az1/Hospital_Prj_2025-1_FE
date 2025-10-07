import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Heart, Eye, EyeOff, Loader2 } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password, formData.role)
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  // Mock credentials for demo
  const mockCredentials = {
    admin: { email: 'admin@hospital.com', password: 'admin123' },
    doctor: { email: 'doctor@hospital.com', password: 'doctor123' },
    nurse: { email: 'nurse@hospital.com', password: 'nurse123' },
    patient: { email: 'patient@email.com', password: 'patient123' }
  }

  const fillMockData = (role) => {
    const credentials = mockCredentials[role]
    setFormData({
      email: credentials.email,
      password: credentials.password,
      role: role
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Đăng nhập hệ thống
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bệnh viện ABC - Hệ thống quản lý bệnh viện
          </p>
        </div>

        {/* Demo credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Thông tin demo:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => fillMockData('admin')}
              className="text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-blue-600">Admin</div>
              <div className="text-gray-600">admin@hospital.com</div>
            </button>
            <button
              onClick={() => fillMockData('doctor')}
              className="text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-green-600">Bác sĩ</div>
              <div className="text-gray-600">doctor@hospital.com</div>
            </button>
            <button
              onClick={() => fillMockData('nurse')}
              className="text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-purple-600">Y tá</div>
              <div className="text-gray-600">nurse@hospital.com</div>
            </button>
            <button
              onClick={() => fillMockData('patient')}
              className="text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-orange-600">Bệnh nhân</div>
              <div className="text-gray-600">patient@email.com</div>
            </button>
          </div>
          <p className="text-xs text-blue-700 mt-2">Mật khẩu: [role]123 (VD: admin123)</p>
        </div>

        {/* Login form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="admin">Quản trị viên</option>
                <option value="doctor">Bác sĩ</option>
                <option value="nurse">Y tá</option>
                <option value="patient">Bệnh nhân</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </a>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Quay lại trang chủ
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
