import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Table from '../../components/Common/Table'
import { patientAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar, 
  Plus, 
  Eye, 
  FileText,
  Pill,
  Receipt,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Activity,
  Heart,
  Stethoscope,
  CreditCard,
  Download
} from 'lucide-react'

const PatientDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false)
  const [showAppointmentDetailModal, setShowAppointmentDetailModal] = useState(false)
  const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false)
  const [showBillDetailModal, setShowBillDetailModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [selectedBill, setSelectedBill] = useState(null)

  // State for API data
  const [currentPatient, setCurrentPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [bills, setBills] = useState([])
  const [availableDoctors, setAvailableDoctors] = useState([])

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load patient profile từ API thật
        try {
          const profile = await patientAPI.getProfile()
          if (profile && (profile.benhnhanId || profile.hoTen)) {
            const age =
              profile.ngaySinh
                ? new Date().getFullYear() - new Date(profile.ngaySinh).getFullYear()
                : undefined

            setCurrentPatient({
              id: profile.benhnhanId,
              name: profile.hoTen || user?.name,
              patientCode: `BN${String(profile.benhnhanId || user?.id || 1).padStart(3, '0')}`,
              email: profile.email || user?.email,
              phone: profile.sdt || user?.phone || '',
              address: profile.diaChi || user?.address || '',
              insuranceNumber: user?.insurance || 'BH001234567',
              age: age || '',
              gender: profile.gioiTinh || 'Khác',
            })
          } else {
            // Fallback nếu API chưa trả đủ dữ liệu
            setCurrentPatient({
              id: user?.id,
              name: user?.name,
              patientCode: `BN${String(user?.id || 1).padStart(3, '0')}`,
              email: user?.email,
              phone: user?.phone || '0123456789',
              address: user?.address || '123 Đường ABC, Quận 1, TP.HCM',
              insuranceNumber: user?.insurance || 'BH001234567',
              age: '',
              gender: 'Khác',
            })
          }
        } catch {
          // Fallback nếu lỗi
          setCurrentPatient({
            id: user?.id,
            name: user?.name,
            patientCode: `BN${String(user?.id || 1).padStart(3, '0')}`,
            email: user?.email,
            phone: user?.phone || '0123456789',
            address: user?.address || '123 Đường ABC, Quận 1, TP.HCM',
            insuranceNumber: user?.insurance || 'BH001234567',
            age: '',
            gender: 'Khác',
          })
        }

        // Load appointments từ API bệnh nhân (Page<DatLichKham>)
        try {
          const appointmentsResponse = await patientAPI.getAppointments()
          const items = appointmentsResponse?.content || []
          const mapped = items.map((apt) => {
            const dateStr = apt.ngayGio
            let timePart = ''
            if (dateStr) {
              const t = String(dateStr).split('T')[1]
              timePart = t ? t.substring(0, 5) : ''
            }

            const statusMap = {
              cho_duyet: 'Chờ xác nhận',
              da_duyet: 'Đã xác nhận',
              da_kham: 'Hoàn thành',
              huy: 'Đã hủy',
            }

            return {
              id: apt.datlichId,
              appointmentCode: `LH${String(apt.datlichId || '').padStart(3, '0')}`,
              doctorName: apt.bacsi?.hoTen || 'Bác sĩ',
              department: apt.bacsi?.phongban?.tenPhongban || '',
              appointmentDate: apt.ngayGio,
              appointmentTime: timePart,
              status: statusMap[apt.trangThai] || 'Chờ xác nhận',
              symptoms: apt.loaiKham || '',
              notes: apt.ghiChu || '',
            }
          })
          setAppointments(mapped)
        } catch {
          setAppointments([])
        }

        // Load prescriptions (Danh sách DonThuoc của bệnh nhân)
        try {
          const prescriptionsResponse = await patientAPI.getPrescriptions()
          const items = prescriptionsResponse || []
          const mapped = items.map((dt) => ({
            id: dt.donthuocId,
            prescriptionCode: `DT${String(dt.donthuocId || '').padStart(3, '0')}`,
            doctorName: dt.bacsi?.hoTen || 'Bác sĩ',
            prescriptionDate: dt.ngayKe,
            medicines:
              dt.danhSachChiTiet?.map((ct) => ({
                id: ct.id,
                name: ct.thuoc?.tenThuoc || 'Thuốc',
                quantity: ct.soLuong,
                unit: ct.thuoc?.donVi || '',
                dosage: ct.lieuDung || '',
                notes: '',
              })) || [],
            diagnosis: dt.ghiChu || '',
            notes: '',
          }))
          setPrescriptions(mapped)
        } catch {
          setPrescriptions([])
        }

        // Load bills (Danh sách HoaDon của bệnh nhân)
        try {
          const billsResponse = await patientAPI.getBills()
          const items = billsResponse || []
          const mapped = items.map((hd) => ({
            id: hd.hoadonId,
            billCode: `HD${String(hd.hoadonId || '').padStart(3, '0')}`,
            billDate: hd.ngayLap,
            services: [], // Backend hiện chưa chi tiết; để trống
            medicines: [],
            subtotal: Number(hd.tongTien || 0),
            discount: 0,
            insuranceCoverage: 0,
            totalAmount: Number(hd.tongTien || 0),
            paymentMethod: 'Tiền mặt',
            status: hd.trangThai || 'chua_thanh_toan',
          }))
          setBills(mapped)
        } catch {
          setBills([])
        }

        // Load available doctors (this would be from a separate API)
        setAvailableDoctors([
          { id: 1, name: 'BS. Nguyễn Văn A', department: 'Khoa Tim mạch', specialty: 'Tim mạch can thiệp' },
          { id: 2, name: 'BS. Trần Thị B', department: 'Khoa Tim mạch', specialty: 'Tim mạch tổng quát' },
          { id: 3, name: 'BS. Lê Văn C', department: 'Khoa Tiêu hóa', specialty: 'Nội soi tiêu hóa' },
          { id: 4, name: 'BS. Phạm Thị D', department: 'Khoa Nội', specialty: 'Nội tổng quát' }
        ])

      } catch (error) {
        console.error('Error loading patient data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    notes: ''
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Đã xác nhận': 'bg-green-100 text-green-800',
      'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
      'Hoàn thành': 'bg-blue-100 text-blue-800',
      'Đã hủy': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const handleBookAppointment = () => {
    setAppointmentForm({
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      symptoms: '',
      notes: ''
    })
    setShowBookAppointmentModal(true)
  }

  const handleSubmitAppointment = async (e) => {
    e.preventDefault()
    
    try {
      // Ghép dữ liệu form vào DTO AppointmentRequestDTO của backend
      const ngayGio =
        appointmentForm.appointmentDate && appointmentForm.appointmentTime
          ? new Date(`${appointmentForm.appointmentDate}T${appointmentForm.appointmentTime}:00`)
          : null

      const dto = {
        ngayGio: ngayGio ? ngayGio.toISOString().slice(0, 19) : null, // yyyy-MM-ddTHH:mm:ss
        loaiKham: appointmentForm.symptoms,
        bacsiId: parseInt(appointmentForm.doctorId),
        ghiChu: appointmentForm.notes,
      }

      const created = await patientAPI.bookAppointment(dto)

      // Map lịch vừa tạo sang format UI
      const selectedDoctor = availableDoctors.find(
        (d) => d.id === parseInt(appointmentForm.doctorId)
      )
      const newAppointment = {
        id: created.datlichId,
        appointmentCode: `LH${String(created.datlichId || '').padStart(3, '0')}`,
        doctorName: selectedDoctor?.name || 'Bác sĩ',
        department: selectedDoctor?.department || 'Khoa',
        appointmentDate: created.ngayGio || dto.ngayGio,
        appointmentTime: appointmentForm.appointmentTime,
        status: 'Chờ xác nhận',
        symptoms: created.loaiKham || appointmentForm.symptoms,
        notes: created.ghiChu || appointmentForm.notes,
      }

      setAppointments([newAppointment, ...appointments])
      setShowBookAppointmentModal(false)

      // Reset form
      setAppointmentForm({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        symptoms: '',
        notes: '',
      })
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Có lỗi xảy ra khi đặt lịch hẹn')
    }
  }

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentDetailModal(true)
  }

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription)
    setShowPrescriptionDetailModal(true)
  }

  const handleViewBill = (bill) => {
    setSelectedBill(bill)
    setShowBillDetailModal(true)
  }

  // Cột cho bảng lịch hẹn
  const appointmentColumns = [
    {
      key: 'appointmentCode',
      label: 'Mã lịch',
      render: (value) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'doctorName',
      label: 'Bác sĩ',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{row.department}</div>
          </div>
        </div>
      )
    },
    {
      key: 'appointmentDate',
      label: 'Ngày giờ',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm">{new Date(value).toLocaleDateString('vi-VN')}</div>
            <div className="text-xs text-gray-500">{row.appointmentTime}</div>
          </div>
        </div>
      )
    },
    {
      key: 'symptoms',
      label: 'Triệu chứng',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{value}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === 'Hoàn thành' ? <CheckCircle className="w-4 h-4 text-blue-600" /> : 
           value === 'Đã xác nhận' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
           <Clock className="w-4 h-4 text-yellow-600" />}
          {getStatusBadge(value)}
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
            onClick={() => handleViewAppointment(row)}
          >
            Xem
          </Button>
          {row.status === 'Chờ xác nhận' && (
            <Button
              size="sm"
              variant="danger"
              icon={<XCircle className="w-4 h-4" />}
              onClick={() => console.log('Cancel appointment:', row.appointmentCode)}
            >
              Hủy
            </Button>
          )}
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

  if (!currentPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông tin bệnh nhân</h2>
          <p className="text-gray-600">Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard bệnh nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý lịch hẹn, đơn thuốc và hóa đơn của bạn</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={handleBookAppointment}
        >
          Đặt lịch hẹn mới
        </Button>
      </div>

      {/* Patient Info Card */}
      <Card title="Thông tin cá nhân">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{currentPatient.name}</div>
              <div className="text-sm text-gray-600">Mã BN: {currentPatient.patientCode}</div>
              <div className="text-sm text-gray-600">{currentPatient.age} tuổi • {currentPatient.gender}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{currentPatient.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{currentPatient.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span>BHYT: {currentPatient.insuranceNumber}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              Cập nhật thông tin
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{appointments.length}</div>
          <div className="text-gray-600">Tổng lịch hẹn</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {appointments.filter(a => a.status === 'Chờ xác nhận').length}
          </div>
          <div className="text-gray-600">Chờ xác nhận</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'Hoàn thành').length}
          </div>
          <div className="text-gray-600">Đã khám</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{prescriptions.length}</div>
          <div className="text-gray-600">Đơn thuốc</div>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card title="Lịch hẹn gần đây">
        <Table
          data={appointments.slice(0, 5)}
          columns={appointmentColumns}
          searchable={false}
        />
        {appointments.length > 5 && (
          <div className="text-center mt-4">
            <Button variant="outline">
              Xem tất cả lịch hẹn
            </Button>
          </div>
        )}
      </Card>

      {/* Recent Prescriptions */}
      <Card title="Đơn thuốc gần đây">
        <div className="space-y-4">
          {prescriptions.slice(0, 3).map((prescription) => (
            <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Pill className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{prescription.prescriptionCode}</div>
                    <div className="text-sm text-gray-600">
                      BS. {prescription.doctorName} • {new Date(prescription.prescriptionDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => handleViewPrescription(prescription)}
                >
                  Xem chi tiết
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <div className="mb-1"><strong>Chẩn đoán:</strong> {prescription.diagnosis}</div>
                <div><strong>Số loại thuốc:</strong> {prescription.medicines.length} loại</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Bills */}
      <Card title="Hóa đơn gần đây">
        <div className="space-y-4">
          {bills.slice(0, 3).map((bill) => (
            <div key={bill.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Receipt className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">{bill.billCode}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(bill.billDate).toLocaleDateString('vi-VN')} • {bill.paymentMethod}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {parseInt(bill.totalAmount).toLocaleString('vi-VN')} VNĐ
                  </div>
                  <div className="text-sm text-gray-600">{bill.status}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {bill.services.length} dịch vụ • {bill.medicines.length} loại thuốc
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => handleViewBill(bill)}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showBookAppointmentModal}
        onClose={() => setShowBookAppointmentModal(false)}
        title="Đặt lịch hẹn khám bệnh"
        size="lg"
      >
        <form onSubmit={handleSubmitAppointment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn bác sĩ *
            </label>
            <select
              value={appointmentForm.doctorId}
              onChange={(e) => setAppointmentForm({...appointmentForm, doctorId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Chọn bác sĩ</option>
              {availableDoctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.department} ({doctor.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày khám *
              </label>
              <input
                type="date"
                value={appointmentForm.appointmentDate}
                onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ khám *
              </label>
              <select
                value={appointmentForm.appointmentTime}
                onChange={(e) => setAppointmentForm({...appointmentForm, appointmentTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn giờ</option>
                <option value="08:00">08:00</option>
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:00">10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Triệu chứng / Lý do khám *
            </label>
            <textarea
              value={appointmentForm.symptoms}
              onChange={(e) => setAppointmentForm({...appointmentForm, symptoms: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mô tả triệu chứng, lý do đến khám..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú thêm
            </label>
            <textarea
              value={appointmentForm.notes}
              onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ghi chú thêm (nếu có)..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBookAppointmentModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              Đặt lịch hẹn
            </Button>
          </div>
        </form>
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={showAppointmentDetailModal}
        onClose={() => setShowAppointmentDetailModal(false)}
        title="Chi tiết lịch hẹn"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin lịch hẹn</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã lịch hẹn:</span>
                    <span className="font-medium">{selectedAppointment.appointmentCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bác sĩ:</span>
                    <span className="font-medium">{selectedAppointment.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khoa:</span>
                    <span className="font-medium">{selectedAppointment.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày khám:</span>
                    <span className="font-medium">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giờ khám:</span>
                    <span className="font-medium">{selectedAppointment.appointmentTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin khám</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 block mb-1">Triệu chứng:</span>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{selectedAppointment.symptoms}</p>
                    </div>
                  </div>
                  {selectedAppointment.notes && (
                    <div>
                      <span className="text-gray-600 block mb-1">Ghi chú:</span>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-blue-800">{selectedAppointment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnosis and Treatment */}
            {selectedAppointment.diagnosis && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Kết quả khám</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 block mb-1">Chẩn đoán:</span>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <p className="text-green-800">{selectedAppointment.diagnosis}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Điều trị:</span>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-blue-800">{selectedAppointment.treatment}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowAppointmentDetailModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
                    <span className="text-gray-600">Bác sĩ:</span>
                    <span className="font-medium">{selectedPrescription.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày kê:</span>
                    <span className="font-medium">
                      {new Date(selectedPrescription.prescriptionDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Chẩn đoán</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
                </div>
              </div>
            </div>

            {/* Medicines */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách thuốc</h3>
              <div className="space-y-3">
                {selectedPrescription.medicines.map((medicine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-gray-900 mb-2">{medicine.name}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Số lượng:</strong> {medicine.quantity} {medicine.unit}</div>
                          <div><strong>Cách dùng:</strong> {medicine.dosage}</div>
                          {medicine.notes && <div><strong>Ghi chú:</strong> {medicine.notes}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedPrescription.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Ghi chú</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{selectedPrescription.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                icon={<Download className="w-4 h-4" />}
                onClick={() => console.log('Download prescription:', selectedPrescription.prescriptionCode)}
              >
                Tải đơn thuốc
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPrescriptionDetailModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bill Detail Modal */}
      <Modal
        isOpen={showBillDetailModal}
        onClose={() => setShowBillDetailModal(false)}
        title="Chi tiết hóa đơn"
        size="lg"
      >
        {selectedBill && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin hóa đơn</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã hóa đơn:</span>
                    <span className="font-medium">{selectedBill.billCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày lập:</span>
                    <span className="font-medium">
                      {new Date(selectedBill.billDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium">{selectedBill.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="font-medium">{selectedBill.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Tổng kết</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-medium">{parseInt(selectedBill.subtotal).toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-medium text-red-600">-{parseInt(selectedBill.discount).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  {selectedBill.insuranceCoverage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">BHYT chi trả:</span>
                      <span className="font-medium text-green-600">-{parseInt(selectedBill.insuranceCoverage).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-semibold">Số tiền trả:</span>
                    <span className="font-bold text-blue-600">
                      {parseInt(selectedBill.totalAmount).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            {selectedBill.services.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Dịch vụ khám chữa bệnh</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dịch vụ</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.services.map((service, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 text-sm">{service.name}</td>
                          <td className="px-4 py-2 text-right text-sm font-medium">{parseInt(service.price).toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Medicines */}
            {selectedBill.medicines.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thuốc</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Thuốc</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Số lượng</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.medicines.map((medicine, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 text-sm">{medicine.name}</td>
                          <td className="px-4 py-2 text-center text-sm">{medicine.quantity}</td>
                          <td className="px-4 py-2 text-right text-sm font-medium">{parseInt(medicine.price).toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                icon={<Download className="w-4 h-4" />}
                onClick={() => console.log('Download bill:', selectedBill.billCode)}
              >
                Tải hóa đơn
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBillDetailModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PatientDashboard


