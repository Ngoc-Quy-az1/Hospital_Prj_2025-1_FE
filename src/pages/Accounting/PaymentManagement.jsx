import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Table from '../../components/Common/Table'
import { accountantAPI } from '../../services/api'
import { 
  CreditCard, 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  Calendar,
  Filter,
  AlertCircle
} from 'lucide-react'

const PaymentManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [payments, setPayments] = useState([])

  // Load payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await accountantAPI.getPayments()
        if (response && response.data) {
          setPayments(response.data)
        } else {
          setPayments([])
        }
      } catch (e) {
        console.error(e)
        setError('Không tải được danh sách thanh toán')
        setPayments([])
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || payment.status === filterStatus
    const matchesMethod = !filterMethod || payment.paymentMethod === filterMethod
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment)
    setShowDetailModal(true)
  }

  const handleConfirmPayment = async (paymentId) => {
    try {
      await accountantAPI.confirmPayment(paymentId)
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'CONFIRMED' } : p
      ))
    } catch (e) {
      console.error(e)
      alert('Xác nhận thanh toán thất bại')
    }
  }

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      await accountantAPI.rejectPayment(paymentId, { reason })
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'REJECTED' } : p
      ))
    } catch (e) {
      console.error(e)
      alert('Từ chối thanh toán thất bại')
    }
  }

  const handleProcessRefund = async (paymentId, refundData) => {
    try {
      await accountantAPI.refundPayment(paymentId, refundData)
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'REFUNDED' } : p
      ))
      setShowRefundModal(false)
    } catch (e) {
      console.error(e)
      alert('Hoàn tiền thất bại')
    }
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
      key: 'billNumber',
      label: 'Hóa đơn',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.patientName}</div>
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
          {value === 'CARD' ? <CreditCard className="w-4 h-4" /> : 
           value === 'CASH' ? <DollarSign className="w-4 h-4" /> :
           <CreditCard className="w-4 h-4" />}
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'paidAt',
      label: 'Ngày thanh toán',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString('vi-VN')}</span>
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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewDetail(row)}
          >
            Chi tiết
          </Button>
          {row.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="success"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => handleConfirmPayment(row.id)}
              >
                Xác nhận
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => handleRejectPayment(row.id, 'Từ chối thanh toán')}
              >
                Từ chối
              </Button>
            </>
          )}
          {row.status === 'CONFIRMED' && (
            <Button
              size="sm"
              variant="warning"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                setSelectedPayment(row)
                setShowRefundModal(true)
              }}
            >
              Hoàn tiền
            </Button>
          )}
        </div>
      )
    }
  ]

  const totalPayments = payments.length
  const totalAmount = payments
    .filter(p => p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
          <p className="text-gray-600 mt-1">Xử lý và theo dõi các giao dịch thanh toán</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{totalPayments}</div>
          <div className="text-gray-600">Tổng thanh toán</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {payments.filter(p => p.status === 'CONFIRMED').length}
          </div>
          <div className="text-gray-600">Đã xác nhận</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {totalAmount.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="text-gray-600">Tổng số tiền</div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <Button
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => {
              setSearchTerm('')
              setFilterStatus('')
              setFilterMethod('')
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      {/* Payments Table */}
      <Card title="Danh sách thanh toán">
        <Table
          columns={columns}
          data={filteredPayments}
        />
      </Card>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết thanh toán"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
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
            </div>
            {selectedPayment.paymentDetails && (
              <div>
                <label className="text-sm font-medium text-gray-700">Chi tiết thanh toán</label>
                <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                  <pre className="text-sm">{JSON.stringify(selectedPayment.paymentDetails, null, 2)}</pre>
                </div>
              </div>
            )}
            {selectedPayment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Ghi chú</label>
                <div className="mt-2 bg-blue-50 p-3 rounded-lg text-blue-800">
                  {selectedPayment.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Hoàn tiền"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền hoàn lại
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập số tiền"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do hoàn tiền
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Nhập lý do..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRefundModal(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                handleProcessRefund(selectedPayment?.id, {})
              }}
            >
              Xác nhận hoàn tiền
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PaymentManagement


