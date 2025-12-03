import React, { useState } from 'react'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Database,
  Save,
  RotateCcw,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    appearance: {
      theme: 'light',
      language: 'vi',
      fontSize: 'medium'
    },
    privacy: {
      showOnlineStatus: true,
      allowDataCollection: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30
    }
  })

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSaveSettings = () => {
    // Lưu cài đặt
    console.log('Saving settings:', settings)
    // Có thể thêm API call ở đây
  }

  const handleResetSettings = () => {
    // Reset về mặc định
    setSettings({
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      appearance: {
        theme: 'light',
        language: 'vi',
        fontSize: 'medium'
      },
      privacy: {
        showOnlineStatus: true,
        allowDataCollection: false
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-600 mt-1">Tùy chỉnh hệ thống theo sở thích của bạn</p>
        </div>
        <div className="flex gap-3">
          <Button 
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={handleResetSettings}
            variant="secondary"
          >
            Đặt lại
          </Button>
          <Button 
            icon={<Save className="w-4 h-4" />}
            onClick={handleSaveSettings}
            variant="primary"
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Thông báo */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email thông báo</h3>
                  <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Push thông báo</h3>
                  <p className="text-sm text-gray-500">Nhận thông báo trên trình duyệt</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">SMS thông báo</h3>
                  <p className="text-sm text-gray-500">Nhận thông báo qua tin nhắn</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Giao diện */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Giao diện</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSettingChange('appearance', 'theme', 'light')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      settings.appearance.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Sáng
                  </button>
                  <button
                    onClick={() => handleSettingChange('appearance', 'theme', 'dark')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      settings.appearance.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Tối
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cỡ chữ</label>
                <select
                  value={settings.appearance.fontSize}
                  onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="small">Nhỏ</option>
                  <option value="medium">Vừa</option>
                  <option value="large">Lớn</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Bảo mật */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Bảo mật</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Xác thực 2 yếu tố</h3>
                  <p className="text-sm text-gray-500">Bảo vệ tài khoản bằng mã OTP</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian timeout (phút)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Quyền riêng tư */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Quyền riêng tư</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Hiển thị trạng thái online</h3>
                  <p className="text-sm text-gray-500">Cho phép người khác thấy bạn đang online</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showOnlineStatus}
                    onChange={(e) => handleSettingChange('privacy', 'showOnlineStatus', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Thu thập dữ liệu</h3>
                  <p className="text-sm text-gray-500">Cho phép thu thập dữ liệu để cải thiện dịch vụ</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.allowDataCollection}
                    onChange={(e) => handleSettingChange('privacy', 'allowDataCollection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Settings
