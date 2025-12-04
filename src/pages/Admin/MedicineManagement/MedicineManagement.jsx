import React, { useState, useEffect } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { adminAPI } from '../../../services/api'
import { 
  Pill, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  Filter,
  Eye,
  AlertTriangle,
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react'

const MedicineManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterDosageForm, setFilterDosageForm] = useState('')
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState({ total: 0, outOfStock: 0, lowStock: 0, expiringSoon: 0 })
  const [sortField, setSortField] = useState('thuocId')
  const [sortDir, setSortDir] = useState('asc')
  const [dosageForms, setDosageForms] = useState([])
  const [groups, setGroups] = useState([])

  // Dữ liệu từ API
  const [medicines, setMedicines] = useState([])
  
  // Load dữ liệu từ API
  useEffect(() => {
    const loadMedicines = async () => {
      setLoading(true)
      try {
        const expiringBefore = filterExpiringSoon ? new Date(Date.now() + 90*24*60*60*1000).toISOString().slice(0,10) : undefined
        const response = await adminAPI.getMedicines(page, size, { search: searchTerm, nhaSanXuat: filterSupplier, nhomThuoc: filterCategory, dangBaoChe: filterDosageForm, expiringBefore, sortField, sortDir })
        const fetchedMedicines = response.content || response.data || []
        setTotalCount(response.totalElements ?? fetchedMedicines.length)
        
        // Chuyển đổi dữ liệu từ API sang format phù hợp với UI
        const formattedMedicines = fetchedMedicines.map(formatMedicine)
        
        setMedicines(formattedMedicines)
        // Cập nhật thống kê cùng lúc để đồng bộ dữ liệu hiển thị
        try {
          const s = await adminAPI.getMedicineStats()
          setStats({
            total: s.total ?? 0,
            outOfStock: s.outOfStock ?? 0,
            lowStock: s.lowStock ?? 0,
            expiringSoon: s.expiringSoon ?? 0,
          })
        } catch {}
        setError(null)
      } catch (err) {
        console.error('Lỗi khi tải danh sách thuốc:', err)
        setError('Không thể tải danh sách thuốc')
      } finally {
        setLoading(false)
      }
    }
    
    loadMedicines()
  }, [page, size, searchTerm, filterSupplier, filterCategory, filterDosageForm, filterExpiringSoon, sortField, sortDir])

  // Load options for selects
  useEffect(() => {
    (async () => {
      try {
        const [df, gr] = await Promise.all([
          adminAPI.getDosageForms(),
          adminAPI.getGroups(),
        ])
        // Backend hiện tại trả dạng { content: [...], ... } nên cần bóc tách
        const dfList = Array.isArray(df) ? df : (df?.content || [])
        const grList = Array.isArray(gr) ? gr : (gr?.content || [])

        setDosageForms(dfList)
        setGroups(grList)
      } catch {}
    })()
  }, [])

  // Load thống kê tổng thể lần đầu
  useEffect(() => { (async () => { try {
    const s = await adminAPI.getMedicineStats();
    setStats({ total: s.total ?? 0, outOfStock: s.outOfStock ?? 0, lowStock: s.lowStock ?? 0, expiringSoon: s.expiringSoon ?? 0 })
  } catch {} })() }, [])
  

  // Removed hardcoded data - should come from API
  const categories = []
  const suppliers = []
  const units = []

  const [formData, setFormData] = useState({
    medicineCode: '',
    name: '',
    genericName: '',
    category: '',
    unit: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unitPrice: '',
    supplier: '',
    expiryDate: '',
    batchNumber: '',
    prescriptionRequired: null,
    status: null,
    description: ''
  })

  // Dữ liệu hiển thị (đã lấy theo filter từ API)
  const filteredMedicines = medicines

  // Tính trạng thái hiển thị chuẩn hóa - removed hardcoded status values
  const computeStatus = (m) => {
    // Return status from API, or null if not available
    return m.trangThai || m.status || null
  }

  // Chuẩn hoá thuốc từ API về UI
  const formatMedicine = (medicine) => ({
    id: medicine.thuocId,
    medicineCode: medicine.maThuoc || `T${medicine.thuocId}`,
    name: medicine.tenThuoc,
    genericName: medicine.hoatChat || '',
    category: medicine.nhomThuoc || '',
    unit: medicine.donVi || 'Viên',
    currentStock: medicine.tonKhoHienTai ?? 0,
    minStock: medicine.tonKhoToiThieu ?? 0,
    maxStock: medicine.tonKhoToiDa ?? 0,
    unitPrice: medicine.donGia ?? 0,
    supplier: medicine.nhaCungCap || medicine.nhaSanXuat || '',
    expiryDate: medicine.hanSuDung || '',
    batchNumber: medicine.soLo || '',
    prescriptionRequired: !!medicine.yeuCauKeDon,
    status: computeStatus(medicine),
    description: ''
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleAddMedicine = () => {
    // Tạo mã thuốc mới
    const newCode = `T${String(medicines.length + 1).padStart(3, '0')}`
    
    setFormData({
      medicineCode: newCode,
      name: '',
      genericName: '',
      category: '',
      unit: '',
      currentStock: '',
      minStock: '',
      maxStock: '',
      unitPrice: '',
      supplier: '',
      expiryDate: '',
      batchNumber: '',
      prescriptionRequired: true,
      status: null,
      description: ''
    })
    setShowAddModal(true)
  }

  const handleEditMedicine = (medicine) => {
    setSelectedMedicine(medicine)
    setFormData(medicine)
    setShowEditModal(true)
  }

  const handleViewMedicine = (medicine) => {
    setSelectedMedicine(medicine)
    setShowViewModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const dto = {
      tenThuoc: formData.name,
      hoatChat: formData.genericName,
      nhomThuoc: formData.category || '',
      donVi: formData.unit || '',
      tonKhoHienTai: parseInt(formData.currentStock || 0),
      tonKhoToiThieu: parseInt(formData.minStock || 0),
      tonKhoToiDa: parseInt(formData.maxStock || 0),
      donGia: Number(formData.unitPrice || 0),
      nhaCungCap: formData.supplier,
      hanSuDung: formData.expiryDate,
      soLo: formData.batchNumber || '',
      yeuCauKeDon: !!formData.prescriptionRequired,
      trangThai: formData.status
    }
    try {
      if (showEditModal && selectedMedicine) {
        // Cập nhật lạc quan trên UI
        setMedicines(prev => prev.map(m => m.id === selectedMedicine.id ? { ...m, ...formData } : m))
        const res = await adminAPI.updateMedicine(selectedMedicine.id, dto)
        // Đồng bộ lại theo dữ liệu server (nếu trả về)
        if (res?.thuocId) {
          const formatted = formatMedicine(res)
          setMedicines(prev => prev.map(m => m.id === formatted.id ? formatted : m))
        }
        setShowEditModal(false)
      } else {
        // Tạo lạc quan với id tạm
        const tempId = `temp-${Date.now()}`
        const optimistic = { ...formData, id: tempId }
        setMedicines(prev => [optimistic, ...prev])
        const res = await adminAPI.createMedicine(dto)
        // Thay id tạm bằng bản ghi thật khi có response
        if (res?.thuocId) {
          const formatted = formatMedicine(res)
          setMedicines(prev => prev.map(m => m.id === tempId ? formatted : m))
        }
        setShowAddModal(false)
      }
      // cập nhật lại thống kê sau khi CRUD
      try {
        const s = await adminAPI.getMedicineStats()
        setStats({ total: s.total ?? 0, outOfStock: s.outOfStock ?? 0, lowStock: s.lowStock ?? 0, expiringSoon: s.expiringSoon ?? 0 })
      } catch {}
    } catch (err) {
      console.error('Lưu thuốc thất bại:', err)
      alert('Lưu thuốc thất bại')
    }
  }

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thuốc này?')) return
    try {
      // Xoá lạc quan
      const prev = medicines
      setMedicines(prev.filter(m => m.id !== id))
      await adminAPI.deleteMedicine(id)
      try {
        const s = await adminAPI.getMedicineStats()
        setStats({ total: s.total ?? 0, outOfStock: s.outOfStock ?? 0, lowStock: s.lowStock ?? 0, expiringSoon: s.expiringSoon ?? 0 })
      } catch {}
    } catch (err) {
      console.error('Xóa thuốc thất bại:', err)
      alert('Xóa thuốc thất bại')
      // Nếu thất bại có thể refetch toàn trang
      setPage(0)
    }
  }

  const getStatusBadge = (status) => {
    // Removed hardcoded status values - should come from API
    const statusConfig = {}
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || ''}
      </span>
    )
  }

  const getStockStatus = (currentStock, minStock) => {
    // Removed hardcoded status - return null or use API data
    return { status: null, color: '' }
  }

  // Cột cho bảng thuốc
  const medicineColumns = [
    {
      key: 'medicineCode',
      label: 'Mã thuốc',
      render: (value, row) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'name',
      label: 'Tên thuốc',
      render: (value, row) => (
        <div className="max-w-[640px]">
          <div className="font-medium text-gray-900 truncate" title={value}>{value}</div>
          <div className="text-sm text-gray-500 truncate" title={row.genericName}>{row.genericName}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Nhóm thuốc',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'currentStock',
      label: 'Tồn kho',
      render: (value, row) => {
        const stockStatus = getStockStatus(value, row.minStock)
        return (
          <div>
            <div className={`font-medium ${stockStatus.color}`}>
              {value} {row.unit}
            </div>
            <div className="text-xs text-gray-500">
              Tối thiểu: {row.minStock}
            </div>
          </div>
        )
      }
    },
    {
      key: 'unitPrice',
      label: 'Đơn giá',
      render: (value) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{parseInt(value).toLocaleString('vi-VN')} VNĐ</span>
        </div>
      )
    },
    {
      key: 'expiryDate',
      label: 'Hạn sử dụng',
      render: (value) => {
        const isExpired = new Date(value) < new Date()
        const isExpiringSoon = new Date(value) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        
        return (
          <div className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-gray-600'}`}>
            {new Date(value).toLocaleDateString('vi-VN')}
            {isExpired && <div className="text-xs text-red-500">Đã hết hạn</div>}
            {!isExpired && isExpiringSoon && <div className="text-xs text-yellow-500">Sắp hết hạn</div>}
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value, row) => {
        return getStatusBadge(row.status)
      }
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
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditMedicine(row)}
          >
            Sửa
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDeleteMedicine(row.id)}
          >
            Xóa
          </Button>
        </div>
      )
    }
  ]

  // Tính toán thống kê
  const totalMedicines = stats.total || totalCount
  const outOfStock = stats.outOfStock
  const lowStock = stats.lowStock
  const expiringSoon = stats.expiringSoon

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý danh mục thuốc</h1>
            <p className="text-emerald-100">Quản lý thuốc, tồn kho và nhà cung cấp</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddMedicine}
            className="bg-white text-emerald-600 hover:bg-emerald-50"
          >
            Thêm thuốc mới
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
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng thuốc</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{totalMedicines}</div>
            <div className="text-sm text-gray-500">Tất cả loại thuốc</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Hết hàng</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{outOfStock}</div>
            <div className="text-sm text-gray-500">Cần nhập kho ngay</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Sắp hết</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{lowStock}</div>
            <div className="text-sm text-gray-500">Cần lên kế hoạch nhập</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Sắp hết hạn</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{expiringSoon}</div>
            <div className="text-sm text-gray-500">Cần kiểm tra và xử lý</div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {(outOfStock > 0 || lowStock > 0 || expiringSoon > 0) && (
        <Card title="Cảnh báo">
          <div className="space-y-3">
            {outOfStock > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-900">Có {outOfStock} loại thuốc đã hết hàng</div>
                  <div className="text-sm text-red-700">Cần nhập kho ngay lập tức</div>
                </div>
              </div>
            )}
            {lowStock > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-900">Có {lowStock} loại thuốc sắp hết</div>
                  <div className="text-sm text-yellow-700">Cần lên kế hoạch nhập kho</div>
                </div>
              </div>
            )}
            {expiringSoon > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">Có {expiringSoon} loại thuốc sắp hết hạn</div>
                  <div className="text-sm text-orange-700">Cần kiểm tra và xử lý</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm thuốc..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(0) }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả nhóm thuốc</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tất cả nhà cung cấp"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={filterDosageForm}
            onChange={(e) => { setFilterDosageForm(e.target.value); setPage(0) }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả dạng bào chế</option>
            {dosageForms.map(df => (
              <option key={df} value={df}>{df}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filterExpiringSoon}
              onChange={(e) => setFilterExpiringSoon(e.target.checked)}
            />
            Sắp hết hạn (≤ 90 ngày)
          </label>

          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={() => console.log('Export medicine list')}
          >
            Xuất danh sách
          </Button>
        </div>
      </Card>

      {/* Medicine Table */}
      <Card title="Danh sách thuốc">
        <Table
          data={filteredMedicines}
          columns={medicineColumns}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDir}
          noHorizontalScroll
          searchable={false}
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Trang {page + 1}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Trước</Button>
            <Button variant="outline" onClick={() => setPage(page + 1)} disabled={(page + 1) * size >= totalCount}>Sau</Button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Medicine Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedMedicine(null)
        }}
        title={showEditModal ? "Sửa thông tin thuốc" : "Thêm thuốc mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã thuốc
              </label>
              <input
                type="text"
                value={formData.medicineCode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên thuốc *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên gốc
              </label>
              <input
                type="text"
                value={formData.genericName}
                onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm thuốc *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn nhóm thuốc</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị tính *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn đơn vị</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn giá (VNĐ) *
              </label>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho hiện tại *
              </label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho tối thiểu *
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho tối đa
              </label>
              <input
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({...formData, maxStock: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhà cung cấp *
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập nhà cung cấp"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạn sử dụng *
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lô
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mô tả về thuốc..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prescriptionRequired"
              checked={formData.prescriptionRequired}
              onChange={(e) => setFormData({...formData, prescriptionRequired: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="prescriptionRequired" className="text-sm text-gray-700">
              Yêu cầu kê đơn
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedMedicine(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Thêm thuốc"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Medicine Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedMedicine(null)
        }}
        title="Chi tiết thuốc"
        size="lg"
      >
        {selectedMedicine && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã thuốc:</span>
                    <span className="font-medium">{selectedMedicine.medicineCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên thuốc:</span>
                    <span className="font-medium">{selectedMedicine.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên gốc:</span>
                    <span className="font-medium">{selectedMedicine.genericName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nhóm thuốc:</span>
                    <span className="font-medium">{selectedMedicine.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đơn vị:</span>
                    <span className="font-medium">{selectedMedicine.unit}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin tồn kho</h3>
                <div className="space-y-2">
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đơn giá:</span>
                    <span className="font-medium">{parseInt(selectedMedicine.unitPrice).toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(getStockStatus(selectedMedicine.currentStock, selectedMedicine.minStock).status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier & Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin nhà cung cấp</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nhà cung cấp:</span>
                    <span className="font-medium">{selectedMedicine.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lô:</span>
                    <span className="font-medium">{selectedMedicine.batchNumber}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin hạn sử dụng</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hạn sử dụng:</span>
                    <span className="font-medium">
                      {new Date(selectedMedicine.expiryDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yêu cầu kê đơn:</span>
                    <span className={`font-medium ${selectedMedicine.prescriptionRequired ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedMedicine.prescriptionRequired ? 'Có' : 'Không'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedMedicine.description && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Mô tả</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedMedicine.description}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedMedicine(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditMedicine(selectedMedicine)
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

export default MedicineManagement

