import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Table from '../../components/Common/Table'
import { pharmacyAPI } from '../../services/api'
import { 
  Pill, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingDown,
  Clock,
  FileText
} from 'lucide-react'

const PharmacyDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('prescriptions')
  const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [selectedMedicine, setSelectedMedicine] = useState(null)

  // State for API data
  const [pendingPrescriptions, setPendingPrescriptions] = useState([])
  const [prescriptionHistory, setPrescriptionHistory] = useState([])
  const [inventory, setInventory] = useState([])
  const [lowStockMedicines, setLowStockMedicines] = useState([])
  const [expiringMedicines, setExpiringMedicines] = useState([])
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    completedPrescriptions: 0,
    lowStockCount: 0
  })

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load pending prescriptions
        const pendingResponse = await pharmacyAPI.getPendingPrescriptions()
        if (pendingResponse.success) {
          setPendingPrescriptions(pendingResponse.data)
        } else {
          // Fallback to mock data
          setPendingPrescriptions([
            {
              id: 1,
              prescriptionCode: 'DT001',
              patientName: 'Nguyễn Văn A',
              doctorName: 'BS. Trần Thị B',
              prescriptionDate: '2024-01-20',
              medicines: [
                { name: 'Paracetamol 500mg', quantity: 20, dosage: '1 viên x 3 lần/ngày' },
                { name: 'Amoxicillin 250mg', quantity: 30, dosage: '1 viên x 2 lần/ngày' }
              ],
              status: 'Chờ xử lý',
              priority: 'Bình thường'
            }
          ])
        }

        // Load prescription history
        const historyResponse = await pharmacyAPI.getPrescriptionHistory()
        if (historyResponse.success) {
          setPrescriptionHistory(historyResponse.data)
        } else {
          setPrescriptionHistory([])
        }

        // Load inventory
        const inventoryResponse = await pharmacyAPI.getInventory()
        if (inventoryResponse.success) {
          setInventory(inventoryResponse.data)
        } else {
          // Fallback to mock data
          setInventory([
            {
              id: 1,
              medicineName: 'Paracetamol 500mg',
              currentStock: 150,
              minStock: 50,
              maxStock: 500,
              unit: 'Viên',
              expiryDate: '2025-12-31',
              supplier: 'Công ty ABC',
              status: 'Còn hàng'
            },
            {
              id: 2,
              medicineName: 'Amoxicillin 250mg',
              currentStock: 25,
              minStock: 50,
              maxStock: 300,
              unit: 'Viên',
              expiryDate: '2024-06-30',
              supplier: 'Công ty XYZ',
              status: 'Sắp hết'
            }
          ])
        }

        // Load low stock medicines
        const lowStockResponse = await pharmacyAPI.getLowStockMedicines()
        if (lowStockResponse.success) {
          setLowStockMedicines(lowStockResponse.data)
        } else {
          setLowStockMedicines(inventory.filter(item => item.currentStock <= item.minStock))
        }

        // Load expiring medicines
        const expiringResponse = await pharmacyAPI.getExpiringMedicines()
        if (expiringResponse.success) {
          setExpiringMedicines(expiringResponse.data)
        } else {
          setExpiringMedicines([])
        }

        // Calculate stats
        setStats({
          totalPrescriptions: pendingPrescriptions.length + prescriptionHistory.length,
          pendingPrescriptions: pendingPrescriptions.length,
          completedPrescriptions: prescriptionHistory.filter(p => p.status === 'Hoàn thành').length,
          lowStockCount: lowStockMedicines.length
        })

      } catch (error) {
        console.error('Error loading pharmacy data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleProcessPrescription = async (prescriptionId, action) => {
    try {
      let response
      if (action === 'complete') {
        response = await pharmacyAPI.completePrescription(prescriptionId)
      } else if (action === 'reject') {
        response = await pharmacyAPI.rejectPrescription(prescriptionId, { reason: 'Không đủ thuốc' })
      } else {
        response = await pharmacyAPI.processPrescription(prescriptionId, { status: 'processing' })
      }

      if (response.success) {
        // Update the prescription in the list
        setPendingPrescriptions(prev => 
          prev.map(p => 
            p.id === prescriptionId 
              ? { ...p, status: action === 'complete' ? 'Hoàn thành' : action === 'reject' ? 'Từ chối' : 'Đang xử lý' }
              : p
          )
        )
      }
    } catch (error) {
      console.error('Error processing prescription:', error)
      alert('Có lỗi xảy ra khi xử lý đơn thuốc')
    }
  }

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription)
    setShowPrescriptionDetailModal(true)
  }

  const handleViewMedicine = (medicine) => {
    setSelectedMedicine(medicine)
    setShowInventoryModal(true)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Chờ xử lý': 'bg-yellow-100 text-yellow-800',
      'Đang xử lý': 'bg-blue-100 text-blue-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Từ chối': 'bg-red-100 text-red-800',
      'Còn hàng': 'bg-green-100 text-green-800',
      'Sắp hết': 'bg-yellow-100 text-yellow-800',
      'Hết hàng': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'Cao': 'bg-red-100 text-red-800',
      'Bình thường': 'bg-blue-100 text-blue-800',
      'Thấp': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    )
  }

  // Columns for pending prescriptions table
  const pendingPrescriptionColumns = [
    {
      key: 'prescriptionCode',
      label: 'Mã đơn',
      render: (value) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'patientName',
      label: 'Bệnh nhân',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">BS. {row.doctorName}</div>
        </div>
      )
    },
    {
      key: 'prescriptionDate',
      label: 'Ngày kê',
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString('vi-VN')}
        </div>
      )
    },
    {
      key: 'medicines',
      label: 'Thuốc',
      render: (value) => (
        <div className="text-sm">
          {value.length} loại thuốc
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Ưu tiên',
      render: (value) => getPriorityBadge(value)
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
            onClick={() => handleViewPrescription(row)}
          >
            Xem
          </Button>
          {row.status === 'Chờ xử lý' && (
            <>
              <Button
                size="sm"
                variant="success"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => handleProcessPrescription(row.id, 'complete')}
              >
                Hoàn thành
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => handleProcessPrescription(row.id, 'reject')}
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  // Columns for inventory table
  const inventoryColumns = [
    {
      key: 'medicineName',
      label: 'Tên thuốc',
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'currentStock',
      label: 'Tồn kho',
      render: (value, row) => (
        <div className="text-center">
          <div className="font-medium">{value} {row.unit}</div>
          <div className="text-xs text-gray-500">
            Min: {row.minStock} | Max: {row.maxStock}
          </div>
        </div>
      )
    },
    {
      key: 'expiryDate',
      label: 'Hạn sử dụng',
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString('vi-VN')}
        </div>
      )
    },
    {
      key: 'supplier',
      label: 'Nhà cung cấp',
      render: (value) => (
        <div className="text-sm">{value}</div>
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
            onClick={() => handleViewMedicine(row)}
          >
            Chi tiết
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => console.log('Import medicine:', row.id)}
          >
            Nhập kho
          </Button>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý dược phẩm</h1>
          <p className="text-gray-600 mt-1">Xử lý đơn thuốc và quản lý kho thuốc</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Làm mới
          </Button>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={() => console.log('Export data')}
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalPrescriptions}</div>
          <div className="text-gray-600">Tổng đơn thuốc</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pendingPrescriptions}</div>
          <div className="text-gray-600">Chờ xử lý</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.completedPrescriptions}</div>
          <div className="text-gray-600">Đã hoàn thành</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{stats.lowStockCount}</div>
          <div className="text-gray-600">Sắp hết hàng</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'prescriptions', label: 'Đơn thuốc chờ xử lý', count: pendingPrescriptions.length },
            { id: 'inventory', label: 'Quản lý kho', count: inventory.length },
            { id: 'alerts', label: 'Cảnh báo', count: lowStockMedicines.length + expiringMedicines.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'prescriptions' && (
        <Card title="Đơn thuốc chờ xử lý">
          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn thuốc..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
              Lọc
            </Button>
          </div>
          <Table
            data={pendingPrescriptions}
            columns={pendingPrescriptionColumns}
            searchable={false}
          />
        </Card>
      )}

      {activeTab === 'inventory' && (
        <Card title="Quản lý kho thuốc">
          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thuốc..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
              Lọc
            </Button>
            <Button icon={<Plus className="w-4 h-4" />}>
              Nhập thuốc mới
            </Button>
          </div>
          <Table
            data={inventory}
            columns={inventoryColumns}
            searchable={false}
          />
        </Card>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Low Stock Alert */}
          {lowStockMedicines.length > 0 && (
            <Card title="Thuốc sắp hết hàng" className="border-yellow-200">
              <div className="space-y-3">
                {lowStockMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-gray-900">{medicine.medicineName}</div>
                        <div className="text-sm text-gray-600">
                          Còn lại: {medicine.currentStock} {medicine.unit} (Tối thiểu: {medicine.minStock})
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="primary">
                      Đặt hàng
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Expiring Medicines Alert */}
          {expiringMedicines.length > 0 && (
            <Card title="Thuốc sắp hết hạn" className="border-red-200">
              <div className="space-y-3">
                {expiringMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">{medicine.medicineName}</div>
                        <div className="text-sm text-gray-600">
                          Hết hạn: {new Date(medicine.expiryDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="danger">
                      Xử lý
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {lowStockMedicines.length === 0 && expiringMedicines.length === 0 && (
            <Card className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có cảnh báo</h3>
              <p className="text-gray-600">Tất cả thuốc trong kho đều ở trạng thái bình thường</p>
            </Card>
          )}
        </div>
      )}

      {/* Prescription Detail Modal */}
      <Modal
        isOpen={showPrescriptionDetailModal}
        onClose={() => setShowPrescriptionDetailModal(false)}
        title="Chi tiết đơn thuốc"
        size="lg"
      >
        {selectedPrescription && (
          <div className="space-y-6">
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
                    <span className="text-gray-600">Ưu tiên:</span>
                    {getPriorityBadge(selectedPrescription.priority)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách thuốc</h3>
                <div className="space-y-3">
                  {selectedPrescription.medicines.map((medicine, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-1">{medicine.name}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Số lượng:</strong> {medicine.quantity}</div>
                        <div><strong>Cách dùng:</strong> {medicine.dosage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPrescriptionDetailModal(false)}
              >
                Đóng
              </Button>
              {selectedPrescription.status === 'Chờ xử lý' && (
                <>
                  <Button
                    variant="success"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => {
                      handleProcessPrescription(selectedPrescription.id, 'complete')
                      setShowPrescriptionDetailModal(false)
                    }}
                  >
                    Hoàn thành
                  </Button>
                  <Button
                    variant="danger"
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={() => {
                      handleProcessPrescription(selectedPrescription.id, 'reject')
                      setShowPrescriptionDetailModal(false)
                    }}
                  >
                    Từ chối
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Inventory Detail Modal */}
      <Modal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        title="Chi tiết thuốc trong kho"
        size="lg"
      >
        {selectedMedicine && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin thuốc</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên thuốc:</span>
                    <span className="font-medium">{selectedMedicine.medicineName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tồn kho hiện tại:</span>
                    <span className="font-medium">{selectedMedicine.currentStock} {selectedMedicine.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tồn kho tối thiểu:</span>
                    <span className="font-medium">{selectedMedicine.minStock} {selectedMedicine.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tồn kho tối đa:</span>
                    <span className="font-medium">{selectedMedicine.maxStock} {selectedMedicine.unit}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin khác</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hạn sử dụng:</span>
                    <span className="font-medium">
                      {new Date(selectedMedicine.expiryDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nhà cung cấp:</span>
                    <span className="font-medium">{selectedMedicine.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedMedicine.status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowInventoryModal(false)}
              >
                Đóng
              </Button>
              <Button
                icon={<Plus className="w-4 h-4" />}
                onClick={() => console.log('Import medicine:', selectedMedicine.id)}
              >
                Nhập kho
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PharmacyDashboard








