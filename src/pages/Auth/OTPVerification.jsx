import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const OTPVerification = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOTP, resendOTP, debugOTP, loading } = useAuth()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [errors, setErrors] = useState({})
  const [resendTimer, setResendTimer] = useState(60)
  const [debugOTPData, setDebugOTPData] = useState(null)
  
  // Lấy email từ state hoặc từ URL params
  const email = location.state?.email || 'user@example.com'

  // Tự động bắt đầu countdown khi component mount
  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer) // Cleanup
  }, [])

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const otpCode = otp.join('')
    console.log('OTP Code:', otpCode) // Debug log
    console.log('Email:', email) // Debug log
    
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Vui lòng nhập đầy đủ 6 số OTP' })
      return
    }

    try {
      console.log('Calling verifyOTP...') // Debug log
      const result = await verifyOTP(email, otpCode)
      console.log('Verify OTP result:', result) // Debug log
      
      if (result.success) {
        console.log('✅ OTP verification successful, navigating to login') // Debug log
        navigate('/login')
      } else {
        console.log('❌ OTP verification failed:', result.message) // Debug log
        setErrors({ submit: result.message })
      }
    } catch (error) {
      console.error('OTP verification error:', error) // Debug log
      setErrors({ submit: 'Có lỗi xảy ra, vui lòng thử lại' })
    }
  }

  const handleResendOTP = async () => {
    try {
      const result = await resendOTP(email)
      if (result.success) {
        setResendTimer(60)
        // Start countdown
        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setErrors({ submit: result.message })
      }
    } catch (error) {
      setErrors({ submit: 'Có lỗi xảy ra, vui lòng thử lại' })
    }
  }

  const handleDebugOTP = async () => {
    try {
      const result = await debugOTP(email)
      if (result) {
        setDebugOTPData(result)
        // Auto fill OTP for testing
        setOtp(result.code.split(''))
      }
    } catch (error) {
      console.error('Debug OTP error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Xác thực OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chúng tôi đã gửi mã OTP đến email <strong>{email}</strong>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ))}
            </div>
            {errors.otp && <p className="text-sm text-red-600 text-center">{errors.otp}</p>}
          </div>

          {errors.submit && (
            <div className="text-red-600 text-sm text-center">{errors.submit}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xác thực...
                </div>
              ) : (
                'Xác thực OTP'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Không nhận được mã?{' '}
              {resendTimer > 0 ? (
                <span className="text-gray-400">Gửi lại sau {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Gửi lại mã
                </button>
              )}
            </span>
          </div>

          {/* Debug OTP button for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleDebugOTP}
                className="text-xs text-gray-500 hover:text-gray-700 underline mr-4"
              >
                🔧 Debug OTP (Dev only)
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                ✅ Skip to Login (Test)
              </button>
              {debugOTPData && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <div>OTP: <strong>{debugOTPData.code}</strong></div>
                  <div>Expires: {new Date(debugOTPData.expiresAt).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/register"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              ← Quay lại đăng ký
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OTPVerification
