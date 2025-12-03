import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Table from '../../components/Common/Table'
import { accountantAPI } from '../../services/api'
import { 
  DollarSign, 
  Edit, 
  Search,
  Filter,
  Plus,
  CheckCircle,
  Calendar
} from 'lucide-react'

const ServiceFeeManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [serviceFees, setServiceFees] = useState([])

  // Load service fees from API
  useEffect(() => {
    const fetchServiceFees = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await accountantAPI.getServiceFees()
        if (response && response.data) {
          setServiceFees(response.data.content || [])
        } else {
          setServiceFees([])
        }
      } catch (e) {
        console.error(e)
        setError('Không tải được danh sách phí dịch vụ')
        setServiceFees([])
      } finally {
        setLoading(false)
      }
    }
    fetchServiceFees()
  }, [])

  // Filter service fees
  const filteredServiceFees = serviceFees.filter(service => {
    const matchesSearch = service.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !filterCategory || service.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const handleEdit = (service) => {
    setSelectedService(service)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedService) return

    try {
      await accountantAPI.updateServiceFee(selectedService.id, {
        currentPrice: selectedService.newPrice,
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: selectedService.reason || 'Cập nhật giá dịch vụ'
      })
      
      setServiceFees(prev => prev.map(s => 
        s.id === selectedService.id 
          ? { ...s, currentPrice: selectedService.newPrice, effectiveDate: new Date().toISOString().split('T')[0] }
          : s
      ))
      setShowEditModal(false)
      setSelectedService(null)
    } catch (e) {
      console.error(e)
      alert('Cập nhật phí dịch vụ thất bại')
    }
  }

  const columns = [
    {
      key: 'serviceName',
      label: 'Dịch vụ',
      render: (value) => <div className="font-medium">{value}</div>
    },
    {
      key: 'category',
      label: 'Loại dịch vụ',
      render: (value) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'basePrice',
      label: 'Giá gốc',
      render: (value) => (
        <div className="text-gray-600 line-through">
          {value.toLocaleString('vi-VN')} VNĐ
        </div>
      )
    },
    {
      key: 'currentPrice',
      label: 'Giá hiện tại',
      render: (value) => (
        <div className="font-bold text-blue-600">
          {value.toLocaleString('vi-VN')} VNĐ
        </div>
      )
    },
    {
      key: 'effectiveDate',
      label: 'Ngày hiệu lực',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString('vi-VN')}</span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (value, row) => (
        <Button
          size="sm"
          variant="outline"
          icon={<Edit className="w-4 h-4" />}
          onClick={() => handleEdit(row)}
        >
          Chỉnh sửa
        </Button>
      )
    }
  ]

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phí dịch vụ</h1>
          <p className="text-gray-600 mt-1">Cấu hình và quản lý giá dịch vụ khám chữa bệnh</p>
        </div>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại dịch vụ</option>
            <option value="CONSULTATION">Tư vấn</option>
            <option value="LABORATORY">Xét nghiệm</option>
            <option value="SURGERY">Phẫu thuật</option>
            <option value="PHARMACY">Dược phẩm</option>
          </select>

          <Button
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => {
              setSearchTerm('')
              setFilterCategory('')
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      {/* Service Fees Table */}
      <Card title="Danh sách phí dịch vụ">
        <Table
          columns={columns}
          data={filteredServiceFees}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedService(null)
        }}
        title="Chỉnh sửa phí dịch vụ"
        size="md"
      >
        {selectedService && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên dịch vụ
              </label>
              <input
                type="text"
                value={selectedService.serviceName}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá hiện tại
              </label>
              <input
                type="text"
                value={selectedService.currentPrice.toLocaleString('vi-VN')}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá mới (VNĐ)
              </label>
              <input
                type="number"
                value={selectedService.newPrice || selectedService.currentPrice}
                onChange={(e) => setSelectedService({
                  ...selectedService,
                  newPrice: parseInt(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do thay đổi
              </label>
              <textarea
                value={selectedService.reason || ''}
                onChange={(e) => setSelectedService({
                  ...selectedService,
                  reason: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Nhập lý do..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedService(null)
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveEdit}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default ServiceFeeManagement


