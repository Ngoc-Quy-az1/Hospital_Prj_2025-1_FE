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
    admin: { identifier: 'admin@hospital.com', password: 'admin123' },
    doctor: { identifier: 'doctor@hospital.com', password: 'doctor123' },
    nurse: { identifier: 'nurse@hospital.com', password: 'nurse123' },
    patient: { identifier: 'patient@email.com', password: 'patient123' }
  }

  const fillMockData = (role) => {
    const credentials = mockCredentials[role]
    setFormData({
      identifier: credentials.identifier,
      password: credentials.password
    })
  }

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
            {/* Multiple video sources for better compatibility */}
            <source src="https://assets.mixkit.co/videos/preview/mixkit-doctor-in-hospital-examining-patient-23753-large.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_25fps.mp4" type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-medical-professionals-in-hospital-walking-23355-large.mp4" type="video/mp4" />
          </video>
          
          {/* Fallback images - Medical & Doctors themed */}
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999e8?auto=format&fit=crop&w=2070&q=80"
            alt="Doctors at Hospital"
            className="absolute inset-0 w-full h-full object-cover animate-slideshow-1"
          />
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

            {/* Demo credentials */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-6 shadow-lg">
              <h3 className="text-sm font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Thông tin demo:
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <button
                  onClick={() => fillMockData('admin')}
                  className="text-left p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  <div className="font-bold text-blue-300 mb-1">Admin</div>
                  <div className="text-slate-300 text-[10px]">admin@hospital.com</div>
                </button>
                <button
                  onClick={() => fillMockData('doctor')}
                  className="text-left p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  <div className="font-bold text-emerald-300 mb-1">Bác sĩ</div>
                  <div className="text-slate-300 text-[10px]">doctor@hospital.com</div>
                </button>
                <button
                  onClick={() => fillMockData('nurse')}
                  className="text-left p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  <div className="font-bold text-purple-300 mb-1">Y tá</div>
                  <div className="text-slate-300 text-[10px]">nurse@hospital.com</div>
                </button>
                <button
                  onClick={() => fillMockData('patient')}
                  className="text-left p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  <div className="font-bold text-orange-300 mb-1">Bệnh nhân</div>
                  <div className="text-slate-300 text-[10px]">patient@email.com</div>
                </button>
              </div>
              <p className="text-xs text-blue-200 bg-blue-500/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-400/20">
                🔐 Mật khẩu: [role]123 (VD: admin123)
              </p>
            </div>

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

              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4">
                  <p className="text-sm text-red-200">{error}</p>
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
                  <a href="#" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                    Quên mật khẩu?
                  </a>
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
