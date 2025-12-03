import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { doctorAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar, 
  Users, 
  Pill,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Heart,
  Stethoscope,
  TrendingUp,
  DollarSign,
  FileText,
  ArrowRight
} from 'lucide-react'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dashboardStats, setDashboardStats] = useState(null)
  const [appointmentStats, setAppointmentStats] = useState(null)
  const [prescriptionStats, setPrescriptionStats] = useState(null)
  const [doctorProfile, setDoctorProfile] = useState(null)

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load doctor profile
        try {
          const profileResponse = await doctorAPI.getProfile()
          setDoctorProfile(profileResponse)
        } catch (err) {
          console.error('Lỗi khi tải thông tin bác sĩ:', err)
        }

        // Load dashboard stats
        await loadStats()
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Reload stats when date changes
  useEffect(() => {
    if (!loading) {
      loadStats()
    }
  }, [selectedDate])

  const loadStats = async () => {
    try {
      const [dashboardData, appointmentData, prescriptionData] = await Promise.all([
        doctorAPI.getDashboardStats(selectedDate),
        doctorAPI.getAppointmentStats(selectedDate),
        doctorAPI.getPrescriptionStats(selectedDate)
      ])
      
      setDashboardStats(dashboardData)
      setAppointmentStats(appointmentData)
      setPrescriptionStats(prescriptionData)
    } catch (err) {
      console.error('Lỗi khi tải thống kê:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard - {doctorProfile?.hoTen || user?.name || 'Bác sĩ'}
          </h1>
          <p className="text-gray-600 mt-1">Tổng quan hoạt động của bạn hôm nay</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Stats Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Bệnh nhân hôm nay</p>
                <p className="text-3xl font-bold">{dashboardStats.patientsToday || 0}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Lịch hẹn hôm nay</p>
                <p className="text-3xl font-bold">{dashboardStats.appointmentsToday || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Đơn thuốc hôm nay</p>
                <p className="text-3xl font-bold">{dashboardStats.prescriptionsToday || 0}</p>
              </div>
              <Pill className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Tổng giá trị đơn thuốc</p>
                <p className="text-2xl font-bold">
                  {dashboardStats.totalPrescriptionValue 
                    ? `${dashboardStats.totalPrescriptionValue.toLocaleString('vi-VN')} VNĐ`
                    : '0 VNĐ'}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-orange-200" />
            </div>
          </Card>
        </div>
      )}

      {/* Appointment Statistics */}
      {appointmentStats && (
        <Card title="Thống kê lịch hẹn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{appointmentStats.totalAppointments || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Tổng lịch hẹn</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{appointmentStats.confirmedAppointments || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Đã xác nhận</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{appointmentStats.completedAppointments || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Hoàn thành</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{appointmentStats.pendingAppointments || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Chờ duyệt</div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/doctor/schedule')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Xem chi tiết lịch hẹn
            </Button>
          </div>
        </Card>
      )}

      {/* Prescription Statistics */}
      {prescriptionStats && (
        <Card title="Thống kê đơn thuốc">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{prescriptionStats.totalPrescriptions || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Tổng đơn thuốc</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{prescriptionStats.totalMedicines || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Tổng số thuốc</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {prescriptionStats.totalValue 
                  ? `${prescriptionStats.totalValue.toLocaleString('vi-VN')} VNĐ`
                  : '0 VNĐ'}
              </div>
              <div className="text-sm text-gray-600 mt-1">Tổng giá trị</div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/doctor/prescriptions')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Xem chi tiết đơn thuốc
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Thao tác nhanh">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/dashboard/doctor/schedule')}
          >
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="font-medium">Lịch làm việc</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/dashboard/doctor/patients')}
          >
            <Users className="w-8 h-8 text-green-600" />
            <span className="font-medium">Bệnh nhân</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/dashboard/doctor/prescriptions')}
          >
            <Pill className="w-8 h-8 text-purple-600" />
            <span className="font-medium">Kê đơn thuốc</span>
          </Button>
        </div>
      </Card>

      {/* Additional Info */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Thông tin bổ sung">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lịch đã xác nhận:</span>
                <span className="font-semibold">{dashboardStats.confirmedAppointments || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lịch đã hoàn thành:</span>
                <span className="font-semibold">{dashboardStats.completedAppointments || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lịch chờ duyệt:</span>
                <span className="font-semibold">{dashboardStats.pendingAppointments || 0}</span>
              </div>
            </div>
          </Card>

          <Card title="Thông tin bác sĩ">
            <div className="space-y-3">
              {doctorProfile && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Chuyên khoa:</span>
                    <span className="font-semibold">{doctorProfile.phongban?.tenPhongBan || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Chức vụ:</span>
                    <span className="font-semibold">{doctorProfile.chucVu || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold">{doctorProfile.email || 'Chưa cập nhật'}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard

