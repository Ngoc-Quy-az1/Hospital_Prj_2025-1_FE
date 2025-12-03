import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import { patientAPI } from '../../services/api'
import { 
  Calendar, 
  Clock,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  Filter
} from 'lucide-react'

const BookAppointment = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'Khám thường',
    notes: '',
    symptoms: ''
  })
  const [allDoctors, setAllDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize] = useState(6)
  const [departmentOptions, setDepartmentOptions] = useState([])

  // Helper: tạo vài slot giờ trống demo cho mỗi bác sĩ (giờ hiển thị, còn lịch thực tạo khi đặt)
  const generateDemoSlots = () => {
    const today = new Date()
    const makeDate = (offsetDays) => {
      const d = new Date(today)
      d.setDate(d.getDate() + offsetDays)
      return d.toISOString().split('T')[0]
    }
    return [
      { date: makeDate(2), time: '09:00', available: true },
      { date: makeDate(2), time: '10:00', available: true },
      { date: makeDate(3), time: '14:00', available: true },
      { date: makeDate(3), time: '15:00', available: true },
    ]
  }

  // Load toàn bộ danh sách bác sĩ thật từ API một lần
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await patientAPI.getDoctors({ page: 0, size: 1000 })
        const items = res?.content || res || []

        const mapped = items.map((bs) => ({
          id: bs.bacsiId,
          name: bs.hoTen,
          department: bs.phongban?.tenPhongban || 'Chưa cập nhật',
          specialization: bs.position || '',
          experience: bs.namKinhNghiem ? `${bs.namKinhNghiem} năm` : '',
          rating: 4.8, // tạm thời dùng giá trị mặc định
          location: bs.phongKham || 'Phòng khám',
          availableSlots: generateDemoSlots(),
        }))

        setAllDoctors(mapped)

        // Tính danh sách khoa từ toàn bộ bác sĩ
        const deps = [...new Set(
          items
            .map((bs) => bs.phongban?.tenPhongban)
            .filter((name) => !!name)
        )]
        setDepartmentOptions(deps)
      } catch (error) {
        console.error('Lỗi tải danh sách bác sĩ cho trang đặt lịch:', error)
        setAllDoctors([])
        setDepartmentOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadDoctors()
  }, [])

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    setShowModal(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDoctor) return

    try {
      // Ghép dữ liệu form thành DTO AppointmentRequestDTO cho backend
      const { date, time, symptoms, notes } = formData
      const ngayGio =
        date && time ? new Date(`${date}T${time}:00`) : null

      const dto = {
        ngayGio: ngayGio ? ngayGio.toISOString().slice(0, 19) : null, // yyyy-MM-ddTHH:mm:ss
        loaiKham: symptoms || formData.type,
        bacsiId: selectedDoctor.id,
        ghiChu: notes,
      }

      await patientAPI.bookAppointment(dto)

      // Đặt lịch thành công: đóng modal + reset form
      setShowModal(false)
      setFormData({
        date: '',
        time: '',
        type: 'Khám thường',
        notes: '',
        symptoms: ''
      })
      // Có thể show toast/alert nhẹ
      alert('Đặt lịch khám thành công!')
    } catch (error) {
      console.error('Lỗi khi đặt lịch khám:', error)
      alert('Đặt lịch khám thất bại, vui lòng thử lại.')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const filteredDoctors = allDoctors.filter((doctor) => {
    const matchesDepartment =
      !departmentFilter || doctor.department === departmentFilter

    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !normalizedSearch ||
      doctor.name.toLowerCase().includes(normalizedSearch) ||
      (doctor.department || '').toLowerCase().includes(normalizedSearch) ||
      (doctor.specialization || '').toLowerCase().includes(normalizedSearch)

    return matchesDepartment && matchesSearch
  })

  // Tính toán phân trang trên client
  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1
  const pagedDoctors = filteredDoctors.slice(page * pageSize, (page + 1) * pageSize)

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
          <h1 className="text-2xl font-bold text-gray-900">Đặt lịch khám</h1>
          <p className="text-gray-600 mt-1">Chọn bác sĩ và đặt lịch khám bệnh</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên bác sĩ, chuyên khoa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả khoa</option>
                {departmentOptions.map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
              <Button icon={<Filter className="w-4 h-4" />} variant="secondary">
                Bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pagedDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.department}</p>
                  <p className="text-xs text-gray-500">{doctor.specialization}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Kinh nghiệm: {doctor.experience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{doctor.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Đánh giá: ⭐ {doctor.rating}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Lịch trống:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {doctor.availableSlots.slice(0, 4).map((slot, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded text-center ${
                        slot.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {slot.date} {slot.time}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => handleDoctorSelect(doctor)}
                className="w-full"
                disabled={!doctor.availableSlots.some(slot => slot.available)}
              >
                Đặt lịch
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Trang trước
          </Button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
          >
            Trang sau
          </Button>
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Đặt lịch khám"
      >
        {selectedDoctor && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedDoctor.name}</h3>
              <p className="text-sm text-gray-600">{selectedDoctor.department} - {selectedDoctor.location}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày khám
                </label>
                <select
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn ngày</option>
                  {selectedDoctor.availableSlots
                    .filter(slot => slot.available)
                    .map((slot, index) => (
                      <option key={index} value={slot.date}>
                        {slot.date}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ khám
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn giờ</option>
                  {selectedDoctor.availableSlots
                    .filter(slot => slot.available && slot.date === formData.date)
                    .map((slot, index) => (
                      <option key={index} value={slot.time}>
                        {slot.time}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại khám
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Khám thường">Khám thường</option>
                <option value="Khám mới">Khám mới</option>
                <option value="Tái khám">Tái khám</option>
                <option value="Khám cấp cứu">Khám cấp cứu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Triệu chứng
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={3}
                placeholder="Mô tả triệu chứng hiện tại..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                placeholder="Ghi chú thêm (nếu có)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Đặt lịch
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default BookAppointment










