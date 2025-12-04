import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { Heart, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!email || !email.trim()) {
      setError('Vui lòng nhập email của bạn')
      setLoading(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ')
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.forgotPassword({ email })
      if (response && response.success) {
        // Thành công: chuyển sang trang nhập OTP + mật khẩu mới
        navigate(`/reset-password?email=${encodeURIComponent(email)}`)
      } else {
        setError(response?.message || 'Có lỗi xảy ra, vui lòng thử lại')
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Quên mật khẩu?
            </h2>
            <p className="text-slate-300 text-sm">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
            </p>
          </div>

          {/* Forgot Password Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-white placeholder:text-slate-400 shadow-lg"
                    placeholder="Nhập email của bạn"
                    required
                  />
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
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      Gửi link đặt lại mật khẩu
                      <Mail className="w-5 h-5 ml-2" />
                    </>
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

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 mt-6 pt-6 border-t border-white/10">
            <p>
              Nhớ mật khẩu?{' '}
              <Link to="/login" className="text-blue-300 hover:text-blue-200 transition-colors font-medium">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

