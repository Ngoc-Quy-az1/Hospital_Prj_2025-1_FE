import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useHospital } from '../../contexts/HospitalContext'
import Card from '../../components/Common/Card'
import Table from '../../components/Common/Table'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import { Search, Filter, Eye, Activity, User, Heart, Thermometer, Droplets } from 'lucide-react'

const NursePatients = () => {
  const { user } = useAuth()
  const { patients, appointments, rooms, updatePatient } = useHospital()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false)
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    notes: ''
  })

  // Lọc bệnh nhân theo khoa của y tá
  const nursePatients = patients.filter(patient => {
    // Mock: giả sử y tá chăm sóc tất cả bệnh nhân trong khoa
    return true
  })

  // Lọc theo tìm kiếm
  const filteredPatients = nursePatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    setShowModal(true)
  }

  const handleVitalSigns = (patient) => {
    setSelectedPatient(patient)
    setVitalSigns({
      bloodPressure: patient.vitalSigns?.bloodPressure || '',
      heartRate: patient.vitalSigns?.heartRate || '',
      temperature: patient.vitalSigns?.temperature || '',
      respiratoryRate: patient.vitalSigns?.respiratoryRate || '',
      oxygenSaturation: patient.vitalSigns?.oxygenSaturation || '',
      weight: patient.vitalSigns?.weight || '',
      height: patient.vitalSigns?.height || '',
      notes: patient.vitalSigns?.notes || ''
    })
    setShowVitalSignsModal(true)
  }

  const handleSubmitVitalSigns = (e) => {
    e.preventDefault()
    
    if (selectedPatient) {
      updatePatient(selectedPatient.id, {
        vitalSigns: {
          ...vitalSigns,
          lastUpdated: new Date().toISOString(),
          updatedBy: user?.name
        }
      })
    }
    
    setShowVitalSignsModal(false)
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
      field: 'age',
      label: 'Tuổi',
      render: (_, row) => {
        const birthYear = new Date(row.dateOfBirth).getFullYear()
        const currentYear = new Date().getFullYear()
        return currentYear - birthYear
      }
    },
    {
      field: 'gender',
      label: 'Giới tính',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Nam' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      field: 'room',
      label: 'Phòng',
      render: (_, row) => {
        const patientRoom = rooms.find(room => room.patientId === row.id)
        return patientRoom ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {patientRoom.number}
          </span>
        ) : (
          <span className="text-gray-400">Chưa phân phòng</span>
        )
      }
    },
    {
      field: 'vitalSigns',
      label: 'Dấu hiệu sinh tồn',
      render: (_, row) => {
        const vitalSigns = row.vitalSigns
        if (!vitalSigns) {
          return <span className="text-red-500 text-sm">Chưa đo</span>
        }
        
        return (
          <div className="text-xs">
            <div>HA: {vitalSigns.bloodPressure || '--'}</div>
            <div>Nhịp: {vitalSigns.heartRate || '--'}</div>
            <div>Nhiệt độ: {vitalSigns.temperature || '--'}</div>
          </div>
        )
      }
    },
    {
      field: 'lastUpdated',
      label: 'Cập nhật cuối',
      render: (_, row) => {
        if (!row.vitalSigns?.lastUpdated) return '--'
        return new Date(row.vitalSigns.lastUpdated).toLocaleString('vi-VN')
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
            size="sm"
            icon={<Activity className="w-4 h-4" />}
            onClick={() => handleVitalSigns(row)}
          >
            Đo dấu hiệu
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
          <h1 className="text-2xl font-bold text-gray-900">Chăm sóc bệnh nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi tình trạng bệnh nhân</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{nursePatients.length}</div>
          <div className="text-gray-600">Tổng bệnh nhân</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {nursePatients.filter(p => p.vitalSigns?.lastUpdated).length}
          </div>
          <div className="text-gray-600">Đã đo dấu hiệu</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {nursePatients.filter(p => !p.vitalSigns?.lastUpdated).length}
          </div>
          <div className="text-gray-600">Chưa đo dấu hiệu</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {rooms.filter(r => r.status === 'occupied').length}
          </div>
          <div className="text-gray-600">Phòng có bệnh nhân</div>
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

            {/* Vital Signs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dấu hiệu sinh tồn</h3>
              {selectedPatient.vitalSigns ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Huyết áp</span>
                    </div>
                    <p className="text-blue-700">{selectedPatient.vitalSigns.bloodPressure || 'Chưa đo'}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-900">Nhịp tim</span>
                    </div>
                    <p className="text-red-700">{selectedPatient.vitalSigns.heartRate || 'Chưa đo'} bpm</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-900">Nhiệt độ</span>
                    </div>
                    <p className="text-orange-700">{selectedPatient.vitalSigns.temperature || 'Chưa đo'}°C</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">SpO2</span>
                    </div>
                    <p className="text-green-700">{selectedPatient.vitalSigns.oxygenSaturation || 'Chưa đo'}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có dấu hiệu sinh tồn</p>
              )}
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
                  handleVitalSigns(selectedPatient)
                }}
              >
                Đo dấu hiệu sinh tồn
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Vital Signs Modal */}
      <Modal
        isOpen={showVitalSignsModal}
        onClose={() => setShowVitalSignsModal(false)}
        title="Đo dấu hiệu sinh tồn"
        size="lg"
      >
        <form onSubmit={handleSubmitVitalSigns} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Huyết áp (mmHg)
              </label>
              <input
                type="text"
                value={vitalSigns.bloodPressure}
                onChange={(e) => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 120/80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhịp tim (bpm)
              </label>
              <input
                type="number"
                value={vitalSigns.heartRate}
                onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 72"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhiệt độ (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={vitalSigns.temperature}
                onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 36.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhịp thở (/phút)
              </label>
              <input
                type="number"
                value={vitalSigns.respiratoryRate}
                onChange={(e) => setVitalSigns({...vitalSigns, respiratoryRate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SpO2 (%)
              </label>
              <input
                type="number"
                value={vitalSigns.oxygenSaturation}
                onChange={(e) => setVitalSigns({...vitalSigns, oxygenSaturation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 98"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={vitalSigns.weight}
                onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 65.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chiều cao (cm)
              </label>
              <input
                type="number"
                value={vitalSigns.height}
                onChange={(e) => setVitalSigns({...vitalSigns, height: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 170"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={vitalSigns.notes}
              onChange={(e) => setVitalSigns({...vitalSigns, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ghi chú về tình trạng bệnh nhân..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVitalSignsModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              Lưu dấu hiệu sinh tồn
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default NursePatients
