import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Table from '../../components/Common/Table'
import { accountantAPI } from '../../services/api'
import { 
  History, 
  Search, 
  Filter, 
  Eye,
  Download,
  Calendar,
  CreditCard,
  DollarSign
} from 'lucide-react'

const PaymentHistory = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [paymentHistory, setPaymentHistory] = useState([])

  // Load payment history from API
  useEffect(() => {
    fetchPaymentHistory()
  }, [dateRange])

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await accountantAPI.getPaymentHistory()
      if (response && response.data) {
        setPaymentHistory(response.data.content || [])
      } else {
        setPaymentHistory([])
      }
    } catch (e) {
      console.error(e)
      setError('Không tải được lịch sử thanh toán')
      setPaymentHistory([])
    } finally {
      setLoading(false)
    }
  }

  // Filter payment history
  const filteredPayments = paymentHistory.filter(payment => {
    const matchesSearch = payment.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || payment.status === filterStatus
    const matchesMethod = !filterMethod || payment.paymentMethod === filterMethod
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment)
    setShowDetailModal(true)
  }

  const handleExport = () => {
    console.log('Export payment history')
    // TODO: Implement export functionality
  }

  const getStatusBadge = (status) => {
    const config = {
      'CONFIRMED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-purple-100 text-purple-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      key: 'transactionId',
      label: 'Mã GD',
      render: (value) => <div className="font-medium text-blue-600">{value}</div>
    },
    {
      key: 'patientName',
      label: 'Bệnh nhân',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.billNumber}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Số tiền',
      render: (value) => (
        <div className="font-medium text-green-600">
          {value.toLocaleString('vi-VN')} VNĐ
        </div>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Phương thức',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === 'CARD' ? <CreditCard className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'paidAt',
      label: 'Thời gian',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm">{new Date(value).toLocaleDateString('vi-VN')}</div>
            <div className="text-xs text-gray-500">{new Date(value).toLocaleTimeString('vi-VN')}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (value, row) => (
        <Button
          size="sm"
          variant="outline"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handleViewDetail(row)}
        >
          Chi tiết
        </Button>
      )
    }
  ]

  // Calculate statistics
  const stats = {
    totalPayments: paymentHistory.length,
    totalAmount: paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0),
    confirmedAmount: paymentHistory
      .filter(p => p.status === 'CONFIRMED')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    averagePayment: paymentHistory.length > 0 
      ? paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0) / paymentHistory.length 
      : 0
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
          <p className="text-gray-600 mt-1">Xem lại tất cả các giao dịch thanh toán đã thực hiện</p>
        </div>
        <Button
          variant="outline"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExport}
        >
          Xuất báo cáo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalPayments}</div>
          <div className="text-gray-600">Tổng giao dịch</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.confirmedAmount.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="text-gray-600">Đã xác nhận</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.totalAmount.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="text-gray-600">Tổng số tiền</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {stats.averagePayment.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="text-gray-600">Trung bình/GD</div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
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
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="REJECTED">Đã từ chối</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả phương thức</option>
            <option value="CASH">Tiền mặt</option>
            <option value="CARD">Thẻ</option>
            <option value="TRANSFER">Chuyển khoản</option>
          </select>

          <input
            type="date"
            placeholder="Từ ngày"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            placeholder="Đến ngày"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Payment History Table */}
      <Card title="Danh sách lịch sử thanh toán">
        <Table
          columns={columns}
          data={filteredPayments}
        />
      </Card>

      {/* Detail Modal */}
      {selectedPayment && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Chi tiết thanh toán"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Mã giao dịch</label>
                <div className="mt-1 text-gray-900">{selectedPayment.transactionId}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hóa đơn</label>
                <div className="mt-1 text-gray-900">{selectedPayment.billNumber}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Bệnh nhân</label>
                <div className="mt-1 text-gray-900">{selectedPayment.patientName}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Số tiền</label>
                <div className="mt-1 font-bold text-green-600">
                  {selectedPayment.amount.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phương thức</label>
                <div className="mt-1 text-gray-900">{selectedPayment.paymentMethod}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Thời gian</label>
                <div className="mt-1 text-gray-900">
                  {new Date(selectedPayment.paidAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default PaymentHistory


