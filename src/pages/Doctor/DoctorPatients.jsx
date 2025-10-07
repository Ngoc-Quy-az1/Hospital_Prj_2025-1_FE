import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useHospital } from '../../contexts/HospitalContext'
import Card from '../../components/Common/Card'
import Table from '../../components/Common/Table'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import { Search, Filter, Eye, FileText, User, Calendar, Phone, Mail } from 'lucide-react'

const DoctorPatients = () => {
  const { user } = useAuth()
  const { patients, appointments, addPatient, updatePatient } = useHospital()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    medicalHistory: ''
  })

  // Lọc bệnh nhân đã khám với bác sĩ này
  const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id)
  const doctorPatientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))]
  const doctorPatients = patients.filter(patient => doctorPatientIds.includes(patient.id))

  // Lọc theo tìm kiếm
  const filteredPatients = doctorPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  const getPatientAppointments = (patientId) => {
    return appointments.filter(apt => 
      apt.patientId === patientId && apt.doctorId === user?.id
    )
  }

  const getLastVisit = (patientId) => {
    const patientAppointments = getPatientAppointments(patientId)
    if (patientAppointments.length === 0) return null
    
    const sortedAppointments = patientAppointments.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
    
    return sortedAppointments[0]
  }

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    setShowModal(true)
  }

  const handleAddPatient = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyContact: '',
      medicalHistory: ''
    })
    setShowAddModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newPatient = {
      ...formData,
      medicalHistory: formData.medicalHistory.split(',').map(h => h.trim()).filter(h => h),
      insurance: `BHYT-${Date.now()}`
    }
    
    addPatient(newPatient)
    setShowAddModal(false)
  }

  const columns = [
    {
      field: 'name',
      label: 'Họ tên',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          {value}
        </div>
      )
    },
    {
      field: 'email',
      label: 'Email',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          {value}
        </div>
      )
    },
    {
      field: 'phone',
      label: 'Số điện thoại',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          {value}
        </div>
      )
    },
    {
      field: 'age',
      label: 'Tuổi',
      render: (_, row) => {
        const birthYear = new Date(row.dateOfBirth).getFullYear()
        const currentYear = new Date().getFullYear()
        return currentYear - birthYear
      }
    },
    {
      field: 'lastVisit',
      label: 'Lần khám cuối',
      render: (_, row) => {
        const lastVisit = getLastVisit(row.id)
        if (!lastVisit) return 'Chưa có'
        
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm">{new Date(lastVisit.date).toLocaleDateString('vi-VN')}</div>
              <div className="text-xs text-gray-500">{lastVisit.time}</div>
            </div>
          </div>
        )
      }
    },
    {
      field: 'totalVisits',
      label: 'Tổng lần khám',
      render: (_, row) => {
        const totalVisits = getPatientAppointments(row.id).length
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {totalVisits}
          </span>
        )
      }
    },
    {
      field: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewPatient(row)}
          >
            Xem
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => window.location.href = `/dashboard/doctor/medical-records?patient=${row.id}`}
          >
            Hồ sơ
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bệnh nhân của tôi</h1>
          <p className="text-gray-600 mt-1">Danh sách bệnh nhân đã khám</p>
        </div>
        <Button onClick={handleAddPatient}>
          Thêm bệnh nhân mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{doctorPatients.length}</div>
          <div className="text-gray-600">Tổng bệnh nhân</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {doctorPatients.filter(p => {
              const lastVisit = getLastVisit(p.id)
              if (!lastVisit) return false
              const daysSinceLastVisit = (new Date() - new Date(lastVisit.date)) / (1000 * 60 * 60 * 24)
              return daysSinceLastVisit <= 30
            }).length}
          </div>
          <div className="text-gray-600">Khám gần đây (30 ngày)</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {appointments.filter(apt => 
              apt.doctorId === user?.id && apt.status === 'completed'
            ).length}
          </div>
          <div className="text-gray-600">Lần khám hoàn thành</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {appointments.filter(apt => 
              apt.doctorId === user?.id && apt.date === new Date().toISOString().split('T')[0]
            ).length}
          </div>
          <div className="text-gray-600">Khám hôm nay</div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
            Lọc
          </Button>
        </div>
      </Card>

      {/* Patients Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredPatients}
          emptyMessage="Không có bệnh nhân nào"
        />
      </Card>

      {/* Patient Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Thông tin bệnh nhân"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedPatient.dateOfBirth).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bảo hiểm</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.insurance}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPatient.address}</p>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiền sử bệnh</h3>
              {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.medicalHistory.map((history, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {history}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Không có tiền sử bệnh</p>
              )}
            </div>

            {/* Appointment History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử khám bệnh</h3>
              <div className="space-y-3">
                {getPatientAppointments(selectedPatient.id).map(appointment => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{appointment.type}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(appointment.date).toLocaleDateString('vi-VN')} - {appointment.time}
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-500 mt-1">{appointment.notes}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'completed' ? 'Hoàn thành' :
                         appointment.status === 'confirmed' ? 'Đã xác nhận' :
                         appointment.status === 'cancelled' ? 'Đã hủy' : 'Đã đặt lịch'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowModal(false)
                  window.location.href = `/dashboard/doctor/medical-records?patient=${selectedPatient.id}`
                }}
              >
                Xem hồ sơ chi tiết
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm bệnh nhân mới"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liên hệ khẩn cấp
              </label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiền sử bệnh (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: Cao huyết áp, Tiểu đường, Viêm dạ dày"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              Thêm bệnh nhân
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DoctorPatients
