import React, { useState } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { 
  TestTube, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Download,
  Printer,
  FileText,
  Stethoscope,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity
} from 'lucide-react'

const LabTests = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDoctor, setFilterDoctor] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Dữ liệu mẫu xét nghiệm
  const [labTests, setLabTests] = useState([
    {
      id: 1,
      testCode: 'XN001',
      patientId: 1,
      patientName: 'Nguyễn Thị An',
      doctorId: 1,
      doctorName: 'BS. Nguyễn Văn An',
      requestDate: '2024-01-15',
      testType: 'Xét nghiệm máu',
      tests: [
        { name: 'Công thức máu', result: 'Bình thường', unit: '', reference: 'Bình thường' },
        { name: 'Đường huyết', result: '5.2', unit: 'mmol/L', reference: '3.9-6.1' },
        { name: 'Cholesterol', result: '4.8', unit: 'mmol/L', reference: '<5.2' }
      ],
      status: 'Hoàn thành',
      completedDate: '2024-01-15',
      technician: 'KT. Trần Thị Bình',
      notes: 'Kết quả bình thường'
    },
    {
      id: 2,
      testCode: 'XN002',
      patientId: 2,
      patientName: 'Trần Văn Bình',
      doctorId: 2,
      doctorName: 'BS. Phạm Thị Dung',
      requestDate: '2024-01-16',
      testType: 'Xét nghiệm nước tiểu',
      tests: [
        { name: 'Protein', result: 'Âm tính', unit: '', reference: 'Âm tính' },
        { name: 'Glucose', result: 'Âm tính', unit: '', reference: 'Âm tính' },
        { name: 'Leukocytes', result: 'Âm tính', unit: '', reference: 'Âm tính' }
      ],
      status: 'Đang xử lý',
      completedDate: '',
      technician: '',
      notes: ''
    }
  ])

  const doctors = [
    { id: 1, name: 'BS. Nguyễn Văn An', department: 'Khoa Tim mạch' },
    { id: 2, name: 'BS. Phạm Thị Dung', department: 'Khoa Nội' },
    { id: 3, name: 'BS. Vũ Thị Phương', department: 'Khoa Ngoại' }
  ]

  const technicians = [
    { id: 1, name: 'KT. Trần Thị Bình', department: 'Khoa Xét nghiệm' },
    { id: 2, name: 'KT. Lê Văn Cường', department: 'Khoa Xét nghiệm' },
    { id: 3, name: 'KT. Nguyễn Thị Dung', department: 'Khoa Xét nghiệm' }
  ]

  const testTypes = [
    'Xét nghiệm máu', 'Xét nghiệm nước tiểu', 'Xét nghiệm phân',
    'Siêu âm', 'X-quang', 'CT Scan', 'MRI', 'Điện tâm đồ'
  ]

  const [formData, setFormData] = useState({
    testCode: '',
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    requestDate: '',
    testType: '',
    tests: [],
    status: 'Chờ xử lý',
    completedDate: '',
    technician: '',
    notes: ''
  })

  // Lọc xét nghiệm
  const filteredTests = labTests.filter(test => {
    const matchesSearch = test.testCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.testType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDoctor = !filterDoctor || test.doctorId === parseInt(filterDoctor)
    const matchesStatus = !filterStatus || test.status === filterStatus
    
    return matchesSearch && matchesDoctor && matchesStatus
  })

  const handleAddTest = () => {
    const newCode = `XN${String(labTests.length + 1).padStart(3, '0')}`
    
    setFormData({
      testCode: newCode,
      patientId: '',
      patientName: '',
      doctorId: '',
      doctorName: '',
      requestDate: new Date().toISOString().split('T')[0],
      testType: '',
      tests: [],
      status: 'Chờ xử lý',
      completedDate: '',
      technician: '',
      notes: ''
    })
    setShowAddModal(true)
  }

  const handleEditTest = (test) => {
    setSelectedTest(test)
    setFormData(test)
    setShowEditModal(true)
  }

  const handleViewTest = (test) => {
    setSelectedTest(test)
    setShowViewModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (showEditModal && selectedTest) {
      setLabTests(labTests.map(test => 
        test.id === selectedTest.id ? { ...test, ...formData } : test
      ))
      setShowEditModal(false)
    } else {
      const newTest = {
        id: labTests.length + 1,
        ...formData
      }
      setLabTests([...labTests, newTest])
      setShowAddModal(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Chờ xử lý': 'bg-yellow-100 text-yellow-800',
      'Đang xử lý': 'bg-blue-100 text-blue-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Đã hủy': 'bg-red-100 text-red-800'
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
      case 'Đang xử lý': return <Activity className="w-4 h-4 text-blue-600" />
      case 'Chờ xử lý': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'Đã hủy': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const addTestItem = () => {
    const newTest = {
      id: Date.now(),
      name: '',
      result: '',
      unit: '',
      reference: ''
    }
    
    setFormData({
      ...formData,
      tests: [...formData.tests, newTest]
    })
  }

  const removeTestItem = (testId) => {
    setFormData({
      ...formData,
      tests: formData.tests.filter(test => test.id !== testId)
    })
  }

  const updateTestItem = (testId, field, value) => {
    const updatedTests = formData.tests.map(test => 
      test.id === testId ? { ...test, [field]: value } : test
    )
    
    setFormData({
      ...formData,
      tests: updatedTests
    })
  }

  // Cột cho bảng xét nghiệm
  const testColumns = [
    {
      key: 'testCode',
      label: 'Mã XN',
      render: (value, row) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'patientName',
      label: 'Bệnh nhân',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
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
      key: 'testType',
      label: 'Loại xét nghiệm',
      render: (value) => (
        <div className="flex items-center gap-2">
          <TestTube className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'requestDate',
      label: 'Ngày yêu cầu',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
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
            onClick={() => handleViewTest(row)}
          >
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => console.log('Print test result:', row.testCode)}
          >
            In
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditTest(row)}
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
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý xét nghiệm</h1>
            <p className="text-rose-100">Quản lý xét nghiệm và kết quả cận lâm sàng</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddTest}
            className="bg-white text-rose-600 hover:bg-rose-50"
          >
            Tạo yêu cầu xét nghiệm
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
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng xét nghiệm</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{labTests.length}</div>
            <div className="text-sm text-gray-500">Tất cả yêu cầu</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Chờ xử lý</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {labTests.filter(t => t.status === 'Chờ xử lý').length}
            </div>
            <div className="text-sm text-gray-500">Đang chờ</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đang xử lý</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {labTests.filter(t => t.status === 'Đang xử lý').length}
            </div>
            <div className="text-sm text-gray-500">Đang thực hiện</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Hoàn thành</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {labTests.filter(t => t.status === 'Hoàn thành').length}
            </div>
            <div className="text-sm text-gray-500">Đã có kết quả</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm xét nghiệm..."
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </Card>

      {/* Lab Tests Table */}
      <Card title="Danh sách xét nghiệm">
        <Table
          data={filteredTests}
          columns={testColumns}
          searchable={false}
        />
      </Card>

      {/* Add/Edit Test Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedTest(null)
        }}
        title={showEditModal ? "Sửa xét nghiệm" : "Tạo yêu cầu xét nghiệm mới"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã xét nghiệm
              </label>
              <input
                type="text"
                value={formData.testCode}
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
                Bác sĩ yêu cầu *
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => {
                  const doctor = doctors.find(d => d.id === parseInt(e.target.value))
                  setFormData({
                    ...formData, 
                    doctorId: e.target.value,
                    doctorName: doctor?.name || ''
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
                Ngày yêu cầu *
              </label>
              <input
                type="date"
                value={formData.requestDate}
                onChange={(e) => setFormData({...formData, requestDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại xét nghiệm *
              </label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData({...formData, testType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn loại xét nghiệm</option>
                {testTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

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
                <option value="Chờ xử lý">Chờ xử lý</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>

            {formData.status === 'Hoàn thành' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hoàn thành
                </label>
                <input
                  type="date"
                  value={formData.completedDate}
                  onChange={(e) => setFormData({...formData, completedDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {formData.status === 'Hoàn thành' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kỹ thuật viên
                </label>
                <select
                  value={formData.technician}
                  onChange={(e) => setFormData({...formData, technician: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn kỹ thuật viên</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.name}>{tech.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Test Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Chi tiết xét nghiệm *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={addTestItem}
              >
                Thêm xét nghiệm
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {formData.tests.map((test, index) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Xét nghiệm {index + 1}</h4>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeTestItem(test.id)}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên xét nghiệm *
                      </label>
                      <input
                        type="text"
                        value={test.name}
                        onChange={(e) => updateTestItem(test.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Kết quả
                      </label>
                      <input
                        type="text"
                        value={test.result}
                        onChange={(e) => updateTestItem(test.id, 'result', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Đơn vị
                      </label>
                      <input
                        type="text"
                        value={test.unit}
                        onChange={(e) => updateTestItem(test.id, 'unit', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: mg/dL, mmol/L"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá trị tham chiếu
                      </label>
                      <input
                        type="text"
                        value={test.reference}
                        onChange={(e) => updateTestItem(test.id, 'reference', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: 3.9-6.1, Bình thường"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.tests.length === 0 && (
              <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có xét nghiệm nào được thêm</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={addTestItem}
                >
                  Thêm xét nghiệm đầu tiên
                </Button>
              </div>
            )}
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
              placeholder="Ghi chú về kết quả xét nghiệm..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedTest(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Tạo yêu cầu"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Test Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedTest(null)
        }}
        title="Chi tiết xét nghiệm"
        size="xl"
      >
        {selectedTest && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin xét nghiệm</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã xét nghiệm:</span>
                    <span className="font-medium">{selectedTest.testCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bệnh nhân:</span>
                    <span className="font-medium">{selectedTest.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bác sĩ:</span>
                    <span className="font-medium">{selectedTest.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại xét nghiệm:</span>
                    <span className="font-medium">{selectedTest.testType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày yêu cầu:</span>
                    <span className="font-medium">
                      {new Date(selectedTest.requestDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedTest.status)}
                  </div>
                </div>
              </div>

              {selectedTest.status === 'Hoàn thành' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin hoàn thành</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày hoàn thành:</span>
                      <span className="font-medium">
                        {selectedTest.completedDate ? new Date(selectedTest.completedDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kỹ thuật viên:</span>
                      <span className="font-medium">{selectedTest.technician || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Test Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Kết quả xét nghiệm</h3>
              <div className="space-y-3">
                {selectedTest.tests.map((test, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{test.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Kết quả</div>
                        <div className="font-medium text-gray-900">
                          {test.result} {test.unit}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Giá trị tham chiếu</div>
                        <div className="font-medium text-gray-900">{test.reference}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Trạng thái</div>
                        <div className={`font-medium ${
                          test.result === 'Bình thường' || test.result === 'Âm tính' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {test.result === 'Bình thường' || test.result === 'Âm tính' ? 'Bình thường' : 'Bất thường'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedTest.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Ghi chú</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{selectedTest.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => console.log('Print test result:', selectedTest.testCode)}
              >
                In kết quả
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedTest(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditTest(selectedTest)
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

export default LabTests

