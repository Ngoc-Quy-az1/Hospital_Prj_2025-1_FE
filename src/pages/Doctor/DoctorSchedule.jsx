import React, { useState } from 'react'
import { useAuth, useHospital } from '../../contexts/HospitalContext'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { Calendar, Clock, User, Stethoscope, Plus } from 'lucide-react'

const DoctorSchedule = () => {
  const { user } = useAuth()
  const { appointments, patients, updateAppointment } = useHospital()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddModal, setShowAddModal] = useState(false)

  // Lọc lịch hẹn theo bác sĩ và ngày
  const doctorAppointments = appointments.filter(appointment => 
    appointment.doctorId === user?.id && appointment.date === selectedDate
  )

  // Sắp xếp theo giờ
  const sortedAppointments = doctorAppointments.sort((a, b) => a.time.localeCompare(b.time))

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? patient.name : 'Không xác định'
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

  const handleStatusChange = (appointmentId, newStatus) => {
    updateAppointment(appointmentId, { status: newStatus })
  }

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  const getAppointmentByTime = (time) => {
    return doctorAppointments.find(apt => apt.time === time)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch làm việc</h1>
          <p className="text-gray-600 mt-1">Quản lý lịch khám bệnh của bạn</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Thêm lịch hẹn
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {doctorAppointments.length}
          </div>
          <div className="text-gray-600">Tổng lịch hôm nay</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {doctorAppointments.filter(a => a.status === 'confirmed').length}
          </div>
          <div className="text-gray-600">Đã xác nhận</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-600">
            {doctorAppointments.filter(a => a.status === 'completed').length}
          </div>
          <div className="text-gray-600">Hoàn thành</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {doctorAppointments.filter(a => a.status === 'cancelled').length}
          </div>
          <div className="text-gray-600">Đã hủy</div>
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

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Slots */}
        <Card title="Lịch theo giờ">
          <div className="space-y-2">
            {timeSlots.map(time => {
              const appointment = getAppointmentByTime(time)
              return (
                <div key={time} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 w-16">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-sm">{time}</span>
                  </div>
                  
                  {appointment ? (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{getPatientName(appointment.patientId)}</span>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {appointment.type} - {appointment.notes}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            >
                              Xác nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            >
                              Hủy
                            </Button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                          >
                            Hoàn thành
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-gray-400 italic">
                      Trống
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Today's Appointments List */}
        <Card title="Danh sách lịch hẹn">
          {sortedAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Không có lịch hẹn nào cho ngày này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAppointments.map(appointment => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{getPatientName(appointment.patientId)}</span>
                        <span className="text-sm text-gray-500">
                          {appointment.time}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <div>Loại: {appointment.type}</div>
                        {appointment.notes && (
                          <div>Ghi chú: {appointment.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        >
                          Hủy
                        </Button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, 'completed')}
                      >
                        Hoàn thành
                      </Button>
                    )}
                    {appointment.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/dashboard/doctor/medical-records?patient=${appointment.patientId}`, '_blank')}
                      >
                        Xem hồ sơ
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            icon={<User className="w-4 h-4" />}
            onClick={() => window.location.href = '/dashboard/doctor/patients'}
          >
            Xem bệnh nhân
          </Button>
          <Button
            variant="outline"
            icon={<Stethoscope className="w-4 h-4" />}
            onClick={() => window.location.href = '/dashboard/doctor/medical-records'}
          >
            Hồ sơ bệnh án
          </Button>
          <Button
            variant="outline"
            icon={<Calendar className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Đặt lịch mới
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default DoctorSchedule
