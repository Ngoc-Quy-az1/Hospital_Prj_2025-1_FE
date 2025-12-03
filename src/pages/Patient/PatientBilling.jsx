import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { patientAPI } from '../../services/api'
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const PatientBilling = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  // Load hóa đơn thật từ API bệnh nhân
  useEffect(() => {
    const loadBills = async () => {
      try {
        const res = await patientAPI.getBills()
        const items = res || []

        const statusMap = {
          PAID: 'Đã thanh toán',
          PENDING: 'Chờ thanh toán',
          OVERDUE: 'Quá hạn',
        }

        const mapped = items.map((hd) => ({
          id: `HD${String(hd.hoadonId || '').padStart(3, '0')}`,
          date: hd.ngayLap,
          type: 'Khám chữa bệnh',
          doctor: hd.benhnhan?.hoTen || 'Bệnh nhân',
          department: '',
          services: [],
          medicines: [],
          totalAmount: Number(hd.tongTien || 0),
          status: statusMap[hd.trangThai] || 'Chờ thanh toán',
          paymentMethod: hd.phuongThucThanhToan || '',
          insurance: 'BHYT',
          insuranceCoverage: 0,
          patientPayment: Number(hd.tongTien || 0),
        }))

        setBills(mapped)
      } catch (error) {
        console.error('Lỗi tải hóa đơn bệnh nhân:', error)
        setBills([])
      } finally {
        setLoading(false)
      }
    }

    loadBills()
  }, [])

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || bill.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'bg-green-100 text-green-800'
      case 'Chờ thanh toán':
        return 'bg-yellow-100 text-yellow-800'
      case 'Quá hạn':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
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
          <h1 className="text-2xl font-bold text-gray-900">Hóa đơn</h1>
          <p className="text-gray-600 mt-1">Quản lý các hóa đơn và thanh toán</p>
        </div>
        <Button icon={<Download className="w-4 h-4" />} variant="secondary">
          Xuất báo cáo
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã hóa đơn, bác sĩ, loại dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chờ thanh toán">Chờ thanh toán</option>
                <option value="Quá hạn">Quá hạn</option>
              </select>
              <Button icon={<Filter className="w-4 h-4" />} variant="secondary">
                Bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
                <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bills.filter(b => b.status === 'Đã thanh toán').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bills.filter(b => b.status === 'Chờ thanh toán').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(bills.reduce((sum, b) => sum + b.totalAmount, 0))}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bills List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách hóa đơn</h2>
          
          {filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy hóa đơn nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBills.map((bill) => (
                <div key={bill.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{bill.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{bill.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{bill.doctor}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                          {bill.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Dịch vụ:</h4>
                          <div className="space-y-1">
                            {bill.services.map((service, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">{service.name}</span>
                                <span className="font-medium">{formatCurrency(service.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Thuốc:</h4>
                          <div className="space-y-1">
                            {bill.medicines.map((medicine, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">{medicine.name} x{medicine.quantity}</span>
                                <span className="font-medium">{formatCurrency(medicine.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="font-medium ml-2">{formatCurrency(bill.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Bảo hiểm ({bill.insurance}):</span>
                            <span className="font-medium ml-2">{bill.insuranceCoverage}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Cần thanh toán:</span>
                            <span className="font-medium ml-2 text-red-600">{formatCurrency(bill.patientPayment)}</span>
                          </div>
                        </div>
                        
                        {bill.paymentMethod && (
                          <div className="mt-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Đã thanh toán bằng: {bill.paymentMethod}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {bill.status === 'Chờ thanh toán' && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          Thanh toán
                        </Button>
                      )}
                      <Button 
                        icon={<Eye className="w-4 h-4" />} 
                        variant="secondary"
                        size="sm"
                      >
                        Xem chi tiết
                      </Button>
                      <Button 
                        icon={<Download className="w-4 h-4" />} 
                        variant="secondary"
                        size="sm"
                      >
                        Tải về
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default PatientBilling










