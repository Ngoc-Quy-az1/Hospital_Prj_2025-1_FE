import React, { useState, useEffect } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { adminAPI } from '../../../services/api'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Download,
  Printer,
  Pill,
  Stethoscope,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign
} from 'lucide-react'

const PrescriptionManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDoctor, setFilterDoctor] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Dữ liệu từ API
  const [prescriptions, setPrescriptions] = useState([])

  // Load prescriptions from API
  useEffect(() => {
    loadPrescriptions()
  }, [page, searchTerm, filterDoctor, filterStatus])

  const loadPrescriptions = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getPrescriptions(page, size, {
        search: searchTerm || undefined,
        doctorId: filterDoctor ? parseInt(filterDoctor) : undefined,
        patientId: undefined
      })
      const fetchedPrescriptions = response.content || response.data || []
      setPrescriptions(fetchedPrescriptions.map(formatPrescription))
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn thuốc:', err)
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrescription = (prescription) => ({
    id: prescription.donthuocId || prescription.id,
    prescriptionCode: prescription.prescriptionCode || `DT${String(prescription.donthuocId || prescription.id).padStart(3, '0')}`,
    patientId: prescription.patientId || prescription.benhnhan?.benhnhanId,
    patientName: prescription.patientName || prescription.benhnhan?.hoTen,
    doctorId: prescription.doctorId || prescription.bacsi?.bacsiId,
    doctorName: prescription.doctorName || prescription.bacsi?.hoTen,
    prescriptionDate: prescription.prescriptionDate || prescription.ngayKe,
    totalAmount: prescription.totalAmount || 0,
    status: prescription.status || null,
    medicines: prescription.medicines || [],
    notes: prescription.notes || prescription.ghiChu || ''
  })

  // Removed hardcoded data - should come from API
  const doctors = []
  const medicines = []

  const [formData, setFormData] = useState({
    prescriptionCode: '',
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    prescriptionDate: '',
    totalAmount: 0,
    status: 'Chờ cấp thuốc',
    medicines: [],
    notes: ''
  })

  // Filtering is done on server side via API
  const filteredPrescriptions = prescriptions

  const handleAddPrescription = () => {
    // Tạo mã đơn thuốc mới
    const newCode = `DT${String(prescriptions.length + 1).padStart(3, '0')}`
    
    setFormData({
      prescriptionCode: newCode,
      patientId: '',
      patientName: '',
      doctorId: '',
      doctorName: '',
      prescriptionDate: new Date().toISOString().split('T')[0],
      totalAmount: 0,
      status: 'Chờ cấp thuốc',
      medicines: [],
      notes: ''
    })
    setShowAddModal(true)
  }

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription)
    setFormData(prescription)
    setShowEditModal(true)
  }

  const handleViewPrescription = async (prescription) => {
    try {
      const detail = await adminAPI.getPrescriptionDetail(prescription.id)
      setSelectedPrescription(formatPrescriptionDetail(detail))
      setShowViewModal(true)
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn thuốc:', err)
      setSelectedPrescription(prescription)
      setShowViewModal(true)
    }
  }

  const formatPrescriptionDetail = (detail) => ({
    id: detail.donthuocId || detail.id,
    prescriptionCode: detail.prescriptionCode || `DT${String(detail.donthuocId || detail.id).padStart(3, '0')}`,
    patientId: detail.patientId || detail.benhnhan?.benhnhanId,
    patientName: detail.patientName || detail.benhnhan?.hoTen,
    doctorId: detail.doctorId || detail.bacsi?.bacsiId,
    doctorName: detail.doctorName || detail.bacsi?.hoTen,
    prescriptionDate: detail.prescriptionDate || detail.ngayKe,
    totalAmount: detail.totalAmount || 0,
    status: detail.status || null,
    medicines: detail.medicines || [],
    notes: detail.notes || detail.ghiChu || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (showEditModal && selectedPrescription) {
      // Cập nhật đơn thuốc
      setPrescriptions(prescriptions.map(prescription => 
        prescription.id === selectedPrescription.id ? { ...prescription, ...formData } : prescription
      ))
      setShowEditModal(false)
    } else {
      // Thêm đơn thuốc mới
      const newPrescription = {
        id: prescriptions.length + 1,
        ...formData
      }
      setPrescriptions([...prescriptions, newPrescription])
      setShowAddModal(false)
    }
  }

  const handlePrintPrescription = (prescription) => {
    console.log('Print prescription:', prescription.prescriptionCode)
    // Implement print functionality
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Chờ cấp thuốc': 'bg-yellow-100 text-yellow-800',
      'Đã cấp thuốc': 'bg-green-100 text-green-800',
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
      case 'Đã cấp thuốc': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Chờ cấp thuốc': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'Đã hủy': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const addMedicineToPrescription = () => {
    const newMedicine = {
      id: Date.now(),
      name: '',
      quantity: 1,
      unit: 'Viên',
      unitPrice: 0,
      totalPrice: 0,
      dosage: '',
      notes: ''
    }
    
    setFormData({
      ...formData,
      medicines: [...formData.medicines, newMedicine]
    })
  }

  const removeMedicineFromPrescription = (medicineId) => {
    const updatedMedicines = formData.medicines.filter(med => med.id !== medicineId)
    const totalAmount = updatedMedicines.reduce((sum, med) => sum + med.totalPrice, 0)
    
    setFormData({
      ...formData,
      medicines: updatedMedicines,
      totalAmount
    })
  }

  const updateMedicineInPrescription = (medicineId, field, value) => {
    const updatedMedicines = formData.medicines.map(med => {
      if (med.id === medicineId) {
        const updatedMed = { ...med, [field]: value }
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedMed.totalPrice = updatedMed.quantity * updatedMed.unitPrice
        }
        
        return updatedMed
      }
      return med
    })
    
    const totalAmount = updatedMedicines.reduce((sum, med) => sum + med.totalPrice, 0)
    
    setFormData({
      ...formData,
      medicines: updatedMedicines,
      totalAmount
    })
  }

  // Cột cho bảng đơn thuốc
  const prescriptionColumns = [
    {
      key: 'prescriptionCode',
      label: 'Mã đơn',
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
      key: 'prescriptionDate',
      label: 'Ngày kê đơn',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'medicines',
      label: 'Số loại thuốc',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Pill className="w-4 h-4 text-gray-400" />
          <span>{value?.length || 0} loại</span>
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      render: (value) => `${parseInt(value).toLocaleString('vi-VN')} VNĐ`
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
            onClick={() => handleViewPrescription(row)}
          >
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => handlePrintPrescription(row)}
          >
            In
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditPrescription(row)}
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
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý đơn thuốc</h1>
            <p className="text-cyan-100">Quản lý đơn thuốc và cấp phát thuốc</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddPrescription}
            className="bg-white text-cyan-600 hover:bg-cyan-50"
          >
            Tạo đơn thuốc
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
              <div className="text-sm font-medium text-gray-500">Tổng đơn thuốc</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{prescriptions.length}</div>
            <div className="text-sm text-gray-500">Tất cả đơn thuốc</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Chờ cấp thuốc</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {prescriptions.filter(p => p.status === 'Chờ cấp thuốc').length}
            </div>
            <div className="text-sm text-gray-500">Đang chờ xử lý</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đã cấp thuốc</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {prescriptions.filter(p => p.status === 'Đã cấp thuốc').length}
            </div>
            <div className="text-sm text-gray-500">Đã hoàn thành</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng giá trị</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {prescriptions.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString('vi-VN')} VNĐ
            </div>
            <div className="text-sm text-gray-500">Tổng doanh thu</div>
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
              placeholder="Tìm kiếm đơn thuốc..."
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
            <option value="Chờ cấp thuốc">Chờ cấp thuốc</option>
            <option value="Đã cấp thuốc">Đã cấp thuốc</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </Card>

      {/* Prescription Table */}
      <Card title="Danh sách đơn thuốc">
        <Table
          data={filteredPrescriptions}
          columns={prescriptionColumns}
          searchable={false}
        />
      </Card>

      {/* Add/Edit Prescription Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedPrescription(null)
        }}
        title={showEditModal ? "Sửa đơn thuốc" : "Tạo đơn thuốc mới"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã đơn thuốc
              </label>
              <input
                type="text"
                value={formData.prescriptionCode}
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
                Bác sĩ kê đơn *
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
                Ngày kê đơn *
              </label>
              <input
                type="date"
                value={formData.prescriptionDate}
                onChange={(e) => setFormData({...formData, prescriptionDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
                <option value="Chờ cấp thuốc">Chờ cấp thuốc</option>
                <option value="Đã cấp thuốc">Đã cấp thuốc</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tổng tiền
              </label>
              <input
                type="text"
                value={`${formData.totalAmount.toLocaleString('vi-VN')} VNĐ`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Danh sách thuốc *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={addMedicineToPrescription}
              >
                Thêm thuốc
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {formData.medicines.map((medicine, index) => (
                <div key={medicine.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Thuốc {index + 1}</h4>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeMedicineFromPrescription(medicine.id)}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên thuốc *
                      </label>
                      <select
                        value={medicine.name}
                        onChange={(e) => {
                          const selectedMedicine = medicines.find(m => m.name === e.target.value)
                          updateMedicineInPrescription(medicine.id, 'name', e.target.value)
                          if (selectedMedicine) {
                            updateMedicineInPrescription(medicine.id, 'unitPrice', selectedMedicine.unitPrice)
                            updateMedicineInPrescription(medicine.id, 'unit', selectedMedicine.unit)
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Chọn thuốc</option>
                        {medicines.map(med => (
                          <option key={med.id} value={med.name}>{med.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng *
                      </label>
                      <input
                        type="number"
                        value={medicine.quantity}
                        onChange={(e) => updateMedicineInPrescription(medicine.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Đơn giá (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={medicine.unitPrice}
                        onChange={(e) => updateMedicineInPrescription(medicine.id, 'unitPrice', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cách dùng *
                      </label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicineInPrescription(medicine.id, 'dosage', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: 1 viên x 3 lần/ngày"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <input
                        type="text"
                        value={medicine.notes}
                        onChange={(e) => updateMedicineInPrescription(medicine.id, 'notes', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: Uống sau ăn"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Thành tiền
                      </label>
                      <input
                        type="text"
                        value={`${medicine.totalPrice.toLocaleString('vi-VN')} VNĐ`}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.medicines.length === 0 && (
              <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có thuốc nào được thêm</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={addMedicineToPrescription}
                >
                  Thêm thuốc đầu tiên
                </Button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú đơn thuốc
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hướng dẫn sử dụng, lưu ý đặc biệt..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedPrescription(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Tạo đơn thuốc"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedPrescription(null)
        }}
        title="Chi tiết đơn thuốc"
        size="xl"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin đơn thuốc</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn:</span>
                    <span className="font-medium">{selectedPrescription.prescriptionCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bệnh nhân:</span>
                    <span className="font-medium">{selectedPrescription.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bác sĩ:</span>
                    <span className="font-medium">{selectedPrescription.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày kê:</span>
                    <span className="font-medium">
                      {new Date(selectedPrescription.prescriptionDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedPrescription.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin thanh toán</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {parseInt(selectedPrescription.totalAmount).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedPrescription.medicines.length} loại thuốc
                  </div>
                </div>
              </div>
            </div>

            {/* Medicines */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách thuốc</h3>
              <div className="space-y-3">
                {selectedPrescription.medicines.map((medicine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-gray-900 mb-2">{medicine.name}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Số lượng:</strong> {medicine.quantity} {medicine.unit}</div>
                          <div><strong>Cách dùng:</strong> {medicine.dosage}</div>
                          {medicine.notes && <div><strong>Ghi chú:</strong> {medicine.notes}</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-2">
                          <div>Đơn giá: {parseInt(medicine.unitPrice).toLocaleString('vi-VN')} VNĐ</div>
                          <div>Thành tiền: {parseInt(medicine.totalPrice).toLocaleString('vi-VN')} VNĐ</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedPrescription.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Ghi chú</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{selectedPrescription.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => handlePrintPrescription(selectedPrescription)}
              >
                In đơn thuốc
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedPrescription(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditPrescription(selectedPrescription)
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

export default PrescriptionManagement
