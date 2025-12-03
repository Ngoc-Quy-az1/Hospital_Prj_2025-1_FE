import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Table from '../../components/Common/Table'
import { 
  Users, 
  Search, 
  Eye, 
  Edit,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  Activity,
  Heart,
  Clock,
  CheckCircle
} from 'lucide-react'

const DoctorPatients = () => {
  const { user } = useAuth()
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [medicalHistory, setMedicalHistory] = useState([])

  // Dữ liệu bệnh nhân từ API
  const [patients, setPatients] = useState([])

  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
    nextAppointment: ''
  })

  // Lọc bệnh nhân
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = !filterDepartment || patient.department === filterDepartment
    const matchesStatus = !filterStatus || patient.status === filterStatus
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient)
    try {
      const history = await doctorAPI.getPatientMedicalHistory(patient.id)
      setMedicalHistory(history || [])
    } catch (err) {
      console.error('Lỗi khi tải lịch sử bệnh án:', err)
      setMedicalHistory([])
    }
  }

  const handleDiagnosis = (patient) => {
    setSelectedPatient(patient)
    setDiagnosisForm({
      diagnosis: patient.diagnosis || '',
      treatment: '',
      notes: '',
      nextAppointment: ''
    })
    setShowDiagnosisModal(true)
  }

  const handleSubmitDiagnosis = (e) => {
    e.preventDefault()
    
    // Cập nhật chẩn đoán cho bệnh nhân
    setPatients(patients.map(patient => 
      patient.id === selectedPatient.id 
        ? { 
            ...patient, 
            diagnosis: diagnosisForm.diagnosis,
            status: 'Hoàn thành'
          } 
        : patient
    ))
    
    setShowDiagnosisModal(false)
    setSelectedPatient(null)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Chờ khám': 'bg-yellow-100 text-yellow-800',
      'Đang khám': 'bg-blue-100 text-blue-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Đã hủy': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Cột cho bảng bệnh nhân
  const patientColumns = [
    {
      key: 'patientCode',
      label: 'Mã BN',
      render: (value, row) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'name',
      label: 'Bệnh nhân',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.age} tuổi • {row.gender}</div>
        </div>
      )
    },
    {
      key: 'appointmentTime',
      label: 'Giờ hẹn',
      render: (value, row) => (
        <div>
          <div className="text-sm">{value}</div>
          <div className="text-xs text-gray-500">{row.appointmentDate}</div>
        </div>
      )
    },
    {
      key: 'symptoms',
      label: 'Triệu chứng',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === 'Hoàn thành' ? <CheckCircle className="w-4 h-4 text-green-600" /> : 
           value === 'Đang khám' ? <Activity className="w-4 h-4 text-blue-600" /> : 
           <Clock className="w-4 h-4 text-yellow-600" />}
          {getStatusBadge(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewPatient(row)}
          >
            Xem
          </Button>
          <Button
            size="sm"
            icon={<Stethoscope className="w-4 h-4" />}
            onClick={() => handleDiagnosis(row)}
            disabled={row.status === 'Hoàn thành'}
          >
            Chẩn đoán
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
          <p className="text-gray-600 mt-1">Quản lý bệnh nhân và thực hiện chẩn đoán</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{patients.length}</div>
          <div className="text-gray-600">Tổng bệnh nhân</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {patients.filter(p => p.status === 'Chờ khám').length}
          </div>
          <div className="text-gray-600">Chờ khám</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {patients.filter(p => p.status === 'Đang khám').length}
          </div>
          <div className="text-gray-600">Đang khám</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {patients.filter(p => p.status === 'Hoàn thành').length}
          </div>
          <div className="text-gray-600">Hoàn thành</div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ khám">Chờ khám</option>
            <option value="Đang khám">Đang khám</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>
      </Card>

      {/* Patients Table */}
      <Card title="Danh sách bệnh nhân">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có bệnh nhân nào
          </div>
        ) : (
          <Table
            data={filteredPatients}
            columns={patientColumns}
            searchable={false}
          />
        )}
      </Card>

      {/* Diagnosis Modal */}
      <Modal
        isOpen={showDiagnosisModal}
        onClose={() => {
          setShowDiagnosisModal(false)
          setSelectedPatient(null)
        }}
        title="Chẩn đoán bệnh"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Thông tin bệnh nhân</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tên:</span>
                  <span className="ml-2 font-medium">{selectedPatient.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tuổi:</span>
                  <span className="ml-2 font-medium">{selectedPatient.age}</span>
                </div>
                <div>
                  <span className="text-gray-600">Giới tính:</span>
                  <span className="ml-2 font-medium">{selectedPatient.gender}</span>
                </div>
                <div>
                  <span className="text-gray-600">Triệu chứng:</span>
                  <span className="ml-2 font-medium">{selectedPatient.symptoms}</span>
                </div>
              </div>
            </div>

            {/* Medical History */}
            {medicalHistory.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Lịch sử bệnh án</h3>
                <div className="space-y-2">
                  {medicalHistory.map((record, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{record.chanDoan || record.diagnosis || 'Chưa có chẩn đoán'}</div>
                          <div className="text-sm text-gray-600">{record.dieuTri || record.treatment || 'Chưa có điều trị'}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.ngayKham ? new Date(record.ngayKham).toLocaleDateString('vi-VN') : record.date || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnosis Form */}
            <form onSubmit={handleSubmitDiagnosis} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chẩn đoán *
                </label>
                <textarea
                  value={diagnosisForm.diagnosis}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, diagnosis: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập chẩn đoán bệnh..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương pháp điều trị *
                </label>
                <textarea
                  value={diagnosisForm.treatment}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, treatment: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập phương pháp điều trị..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={diagnosisForm.notes}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lịch hẹn tái khám
                </label>
                <input
                  type="date"
                  value={diagnosisForm.nextAppointment}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, nextAppointment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDiagnosisModal(false)
                    setSelectedPatient(null)
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  Lưu chẩn đoán
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DoctorPatients