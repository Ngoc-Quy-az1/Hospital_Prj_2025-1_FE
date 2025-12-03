import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { patientAPI } from '../../services/api'
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

const PatientAppointments = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editData, setEditData] = useState({
    date: '',
    time: '',
    symptoms: '',
    notes: '',
  })

  // Load lịch hẹn thật từ API bệnh nhân
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await patientAPI.getAppointments()
        // Backend trả Page<DatLichKham>: { content, ... }
        const items = res?.content || res || []

        const statusMap = {
          cho_duyet: 'Chờ xác nhận',
          da_duyet: 'Đã xác nhận',
          da_kham: 'Hoàn thành',
          huy: 'Đã hủy',
        }

        const mapped = items.map((apt) => {
          const ngayGio = apt.ngayGio
          let dateStr = ''
          let timeStr = ''
          if (ngayGio) {
            const d = new Date(ngayGio)
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0]
              timeStr = d.toTimeString().slice(0, 5)
            } else {
              // Trường hợp backend trả string không chuẩn ISO
              const parts = String(ngayGio).split('T')
              dateStr = parts[0] || ''
              timeStr = (parts[1] || '').slice(0, 5)
            }
          }

          return {
            id: apt.datlichId,
            date: dateStr,
            time: timeStr,
            doctor: apt.bacsi?.hoTen || 'Bác sĩ',
            department: apt.bacsi?.phongban?.tenPhongban || '',
            type: apt.loaiKham || 'Khám thường',
            status: statusMap[apt.trangThai] || 'Chờ xác nhận',
            notes: apt.ghiChu || '',
            location: apt.phongKham || '',
          }
        })

        setAppointments(mapped)
      } catch (error) {
        console.error('Lỗi tải lịch hẹn bệnh nhân:', error)
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'bg-green-100 text-green-800'
      case 'Chờ xác nhận':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hoàn thành':
        return 'bg-blue-100 text-blue-800'
      case 'Đã hủy':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Khám mới':
        return 'bg-purple-100 text-purple-800'
      case 'Tái khám':
        return 'bg-orange-100 text-orange-800'
      case 'Khám thường':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment)
    setEditData({
      date: appointment.date || '',
      time: appointment.time || '',
      symptoms: appointment.type || '',
      notes: appointment.notes || '',
    })
    setShowDetailModal(true)
  }

  const handleCancelAppointment = async (appointment) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy lịch hẹn này?')) {
      return
    }

    try {
      await patientAPI.cancelAppointment(appointment.id)
      // Cập nhật lại trạng thái trong danh sách hiện tại
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointment.id ? { ...apt, status: 'Đã hủy' } : apt
        )
      )
      alert('Hủy lịch hẹn thành công.')
    } catch (error) {
      console.error('Lỗi khi hủy lịch hẹn:', error)
      alert('Hủy lịch hẹn thất bại, vui lòng thử lại.')
    }
  }

  const handleSaveAppointment = async () => {
    if (!selectedAppointment) return
    const { date, time, symptoms, notes } = editData
    if (!date || !time) {
      alert('Vui lòng chọn ngày và giờ khám')
      return
    }

    try {
      const ngayGio = new Date(`${date}T${time}:00`)
      const dto = {
        ngayGio: ngayGio.toISOString().slice(0, 19),
        loaiKham: symptoms || 'Khám thường',
        bacsiId: null, // giữ nguyên bác sĩ hiện tại
        ghiChu: notes,
      }

      await patientAPI.updateAppointment(selectedAppointment.id, dto)

      // Cập nhật lại ở client
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                date,
                time,
                type: dto.loaiKham,
                notes: dto.ghiChu,
              }
            : apt
        )
      )
      alert('Cập nhật lịch hẹn thành công.')
      setShowDetailModal(false)
    } catch (error) {
      console.error('Lỗi khi cập nhật lịch hẹn:', error)
      alert('Cập nhật lịch hẹn thất bại, vui lòng thử lại.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý các cuộc hẹn khám bệnh</p>
        </div>
        <a href="/dashboard/patient/book-appointment">
          <Button icon={<Plus className="w-4 h-4" />}>
            Đặt lịch mới
          </Button>
        </a>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo bác sĩ, khoa, loại khám..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đã xác nhận">Đã xác nhận</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
              <Button icon={<Filter className="w-4 h-4" />} variant="secondary">
                Bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng lịch hẹn</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'Đã xác nhận').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'Chờ xác nhận').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'Hoàn thành').length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách lịch hẹn</h2>
          
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy lịch hẹn nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{appointment.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.department}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                            {appointment.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <strong>Ghi chú:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {appointment.status === 'Chờ xác nhận' && (
                        <>
                          <Button 
                            icon={<Edit className="w-4 h-4" />} 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewDetail(appointment)}
                          >
                            Sửa
                          </Button>
                          <Button 
                            icon={<Trash2 className="w-4 h-4" />} 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment)}
                          >
                            Hủy
                          </Button>
                        </>
                      )}
                      <Button 
                        icon={<Eye className="w-4 h-4" />} 
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetail(appointment)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết lịch hẹn</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày khám</p>
                  {selectedAppointment.status === 'Chờ xác nhận' ? (
                    <input
                      type="date"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={editData.date}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, date: e.target.value }))
                      }
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{selectedAppointment.date}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giờ khám</p>
                  {selectedAppointment.status === 'Chờ xác nhận' ? (
                    <input
                      type="time"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={editData.time}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, time: e.target.value }))
                      }
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{selectedAppointment.time}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bác sĩ</p>
                  <p className="font-medium text-gray-900">{selectedAppointment.doctor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khoa</p>
                  <p className="font-medium text-gray-900">{selectedAppointment.department}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Địa điểm</p>
                <p className="font-medium text-gray-900">
                  {selectedAppointment.location || 'Phòng khám sẽ được thông báo sau'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Loại khám</p>
                  {selectedAppointment.status === 'Chờ xác nhận' ? (
                    <input
                      type="text"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={editData.symptoms}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, symptoms: e.target.value }))
                      }
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{selectedAppointment.type}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedAppointment.status
                    )}`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  {selectedAppointment.status === 'Chờ xác nhận' ? (
                    <textarea
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      value={editData.notes}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, notes: e.target.value }))
                      }
                    />
                  ) : (
                    <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-lg">
                      {selectedAppointment.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                {selectedAppointment.status === 'Chờ xác nhận' && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleCancelAppointment(selectedAppointment)}
                    >
                      Hủy lịch
                    </Button>
                    <Button onClick={handleSaveAppointment}>Lưu thay đổi</Button>
                  </>
                )}
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientAppointments