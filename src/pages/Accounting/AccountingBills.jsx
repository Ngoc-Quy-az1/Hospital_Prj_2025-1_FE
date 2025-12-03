import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Table from '../../components/Common/Table'
import { accountantAPI } from '../../services/api'
import { 
  Receipt, 
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
  DollarSign,
  CreditCard,
  Download,
  Filter
} from 'lucide-react'

const AccountingBills = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreateBillModal, setShowCreateBillModal] = useState(false)
  const [showBillDetailModal, setShowBillDetailModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateRange, setFilterDateRange] = useState('')

  // Danh sách hóa đơn từ API
  const [bills, setBills] = useState([])

  const [billForm, setBillForm] = useState({
    patientName: '',
    patientCode: '',
    services: [],
    medicines: [],
    subtotal: 0,
    discount: 0,
    insuranceCoverage: 0,
    totalAmount: 0,
    paymentMethod: '',
    notes: ''
  })

  // Dữ liệu mẫu dịch vụ và thuốc
  const availableServices = [
    { id: 1, name: 'Khám tim mạch', price: 150000 },
    { id: 2, name: 'Khám tiêu hóa', price: 120000 },
    { id: 3, name: 'Khám nội', price: 100000 },
    { id: 4, name: 'Điện tâm đồ', price: 80000 },
    { id: 5, name: 'Siêu âm tim', price: 200000 },
    { id: 6, name: 'Xét nghiệm máu', price: 150000 }
  ]

  const availableMedicines = [
    { id: 1, name: 'Paracetamol 500mg', price: 500 },
    { id: 2, name: 'Amoxicillin 250mg', price: 1200 },
    { id: 3, name: 'Omeprazole 20mg', price: 2500 },
    { id: 4, name: 'Metformin 500mg', price: 800 },
    { id: 5, name: 'Aspirin 81mg', price: 300 }
  ]

  // Load bills from API
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await accountantAPI.getBills()
        const rawBills = res?.content || res?.data || res || []

        if (Array.isArray(rawBills) && rawBills.length > 0) {
          // Chuẩn hóa dữ liệu cho bảng hiện tại
          const normalized = rawBills.map((b) => ({
            id: b.id ?? b.billId ?? Math.random(),
            billCode: b.maHoaDon || b.billCode || `HD${(b.id || '').toString().padStart(3, '0')}`,
            patientName: b.benhnhanName || b.patientName || 'Bệnh nhân',
            patientCode: b.benhnhanCode || b.patientCode || 'BN---',
            billDate: b.ngayLap || b.billDate || new Date().toISOString().split('T')[0],
            billTime: b.billTime || '00:00',
            services: (b.chiTiet || b.services || []).map((s, idx) => ({
              id: s.id || idx + 1,
              name: s.tenDichVu || s.name,
              quantity: s.soLuong || s.quantity || 1,
              unitPrice: s.donGia || s.unitPrice || 0,
              totalPrice: (s.soLuong || s.quantity || 1) * (s.donGia || s.unitPrice || 0)
            })),
            medicines: b.medicines || [],
            subtotal: b.tongTien || b.subtotal || ((b.chiTiet || []).reduce((sum, s) => sum + (s.soLuong || 1) * (s.donGia || 0), 0)),
            discount: b.giamGia || b.discount || 0,
            insuranceCoverage: b.bhytChiTra || b.insuranceCoverage || 0,
            totalAmount: b.soTienPhaiTra || b.totalAmount || (b.tongTien || 0) - (b.giamGia || 0) - (b.bhytChiTra || 0),
            paymentMethod: b.phuongThucThanhToan || b.paymentMethod || 'Tiền mặt',
            status: b.trangThaiLabel || b.status || 'Chờ thanh toán',
            notes: b.ghiChu || b.notes || ''
          }))
          setBills(normalized)
        } else {
          setBills([])
        }
      } catch (e) {
        console.error(e)
        setError('Không tải được danh sách hóa đơn')
        setBills([])
      } finally {
        setLoading(false)
      }
    }
    fetchBills()
  }, [])

  // Lọc hóa đơn
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || bill.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleCreateBill = () => {
    setBillForm({
      patientName: '',
      patientCode: '',
      services: [],
      medicines: [],
      subtotal: 0,
      discount: 0,
      insuranceCoverage: 0,
      totalAmount: 0,
      paymentMethod: '',
      notes: ''
    })
    setShowCreateBillModal(true)
  }

  const handleViewBill = (bill) => {
    setSelectedBill(bill)
    setShowBillDetailModal(true)
  }

  const handleSubmitBill = async (e) => {
    e.preventDefault()
      try {
        // Map form -> API payload -> BillCreationDTO (backend)
        const benhnhanId = parseInt((billForm.patientCode || '').replace(/\D/g, '')) || 0
        const payload = {
          benhnhanId,
          ngayLap: new Date().toISOString().split('T')[0],
          tongTien: billForm.totalAmount,
          danhSachDichVu: billForm.services.map(s => ({
            tenDichVu: s.name,
            soLuong: s.quantity,
            donGia: s.unitPrice,
          })),
          ghiChu: billForm.notes || '',
        }

        const res = await accountantAPI.createBill(payload)
      if (res) {
        // Reload bills from API
        const refreshed = await accountantAPI.getBills()
        const rawBills = refreshed?.content || refreshed?.data || refreshed || []
        if (Array.isArray(rawBills) && rawBills.length > 0) {
          const normalized = rawBills.map((b) => ({
            id: b.id ?? b.billId ?? Math.random(),
            billCode: b.maHoaDon || b.billCode || `HD${(b.id || '').toString().padStart(3, '0')}`,
            patientName: b.benhnhanName || b.patientName || 'Bệnh nhân',
            patientCode: b.benhnhanCode || b.patientCode || 'BN---',
            billDate: b.ngayLap || b.billDate || new Date().toISOString().split('T')[0],
            billTime: b.billTime || '00:00',
            services: (b.chiTiet || b.services || []).map((s, idx) => ({
              id: s.id || idx + 1,
              name: s.tenDichVu || s.name,
              quantity: s.soLuong || s.quantity || 1,
              unitPrice: s.donGia || s.unitPrice || 0,
              totalPrice: (s.soLuong || s.quantity || 1) * (s.donGia || s.unitPrice || 0)
            })),
            medicines: b.medicines || [],
            subtotal: b.tongTien || b.subtotal || ((b.chiTiet || []).reduce((sum, s) => sum + (s.soLuong || 1) * (s.donGia || 0), 0)),
            discount: b.giamGia || b.discount || 0,
            insuranceCoverage: b.bhytChiTra || b.insuranceCoverage || 0,
            totalAmount: b.soTienPhaiTra || b.totalAmount || (b.tongTien || 0) - (b.giamGia || 0) - (b.bhytChiTra || 0),
            paymentMethod: b.phuongThucThanhToan || b.paymentMethod || 'Tiền mặt',
            status: b.trangThaiLabel || b.status || 'Chờ thanh toán',
            notes: b.ghiChu || b.notes || ''
          }))
          setBills(normalized)
        }
        setShowCreateBillModal(false)
      }
    } catch (e) {
      console.error(e)
      alert('Tạo hóa đơn thất bại')
    }
  }

  const handleConfirmBill = async (bill) => {
    try {
      await accountantAPI.confirmBill(bill.id)
      setBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: 'Đã thanh toán' } : b))
    } catch (e) {
      console.error(e)
      alert('Xác nhận hóa đơn thất bại')
    }
  }

  const handleCancelBill = async (bill) => {
    try {
      await accountantAPI.cancelBill(bill.id)
      setBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: 'Đã hủy' } : b))
    } catch (e) {
      console.error(e)
      alert('Hủy hóa đơn thất bại')
    }
  }

  const addServiceToBill = () => {
    const newService = {
      id: Date.now(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
    
    setBillForm({
      ...billForm,
      services: [...billForm.services, newService]
    })
  }

  const removeServiceFromBill = (serviceId) => {
    const updatedServices = billForm.services.filter(s => s.id !== serviceId)
    const updatedMedicines = billForm.medicines.filter(m => true) // Keep medicines
    const subtotal = [...updatedServices, ...updatedMedicines].reduce((sum, item) => sum + item.totalPrice, 0)
    const totalAmount = subtotal - billForm.discount - billForm.insuranceCoverage
    
    setBillForm({
      ...billForm,
      services: updatedServices,
      subtotal,
      totalAmount: Math.max(0, totalAmount)
    })
  }

  const updateServiceInBill = (serviceId, field, value) => {
    const updatedServices = billForm.services.map(s => {
      if (s.id === serviceId) {
        const updatedService = { ...s, [field]: value }
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedService.totalPrice = updatedService.quantity * updatedService.unitPrice
        }
        
        return updatedService
      }
      return s
    })
    
    const subtotal = [...updatedServices, ...billForm.medicines].reduce((sum, item) => sum + item.totalPrice, 0)
    const totalAmount = subtotal - billForm.discount - billForm.insuranceCoverage
    
    setBillForm({
      ...billForm,
      services: updatedServices,
      subtotal,
      totalAmount: Math.max(0, totalAmount)
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Đã thanh toán': 'bg-green-100 text-green-800',
      'Chờ thanh toán': 'bg-yellow-100 text-yellow-800',
      'Đã hủy': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Cột cho bảng hóa đơn
  const billColumns = [
    {
      key: 'billCode',
      label: 'Mã HD',
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
      key: 'billDate',
      label: 'Ngày lập',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm">{new Date(value).toLocaleDateString('vi-VN')}</div>
            <div className="text-xs text-gray-500">{row.billTime}</div>
          </div>
        </div>
      )
    },
    {
      key: 'subtotal',
      label: 'Tổng tiền',
      render: (value, row) => (
        <div>
          <div className="font-medium">{parseInt(value).toLocaleString('vi-VN')} VNĐ</div>
          {row.discount > 0 && (
            <div className="text-xs text-red-600">Giảm: {parseInt(row.discount).toLocaleString('vi-VN')} VNĐ</div>
          )}
        </div>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Phương thức TT',
      render: (value) => (
        <div className="flex items-center gap-1">
          {value === 'BHYT' ? <CreditCard className="w-4 h-4 text-green-600" /> : 
           <DollarSign className="w-4 h-4 text-blue-600" />}
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === 'Đã thanh toán' ? <CheckCircle className="w-4 h-4 text-green-600" /> : 
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
            onClick={() => handleViewBill(row)}
          >
            Xem
          </Button>
          {row.status === 'Chờ thanh toán' && (
            <>
              <Button
                size="sm"
                variant="outline"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => handleConfirmBill(row)}
              >
                Xác nhận
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<Clock className="w-4 h-4" />}
                onClick={() => handleCancelBill(row)}
              >
                Hủy
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => console.log('Print bill:', row.billCode)}
          >
            In
          </Button>
        </div>
      )
    }
  ]

  // Tính tổng doanh thu
  const totalRevenue = bills
    .filter(bill => bill.status === 'Đã thanh toán')
    .reduce((sum, bill) => sum + bill.totalAmount, 0)

  const todayRevenue = bills
    .filter(bill => bill.billDate === new Date().toISOString().split('T')[0] && bill.status === 'Đã thanh toán')
    .reduce((sum, bill) => sum + bill.totalAmount, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý hóa đơn & thanh toán</h1>
          <p className="text-gray-600 mt-1">Tạo hóa đơn, theo dõi thanh toán và thống kê doanh thu</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={() => console.log('Export bills')}
          >
            Xuất báo cáo
          </Button>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateBill}
          >
            Tạo hóa đơn mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{bills.length}</div>
          <div className="text-gray-600">Tổng hóa đơn</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {bills.filter(b => b.status === 'Đã thanh toán').length}
          </div>
          <div className="text-gray-600">Đã thanh toán</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {bills.filter(b => b.status === 'Chờ thanh toán').length}
          </div>
          <div className="text-gray-600">Chờ thanh toán</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {totalRevenue.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="text-gray-600">Tổng doanh thu</div>
        </Card>
      </div>

      {/* Daily Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Doanh thu hôm nay">
          <div className="text-center py-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {todayRevenue.toLocaleString('vi-VN')} VNĐ
            </div>
            <div className="text-gray-600">
              {bills.filter(b => b.billDate === new Date().toISOString().split('T')[0] && b.status === 'Đã thanh toán').length} hóa đơn
            </div>
          </div>
        </Card>

        <Card title="Phương thức thanh toán">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="text-sm">BHYT</span>
              </div>
              <span className="font-medium">
                {bills.filter(b => b.paymentMethod === 'BHYT').length} hóa đơn
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Tiền mặt</span>
              </div>
              <span className="font-medium">
                {bills.filter(b => b.paymentMethod === 'Tiền mặt').length} hóa đơn
              </span>
            </div>
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
              placeholder="Tìm kiếm hóa đơn..."
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
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chờ thanh toán">Chờ thanh toán</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>

          <input
            type="date"
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Bills Table */}
      <Card title="Danh sách hóa đơn">
        <Table
          data={filteredBills}
          columns={billColumns}
          searchable={false}
        />
      </Card>

      {/* Create Bill Modal */}
      <Modal
        isOpen={showCreateBillModal}
        onClose={() => setShowCreateBillModal(false)}
        title="Tạo hóa đơn mới"
        size="xl"
      >
        <form onSubmit={handleSubmitBill} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên bệnh nhân *
              </label>
              <input
                type="text"
                value={billForm.patientName}
                onChange={(e) => setBillForm({...billForm, patientName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã bệnh nhân *
              </label>
              <input
                type="text"
                value={billForm.patientCode}
                onChange={(e) => setBillForm({...billForm, patientCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Dịch vụ khám chữa bệnh
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={addServiceToBill}
              >
                Thêm dịch vụ
              </Button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {billForm.services.map((service, index) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Dịch vụ {index + 1}</h4>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeServiceFromBill(service.id)}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên dịch vụ *
                      </label>
                      <select
                        value={service.name}
                        onChange={(e) => {
                          const selectedService = availableServices.find(s => s.name === e.target.value)
                          updateServiceInBill(service.id, 'name', e.target.value)
                          if (selectedService) {
                            updateServiceInBill(service.id, 'unitPrice', selectedService.price)
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Chọn dịch vụ</option>
                        {availableServices.map(s => (
                          <option key={s.id} value={s.name}>{s.name} - {s.price.toLocaleString('vi-VN')} VNĐ</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng *
                      </label>
                      <input
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateServiceInBill(service.id, 'quantity', parseInt(e.target.value) || 0)}
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
                        value={service.unitPrice}
                        onChange={(e) => updateServiceInBill(service.id, 'unitPrice', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Thành tiền
                      </label>
                      <input
                        type="text"
                        value={`${service.totalPrice.toLocaleString('vi-VN')} VNĐ`}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng tiền dịch vụ:</span>
              <span className="font-medium">
                {billForm.subtotal.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giảm giá:</span>
              <input
                type="number"
                value={billForm.discount}
                onChange={(e) => {
                  const discount = parseInt(e.target.value) || 0
                  const totalAmount = billForm.subtotal - discount - billForm.insuranceCoverage
                  setBillForm({
                    ...billForm,
                    discount,
                    totalAmount: Math.max(0, totalAmount)
                  })
                }}
                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">BHYT chi trả:</span>
              <input
                type="number"
                value={billForm.insuranceCoverage}
                onChange={(e) => {
                  const coverage = parseInt(e.target.value) || 0
                  const totalAmount = billForm.subtotal - billForm.discount - coverage
                  setBillForm({
                    ...billForm,
                    insuranceCoverage: coverage,
                    totalAmount: Math.max(0, totalAmount)
                  })
                }}
                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-gray-900 font-semibold">Số tiền phải trả:</span>
              <span className="text-xl font-bold text-blue-600">
                {billForm.totalAmount.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán *
              </label>
              <select
                value={billForm.paymentMethod}
                onChange={(e) => setBillForm({...billForm, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn phương thức</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="BHYT">BHYT</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <input
                type="text"
                value={billForm.notes}
                onChange={(e) => setBillForm({...billForm, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateBillModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              Tạo hóa đơn
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bill Detail Modal */}
      <Modal
        isOpen={showBillDetailModal}
        onClose={() => setShowBillDetailModal(false)}
        title="Chi tiết hóa đơn"
        size="xl"
      >
        {selectedBill && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin hóa đơn</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã hóa đơn:</span>
                    <span className="font-medium">{selectedBill.billCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bệnh nhân:</span>
                    <span className="font-medium">{selectedBill.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã BN:</span>
                    <span className="font-medium">{selectedBill.patientCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày lập:</span>
                    <span className="font-medium">
                      {new Date(selectedBill.billDate).toLocaleDateString('vi-VN')} - {selectedBill.billTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedBill.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin thanh toán</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium flex items-center gap-1">
                      {selectedBill.paymentMethod === 'BHYT' ? <CreditCard className="w-4 h-4 text-green-600" /> : 
                       <DollarSign className="w-4 h-4 text-blue-600" />}
                      {selectedBill.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-medium">{parseInt(selectedBill.subtotal).toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-medium text-red-600">-{parseInt(selectedBill.discount).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  {selectedBill.insuranceCoverage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">BHYT chi trả:</span>
                      <span className="font-medium text-green-600">-{parseInt(selectedBill.insuranceCoverage).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-semibold">Số tiền trả:</span>
                    <span className="font-bold text-blue-600">
                      {parseInt(selectedBill.totalAmount).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            {selectedBill.services.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Dịch vụ khám chữa bệnh</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dịch vụ</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Số lượng</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Đơn giá</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.services.map((service, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 text-sm">{service.name}</td>
                          <td className="px-4 py-2 text-center text-sm">{service.quantity}</td>
                          <td className="px-4 py-2 text-right text-sm">{parseInt(service.unitPrice).toLocaleString('vi-VN')} VNĐ</td>
                          <td className="px-4 py-2 text-right text-sm font-medium">{parseInt(service.totalPrice).toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedBill.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Ghi chú</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{selectedBill.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => console.log('Print bill:', selectedBill.billCode)}
              >
                In hóa đơn
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBillDetailModal(false)}
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

export default AccountingBills


