import React, { useState } from 'react'
import { useHospital } from '../../contexts/HospitalContext'
import Card from '../../components/Common/Card'
import Table from '../../components/Common/Table'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'

const AdminUsers = () => {
  const { doctors, nurses, patients, addDoctor, addNurse, addPatient, updateDoctor, updateNurse, updatePatient, deleteDoctor, deleteNurse, deletePatient } = useHospital()
  const [activeTab, setActiveTab] = useState('doctors')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor'
  })

  // Combine all users for unified view
  const allUsers = [
    ...doctors.map(d => ({ ...d, role: 'doctor' })),
    ...nurses.map(n => ({ ...n, role: 'nurse' })),
    ...patients.map(p => ({ ...p, role: 'patient' }))
  ]

  const getCurrentData = () => {
    const data = activeTab === 'all' ? allUsers : 
                 activeTab === 'doctors' ? doctors :
                 activeTab === 'nurses' ? nurses : patients
    
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: activeTab === 'all' ? 'doctor' : activeTab.slice(0, -1)
    })
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      ...(user.specialization && { specialization: user.specialization }),
      ...(user.department && { department: user.department }),
      ...(user.experience && { experience: user.experience })
    })
    setShowModal(true)
  }

  const handleDeleteUser = (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${user.name}?`)) {
      switch (user.role) {
        case 'doctor':
          deleteDoctor(user.id)
          break
        case 'nurse':
          deleteNurse(user.id)
          break
        case 'patient':
          deletePatient(user.id)
          break
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingUser) {
      // Update existing user
      switch (formData.role) {
        case 'doctor':
          updateDoctor(editingUser.id, formData)
          break
        case 'nurse':
          updateNurse(editingUser.id, formData)
          break
        case 'patient':
          updatePatient(editingUser.id, formData)
          break
      }
    } else {
      // Add new user
      switch (formData.role) {
        case 'doctor':
          addDoctor(formData)
          break
        case 'nurse':
          addNurse(formData)
          break
        case 'patient':
          addPatient(formData)
          break
      }
    }
    
    setShowModal(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'doctor'
    })
  }

  const columns = [
    {
      field: 'name',
      label: 'Họ tên',
      sortable: true
    },
    {
      field: 'email',
      label: 'Email',
      sortable: true
    },
    {
      field: 'phone',
      label: 'Số điện thoại',
      sortable: true
    },
    {
      field: 'role',
      label: 'Vai trò',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'doctor' ? 'bg-blue-100 text-blue-800' :
          value === 'nurse' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {value === 'doctor' ? 'Bác sĩ' : 
           value === 'nurse' ? 'Y tá' : 'Bệnh nhân'}
        </span>
      )
    },
    {
      field: 'specialization',
      label: 'Chuyên khoa',
      render: (value, row) => row.role === 'doctor' ? value : '-'
    },
    {
      field: 'department',
      label: 'Khoa',
      render: (value, row) => (row.role === 'doctor' || row.role === 'nurse') ? value : '-'
    },
    {
      field: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditUser(row)}
          >
            Sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDeleteUser(row)}
          >
            Xóa
          </Button>
        </div>
      )
    }
  ]

  const tabs = [
    { id: 'all', label: 'Tất cả', count: allUsers.length },
    { id: 'doctors', label: 'Bác sĩ', count: doctors.length },
    { id: 'nurses', label: 'Y tá', count: nurses.length },
    { id: 'patients', label: 'Bệnh nhân', count: patients.length }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin bác sĩ, y tá và bệnh nhân</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAddUser}
        >
          Thêm người dùng
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{doctors.length}</div>
          <div className="text-gray-600">Bác sĩ</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{nurses.length}</div>
          <div className="text-gray-600">Y tá</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{patients.length}</div>
          <div className="text-gray-600">Bệnh nhân</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-600">{allUsers.length}</div>
          <div className="text-gray-600">Tổng cộng</div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
            Lọc
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          data={getCurrentData()}
          emptyMessage="Không có người dùng nào"
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên *
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
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="doctor">Bác sĩ</option>
                <option value="nurse">Y tá</option>
                <option value="patient">Bệnh nhân</option>
              </select>
            </div>

            {formData.role === 'doctor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chuyên khoa
                  </label>
                  <input
                    type="text"
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Tim mạch, Nhi khoa..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kinh nghiệm (năm)
                  </label>
                  <input
                    type="number"
                    value={formData.experience || ''}
                    onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </>
            )}

            {(formData.role === 'doctor' || formData.role === 'nurse') && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoa
                </label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Khoa Tim mạch, Khoa Nhi..."
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              {editingUser ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminUsers
