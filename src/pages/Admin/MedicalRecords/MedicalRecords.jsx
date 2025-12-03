import React, { useState } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Download,
  Filter,
  Stethoscope,
  User,
  Calendar,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

const MedicalRecords = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDoctor, setFilterDoctor] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Dữ liệu mẫu hồ sơ khám bệnh
  const [medicalRecords, setMedicalRecords] = useState([
    {
      id: 1,
      recordCode: 'HS001',
      patientId: 1,
      patientName: 'Nguyễn Thị An',
      doctorId: 1,
      doctorName: 'BS. Nguyễn Văn An',
      department: 'Khoa Tim mạch',
      visitDate: '2024-01-15',
      visitTime: '08:30',
      symptoms: 'Đau ngực, khó thở, mệt mỏi',
      diagnosis: 'Rối loạn nhịp tim, tăng huyết áp',
      treatment: 'Nghỉ ngơi, dùng thuốc điều hòa nhịp tim',
      prescription: 'Thuốc điều hòa nhịp tim, thuốc hạ huyết áp',
      notes: 'Bệnh nhân cần theo dõi thường xuyên',
      status: 'Hoàn thành',
      nextVisit: '2024-02-15',
      vitalSigns: {
        bloodPressure: '140/90',
        heartRate: '95',
        temperature: '36.5',
        weight: '65kg',
        height: '160cm'
      },
      labResults: [
        { name: 'Xét nghiệm máu', result: 'Bình thường', date: '2024-01-15' },
        { name: 'Điện tâm đồ', result: 'Rối loạn nhịp tim', date: '2024-01-15' }
      ]
    },
    {
      id: 2,
      recordCode: 'HS002',
      patientId: 2,
      patientName: 'Trần Văn Bình',
      doctorId: 2,
      doctorName: 'BS. Phạm Thị Dung',
      department: 'Khoa Nội',
      visitDate: '2024-01-16',
      visitTime: '10:15',
      symptoms: 'Đau bụng, buồn nôn, chán ăn',
      diagnosis: 'Viêm dạ dày cấp',
      treatment: 'Nghỉ ngơi, ăn uống nhẹ, dùng thuốc',
      prescription: 'Thuốc kháng axit, thuốc giảm đau',
      notes: 'Tránh thức ăn cay nóng',
      status: 'Đang điều trị',
      nextVisit: '2024-01-23',
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: '75',
        temperature: '37.2',
        weight: '70kg',
        height: '175cm'
      },
      labResults: [
        { name: 'Xét nghiệm máu', result: 'Viêm nhẹ', date: '2024-01-16' },
        { name: 'Siêu âm bụng', result: 'Bình thường', date: '2024-01-16' }
      ]
    },
    {
      id: 3,
      recordCode: 'HS003',
      patientId: 3,
      patientName: 'Lê Thị Cường',
      doctorId: 3,
      doctorName: 'BS. Vũ Thị Phương',
      department: 'Khoa Ngoại',
      visitDate: '2024-01-17',
      visitTime: '14:30',
      symptoms: 'Đau vùng bụng dưới, sốt nhẹ',
      diagnosis: 'Viêm ruột thừa cấp',
      treatment: 'Phẫu thuật cắt ruột thừa',
      prescription: 'Kháng sinh, giảm đau sau phẫu thuật',
      notes: 'Bệnh nhân cần nghỉ ngơi hoàn toàn',
      status: 'Sau phẫu thuật',
      nextVisit: '2024-01-24',
      vitalSigns: {
        bloodPressure: '110/70',
        heartRate: '85',
        temperature: '38.1',
        weight: '55kg',
        height: '155cm'
      },
      labResults: [
        { name: 'Xét nghiệm máu', result: 'Nhiễm trùng', date: '2024-01-17' },
        { name: 'Siêu âm ổ bụng', result: 'Viêm ruột thừa', date: '2024-01-17' },
        { name: 'CT bụng', result: 'Xác nhận chẩn đoán', date: '2024-01-17' }
      ]
    }
  ])

  // Dữ liệu mẫu bác sĩ
  const doctors = [
    { id: 1, name: 'BS. Nguyễn Văn An', department: 'Khoa Tim mạch' },
    { id: 2, name: 'BS. Phạm Thị Dung', department: 'Khoa Nội' },
    { id: 3, name: 'BS. Vũ Thị Phương', department: 'Khoa Ngoại' },
    { id: 4, name: 'BS. Hoàng Văn Em', department: 'Khoa Sản' }
  ]

  const departments = [
    'Khoa Tim mạch', 'Khoa Nội', 'Khoa Ngoại', 'Khoa Sản', 'Khoa Nhi'
  ]

  const [formData, setFormData] = useState({
    recordCode: '',
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    department: '',
    visitDate: '',
    visitTime: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    status: 'Đang điều trị',
    nextVisit: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    labResults: []
  })

  // Lọc hồ sơ khám bệnh
  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.recordCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDoctor = !filterDoctor || record.doctorId === parseInt(filterDoctor)
    const matchesDepartment = !filterDepartment || record.department === filterDepartment
    const matchesStatus = !filterStatus || record.status === filterStatus
    
    return matchesSearch && matchesDoctor && matchesDepartment && matchesStatus
  })

  const handleAddRecord = () => {
    // Tạo mã hồ sơ mới
    const newCode = `HS${String(medicalRecords.length + 1).padStart(3, '0')}`
    
    setFormData({
      recordCode: newCode,
      patientId: '',
      patientName: '',
      doctorId: '',
      doctorName: '',
      department: '',
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      notes: '',
      status: 'Đang điều trị',
      nextVisit: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
      },
      labResults: []
    })
    setShowAddModal(true)
  }

  const handleEditRecord = (record) => {
    setSelectedRecord(record)
    setFormData(record)
    setShowEditModal(true)
  }

  const handleViewRecord = (record) => {
    setSelectedRecord(record)
    setShowViewModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (showEditModal && selectedRecord) {
      // Cập nhật hồ sơ
      setMedicalRecords(medicalRecords.map(record => 
        record.id === selectedRecord.id ? { ...record, ...formData } : record
      ))
      setShowEditModal(false)
    } else {
      // Thêm hồ sơ mới
      const newRecord = {
        id: medicalRecords.length + 1,
        ...formData
      }
      setMedicalRecords([...medicalRecords, newRecord])
      setShowAddModal(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Đang điều trị': 'bg-blue-100 text-blue-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Sau phẫu thuật': 'bg-yellow-100 text-yellow-800',
      'Chuyển viện': 'bg-orange-100 text-orange-800',
      'Tử vong': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Hoàn thành': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Đang điều trị': return <Clock className="w-4 h-4 text-blue-600" />
      case 'Sau phẫu thuật': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  // Cột cho bảng hồ sơ khám bệnh
  const recordColumns = [
    {
      key: 'recordCode',
      label: 'Mã HS',
      render: (value, row) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'patientName',
      label: 'Bệnh nhân',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.department}</div>
        </div>
      )
    },
    {
      key: 'doctorName',
      label: 'Bác sĩ',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'visitDate',
      label: 'Ngày khám',
      render: (value, row) => (
        <div>
          <div className="text-sm">{new Date(value).toLocaleDateString('vi-VN')}</div>
          <div className="text-xs text-gray-500">{row.visitTime}</div>
        </div>
      )
    },
    {
      key: 'diagnosis',
      label: 'Chẩn đoán',
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
          {getStatusIcon(value)}
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
            onClick={() => handleViewRecord(row)}
          >
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditRecord(row)}
          >
            Sửa
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý hồ sơ khám bệnh</h1>
            <p className="text-slate-100">Quản lý hồ sơ khám bệnh và kết quả điều trị</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddRecord}
            className="bg-white text-slate-600 hover:bg-slate-50"
          >
            Tạo hồ sơ mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng hồ sơ</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{medicalRecords.length}</div>
            <div className="text-sm text-gray-500">Tất cả hồ sơ</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đã hoàn thành</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {medicalRecords.filter(r => r.status === 'Hoàn thành').length}
            </div>
            <div className="text-sm text-gray-500">Đã kết thúc điều trị</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đang điều trị</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {medicalRecords.filter(r => r.status === 'Đang điều trị').length}
            </div>
            <div className="text-sm text-gray-500">Đang được chăm sóc</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Sau phẫu thuật</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {medicalRecords.filter(r => r.status === 'Sau phẫu thuật').length}
            </div>
            <div className="text-sm text-gray-500">Đang hồi phục</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm hồ sơ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả bác sĩ</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
            ))}
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả khoa</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Đang điều trị">Đang điều trị</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Sau phẫu thuật">Sau phẫu thuật</option>
            <option value="Chuyển viện">Chuyển viện</option>
            <option value="Tử vong">Tử vong</option>
          </select>
        </div>
      </Card>

      {/* Medical Records Table */}
      <Card title="Danh sách hồ sơ khám bệnh">
        <Table
          data={filteredRecords}
          columns={recordColumns}
          searchable={false}
        />
      </Card>

      {/* Add/Edit Medical Record Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedRecord(null)
        }}
        title={showEditModal ? "Sửa hồ sơ khám bệnh" : "Tạo hồ sơ khám bệnh mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã hồ sơ
              </label>
              <input
                type="text"
                value={formData.recordCode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên bệnh nhân *
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bác sĩ khám *
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => {
                  const doctor = doctors.find(d => d.id === parseInt(e.target.value))
                  setFormData({
                    ...formData, 
                    doctorId: e.target.value,
                    doctorName: doctor?.name || '',
                    department: doctor?.department || ''
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn bác sĩ</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khoa
              </label>
              <input
                type="text"
                value={formData.department}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày khám *
              </label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
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
                value={formData.visitTime}
                onChange={(e) => setFormData({...formData, visitTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Triệu chứng *
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mô tả triệu chứng bệnh nhân..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chẩn đoán *
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Chẩn đoán bệnh..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phương pháp điều trị *
            </label>
            <textarea
              value={formData.treatment}
              onChange={(e) => setFormData({...formData, treatment: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phương pháp điều trị..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đơn thuốc
            </label>
            <textarea
              value={formData.prescription}
              onChange={(e) => setFormData({...formData, prescription: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Danh sách thuốc được kê..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ghi chú thêm..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Đang điều trị">Đang điều trị</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Sau phẫu thuật">Sau phẫu thuật</option>
                <option value="Chuyển viện">Chuyển viện</option>
                <option value="Tử vong">Tử vong</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lần khám tiếp theo
              </label>
              <input
                type="date"
                value={formData.nextVisit}
                onChange={(e) => setFormData({...formData, nextVisit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedRecord(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Tạo hồ sơ"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Medical Record Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedRecord(null)
        }}
        title="Chi tiết hồ sơ khám bệnh"
        size="xl"
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã hồ sơ:</span>
                    <span className="font-medium">{selectedRecord.recordCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bệnh nhân:</span>
                    <span className="font-medium">{selectedRecord.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bác sĩ khám:</span>
                    <span className="font-medium">{selectedRecord.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khoa:</span>
                    <span className="font-medium">{selectedRecord.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày khám:</span>
                    <span className="font-medium">
                      {new Date(selectedRecord.visitDate).toLocaleDateString('vi-VN')} - {selectedRecord.visitTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Dấu hiệu sinh tồn</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Huyết áp</div>
                    <div className="font-medium">{selectedRecord.vitalSigns.bloodPressure}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Nhịp tim</div>
                    <div className="font-medium">{selectedRecord.vitalSigns.heartRate} bpm</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Nhiệt độ</div>
                    <div className="font-medium">{selectedRecord.vitalSigns.temperature}°C</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Cân nặng</div>
                    <div className="font-medium">{selectedRecord.vitalSigns.weight}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin y tế</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Triệu chứng</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRecord.symptoms}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Chẩn đoán</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRecord.diagnosis}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Điều trị</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRecord.treatment}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Đơn thuốc</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRecord.prescription || 'Không có'}</p>
                </div>
              </div>
              {selectedRecord.notes && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Ghi chú</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRecord.notes}</p>
                </div>
              )}
            </div>

            {/* Lab Results */}
            {selectedRecord.labResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Kết quả xét nghiệm</h3>
                <div className="space-y-3">
                  {selectedRecord.labResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{result.name}</h4>
                        <span className="text-sm text-gray-500">{result.date}</span>
                      </div>
                      <p className="text-gray-600">{result.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Visit */}
            {selectedRecord.nextVisit && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Lần khám tiếp theo</h4>
                <p className="text-blue-800">
                  {new Date(selectedRecord.nextVisit).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedRecord(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditRecord(selectedRecord)
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MedicalRecords
