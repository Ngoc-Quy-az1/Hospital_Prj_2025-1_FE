import React, { useState, useEffect } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { adminAPI } from '../../../services/api'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  UserCheck,
  Lock,
  Unlock,
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

const UserManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Dữ liệu từ API
  const [users, setUsers] = useState([])
  
  // Load dữ liệu từ API
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      try {
        const response = await adminAPI.getUsers()
        const fetchedUsers = response.content || response.data || []
        
        // Chuyển đổi dữ liệu từ API sang format phù hợp với UI
        const formattedUsers = fetchedUsers.map(user => ({
          id: user.userId,
          username: user.username,
          email: user.email || '',
          name: user.username,
          role: user.role?.tenRole || 'patient',
          department: '',
          status: user.status || 'active',
          lastLogin: '',
          createdAt: '',
          permissions: [],
      twoFactorEnabled: false,
      loginAttempts: 0
        }))
        
        setUsers(formattedUsers)
        setError(null)
      } catch (err) {
        console.error('Lỗi khi tải danh sách người dùng:', err)
        setError('Không thể tải danh sách người dùng')
      } finally {
        setLoading(false)
      }
    }
    
    loadUsers()
  }, [])

  const roles = [
    { value: 'admin', label: 'Quản trị viên', permissions: ['*'] },
    { value: 'doctor', label: 'Bác sĩ', permissions: ['patient.*', 'medical-record.*', 'prescription.*', 'lab-test.read'] },
    { value: 'nurse', label: 'Y tá', permissions: ['patient.read', 'medical-record.read', 'room.read', 'room.update'] },
    { value: 'pharmacist', label: 'Dược sĩ', permissions: ['medicine.read', 'prescription.read', 'prescription.update'] },
    { value: 'receptionist', label: 'Lễ tân', permissions: ['patient.create', 'patient.read', 'appointment.*'] },
    { value: 'accountant', label: 'Kế toán', permissions: ['financial.read', 'invoice.*'] }
  ]

  const allPermissions = [
    { category: 'Người dùng', permissions: ['user.create', 'user.read', 'user.update', 'user.delete'] },
    { category: 'Bệnh nhân', permissions: ['patient.create', 'patient.read', 'patient.update', 'patient.delete'] },
    { category: 'Hồ sơ y tế', permissions: ['medical-record.create', 'medical-record.read', 'medical-record.update', 'medical-record.delete'] },
    { category: 'Thuốc', permissions: ['medicine.create', 'medicine.read', 'medicine.update', 'medicine.delete'] },
    { category: 'Đơn thuốc', permissions: ['prescription.create', 'prescription.read', 'prescription.update', 'prescription.delete'] },
    { category: 'Xét nghiệm', permissions: ['lab-test.create', 'lab-test.read', 'lab-test.update', 'lab-test.delete'] },
    { category: 'Tài chính', permissions: ['financial.create', 'financial.read', 'financial.update', 'financial.delete'] },
    { category: 'Phòng bệnh', permissions: ['room.create', 'room.read', 'room.update', 'room.delete'] },
    { category: 'Lịch hẹn', permissions: ['appointment.create', 'appointment.read', 'appointment.update', 'appointment.delete'] },
    { category: 'Báo cáo', permissions: ['report.read'] }
  ]

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    role: '',
    department: '',
    status: 'active',
    permissions: [],
    twoFactorEnabled: false,
    password: ''
  })

  // Lọc tài khoản
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = !filterRole || user.role === filterRole
    const matchesStatus = !filterStatus || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleAddUser = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      role: '',
      department: '',
      status: 'active',
      permissions: [],
      twoFactorEnabled: false,
      password: ''
    })
    setShowAddModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setFormData({
      ...user,
      password: ''
    })
    setShowEditModal(true)
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (showEditModal && selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...formData } : user
      ))
      setShowEditModal(false)
    } else {
      const newUser = {
        id: users.length + 1,
        ...formData,
        lastLogin: null,
        createdAt: new Date().toISOString().split('T')[0],
        loginAttempts: 0
      }
      setUsers([...users, newUser])
      setShowAddModal(false)
    }
  }

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ))
  }

  const resetLoginAttempts = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, loginAttempts: 0 }
        : user
    ))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'locked': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'active' ? 'Hoạt động' : status === 'inactive' ? 'Tạm khóa' : 'Bị khóa'}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': 'bg-purple-100 text-purple-800',
      'doctor': 'bg-blue-100 text-blue-800',
      'nurse': 'bg-green-100 text-green-800',
      'pharmacist': 'bg-orange-100 text-orange-800',
      'receptionist': 'bg-yellow-100 text-yellow-800',
      'accountant': 'bg-pink-100 text-pink-800'
    }
    
    const roleLabel = roles.find(r => r.value === role)?.label || role
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig[role] || 'bg-gray-100 text-gray-800'}`}>
        {roleLabel}
      </span>
    )
  }

  const handleRoleChange = (role) => {
    const selectedRole = roles.find(r => r.value === role)
    setFormData({
      ...formData,
      role,
      permissions: selectedRole ? selectedRole.permissions : []
    })
  }

  const togglePermission = (permission) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission]
    
    setFormData({
      ...formData,
      permissions: updatedPermissions
    })
  }

  // Cột cho bảng tài khoản
  const userColumns = [
    {
      key: 'username',
      label: 'Tên đăng nhập',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Họ tên',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (value) => getRoleBadge(value)
    },
    {
      key: 'department',
      label: 'Phòng ban',
      render: (value) => (
        <div className="text-sm text-gray-600">{value}</div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {value === 'active' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
          {getStatusBadge(value)}
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Lần đăng nhập cuối',
      render: (value) => (
        <div className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
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
            onClick={() => handleViewUser(row)}
          >
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditUser(row)}
          >
            Sửa
          </Button>
          <Button
            size="sm"
            variant={row.status === 'active' ? 'danger' : 'outline'}
            icon={row.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            onClick={() => toggleUserStatus(row.id)}
          >
            {row.status === 'active' ? 'Khóa' : 'Mở khóa'}
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý tài khoản & phân quyền</h1>
            <p className="text-violet-100">Quản lý tài khoản người dùng và phân quyền hệ thống</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddUser}
            className="bg-white text-violet-600 hover:bg-violet-50"
          >
            Thêm tài khoản mới
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng tài khoản</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{users.length}</div>
            <div className="text-sm text-gray-500">Tất cả người dùng</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đang hoạt động</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Tài khoản đang sử dụng</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tạm khóa</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {users.filter(u => u.status === 'inactive').length}
            </div>
            <div className="text-sm text-gray-500">Tài khoản bị khóa</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">2FA được bật</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {users.filter(u => u.twoFactorEnabled).length}
            </div>
            <div className="text-sm text-gray-500">Xác thực 2 yếu tố</div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {users.filter(u => u.loginAttempts >= 3).length > 0 && (
        <Card title="Cảnh báo bảo mật">
          <div className="space-y-3">
            {users.filter(u => u.loginAttempts >= 3).map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <div className="font-medium text-red-900">{user.name} ({user.username})</div>
                  <div className="text-sm text-red-700">
                    Tài khoản có {user.loginAttempts} lần đăng nhập thất bại
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resetLoginAttempts(user.id)}
                >
                  Reset
                </Button>
              </div>
            ))}
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
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm khóa</option>
            <option value="locked">Bị khóa</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card title="Danh sách tài khoản">
        <Table
          data={filteredUsers}
          columns={userColumns}
          searchable={false}
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        title={showEditModal ? "Sửa tài khoản" : "Thêm tài khoản mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
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
                Vai trò *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn vai trò</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng ban
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {!showEditModal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!showEditModal}
                />
              </div>
            )}

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
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Phân quyền
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {allPermissions.map(category => (
                <div key={category.category} className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {category.permissions.map(permission => (
                      <label key={permission} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs">{permission.split('.').pop()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2FA */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="twoFactorEnabled"
              checked={formData.twoFactorEnabled}
              onChange={(e) => setFormData({...formData, twoFactorEnabled: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="twoFactorEnabled" className="text-sm text-gray-700">
              Bật xác thực 2 yếu tố (2FA)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedUser(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Thêm tài khoản"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedUser(null)
        }}
        title="Chi tiết tài khoản"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên đăng nhập:</span>
                    <span className="font-medium">{selectedUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vai trò:</span>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phòng ban:</span>
                    <span className="font-medium">{selectedUser.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin bảo mật</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">2FA:</span>
                    <span className={`font-medium ${selectedUser.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lần đăng nhập cuối:</span>
                    <span className="font-medium text-sm">
                      {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lần đăng nhập thất bại:</span>
                    <span className={`font-medium ${selectedUser.loginAttempts >= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                      {selectedUser.loginAttempts}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Phân quyền</h3>
              <div className="space-y-3">
                {allPermissions.map(category => {
                  const categoryPermissions = selectedUser.permissions.filter(p => 
                    category.permissions.some(cp => p === cp || p === '*')
                  )
                  
                  if (categoryPermissions.length === 0) return null
                  
                  return (
                    <div key={category.category} className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {categoryPermissions.map(permission => (
                          <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {permission === '*' ? 'Tất cả quyền' : permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedUser(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditUser(selectedUser)
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

export default UserManagement










