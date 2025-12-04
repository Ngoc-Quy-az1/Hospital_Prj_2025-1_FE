import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Table from '../../components/Common/Table'
import Pagination from '../../components/Common/Pagination'
import { 
  Pill, 
  Plus, 
  Search, 
  Eye, 
  Edit,
  Printer,
  FileText,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Stethoscope
} from 'lucide-react'

const DoctorPrescriptions = () => {
  const { user } = useAuth()
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [prescriptionStats, setPrescriptionStats] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Dữ liệu đơn thuốc từ API với phân trang
  const [prescriptions, setPrescriptions] = useState([])
  const [pageInfo, setPageInfo] = useState({ 
    page: 0, 
    size: 20, 
    totalElements: 0, 
    totalPages: 0 
  })

  // Dữ liệu thuốc gợi ý & bệnh nhân
  const [availableMedicines, setAvailableMedicines] = useState([])
  const [availablePatients, setAvailablePatients] = useState([])
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('')

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientName: '',
    patientCode: '',
    diagnosis: '',
    medicines: [],
    totalAmount: 0,
    notes: ''
  })

  // Map prescription từ backend format
  const mapPrescription = (prescription) => {
    const totalAmount = prescription.danhSachChiTiet?.reduce((sum, item) => {
      const price = item.thuoc?.donGia || 0
      return sum + (price * item.soLuong)
    }, 0) || 0

    const rawId = prescription.donthuocId || prescription.donThuocId || prescription.id

    return {
      id: prescription.donThuocId || prescription.id,
      prescriptionCode: prescription.maDonThuoc || (rawId ? `DT${String(rawId).padStart(3, '0')}` : 'DT---'),
      patientName: prescription.benhnhan?.hoTen || prescription.benhnhan?.name || 'Không xác định',
      patientCode: prescription.benhnhan?.maBenhNhan || prescription.benhnhan?.patientCode || '',
      prescriptionDate: prescription.ngayKe || prescription.prescriptionDate,
      diagnosis: prescription.chanDoan || prescription.diagnosis || '',
      medicines: prescription.danhSachChiTiet?.map(item => ({
        id: item.donThuocChiTietId || item.id,
        name: item.thuoc?.tenThuoc || item.thuoc?.name || '',
        quantity: item.soLuong || 0,
        unit: item.thuoc?.donViTinh || item.unit || 'Viên',
        dosage: item.lieuDung || item.dosage || '',
        notes: item.ghiChu || item.notes || '',
        unitPrice: item.thuoc?.donGia || 0,
        totalPrice: (item.thuoc?.donGia || 0) * (item.soLuong || 0)
      })) || [],
      totalAmount: totalAmount,
      status: 'Đã kê đơn',
      notes: prescription.ghiChu || prescription.notes || ''
    }
  }

  // Load prescriptions from API với phân trang
  const loadPrescriptions = useCallback(async (page = 0, size = 20) => {
    setLoading(true)
    try {
      const response = await doctorAPI.getPrescriptions({ page, size })
      const prescriptionsData = response.content || response.data || []
      const mapped = prescriptionsData.map(mapPrescription)
      setPrescriptions(mapped)
      
      setPageInfo({
        page: response.number ?? page,
        size: response.size ?? size,
        totalElements: response.totalElements ?? 0,
        totalPages: response.totalPages ?? 0
      })
      
      // Load stats
      await loadPrescriptionStats()
    } catch (err) {
      console.error('Lỗi khi tải đơn thuốc:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load medicines theo tên nhập (search server-side, tránh tải 9000 bản ghi)
  useEffect(() => {
    if (!medicineSearchTerm || medicineSearchTerm.trim().length < 2) {
      setAvailableMedicines([])
      return
    }

    const term = medicineSearchTerm.trim()
    const handler = setTimeout(async () => {
      try {
        const response = await doctorAPI.getMedicines({ search: term, page: 0, size: 10 })
        const medicinesData = response.content || response.data || []
        const mappedMedicines = medicinesData.map(med => ({
          id: med.thuocId || med.id,
          name: med.tenThuoc || med.name || '',
          unitPrice: med.donGia ? parseFloat(med.donGia) : 0,
          unit: med.donViTinh || med.donVi || 'Viên',
          stock: med.tonKhoHienTai || med.stock || 0
        }))
        setAvailableMedicines(mappedMedicines)
      } catch (err) {
        console.error('Lỗi khi tìm thuốc:', err)
        setAvailableMedicines([])
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [medicineSearchTerm])

  const loadPatients = useCallback(async () => {
    try {
      const response = await doctorAPI.getPatients({ page: 0, size: 200 })
      const patientsData = response.content || response.data || []
      const mappedPatients = patientsData.map(patient => ({
        id: patient.benhnhanId || patient.id,
        name: patient.hoTen || patient.name || 'Không xác định',
        code: `BN${String(patient.benhnhanId || patient.id).padStart(3, '0')}`
      }))
      setAvailablePatients(mappedPatients)
    } catch (err) {
      console.error('Lỗi khi tải danh sách bệnh nhân:', err)
      setAvailablePatients([])
    }
  }, [])

  // Load prescriptions khi component mount
  useEffect(() => {
    loadPrescriptions(0, pageInfo.size)
    loadPatients()
  }, [])

  // Reload stats when date changes
  useEffect(() => {
    if (!loading) {
      loadPrescriptionStats()
    }
  }, [selectedDate])

  const loadPrescriptionStats = async () => {
    try {
      const stats = await doctorAPI.getPrescriptionStats(selectedDate)
      setPrescriptionStats(stats)
    } catch (err) {
      console.error('Lỗi khi tải thống kê đơn thuốc:', err)
    }
  }

  // Lọc đơn thuốc (dùng useMemo để tránh tính lại nặng trên mỗi lần gõ)
  const filteredPrescriptions = useMemo(() => {
    const search = searchTerm.toLowerCase()

    return prescriptions.filter(prescription => {
      const matchesSearch =
        prescription.prescriptionCode.toLowerCase().includes(search) ||
        prescription.patientName.toLowerCase().includes(search)

      const matchesStatus = !filterStatus || prescription.status === filterStatus

      // Lọc theo khoảng ngày kê
      let matchesDate = true
      if (filterDateFrom || filterDateTo) {
        const date = prescription.prescriptionDate ? new Date(prescription.prescriptionDate) : null
        if (!date) {
          matchesDate = false
        } else {
          if (filterDateFrom) {
            const from = new Date(filterDateFrom)
            if (date < from) matchesDate = false
          }
          if (filterDateTo) {
            const to = new Date(filterDateTo)
            // so sánh đến cuối ngày
            to.setHours(23, 59, 59, 999)
            if (date > to) matchesDate = false
          }
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [prescriptions, searchTerm, filterStatus, filterDateFrom, filterDateTo])

  const handleCreatePrescription = () => {
    setPrescriptionForm({
      patientName: '',
      patientCode: '',
      diagnosis: '',
      medicines: [],
      totalAmount: 0,
      notes: ''
    })
    setShowPrescriptionModal(true)
  }

  const handleViewPrescription = async (prescription) => {
    try {
      const id =
        prescription.id ||
        prescription.donThuocId ||
        prescription.donthuocId

      if (!id) {
        console.error('Không xác định được ID đơn thuốc để xem chi tiết:', prescription)
        alert('Không xác định được mã đơn thuốc, vui lòng tải lại trang và thử lại.')
        return
      }

      const response = await doctorAPI.getPrescriptionDetail(id)
      const mapped = mapPrescription(response)
      setSelectedPrescription(mapped)
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn thuốc:', err)
      setSelectedPrescription(prescription)
    }
  }

  const handleSubmitPrescription = async (e) => {
    e.preventDefault()
    
    try {
      // Tìm bệnh nhân từ patientCode
      const patient = availablePatients.find(p => p.code === prescriptionForm.patientCode)
      if (!patient) {
        alert('Vui lòng chọn bệnh nhân hợp lệ')
        return
      }

      // Map form data to API format
      const prescriptionData = {
        benhnhanId: patient.id,
        chanDoan: prescriptionForm.diagnosis,
        ngayKeDon: new Date().toISOString().split('T')[0],
        ghiChu: prescriptionForm.notes,
        chiTietDonThuoc: prescriptionForm.medicines.map(med => ({
          thuocId: med.id,
          soLuong: med.quantity,
          cachDung: med.dosage,
          ghiChu: med.notes || '',
          donGia: med.unitPrice || 0
        }))
      }
      
      console.log('Gửi dữ liệu đơn thuốc:', prescriptionData)
      
      const response = await doctorAPI.createPrescription(prescriptionData)
      console.log('Response từ API:', response)
      
      const newPrescription = mapPrescription(response)
      
      // Reload danh sách đơn thuốc
      await loadPrescriptions(0, pageInfo.size)
      await loadPrescriptionStats()
      
      setShowPrescriptionModal(false)
      
      // Reset form
      setPrescriptionForm({
        patientName: '',
        patientCode: '',
        diagnosis: '',
        medicines: [],
        totalAmount: 0,
        notes: ''
      })
      
      alert('Tạo đơn thuốc thành công!')
    } catch (err) {
      console.error('Lỗi khi tạo đơn thuốc:', err)
      alert('Lỗi khi tạo đơn thuốc: ' + (err.message || 'Vui lòng thử lại'))
    }
  }

  const addMedicineToPrescription = () => {
    const newMedicine = {
      // tempId dùng làm khóa tạm cho React, id để lưu id thuốc thật từ backend
      tempId: Date.now(),
      id: '',
      name: '',
      quantity: 1,
      unit: 'Viên',
      unitPrice: 0,
      totalPrice: 0,
      dosage: '',
      notes: ''
    }
    
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: [...prescriptionForm.medicines, newMedicine]
    })
  }

  const removeMedicineFromPrescription = (medicineId) => {
    const updatedMedicines = prescriptionForm.medicines.filter(
      med => (med.tempId || med.id) !== medicineId
    )
    const totalAmount = updatedMedicines.reduce((sum, med) => sum + med.totalPrice, 0)
    
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: updatedMedicines,
      totalAmount
    })
  }

  const updateMedicineInPrescription = (medicineId, field, value) => {
    // Cho phép truyền vào một object nhiều field để cập nhật cùng lúc
    const isObjectUpdate = typeof field === 'object' && field !== null

    const updatedMedicines = prescriptionForm.medicines.map(med => {
      if ((med.tempId || med.id) === medicineId) {
        const patch = isObjectUpdate ? field : { [field]: value }
        const updatedMed = { ...med, ...patch }
        
        if (
          Object.prototype.hasOwnProperty.call(patch, 'quantity') ||
          Object.prototype.hasOwnProperty.call(patch, 'unitPrice')
        ) {
          updatedMed.totalPrice = updatedMed.quantity * updatedMed.unitPrice
        }
        
        return updatedMed
      }
      return med
    })
    
    const totalAmount = updatedMedicines.reduce((sum, med) => sum + med.totalPrice, 0)
    
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: updatedMedicines,
      totalAmount
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Đã kê đơn': 'bg-green-100 text-green-800',
      'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
      'Đã hủy': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
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
          <div>
            <div className="text-sm font-medium">{value}</div>
            <div className="text-xs text-gray-500">{row.patientCode}</div>
          </div>
        </div>
      )
    },
    {
      key: 'prescriptionDate',
      label: 'Ngày kê',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'diagnosis',
      label: 'Chẩn đoán',
      render: (value) => (
        <div className="max-w-xs truncate" title={value || ''}>
          <div className="flex items-center gap-1">
            <Stethoscope className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{value || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'medicines',
      label: 'Số loại thuốc',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Pill className="w-4 h-4 text-gray-400" />
          <span>{value && Array.isArray(value) ? value.length : 0} loại</span>
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      render: (value) => `${parseInt(value || 0).toLocaleString('vi-VN')} VNĐ`
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === 'Đã kê đơn' ? <CheckCircle className="w-4 h-4 text-green-600" /> : 
           <Clock className="w-4 h-4 text-yellow-600" />}
          {getStatusBadge(value || 'Chưa xác định')}
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
            onClick={() => console.log('Print prescription:', row.prescriptionCode)}
          >
            In
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
          <h1 className="text-2xl font-bold text-gray-900">Kê đơn thuốc</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý đơn thuốc cho bệnh nhân</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={handleCreatePrescription}
        >
          Kê đơn thuốc mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {prescriptionStats?.totalPrescriptions ?? pageInfo.totalElements}
          </div>
          <div className="text-gray-600">Tổng đơn thuốc</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {prescriptionStats?.totalMedicines ?? prescriptions.reduce((sum, p) => sum + p.medicines.length, 0)}
          </div>
          <div className="text-gray-600">Tổng số thuốc</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {prescriptionStats?.totalValue 
              ? `${prescriptionStats.totalValue.toLocaleString('vi-VN')} VNĐ`
              : `${prescriptions.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString('vi-VN')} VNĐ`}
          </div>
          <div className="text-gray-600">Tổng giá trị</div>
        </Card>
        <Card className="text-center">
          <div className="text-sm text-gray-600 mb-2">Chọn ngày</div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Ô tìm kiếm */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên bệnh nhân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          {/* Ô trạng thái */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đã kê đơn">Đã kê đơn</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          {/* Ngày kê từ */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Ngày kê từ
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Ngày kê đến */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Ngày kê đến
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Prescriptions Table */}
      <Card title="Danh sách đơn thuốc">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có đơn thuốc nào
          </div>
        ) : (
          <>
            <Table
              data={filteredPrescriptions}
              columns={prescriptionColumns}
              searchable={false}
            />
            <Pagination
              currentPage={pageInfo.page}
              totalPages={pageInfo.totalPages}
              totalElements={pageInfo.totalElements}
              pageSize={pageInfo.size}
              onPageChange={(page) => loadPrescriptions(page, pageInfo.size)}
              onPageSizeChange={(size) => loadPrescriptions(0, size)}
            />
          </>
        )}
      </Card>

      {/* Prescription Modal */}
      <Modal
        isOpen={showPrescriptionModal}
        onClose={() => {
          setShowPrescriptionModal(false)
          setSelectedPrescription(null)
        }}
        title="Kê đơn thuốc mới"
        size="xl"
      >
        <form onSubmit={handleSubmitPrescription} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn bệnh nhân *
              </label>
              <select
                value={prescriptionForm.patientCode}
                onChange={(e) => {
                  const selectedPatient = availablePatients.find(p => p.code === e.target.value)
                  setPrescriptionForm({
                    ...prescriptionForm,
                    patientCode: e.target.value,
                    patientName: selectedPatient ? selectedPatient.name : ''
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Chọn bệnh nhân --</option>
                {availablePatients.map(patient => (
                  <option key={patient.id} value={patient.code}>
                    {patient.code} - {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên bệnh nhân
              </label>
              <input
                type="text"
                value={prescriptionForm.patientName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chẩn đoán *
              </label>
              <textarea
                value={prescriptionForm.diagnosis}
                onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
              {prescriptionForm.medicines.map((medicine, index) => (
                <div key={medicine.tempId || medicine.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Thuốc {index + 1}</h4>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeMedicineFromPrescription(medicine.tempId || medicine.id)}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên thuốc *
                      </label>
                      <input
                        type="text"
                        value={medicine.name}
                        onChange={(e) => {
                          const value = e.target.value
                          const trimmed = value.trim().toLowerCase()

                          // cập nhật term để gọi API search thuốc
                          setMedicineSearchTerm(value)

                          // Tìm thuốc gợi ý theo tên có chứa chuỗi nhập, giới hạn 1 thuốc đầu
                          const matched = availableMedicines
                            .filter(m => m.name && m.name.toLowerCase().includes(trimmed))
                            .slice(0, 1)[0]

                          const medicineId = medicine.tempId || medicine.id
                          updateMedicineInPrescription(medicineId, {
                            name: value,
                            id: matched ? matched.id : medicine.id,
                            unitPrice: matched ? matched.unitPrice : medicine.unitPrice,
                            unit: matched ? matched.unit : medicine.unit
                          })
                        }}
                        list={`medicine-suggestions-${index}`}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập tên thuốc"
                        required
                      />
                      <datalist id={`medicine-suggestions-${index}`}>
                        {availableMedicines
                          .filter(m => !medicine.name || m.name.toLowerCase().includes(medicine.name.toLowerCase()))
                          .slice(0, 10)
                          .map(med => (
                            <option
                              key={med.id}
                              value={med.name}
                            >
                              {med.name}
                            </option>
                          ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng *
                      </label>
                      <input
                        type="number"
                        value={medicine.quantity}
                        onChange={(e) => updateMedicineInPrescription(medicine.tempId || medicine.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cách dùng *
                      </label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicineInPrescription(medicine.tempId || medicine.id, 'dosage', e.target.value)}
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
                        onChange={(e) => updateMedicineInPrescription(medicine.tempId || medicine.id, 'notes', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: Uống sau ăn"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Đơn giá (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={medicine.unitPrice}
                        onChange={(e) =>
                          updateMedicineInPrescription(
                            medicine.tempId || medicine.id,
                            'unitPrice',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {prescriptionForm.medicines.length === 0 && (
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

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="text-xl font-bold text-blue-600">
                {prescriptionForm.totalAmount.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú đơn thuốc
            </label>
            <textarea
              value={prescriptionForm.notes}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
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
                setShowPrescriptionModal(false)
                setSelectedPrescription(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              Kê đơn thuốc
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        isOpen={selectedPrescription !== null && !showPrescriptionModal}
        onClose={() => setSelectedPrescription(null)}
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
                    <span className="text-gray-600">Mã BN:</span>
                    <span className="font-medium">{selectedPrescription.patientCode}</span>
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
                <h3 className="text-lg font-semibold text-gray-900">Chẩn đoán</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
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
                          <div>Đơn giá: {parseInt(medicine.unitPrice || 0).toLocaleString('vi-VN')} VNĐ</div>
                          <div>Thành tiền: {parseInt(medicine.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="text-xl font-bold text-blue-600">
                  {parseInt(selectedPrescription.totalAmount).toLocaleString('vi-VN')} VNĐ
                </span>
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
                onClick={() => console.log('Print prescription:', selectedPrescription.prescriptionCode)}
              >
                In đơn thuốc
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedPrescription(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DoctorPrescriptions










