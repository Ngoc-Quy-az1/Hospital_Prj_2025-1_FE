import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Shield,
  Key,
  Bell
} from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    department: user?.department || '',
    position: user?.position || ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    // Lưu thông tin cá nhân
    console.log('Saving profile:', formData)
    setIsEditing(false)
    // Có thể thêm API call ở đây
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      department: user?.department || '',
      position: user?.position || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
        </div>
        {!isEditing && (
          <Button 
            icon={<Edit3 className="w-4 h-4" />}
            onClick={() => setIsEditing(true)}
          >
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Thông tin cá nhân */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Thông tin cơ bản</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.address || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Phòng ban
                  </label>
                  <p className="text-gray-900 py-2">{user?.department || 'Chưa cập nhật'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Vai trò
                  </label>
                  <p className="text-gray-900 py-2">{user?.role || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button 
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSave}
                    variant="primary"
                  >
                    Lưu thay đổi
                  </Button>
                  <Button 
                    icon={<X className="w-4 h-4" />}
                    onClick={handleCancel}
                    variant="secondary"
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar */}
          <Card>
            <div className="p-6 text-center">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.role}</p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="space-y-3">
                <Button 
                  icon={<Key className="w-4 h-4" />}
                  variant="secondary"
                  className="w-full justify-start"
                >
                  Đổi mật khẩu
                </Button>
                <Button 
                  icon={<Bell className="w-4 h-4" />}
                  variant="secondary"
                  className="w-full justify-start"
                >
                  Cài đặt thông báo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
