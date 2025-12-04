import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Heart, Eye, EyeOff, Loader2, Shield, Award, Clock, Users, ArrowRight } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
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
      const result = await login(formData.identifier, formData.password)
      
      if (result.success) {
        // Navigate based on user role
        const role = result.user?.role
        let dashboardPath = '/dashboard'
        
        switch (role) {
          case 'admin':
            dashboardPath = '/dashboard/admin/staff'
            break
          case 'doctor':
            dashboardPath = '/dashboard/doctor/dashboard'
            break
          case 'patient':
            dashboardPath = '/dashboard/patient/dashboard'
            break
          case 'accounting':
            dashboardPath = '/dashboard/accounting/bills'
            break
          case 'pharmacy':
            dashboardPath = '/dashboard/pharmacy/dashboard'
            break
          default:
            dashboardPath = '/dashboard/overview'
        }
        
        navigate(dashboardPath)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  // Không dùng mock credentials nữa, luôn yêu cầu người dùng nhập thật

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Left Side - Branding with Video Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/10">
        {/* Medical Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          
          {/* Fallback images - Medical & Doctors themed */}
          <img 
            src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=2070&q=80"
            alt="Medical Team"
            className="absolute inset-0 w-full h-full object-cover animate-slideshow-2"
          />
          <img 
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=2070&q=80"
            alt="Doctor Consultation"
            className="absolute inset-0 w-full h-full object-cover animate-slideshow-3"
          />
        </div>
        
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-purple-900/80 to-blue-900/85"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-10 text-white h-full">
          {/* Top Section */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Bệnh viện ABC</h1>
                <p className="text-blue-300 text-sm font-medium">Hệ thống quản lý thông minh</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-5xl font-extrabold mb-4 leading-tight">
                Chào mừng đến với
                <span className="block bg-gradient-to-r from-blue-200 via-purple-200 to-pink-300 bg-clip-text text-transparent">
                  Hệ thống quản lý
                </span>
              </h2>
              <p className="text-lg text-blue-100 leading-relaxed">
                Nền tảng công nghệ tiên tiến giúp quản lý bệnh viện hiệu quả và chuyên nghiệp
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                { icon: Shield, color: 'from-emerald-500/30 to-green-500/30', textColor: 'text-emerald-300', text: 'Bảo mật dữ liệu tuyệt đối' },
                { icon: Award, color: 'from-cyan-500/30 to-blue-500/30', textColor: 'text-cyan-300', text: 'Chuẩn quốc tế JCI' },
                { icon: Clock, color: 'from-pink-500/30 to-purple-500/30', textColor: 'text-pink-300', text: 'Hỗ trợ 24/7' },
                { icon: Users, color: 'from-amber-500/30 to-orange-500/30', textColor: 'text-amber-300', text: 'Đội ngũ chuyên nghiệp' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className={`w-5 h-5 ${feature.textColor}`} />
                  </div>
                  <span className="text-slate-100 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 w-fit">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping animation-delay-300"></div>
            </div>
            <span className="font-medium">Đã phục vụ hơn 100,000+ bệnh nhân</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-8 lg:px-16 relative z-10">
        <div className="w-full max-w-xl">
          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                  <Heart className="w-8 h-8 text-white" fill="currentColor" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Đăng nhập hệ thống
              </h2>
              <p className="text-slate-300 text-sm">
                Bệnh viện ABC - Hệ thống quản lý bệnh viện
              </p>
            </div>

            {/* Không hiển thị thông tin demo / mock account nữa */}

            {/* Login form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Username/Email/Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Tên đăng nhập / Email / Số điện thoại
                  </label>
                  <input
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-white placeholder:text-slate-400 shadow-lg"
                    placeholder="Nhập username, email hoặc số điện thoại"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 pr-12 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-white placeholder:text-slate-400 shadow-lg"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error message - Improved UI */}
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-200 mb-1">Đăng nhập thất bại</p>
                      <p className="text-sm text-red-300">{error}</p>
                      {(error.includes('mật khẩu') || error.includes('password')) && (
                        <Link 
                          to="/forgot-password" 
                          className="text-xs text-red-200 hover:text-red-100 underline mt-2 inline-block"
                        >
                          Quên mật khẩu? Nhấn vào đây để khôi phục
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-white/30 rounded bg-white/10"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="font-medium text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-xl shadow-purple-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      Đăng nhập
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Register link */}
              <div className="text-center">
                <span className="text-sm text-slate-300">
                  Chưa có tài khoản?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </span>
              </div>

              {/* Back to home */}
              <div className="text-center">
                <Link
                  to="/"
                  className="text-sm text-slate-400 hover:text-white font-medium transition-colors inline-flex items-center gap-2"
                >
                  ← Quay lại trang chủ
                </Link>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 mt-6 pt-6 border-t border-white/10">
              <p>
                Bằng việc đăng nhập, bạn đồng ý với{' '}
                <a href="#" className="text-blue-300 hover:text-blue-200 transition-colors font-medium">
                  Điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a href="#" className="text-blue-300 hover:text-blue-200 transition-colors font-medium">
                  Chính sách bảo mật
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
