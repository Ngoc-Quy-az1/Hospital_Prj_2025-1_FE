import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { Clock, Calendar } from 'lucide-react'

const DoctorWorkSchedule = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  })

  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  })

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const response = await doctorAPI.getSchedule({
        startDate: filters.startDate,
        endDate: filters.endDate
      })
      // API trả về {content: [], totalElements: 0, ...} hoặc array trực tiếp
      const schedulesData = Array.isArray(response) 
        ? response 
        : (response?.content || response?.data || [])
      setSchedules(Array.isArray(schedulesData) ? schedulesData : [])
    } catch (err) {
      console.error('Lỗi khi tải lịch làm việc:', err)
      setSchedules([]) // Set empty array on error
      alert('Không thể tải lịch làm việc')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilter = async (e) => {
    e.preventDefault()
    await loadSchedule()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.date || !form.startTime || !form.endTime) {
      alert('Vui lòng điền đầy đủ ngày, giờ bắt đầu và kết thúc')
      return
    }

    try {
      setSaving(true)
      await doctorAPI.updateSchedule({
        ngayLamViec: form.date,
        gioBatDau: form.startTime,
        gioKetThuc: form.endTime,
        ghiChu: form.notes
      })
      await loadSchedule()
      setForm({
        date: '',
        startTime: '',
        endTime: '',
        notes: ''
      })
      alert('Thêm lịch làm việc thành công!')
    } catch (err) {
      console.error('Lỗi khi thêm lịch làm việc:', err)
      alert('Không thể thêm lịch làm việc: ' + (err.message || 'Vui lòng thử lại'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch làm việc...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch trực / làm việc</h1>
          <p className="text-gray-600 mt-1">Thêm và xem các ca làm việc của bạn</p>
        </div>
        <Button variant="outline" onClick={loadSchedule}>
          Tải lại
        </Button>
      </div>

      <Card title="Bộ lọc">
        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full md:w-auto">
              Áp dụng
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Thêm lịch làm việc">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu *</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc *</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: trực cấp cứu..."
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm lịch'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Lịch làm việc">
        {!Array.isArray(schedules) || schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Chưa có lịch làm việc nào
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((item, index) => (
              <div
                key={item.lichlamviecId || item.id || index}
                className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {item.ngayLamViec
                      ? new Date(item.ngayLamViec).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </div>
                  {item.ghiChu && <div className="text-sm text-gray-600">{item.ghiChu}</div>}
                </div>
                <div className="text-sm text-gray-600">
                  Giờ: {item.gioBatDau || '--:--'} - {item.gioKetThuc || '--:--'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default DoctorWorkSchedule


