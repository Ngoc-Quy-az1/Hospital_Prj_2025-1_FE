import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { Heart, Lock, Eye, EyeOff, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailValid, setEmailValid] = useState(true)

  useEffect(() => {
    if (!email) {
      setEmailValid(false)
      setError('Email không hợp lệ hoặc đã hết hạn yêu cầu đặt lại mật khẩu')
    }
  }, [email])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.otp || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ OTP và mật khẩu mới')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.resetPassword({
        email,
        otp: formData.otp,
        newPassword: formData.password
      })
      
      if (response && response.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(response?.message || 'Có lỗi xảy ra, vui lòng thử lại')
        if (response?.message?.includes('hết hạn') || response?.message?.includes('invalid')) {
          setEmailValid(false)
        }
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại')
      if (err.message?.includes('hết hạn') || err.message?.includes('invalid')) {
        setEmailValid(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!emailValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-400/50 p-8 lg:p-10 text-center">
            <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Link không hợp lệ</h2>
            <p className="text-slate-300 mb-6">
              Thông tin đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã OTP mới.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Yêu cầu link mới
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
          {success ? (
            /* Success Message */
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Đặt lại mật khẩu thành công!
              </h2>
              <p className="text-slate-300 mb-6">
                Mật khẩu của bạn đã được thay đổi thành công. Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Đặt lại mật khẩu
                </h2>
                <p className="text-slate-300 text-sm">
                  Nhập mã OTP và mật khẩu mới của bạn
                </p>
              </div>

              {/* Reset Password Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* OTP */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Mã OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="otp"
                      type="text"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-white placeholder:text-slate-400 shadow-lg"
                      placeholder="Nhập mã OTP được gửi tới email"
                      required
                    />
                  </div>
                </div>
                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-white placeholder:text-slate-400 shadow-lg"
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-white placeholder:text-slate-400 shadow-lg"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-200 mb-1">Lỗi</p>
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-xl shadow-purple-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đặt lại mật khẩu'
                    )}
                  </button>
                </div>

                {/* Back to login */}
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-slate-300 hover:text-white font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

