import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Pagination from '../../components/Common/Pagination'
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react'

const DoctorSchedule = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [appointmentStats, setAppointmentStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 })

  const getStatusBadge = (status) => {
    const statusConfig = {
      'scheduled': { color: 'bg-blue-100 text-blue-800', label: 'Đã đặt lịch' },
      'confirmed': { color: 'bg-green-100 text-green-800', label: 'Đã xác nhận' },
      'completed': { color: 'bg-gray-100 text-gray-800', label: 'Hoàn thành' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Đã hủy' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ duyệt' }
    }
    
    const config = statusConfig[status] || statusConfig['scheduled']
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const mapAppointment = (apt) => ({
    id: apt.datLichKhamId || apt.id,
    patientName: apt.benhnhan?.hoTen || apt.benhnhan?.name || 'Không xác định',
    patientId: apt.benhnhan?.benhnhanId || apt.benhnhan?.id,
    date: apt.ngayHen || apt.date || apt.ngayKham,
    time: apt.gioHen || apt.time || '08:00',
    status: apt.status || apt.trangThai,
    notes: apt.lyDoKham || apt.notes || '',
    phone: apt.benhnhan?.sdt || apt.benhnhan?.phone || '',
    email: apt.benhnhan?.email || '',
    address: apt.benhnhan?.diaChi || apt.benhnhan?.address || ''
  })

  const reloadAppointments = useCallback(async (page = 0, size = 20) => {
    const params = {
      date: selectedDate,
      size: size,
      page: page,
    }
    const response = await doctorAPI.getAppointments(params)
    const fetched = response.content || response.data || []
    const formatted = fetched.map(mapAppointment)
    setAppointments(formatted)
    setPageInfo({
      page: response.number ?? page,
      size: response.size ?? size,
      totalElements: response.totalElements ?? 0,
      totalPages: response.totalPages ?? 0
    })
  }, [selectedDate])

  const handleApproveAppointment = async (appointmentId) => {
    try {
      await doctorAPI.approveAppointment(appointmentId)
      await reloadAppointments()
    } catch (err) {
      console.error('Lỗi khi duyệt lịch hẹn:', err)
    }
  }

  const handleRejectAppointment = async (appointmentId) => {
    try {
      await doctorAPI.rejectAppointment(appointmentId, 'Từ chối')
      await reloadAppointments()
    } catch (err) {
      console.error('Lỗi khi từ chối lịch hẹn:', err)
    }
  }

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await doctorAPI.completeAppointment(appointmentId)
      await reloadAppointments()
    } catch (err) {
      console.error('Lỗi khi hoàn thành lịch hẹn:', err)
    }
  }

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentDetail(true)
  }

  // Load lịch hẹn và thống kê từ API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          reloadAppointments(0, pageInfo.size),
          loadAppointmentStats()
        ])
        setError(null)
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err)
        setError('Không thể tải lịch hẹn')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [selectedDate])

  // Reload appointments khi date thay đổi
  useEffect(() => {
    if (!loading) {
      reloadAppointments(0, pageInfo.size)
    }
  }, [selectedDate])

  // Reload stats when date changes
  useEffect(() => {
    if (!loading) {
      loadAppointmentStats()
    }
  }, [selectedDate])

  const loadAppointmentStats = async () => {
    try {
      const stats = await doctorAPI.getAppointmentStats(selectedDate)
      setAppointmentStats(stats)
    } catch (err) {
      console.error('Lỗi khi tải thống kê lịch hẹn:', err)
    }
  }

  // Danh sách lịch hẹn cho ngày đã chọn (đã được backend lọc theo date)
  const appointmentsForDate = appointments || []

  // Lọc theo trạng thái
  const scheduledAppointments = appointmentsForDate.filter(a => a.status === 'scheduled')
  const confirmedAppointments = appointmentsForDate.filter(a => a.status === 'confirmed')
  const completedAppointments = appointmentsForDate.filter(a => a.status === 'completed')

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
          <h1 className="text-2xl font-bold text-gray-900">Lịch làm việc</h1>
          <p className="text-gray-600 mt-1">Quản lý lịch khám bệnh của bạn</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {appointmentStats?.totalAppointments ?? appointmentsForDate.length}
          </div>
          <div className="text-gray-600">Tổng lịch hôm nay</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {appointmentStats?.confirmedAppointments ?? confirmedAppointments.length}
          </div>
          <div className="text-gray-600">Đã xác nhận</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-600">
            {appointmentStats?.completedAppointments ?? completedAppointments.length}
          </div>
          <div className="text-gray-600">Hoàn thành</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {appointmentStats?.pendingAppointments ?? scheduledAppointments.length}
          </div>
          <div className="text-gray-600">Chờ xác nhận</div>
        </Card>
      </div>

      {/* Date Selector */}
      <Card>
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Chọn ngày:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="ml-auto text-sm text-gray-600">
            {new Date(selectedDate).toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      <Card title="Danh sách lịch hẹn">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có lịch hẹn nào cho ngày này
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {appointmentsForDate.map(appointment => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{appointment.patientName}</span>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {appointment.notes}
                      </div>
                      {appointment.phone && (
                        <div className="text-xs text-gray-500 mt-1">
                          📞 {appointment.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          icon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => handleApproveAppointment(appointment.id)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => handleRejectAppointment(appointment.id)}
                        >
                          Từ chối
                        </Button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteAppointment(appointment.id)}
                      >
                        Hoàn thành
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAppointment(appointment)}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </div>
              ))}
            </div>
            <Pagination
              currentPage={pageInfo.page}
              totalPages={pageInfo.totalPages}
              totalElements={pageInfo.totalElements}
              pageSize={pageInfo.size}
              onPageChange={(page) => reloadAppointments(page, pageInfo.size)}
              onPageSizeChange={(size) => reloadAppointments(0, size)}
            />
          </>
        )}
      </Card>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={showAppointmentDetail}
        onClose={() => {
          setShowAppointmentDetail(false)
          setSelectedAppointment(null)
        }}
        title="Chi tiết lịch hẹn"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Bệnh nhân:</label>
              <div className="mt-1 text-gray-900">{selectedAppointment.patientName}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Thời gian:</label>
              <div className="mt-1 text-gray-900">
                {selectedAppointment.date && new Date(selectedAppointment.date).toLocaleDateString('vi-VN')} lúc {selectedAppointment.time}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Lý do khám:</label>
              <div className="mt-1 text-gray-900">{selectedAppointment.notes}</div>
            </div>
            {selectedAppointment.phone && (
              <div>
                <label className="text-sm font-medium text-gray-700">Số điện thoại:</label>
                <div className="mt-1 text-gray-900">{selectedAppointment.phone}</div>
              </div>
            )}
            {selectedAppointment.email && (
              <div>
                <label className="text-sm font-medium text-gray-700">Email:</label>
                <div className="mt-1 text-gray-900">{selectedAppointment.email}</div>
              </div>
            )}
            {selectedAppointment.address && (
              <div>
                <label className="text-sm font-medium text-gray-700">Địa chỉ:</label>
                <div className="mt-1 text-gray-900">{selectedAppointment.address}</div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
              <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DoctorSchedule