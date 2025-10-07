import React, { useState } from 'react'
import { useHospital } from '../../contexts/HospitalContext'
import Card from '../../components/Common/Card'
import Table from '../../components/Common/Table'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import { Plus, Edit, Trash2, Search, Filter, Calendar, Clock, User, Stethoscope } from 'lucide-react'

const AdminAppointments = () => {
  const { appointments, doctors, patients, addAppointment, updateAppointment, deleteAppointment } = useHospital()
  const [showModal, setShowModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'Khám thường',
    notes: ''
  })

  // Get patient and doctor names
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? patient.name : 'Không xác định'
  }

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId)
    return doctor ? doctor.name : 'Không xác định'
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      getPatientName(appointment.patientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDoctorName(appointment.doctorId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleAddAppointment = () => {
    setEditingAppointment(null)
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      type: 'Khám thường',
      notes: ''
    })
    setShowModal(true)
  }

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      notes: appointment.notes || ''
    })
    setShowModal(true)
  }

  const handleDeleteAppointment = (appointment) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lịch hẹn này?`)) {
      deleteAppointment(appointment.id)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingAppointment) {
      updateAppointment(editingAppointment.id, formData)
    } else {
      addAppointment(formData)
    }
    
    setShowModal(false)
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      type: 'Khám thường',
      notes: ''
    })
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

  const columns = [
    {
      field: 'patientId',
      label: 'Bệnh nhân',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          {getPatientName(value)}
        </div>
      )
    },
    {
      field: 'doctorId',
      label: 'Bác sĩ',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-gray-400" />
          {getDoctorName(value)}
        </div>
      )
    },
    {
      field: 'date',
      label: 'Ngày',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date(value).toLocaleDateString('vi-VN')}
        </div>
      )
    },
    {
      field: 'time',
      label: 'Giờ',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          {value}
        </div>
      )
    },
    {
      field: 'type',
      label: 'Loại khám',
      sortable: true
    },
    {
      field: 'status',
      label: 'Trạng thái',
      render: (value) => getStatusBadge(value)
    },
    {
      field: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditAppointment(row)}
          >
            Sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDeleteAppointment(row)}
          >
            Xóa
          </Button>
        </div>
      )
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'scheduled', label: 'Đã đặt lịch' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
  ]

  const appointmentTypes = [
    'Khám thường',
    'Khám cấp cứu',
    'Khám chuyên khoa',
    'Tái khám',
    'Khám định kỳ'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
          <p className="text-gray-600 mt-1">Quản lý lịch hẹn khám bệnh của bệnh nhân</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAddAppointment}
        >
          Thêm lịch hẹn
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {appointments.filter(a => a.status === 'scheduled').length}
          </div>
          <div className="text-gray-600">Đã đặt lịch</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'confirmed').length}
          </div>
          <div className="text-gray-600">Đã xác nhận</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-600">
            {appointments.filter(a => a.status === 'completed').length}
          </div>
          <div className="text-gray-600">Hoàn thành</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {appointments.filter(a => a.status === 'cancelled').length}
          </div>
          <div className="text-gray-600">Đã hủy</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo bệnh nhân, bác sĩ hoặc loại khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
            Lọc
          </Button>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredAppointments}
          emptyMessage="Không có lịch hẹn nào"
        />
      </Card>

      {/* Add/Edit Appointment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAppointment ? 'Chỉnh sửa lịch hẹn' : 'Thêm lịch hẹn mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bệnh nhân *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn bệnh nhân</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bác sĩ *
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({...formData, doctorId: parseInt(e.target.value)})}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ khám *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={editingAppointment?.status || 'scheduled'}
                onChange={(e) => {
                  if (editingAppointment) {
                    updateAppointment(editingAppointment.id, { status: e.target.value })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">Đã đặt lịch</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
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
              placeholder="Nhập ghi chú về lịch hẹn..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              {editingAppointment ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminAppointments
