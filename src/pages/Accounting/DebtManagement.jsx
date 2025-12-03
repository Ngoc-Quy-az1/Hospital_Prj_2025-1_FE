import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Table from '../../components/Common/Table'
import { accountantAPI } from '../../services/api'
import { 
  AlertCircle,
  DollarSign,
  Calendar,
  Search,
  User,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react'

const DebtManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debts, setDebts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Load debts from API
  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await accountantAPI.getDebts()
        if (response && response.data) {
          setDebts(response.data.content || [])
        } else {
          setDebts([])
        }
      } catch (e) {
        console.error(e)
        setError('Không tải được danh sách công nợ')
        setDebts([])
      } finally {
        setLoading(false)
      }
    }
    fetchDebts()
  }, [])

  // Filter debts
  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.billNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || debt.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async (debtId, status, notes) => {
    try {
      await accountantAPI.updateDebtStatus(debtId, { status, notes })
      setDebts(prev => prev.map(d => 
        d.id === debtId ? { ...d, status } : d
      ))
    } catch (e) {
      console.error(e)
      alert('Cập nhật trạng thái thất bại')
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      'ACTIVE': 'bg-yellow-100 text-yellow-800',
      'OVERDUE': 'bg-red-100 text-red-800',
      'SETTLED': 'bg-green-100 text-green-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      key: 'patientName',
      label: 'Bệnh nhân',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-gray-500">{row.billNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Số tiền nợ',
      render: (value) => (
        <div className="font-medium text-red-600">
          {value.toLocaleString('vi-VN')} VNĐ
        </div>
      )
    },
    {
      key: 'overdueAmount',
      label: 'Quá hạn',
      render: (value) => (
        <div className="font-medium text-red-800">
          {value.toLocaleString('vi-VN')} VNĐ
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Ngày đáo hạn',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString('vi-VN')}</span>
        </div>
      )
    },
    {
      key: 'overdueDays',
      label: 'Số ngày quá hạn',
      render: (value) => (
        <div className={value > 0 ? 'font-medium text-red-600' : ''}>
          {value > 0 ? `${value} ngày` : 'Đúng hạn'}
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
          {row.status !== 'SETTLED' && (
            <Button
              size="sm"
              variant="success"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={() => handleUpdateStatus(row.id, 'SETTLED', 'Đã thanh toán đầy đủ')}
            >
              Thanh toán
            </Button>
          )}
        </div>
      )
    }
  ]

  // Calculate summary
  const summary = {
    totalDebtAmount: debts.reduce((sum, d) => sum + (d.amount || 0), 0),
    overdueAmount: debts.reduce((sum, d) => sum + (d.overdueAmount || 0), 0),
    activeDebtors: debts.filter(d => d.status !== 'SETTLED').length
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý công nợ</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý công nợ bệnh nhân</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{debts.length}</div>
          <div className="text-gray-600">Tổng công nợ</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {debts.filter(d => d.status === 'OVERDUE').length}
          </div>
          <div className="text-gray-600">Quá hạn thanh toán</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {summary.totalDebtAmount.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="text-gray-600">Tổng số tiền nợ</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {summary.overdueAmount.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="text-gray-600">Tổng quá hạn</div>
        </Card>
      </div>

      {/* Alert for overdue debts */}
      {debts.filter(d => d.status === 'OVERDUE').length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">
                Cảnh báo: {debts.filter(d => d.status === 'OVERDUE').length} công nợ quá hạn
              </h3>
              <p className="text-red-700 text-sm">
                Tổng số tiền quá hạn: {summary.overdueAmount.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="ACTIVE">Đang nợ</option>
            <option value="OVERDUE">Quá hạn</option>
            <option value="SETTLED">Đã thanh toán</option>
          </select>

          <Button
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => {
              setSearchTerm('')
              setFilterStatus('')
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      {/* Debts Table */}
      <Card title="Danh sách công nợ">
        <Table
          columns={columns}
          data={filteredDebts}
        />
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default DebtManagement


