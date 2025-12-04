import React, { useState, useEffect } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { adminAPI } from '../../../services/api'
import { 
  DollarSign, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Download,
  Printer,
  FileText,
  CreditCard,
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt
} from 'lucide-react'

const FinancialManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    totalRevenue: 0
  })

  // Dữ liệu từ API
  const [invoices, setInvoices] = useState([])

  // Load invoices from API
  useEffect(() => {
    loadInvoices()
    loadStats()
  }, [page, searchTerm, filterStatus])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getInvoices(page, size, {
        search: searchTerm || undefined,
        status: filterStatus || undefined
      })
      const fetchedInvoices = response.content || response.data || []
      setInvoices(fetchedInvoices.map(formatInvoice))
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
    } catch (err) {
      console.error('Lỗi khi tải danh sách hóa đơn:', err)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await adminAPI.getInvoiceStats()
      setStats({
        totalInvoices: response.totalInvoices || 0,
        paidInvoices: response.paidInvoices || 0,
        unpaidInvoices: response.unpaidInvoices || 0,
        totalRevenue: response.totalRevenue || 0
      })
    } catch (err) {
      console.error('Lỗi khi tải thống kê hóa đơn:', err)
    }
  }

  const formatInvoice = (invoice) => ({
    id: invoice.id || invoice.hoadonId,
    invoiceCode: invoice.invoiceCode || `HD${String(invoice.id || invoice.hoadonId).padStart(3, '0')}`,
    patientId: invoice.patientId || invoice.benhnhan?.benhnhanId,
    patientName: invoice.patientName || invoice.benhnhan?.hoTen,
    invoiceDate: invoice.invoiceDate || invoice.ngayLap,
    dueDate: invoice.dueDate || null,
    services: invoice.services || [],
    subtotal: invoice.subtotal || invoice.total || 0,
    discount: invoice.discount || 0,
    tax: invoice.tax || 0,
    total: invoice.total || 0,
    paid: invoice.paid || 0,
    balance: invoice.balance || 0,
    status: invoice.status || 'Chưa thanh toán',
    paymentMethod: invoice.paymentMethod || '',
    notes: invoice.notes || ''
  })

  const [formData, setFormData] = useState({
    invoiceCode: '',
    patientId: '',
    patientName: '',
    invoiceDate: '',
    dueDate: '',
    services: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    paid: 0,
    balance: 0,
    status: 'Chưa thanh toán',
    paymentMethod: '',
    notes: ''
  })

  // Filtering is done on server side via API
  const filteredInvoices = invoices

  const handleAddInvoice = () => {
    const newCode = `HD${String(invoices.length + 1).padStart(3, '0')}`
    
    setFormData({
      invoiceCode: newCode,
      patientId: '',
      patientName: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      services: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      paid: 0,
      balance: 0,
      status: 'Chưa thanh toán',
      paymentMethod: '',
      notes: ''
    })
    setShowAddModal(true)
  }

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setFormData(invoice)
    setShowEditModal(true)
  }

  const handleViewInvoice = async (invoice) => {
    try {
      const detail = await adminAPI.getInvoiceDetail(invoice.id)
      setSelectedInvoice(formatInvoice(detail))
      setShowViewModal(true)
    } catch (err) {
      console.error('Lỗi khi tải chi tiết hóa đơn:', err)
      setSelectedInvoice(invoice)
      setShowViewModal(true)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (showEditModal && selectedInvoice) {
      setInvoices(invoices.map(invoice => 
        invoice.id === selectedInvoice.id ? { ...invoice, ...formData } : invoice
      ))
      setShowEditModal(false)
    } else {
      const newInvoice = {
        id: invoices.length + 1,
        ...formData
      }
      setInvoices([...invoices, newInvoice])
      setShowAddModal(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Chưa thanh toán': 'bg-red-100 text-red-800',
      'Đã thanh toán': 'bg-green-100 text-green-800',
      'Quá hạn': 'bg-orange-100 text-orange-800',
      'Đã hủy': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Đã thanh toán': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Chưa thanh toán': return <Clock className="w-4 h-4 text-red-600" />
      case 'Quá hạn': return <AlertTriangle className="w-4 h-4 text-orange-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const addService = () => {
    const newService = {
      id: Date.now(),
      name: '',
      price: 0,
      quantity: 1,
      total: 0
    }
    
    setFormData({
      ...formData,
      services: [...formData.services, newService]
    })
  }

  const removeService = (serviceId) => {
    const updatedServices = formData.services.filter(service => service.id !== serviceId)
    const subtotal = updatedServices.reduce((sum, service) => sum + service.total, 0)
    const tax = subtotal * 0.1
    const total = subtotal - formData.discount + tax
    const balance = total - formData.paid
    
    setFormData({
      ...formData,
      services: updatedServices,
      subtotal,
      tax,
      total,
      balance
    })
  }

  const updateService = (serviceId, field, value) => {
    const updatedServices = formData.services.map(service => {
      if (service.id === serviceId) {
        const updatedService = { ...service, [field]: value }
        if (field === 'price' || field === 'quantity') {
          updatedService.total = updatedService.price * updatedService.quantity
        }
        return updatedService
      }
      return service
    })
    
    const subtotal = updatedServices.reduce((sum, service) => sum + service.total, 0)
    const tax = subtotal * 0.1
    const total = subtotal - formData.discount + tax
    const balance = total - formData.paid
    
    setFormData({
      ...formData,
      services: updatedServices,
      subtotal,
      tax,
      total,
      balance
    })
  }

  // Cột cho bảng hóa đơn
  const invoiceColumns = [
    {
      key: 'invoiceCode',
      label: 'Mã HĐ',
      render: (value, row) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'patientName',
      label: 'Bệnh nhân',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'invoiceDate',
      label: 'Ngày lập',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'total',
      label: 'Tổng tiền',
      render: (value) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{parseInt(value).toLocaleString('vi-VN')} VNĐ</span>
        </div>
      )
    },
    {
      key: 'paid',
      label: 'Đã trả',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
            {parseInt(value).toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
      )
    },
    {
      key: 'balance',
      label: 'Còn lại',
      render: (value) => (
        <div className={`flex items-center gap-1 ${parseInt(value) > 0 ? 'text-red-600' : 'text-green-600'}`}>
          <span>{parseInt(value).toLocaleString('vi-VN')} VNĐ</span>
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
            onClick={() => handleViewInvoice(row)}
          >
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => console.log('Print invoice:', row.invoiceCode)}
          >
            In
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditInvoice(row)}
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
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý viện phí</h1>
            <p className="text-amber-100">Quản lý hóa đơn và thanh toán viện phí</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddInvoice}
            className="bg-white text-amber-600 hover:bg-amber-50"
          >
            Tạo hóa đơn mới
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
              <div className="text-sm font-medium text-gray-500">Tổng hóa đơn</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.totalInvoices}</div>
            <div className="text-sm text-gray-500">Tất cả hóa đơn</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đã thanh toán</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.paidInvoices}
            </div>
            <div className="text-sm text-gray-500">Đã hoàn thành</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Chưa thanh toán</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.unpaidInvoices}
            </div>
            <div className="text-sm text-gray-500">Đang chờ thanh toán</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng doanh thu</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {parseInt(stats.totalRevenue).toLocaleString('vi-VN')} VNĐ
            </div>
            <div className="text-sm text-gray-500">Tổng giá trị</div>
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
            <option value="Chưa thanh toán">Chưa thanh toán</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Quá hạn">Quá hạn</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>

          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả phương thức</option>
            <option value="Tiền mặt">Tiền mặt</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="Thẻ">Thẻ</option>
            <option value="BHYT">BHYT</option>
          </select>
        </div>
      </Card>

      {/* Invoice Table */}
      <Card title="Danh sách hóa đơn">
        <Table
          data={filteredInvoices}
          columns={invoiceColumns}
          searchable={false}
        />
      </Card>

      {/* Add/Edit Invoice Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedInvoice(null)
        }}
        title={showEditModal ? "Sửa hóa đơn" : "Tạo hóa đơn mới"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã hóa đơn
              </label>
              <input
                type="text"
                value={formData.invoiceCode}
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
                Ngày lập hóa đơn *
              </label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạn thanh toán *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
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
                <option value="Chưa thanh toán">Chưa thanh toán</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Quá hạn">Quá hạn</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn phương thức</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Thẻ">Thẻ</option>
                <option value="BHYT">BHYT</option>
              </select>
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Dịch vụ *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={addService}
              >
                Thêm dịch vụ
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {formData.services.map((service, index) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Dịch vụ {index + 1}</h4>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeService(service.id)}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên dịch vụ *
                      </label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(service.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Đơn giá (VNĐ) *
                      </label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(service.id, 'price', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng *
                      </label>
                      <input
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateService(service.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Thành tiền (VNĐ)
                      </label>
                      <input
                        type="text"
                        value={`${service.total.toLocaleString('vi-VN')}`}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.services.length === 0 && (
              <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có dịch vụ nào được thêm</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={addService}
                >
                  Thêm dịch vụ đầu tiên
                </Button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền dịch vụ:</span>
                  <span className="font-medium">{formData.subtotal.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => {
                      const discount = parseInt(e.target.value) || 0
                      const tax = (formData.subtotal - discount) * 0.1
                      const total = formData.subtotal - discount + tax
                      setFormData({
                        ...formData,
                        discount,
                        tax,
                        total,
                        balance: total - formData.paid
                      })
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (10%):</span>
                  <span className="font-medium">{formData.tax.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formData.total.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <input
                    type="number"
                    value={formData.paid}
                    onChange={(e) => {
                      const paid = parseInt(e.target.value) || 0
                      setFormData({
                        ...formData,
                        paid,
                        balance: formData.total - paid
                      })
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Còn lại:</span>
                  <span className={`${formData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formData.balance.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
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
              placeholder="Ghi chú về hóa đơn..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedInvoice(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Tạo hóa đơn"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedInvoice(null)
        }}
        title="Chi tiết hóa đơn"
        size="xl"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">HÓA ĐƠN VIỆN PHÍ</h2>
              <p className="text-gray-600">Bệnh viện ABC</p>
              <p className="text-sm text-gray-500">123 Đường ABC, Quận 1, TP.HCM</p>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin hóa đơn</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã hóa đơn:</span>
                    <span className="font-medium">{selectedInvoice.invoiceCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày lập:</span>
                    <span className="font-medium">
                      {new Date(selectedInvoice.invoiceDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hạn thanh toán:</span>
                    <span className="font-medium">
                      {new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin bệnh nhân</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên bệnh nhân:</span>
                    <span className="font-medium">{selectedInvoice.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức TT:</span>
                    <span className="font-medium">{selectedInvoice.paymentMethod || 'Chưa chọn'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Chi tiết dịch vụ</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dịch vụ</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Đơn giá</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Số lượng</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.services.map((service, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2 text-sm">{service.name}</td>
                        <td className="px-4 py-2 text-center text-sm">{service.price.toLocaleString('vi-VN')} VNĐ</td>
                        <td className="px-4 py-2 text-center text-sm">{service.quantity}</td>
                        <td className="px-4 py-2 text-right text-sm font-medium">{service.total.toLocaleString('vi-VN')} VNĐ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền dịch vụ:</span>
                  <span className="font-medium">{selectedInvoice.subtotal.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="font-medium">-{selectedInvoice.discount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (10%):</span>
                  <span className="font-medium">{selectedInvoice.tax.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{selectedInvoice.total.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="font-medium text-green-600">{selectedInvoice.paid.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Còn lại:</span>
                  <span className={`${selectedInvoice.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedInvoice.balance.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedInvoice.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Ghi chú:</h4>
                <p className="text-blue-800">{selectedInvoice.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => console.log('Print invoice:', selectedInvoice.invoiceCode)}
              >
                In hóa đơn
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedInvoice(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditInvoice(selectedInvoice)
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

export default FinancialManagement










