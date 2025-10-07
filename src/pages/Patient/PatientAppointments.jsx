import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useHospital } from '../../contexts/HospitalContext'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import { Calendar, Clock, User, Stethoscope, Plus, Eye, X } from 'lucide-react'

const PatientAppointments = () => {
  const { user } = useAuth()
  const { appointments, doctors, addAppointment } = useHospital()
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'Khám thường',
    notes: ''
  })

  // Lọc lịch hẹn của bệnh nhân hiện tại
  const patientAppointments = appointments.filter(appointment => 
    appointment.patientId === user?.id
  )

  // Sắp xếp theo ngày giảm dần
  const sortedAppointments = patientAppointments.sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId)
    return doctor ? doctor.name : 'Không xác định'
  }

  const getDoctorSpecialization = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId)
    return doctor ? doctor.specialization : ''
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Đã đặt lịch' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Đã xác nhận' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Hoàn thành' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Đã hủy' }
    }
    
    const config = statusConfig[status] || statusConfig.scheduled
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const handleBookAppointment = () => {
    setFormData({
      doctorId: '',
      date: selectedDate,
      time: '',
      type: 'Khám thường',
      notes: ''
    })
    setShowBookModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newAppointment = {
      ...formData,
      patientId: user?.id,
      doctorId: parseInt(formData.doctorId),
      date: formData.date,
      time: formData.time,
      status: 'scheduled'
    }
    
    addAppointment(newAppointment)
    setShowBookModal(false)
  }

  const appointmentTypes = [
    'Khám thường',
    'Khám cấp cứu',
    'Khám chuyên khoa',
    'Tái khám',
    'Khám định kỳ'
  ]

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý lịch hẹn khám bệnh</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={handleBookAppointment}
        >
          Đặt lịch khám
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {patientAppointments.filter(a => a.status === 'scheduled').length}
          </div>
          <div className="text-gray-600">Đã đặt lịch</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {patientAppointments.filter(a => a.status === 'confirmed').length}
          </div>
          <div className="text-gray-600">Đã xác nhận</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-600">
            {patientAppointments.filter(a => a.status === 'completed').length}
          </div>
          <div className="text-gray-600">Hoàn thành</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {patientAppointments.filter(a => a.status === 'cancelled').length}
          </div>
          <div className="text-gray-600">Đã hủy</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            icon={<Calendar className="w-4 h-4" />}
            onClick={handleBookAppointment}
          >
            Đặt lịch khám mới
          </Button>
          <Button
            variant="outline"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => window.location.href = '/dashboard/patient/medical-history'}
          >
            Xem lịch sử khám
          </Button>
          <Button
            variant="outline"
            icon={<User className="w-4 h-4" />}
            onClick={() => window.location.href = '/dashboard/patient/prescriptions'}
          >
            Đơn thuốc
          </Button>
        </div>
      </Card>

      {/* Appointments List */}
      <Card title="Danh sách lịch hẹn">
        {sortedAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Bạn chưa có lịch hẹn nào</p>
            <Button
              className="mt-4"
              onClick={handleBookAppointment}
            >
              Đặt lịch khám đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map(appointment => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getDoctorName(appointment.doctorId)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getDoctorSpecialization(appointment.doctorId)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(appointment.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      <div><strong>Loại khám:</strong> {appointment.type}</div>
                      {appointment.notes && (
                        <div className="mt-1"><strong>Ghi chú:</strong> {appointment.notes}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end gap-2">
                    {getStatusBadge(appointment.status)}
                    
                    {appointment.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<X className="w-4 h-4" />}
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
                              // TODO: Implement cancel appointment
                              console.log('Cancel appointment:', appointment.id)
                            }
                          }}
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = '/dashboard/patient/medical-history'}
                      >
                        Xem kết quả
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title="Đặt lịch khám"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bác sĩ *
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn bác sĩ</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày khám *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ khám *
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn giờ khám</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại khám *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mô tả triệu chứng hoặc lý do khám..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Lưu ý:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Vui lòng đến trước 15 phút so với giờ hẹn</li>
              <li>• Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
              <li>• Liên hệ bệnh viện nếu cần thay đổi lịch hẹn</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBookModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              Đặt lịch khám
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PatientAppointments
