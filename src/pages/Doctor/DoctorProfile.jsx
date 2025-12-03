import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await doctorAPI.getProfile()
        setProfile(data)
      } catch (err) {
        console.error('Lỗi khi tải hồ sơ bác sĩ:', err)
        alert('Không tải được hồ sơ bác sĩ')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (field, value) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile) return
    try {
      setSaving(true)
        await doctorAPI.updateProfile({
          hoTen: profile.hoTen,
          email: profile.email,
          sdt: profile.sdt,
          position: profile.chucVu || profile.position || '',
          phongbanId: profile.phongban?.phongbanId || profile.phongbanId || null,
        })
      alert('Cập nhật hồ sơ thành công')
    } catch (err) {
      console.error('Lỗi khi cập nhật hồ sơ bác sĩ:', err)
      alert('Cập nhật hồ sơ thất bại: ' + (err.message || 'Vui lòng thử lại'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-red-600">Không tìm thấy thông tin hồ sơ bác sĩ.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hồ sơ bác sĩ</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={profile.hoTen || ''}
                onChange={(e) => handleChange('hoTen', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={profile.sdt || ''}
                onChange={(e) => handleChange('sdt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chức vụ
              </label>
              <input
                type="text"
                value={profile.chucVu || profile.position || ''}
                onChange={(e) => handleChange('chucVu', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default DoctorProfile


