import React, { useState } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import { 
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Bed,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity
} from 'lucide-react'

const RoomManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Dữ liệu mẫu phòng bệnh
  const [rooms, setRooms] = useState([
    {
      id: 1,
      roomNumber: 'P101',
      roomType: 'Phòng đơn',
      department: 'Khoa Tim mạch',
      capacity: 1,
      currentOccupancy: 1,
      beds: [
        {
          id: 1,
          bedNumber: 'P101-1',
          status: 'Đang sử dụng',
          patientId: 1,
          patientName: 'Nguyễn Thị An',
          admissionDate: '2024-01-15',
          expectedDischarge: '2024-01-20',
          dailyRate: 500000
        }
      ],
      status: 'Đầy',
      facilities: ['Điều hòa', 'TV', 'Tủ lạnh', 'Wifi'],
      dailyRate: 500000
    },
    {
      id: 2,
      roomNumber: 'P102',
      roomType: 'Phòng đôi',
      department: 'Khoa Nội',
      capacity: 2,
      currentOccupancy: 1,
      beds: [
        {
          id: 2,
          bedNumber: 'P102-1',
          status: 'Đang sử dụng',
          patientId: 2,
          patientName: 'Trần Văn Bình',
          admissionDate: '2024-01-16',
          expectedDischarge: '2024-01-22',
          dailyRate: 300000
        },
        {
          id: 3,
          bedNumber: 'P102-2',
          status: 'Trống',
          patientId: null,
          patientName: '',
          admissionDate: '',
          expectedDischarge: '',
          dailyRate: 300000
        }
      ],
      status: 'Có chỗ trống',
      facilities: ['Điều hòa', 'TV', 'Wifi'],
      dailyRate: 300000
    },
    {
      id: 3,
      roomNumber: 'P103',
      roomType: 'Phòng 4 giường',
      department: 'Khoa Ngoại',
      capacity: 4,
      currentOccupancy: 0,
      beds: [
        {
          id: 4,
          bedNumber: 'P103-1',
          status: 'Trống',
          patientId: null,
          patientName: '',
          admissionDate: '',
          expectedDischarge: '',
          dailyRate: 150000
        },
        {
          id: 5,
          bedNumber: 'P103-2',
          status: 'Trống',
          patientId: null,
          patientName: '',
          admissionDate: '',
          expectedDischarge: '',
          dailyRate: 150000
        },
        {
          id: 6,
          bedNumber: 'P103-3',
          status: 'Trống',
          patientId: null,
          patientName: '',
          admissionDate: '',
          expectedDischarge: '',
          dailyRate: 150000
        },
        {
          id: 7,
          bedNumber: 'P103-4',
          status: 'Trống',
          patientId: null,
          patientName: '',
          admissionDate: '',
          expectedDischarge: '',
          dailyRate: 150000
        }
      ],
      status: 'Trống',
      facilities: ['Điều hòa', 'Wifi'],
      dailyRate: 150000
    }
  ])

  const departments = [
    'Khoa Tim mạch', 'Khoa Nội', 'Khoa Ngoại', 'Khoa Sản', 'Khoa Nhi'
  ]

  const roomTypes = [
    'Phòng đơn', 'Phòng đôi', 'Phòng 4 giường', 'Phòng VIP', 'Phòng cấp cứu'
  ]

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: '',
    department: '',
    capacity: 1,
    dailyRate: 0,
    facilities: [],
    status: 'Trống'
  })

  // Lọc phòng bệnh
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = !filterDepartment || room.department === filterDepartment
    const matchesStatus = !filterStatus || room.status === filterStatus
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleAddRoom = () => {
    setFormData({
      roomNumber: '',
      roomType: '',
      department: '',
      capacity: 1,
      dailyRate: 0,
      facilities: [],
      status: 'Trống'
    })
    setShowAddModal(true)
  }

  const handleEditRoom = (room) => {
    setSelectedRoom(room)
    setFormData(room)
    setShowEditModal(true)
  }

  const handleViewRoom = (room) => {
    setSelectedRoom(room)
    setShowViewModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (showEditModal && selectedRoom) {
      setRooms(rooms.map(room => 
        room.id === selectedRoom.id ? { ...room, ...formData } : room
      ))
      setShowEditModal(false)
    } else {
      const newRoom = {
        id: rooms.length + 1,
        ...formData,
        currentOccupancy: 0,
        beds: Array.from({ length: formData.capacity }, (_, index) => ({
          id: Date.now() + index,
          bedNumber: `${formData.roomNumber}-${index + 1}`,
          status: 'Trống',
          patientId: null,
          patientName: '',
          admissionDate: '',
          expectedDischarge: '',
          dailyRate: formData.dailyRate
        }))
      }
      setRooms([...rooms, newRoom])
      setShowAddModal(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Trống': 'bg-green-100 text-green-800',
      'Có chỗ trống': 'bg-yellow-100 text-yellow-800',
      'Đầy': 'bg-red-100 text-red-800',
      'Bảo trì': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const getBedStatusBadge = (status) => {
    const statusConfig = {
      'Trống': 'bg-green-100 text-green-800',
      'Đang sử dụng': 'bg-red-100 text-red-800',
      'Bảo trì': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý phòng & giường bệnh</h1>
            <p className="text-teal-100">Quản lý phòng bệnh và phân giường cho bệnh nhân nội trú</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddRoom}
            className="bg-white text-teal-600 hover:bg-teal-50"
          >
            Thêm phòng mới
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
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng phòng</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{rooms.length}</div>
            <div className="text-sm text-gray-500">Tất cả phòng bệnh</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <Bed className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Phòng trống</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {rooms.filter(r => r.status === 'Trống').length}
            </div>
            <div className="text-sm text-gray-500">Có thể sử dụng</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Có chỗ trống</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {rooms.filter(r => r.status === 'Có chỗ trống').length}
            </div>
            <div className="text-sm text-gray-500">Còn giường trống</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Bệnh nhân nội trú</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {rooms.reduce((sum, r) => sum + r.currentOccupancy, 0)}
            </div>
            <div className="text-sm text-gray-500">Đang điều trị nội trú</div>
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
              placeholder="Tìm kiếm phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả khoa</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Trống">Trống</option>
            <option value="Có chỗ trống">Có chỗ trống</option>
            <option value="Đầy">Đầy</option>
            <option value="Bảo trì">Bảo trì</option>
          </select>
        </div>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Room Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3>
                  <p className="text-sm text-gray-600">{room.roomType}</p>
                </div>
                {getStatusBadge(room.status)}
              </div>

              {/* Room Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{room.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bed className="w-4 h-4 text-gray-400" />
                  <span>{room.currentOccupancy}/{room.capacity} giường</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span>{room.dailyRate.toLocaleString('vi-VN')} VNĐ/ngày</span>
                </div>
              </div>

              {/* Beds */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Giường bệnh</h4>
                <div className="space-y-2">
                  {room.beds.map(bed => (
                    <div key={bed.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{bed.bedNumber}</span>
                      </div>
                      {getBedStatusBadge(bed.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tiện ích</h4>
                <div className="flex flex-wrap gap-1">
                  {room.facilities.map((facility, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => handleViewRoom(room)}
                >
                  Xem
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => handleEditRoom(room)}
                >
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
                      setRooms(rooms.filter(r => r.id !== room.id))
                    }
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Room Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedRoom(null)
        }}
        title={showEditModal ? "Sửa phòng bệnh" : "Thêm phòng bệnh mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số phòng *
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: P101"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại phòng *
              </label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn loại phòng</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khoa *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn khoa</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số giường *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá phòng/ngày (VNĐ) *
              </label>
              <input
                type="number"
                value={formData.dailyRate}
                onChange={(e) => setFormData({...formData, dailyRate: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
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
                <option value="Trống">Trống</option>
                <option value="Có chỗ trống">Có chỗ trống</option>
                <option value="Đầy">Đầy</option>
                <option value="Bảo trì">Bảo trì</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiện ích
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Điều hòa', 'TV', 'Tủ lạnh', 'Wifi', 'Tủ quần áo', 'Nhà vệ sinh riêng'].map(facility => (
                <label key={facility} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          facilities: [...formData.facilities, facility]
                        })
                      } else {
                        setFormData({
                          ...formData,
                          facilities: formData.facilities.filter(f => f !== facility)
                        })
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedRoom(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Thêm phòng"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Room Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedRoom(null)
        }}
        title="Chi tiết phòng bệnh"
        size="lg"
      >
        {selectedRoom && (
          <div className="space-y-6">
            {/* Room Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin phòng</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số phòng:</span>
                    <span className="font-medium">{selectedRoom.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại phòng:</span>
                    <span className="font-medium">{selectedRoom.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khoa:</span>
                    <span className="font-medium">{selectedRoom.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sức chứa:</span>
                    <span className="font-medium">{selectedRoom.currentOccupancy}/{selectedRoom.capacity} giường</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá/ngày:</span>
                    <span className="font-medium">{selectedRoom.dailyRate.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedRoom.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Tiện ích</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.facilities.map((facility, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Beds */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết giường bệnh</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRoom.beds.map(bed => (
                  <div key={bed.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{bed.bedNumber}</h4>
                      {getBedStatusBadge(bed.status)}
                    </div>
                    
                    {bed.status === 'Đang sử dụng' && bed.patientName && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{bed.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Nhập viện: {new Date(bed.admissionDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {bed.expectedDischarge && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Dự kiến xuất viện: {new Date(bed.expectedDischarge).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {bed.dailyRate.toLocaleString('vi-VN')} VNĐ/ngày
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedRoom(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditRoom(selectedRoom)
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

export default RoomManagement










