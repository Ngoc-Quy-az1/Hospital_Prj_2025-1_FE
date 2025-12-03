import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import Modal from '../../components/Common/Modal'
import Table from '../../components/Common/Table'
import Pagination from '../../components/Common/Pagination'
import { 
  Users, 
  Search, 
  Eye, 
  Edit,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  Activity,
  Heart,
  Clock,
  CheckCircle
} from 'lucide-react'

const DoctorPatients = () => {
  const { user } = useAuth()
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false)
  const [showPatientDetailModal, setShowPatientDetailModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [medicalHistory, setMedicalHistory] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [patientAppointments, setPatientAppointments] = useState([])
  const [loadingPatientData, setLoadingPatientData] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  
  // Thống kê bệnh nhân
  const [patientStats, setPatientStats] = useState({
    totalPatients: 0,
    waitingForExamination: 0,
    currentlyExamining: 0,
    completed: 0
  })

  // Dữ liệu bệnh nhân từ API với phân trang
  const [patients, setPatients] = useState([])
  const [pageInfo, setPageInfo] = useState({ 
    page: 0, 
    size: 20, 
    totalElements: 0, 
    totalPages: 0 
  })

  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
    nextAppointment: ''
  })

  // Load patients từ API với phân trang
  const loadPatients = useCallback(async (page = 0, size = 20, search = '', status = '') => {
    setLoading(true)
    try {
      const response = await doctorAPI.getPatients({ 
        search: search || searchTerm, 
        appointmentStatus: status || filterStatus,
        page, 
        size 
      })
      
      const patientsData = response.content || response.data || []

      // Lấy thông tin lịch hẹn gần nhất cho các bệnh nhân (nếu có)
      let latestAppointmentsByPatient = {}
      try {
        const aptResponse = await doctorAPI.getAppointments({ page: 0, size: 200 })
        const appointments = aptResponse.content || aptResponse.data || []
        appointments.forEach(apt => {
          const patientId = apt.benhnhan?.benhnhanId || apt.benhnhan?.id
          if (!patientId) return

          const existing = latestAppointmentsByPatient[patientId]
          // so sánh theo ngày hẹn dạng chuỗi yyyy-MM-dd, lấy lịch mới nhất
          const ngayHen = apt.ngayHen || apt.date || ''
          if (!existing || (ngayHen && ngayHen > (existing.ngayHen || existing.date || ''))) {
            latestAppointmentsByPatient[patientId] = apt
          }
        })
      } catch (e) {
        console.error('Lỗi khi tải lịch hẹn cho danh sách bệnh nhân:', e)
      }

      const mappedPatients = patientsData.map(patient => {
        const id = patient.benhnhanId || patient.id
        const latestApt = latestAppointmentsByPatient[id] || {}

        const appointmentDate = patient.ngayHen || patient.appointmentDate || latestApt.ngayHen || latestApt.date || ''
        const appointmentTime = patient.gioHen || patient.appointmentTime || latestApt.gioHen || latestApt.time || ''
        const symptoms = patient.trieuChung || patient.symptoms || latestApt.lyDoKham || latestApt.notes || ''

        return {
          id,
          name: patient.hoTen || patient.name || 'Không xác định',
          patientCode: patient.maBenhNhan || patient.patientCode || `BN${String(id).padStart(3, '0')}`,
          age: patient.ngaySinh ? new Date().getFullYear() - new Date(patient.ngaySinh).getFullYear() : patient.age || 'N/A',
          gender: patient.gioiTinh || patient.gender || 'N/A',
          phone: patient.sdt || patient.phone || '',
          email: patient.email || '',
          address: patient.diaChi || patient.address || '',
          status: patient.trangThai || patient.status || 'Chờ khám',
          department: patient.khoa || patient.department || '',
          symptoms,
          diagnosis: patient.chanDoan || patient.diagnosis || '',
          appointmentDate,
          appointmentTime
        }
      })
      
      setPatients(mappedPatients)
      setPageInfo({
        page: response.number ?? page,
        size: response.size ?? size,
        totalElements: response.totalElements ?? 0,
        totalPages: response.totalPages ?? 0
      })
    } catch (err) {
      console.error('Lỗi khi tải danh sách bệnh nhân:', err)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  // Load thống kê bệnh nhân
  const loadPatientStats = useCallback(async () => {
    try {
      console.log('Đang gọi API getPatientStats...')
      const stats = await doctorAPI.getPatientStats()
      console.log('Response từ getPatientStats:', stats)
      setPatientStats({
        totalPatients: stats.totalPatients || 0,
        waitingForExamination: stats.waitingForExamination || 0,
        currentlyExamining: stats.currentlyExamining || 0,
        completed: stats.completed || 0
      })
      console.log('Đã set patientStats:', {
        totalPatients: stats.totalPatients || 0,
        waitingForExamination: stats.waitingForExamination || 0,
        currentlyExamining: stats.currentlyExamining || 0,
        completed: stats.completed || 0
      })
    } catch (err) {
      console.error('Lỗi khi tải thống kê bệnh nhân:', err)
      console.error('Chi tiết lỗi:', err.response || err.message)
    }
  }, [])

  // Load patients khi component mount, searchTerm hoặc filterStatus thay đổi
  useEffect(() => {
    loadPatients(0, pageInfo.size, searchTerm, filterStatus)
    loadPatientStats()
  }, [searchTerm, filterStatus])

  // Lọc bệnh nhân (chỉ filter department vì status đã được filter ở backend)
  const filteredPatients = patients.filter(patient => {
    const matchesDepartment = !filterDepartment || patient.department === filterDepartment
    return matchesDepartment
  })

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient)
    setShowPatientDetailModal(true)
    setActiveTab('info')
    setLoadingPatientData(true)
    
    try {
      // Load tất cả dữ liệu liên quan đến bệnh nhân với phân trang
      const [historyResponse, records, appointments] = await Promise.all([
        doctorAPI.getPatientMedicalHistory(patient.id, { page: 0, size: 100 }).catch((err) => {
          console.error('Lỗi khi tải bệnh án:', err)
          return { content: [] }
        }),
        doctorAPI.getMedicalRecords({ patientId: patient.id, page: 0, size: 100 }).catch((err) => {
          console.error('Lỗi khi tải hồ sơ khám:', err)
          return { content: [] }
        }),
        doctorAPI.getPatientAppointments(patient.id, 0, 100).catch((err) => {
          console.error('Lỗi khi tải lịch hẹn:', err)
          return { content: [] }
        })
      ])
      
      // Debug: Log response để kiểm tra
      console.log('History response:', historyResponse)
      console.log('Records response:', records)
      
      // Parse response - Spring Data JPA Page format
      const history = Array.isArray(historyResponse) 
        ? historyResponse 
        : (historyResponse?.content || historyResponse?.data || [])
      
      const recordsData = Array.isArray(records)
        ? records
        : (records?.content || records?.data || [])
      
      console.log('Parsed history:', history)
      console.log('Parsed records:', recordsData)
      
      setMedicalHistory(history)
      setMedicalRecords(recordsData)
      
      // Lọc lịch hẹn của bệnh nhân này
      const allAppointments = appointments?.content || appointments?.data || []
      const filteredAppointments = allAppointments.map(apt => ({
        id: apt.datLichKhamId || apt.id,
        date: apt.ngayGio || apt.ngayHen || apt.date || apt.ngayKham,
        time: apt.ngayGio ? new Date(apt.ngayGio).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : (apt.gioHen || apt.time || '08:00'),
        reason: apt.loaiKham || apt.lyDoKham || apt.notes || apt.reason || '',
        status: apt.trangThai || apt.status,
        patientName: apt.benhnhan?.hoTen || apt.benhnhan?.name || patient.name
      }))
      setPatientAppointments(filteredAppointments)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu bệnh nhân:', err)
      setMedicalHistory([])
      setMedicalRecords([])
      setPatientAppointments([])
    } finally {
      setLoadingPatientData(false)
    }
  }

  const handleDiagnosis = (patient) => {
    setSelectedPatient(patient)
    setDiagnosisForm({
      diagnosis: patient.diagnosis || '',
      treatment: '',
      notes: '',
      nextAppointment: ''
    })
    setShowDiagnosisModal(true)
  }

  const handleSubmitDiagnosis = async (e) => {
    e.preventDefault()
    
    try {
      // Gọi API để lưu chẩn đoán vào database
      const medicalRecordData = {
        benhnhanId: selectedPatient.id,
        ngayKham: new Date().toISOString().split('T')[0], // Ngày hôm nay
        trieuChung: selectedPatient.symptoms || '',
        chanDoan: diagnosisForm.diagnosis,
        dieuTri: diagnosisForm.treatment,
        ghiChu: diagnosisForm.notes,
        loiKhuyen: diagnosisForm.nextAppointment ? `Tái khám ngày: ${diagnosisForm.nextAppointment}` : ''
      }
      
      await doctorAPI.createMedicalRecord(medicalRecordData)
      
      // Cập nhật UI
      setPatients(patients.map(patient => 
        patient.id === selectedPatient.id 
          ? { 
              ...patient, 
              diagnosis: diagnosisForm.diagnosis,
              status: 'Hoàn thành'
            } 
          : patient
      ))
      
      // Reload danh sách để cập nhật dữ liệu mới nhất
      await loadPatients(pageInfo.page, pageInfo.size, searchTerm)
      
      setShowDiagnosisModal(false)
      setSelectedPatient(null)
      
      // Reset form
      setDiagnosisForm({
        diagnosis: '',
        treatment: '',
        notes: '',
        nextAppointment: ''
      })
    } catch (err) {
      console.error('Lỗi khi lưu chẩn đoán:', err)
      alert('Lỗi khi lưu chẩn đoán: ' + (err.message || 'Có lỗi xảy ra'))
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Chờ khám': 'bg-yellow-100 text-yellow-800',
      'Đang khám': 'bg-blue-100 text-blue-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Đã hủy': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Cột cho bảng bệnh nhân
  const patientColumns = [
    {
      key: 'patientCode',
      label: 'Mã BN',
      render: (value, row) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'name',
      label: 'Bệnh nhân',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.age} tuổi • {row.gender}</div>
        </div>
      )
    },
    {
      key: 'appointmentTime',
      label: 'Giờ hẹn',
      render: (value, row) => (
        <div>
          <div className="text-sm">{value || 'N/A'}</div>
          <div className="text-xs text-gray-500">{row.appointmentDate || ''}</div>
        </div>
      )
    },
    {
      key: 'symptoms',
      label: 'Triệu chứng',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || 'Chưa cập nhật'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === 'Hoàn thành' ? <CheckCircle className="w-4 h-4 text-green-600" /> : 
           value === 'Đang khám' ? <Activity className="w-4 h-4 text-blue-600" /> : 
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
            onClick={() => handleViewPatient(row)}
          >
            Xem
          </Button>
          <Button
            size="sm"
            icon={<Stethoscope className="w-4 h-4" />}
            onClick={() => handleDiagnosis(row)}
            disabled={row.status === 'Hoàn thành'}
          >
            Chẩn đoán
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bệnh nhân của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý bệnh nhân và thực hiện chẩn đoán</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{patientStats.totalPatients}</div>
          <div className="text-gray-600">Tổng bệnh nhân</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {patientStats.waitingForExamination}
          </div>
          <div className="text-gray-600">Chờ khám</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {patientStats.currentlyExamining}
          </div>
          <div className="text-gray-600">Đang khám</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {patientStats.completed}
          </div>
          <div className="text-gray-600">Hoàn thành</div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                // Reset về trang đầu khi search
                loadPatients(0, pageInfo.size, e.target.value)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  loadPatients(0, pageInfo.size, searchTerm)
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ khám">Chờ khám</option>
            <option value="Đang khám">Đang khám</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>
      </Card>

      {/* Patients Table */}
      <Card title="Danh sách bệnh nhân">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có bệnh nhân nào
          </div>
        ) : (
          <>
            <Table
              data={filteredPatients}
              columns={patientColumns}
              searchable={false}
            />
            <Pagination
              currentPage={pageInfo.page}
              totalPages={pageInfo.totalPages}
              totalElements={pageInfo.totalElements}
              pageSize={pageInfo.size}
              onPageChange={(page) => loadPatients(page, pageInfo.size, searchTerm)}
              onPageSizeChange={(size) => loadPatients(0, size, searchTerm)}
            />
          </>
        )}
      </Card>

      {/* Patient Detail Modal */}
      <Modal
        isOpen={showPatientDetailModal}
        onClose={() => {
          setShowPatientDetailModal(false)
          setSelectedPatient(null)
          setMedicalHistory([])
          setMedicalRecords([])
          setPatientAppointments([])
        }}
        title={`Chi tiết bệnh nhân - ${selectedPatient?.name || ''}`}
        size="xl"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Thông tin
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'appointments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Lịch hẹn ({patientAppointments.length})
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'records'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hồ sơ khám ({medicalRecords.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bệnh án ({medicalHistory.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {loadingPatientData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                {/* Tab: Thông tin bệnh nhân */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin cá nhân</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Mã bệnh nhân:</span>
                          <span className="ml-2 font-medium">{selectedPatient.patientCode}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Họ tên:</span>
                          <span className="ml-2 font-medium">{selectedPatient.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tuổi:</span>
                          <span className="ml-2 font-medium">{selectedPatient.age}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Giới tính:</span>
                          <span className="ml-2 font-medium">{selectedPatient.gender}</span>
                        </div>
                        {selectedPatient.phone && (
                          <div>
                            <span className="text-gray-600">Số điện thoại:</span>
                            <span className="ml-2 font-medium">{selectedPatient.phone}</span>
                          </div>
                        )}
                        {selectedPatient.department && (
                          <div>
                            <span className="text-gray-600">Khoa:</span>
                            <span className="ml-2 font-medium">{selectedPatient.department}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Lịch hẹn */}
                {activeTab === 'appointments' && (
                  <div className="space-y-4">
                    {patientAppointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Chưa có lịch hẹn nào</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {patientAppointments.map((apt, index) => (
                          <div key={apt.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {apt.date 
                                      ? new Date(apt.date).toLocaleDateString('vi-VN', { 
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })
                                      : 'N/A'}
                                  </span>
                                  <Clock className="w-4 h-4 text-gray-400 ml-4" />
                                  <span className="text-sm text-gray-600">
                                    {apt.time || 'N/A'}
                                  </span>
                                </div>
                                {apt.reason && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    <strong>Lý do khám:</strong> {apt.reason}
                                  </div>
                                )}
                                <div className="mt-2">
                                  {getStatusBadge(apt.status || 'Chờ khám')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Hồ sơ khám bệnh */}
                {activeTab === 'records' && (
                  <div className="space-y-4">
                    {medicalRecords.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Chưa có hồ sơ khám bệnh nào</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {medicalRecords.map((record, index) => (
                          <div key={record.hosokhamId || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-gray-900">
                                  {record.ngayKham 
                                    ? new Date(record.ngayKham).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })
                                    : 'N/A'}
                                </span>
                              </div>
                              {record.hosokhamId && (
                                <span className="text-xs text-gray-500">Mã HS: {record.hosokhamId}</span>
                              )}
                            </div>
                            <div className="space-y-2">
                              {record.trieuChung && (
                                <div className="bg-blue-50 p-3 rounded">
                                  <span className="text-sm font-medium text-gray-700">Triệu chứng:</span>
                                  <p className="text-sm text-gray-700 mt-1">{record.trieuChung}</p>
                                </div>
                              )}
                              {record.chanDoan && (
                                <div className="bg-yellow-50 p-3 rounded">
                                  <span className="text-sm font-medium text-gray-700">Chẩn đoán:</span>
                                  <p className="text-sm text-gray-700 mt-1">{record.chanDoan}</p>
                                </div>
                              )}
                              {record.huongDieuTri && (
                                <div className="bg-green-50 p-3 rounded">
                                  <span className="text-sm font-medium text-gray-700">Hướng điều trị:</span>
                                  <p className="text-sm text-gray-700 mt-1">{record.huongDieuTri}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Lịch sử bệnh án */}
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {medicalHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Chưa có lịch sử bệnh án nào</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {medicalHistory.map((record, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                {record.hoSoKham && (
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-500">
                                      Ngày khám: {record.hoSoKham.ngayKham 
                                        ? new Date(record.hoSoKham.ngayKham).toLocaleDateString('vi-VN')
                                        : 'N/A'}
                                    </span>
                                  </div>
                                )}
                                {record.hoSoKham?.chanDoan && (
                                  <div className="mb-1">
                                    <span className="font-medium text-gray-900">Chẩn đoán:</span>
                                    <p className="text-sm text-gray-600 mt-1">{record.hoSoKham.chanDoan}</p>
                                  </div>
                                )}
                                {record.hoSoKham?.huongDieuTri && (
                                  <div className="mb-1">
                                    <span className="font-medium text-gray-900">Hướng điều trị:</span>
                                    <p className="text-sm text-gray-600 mt-1">{record.hoSoKham.huongDieuTri}</p>
                                  </div>
                                )}
                                {record.ghiChu && (
                                  <div>
                                    <span className="font-medium text-gray-900">Ghi chú:</span>
                                    <p className="text-sm text-gray-600 mt-1">{record.ghiChu}</p>
                                  </div>
                                )}
                                {record.donThuoc && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <span className="text-xs text-gray-500">Có đơn thuốc</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Diagnosis Modal */}
      <Modal
        isOpen={showDiagnosisModal}
        onClose={() => {
          setShowDiagnosisModal(false)
          setSelectedPatient(null)
        }}
        title="Chẩn đoán bệnh"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Thông tin bệnh nhân</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tên:</span>
                  <span className="ml-2 font-medium">{selectedPatient.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tuổi:</span>
                  <span className="ml-2 font-medium">{selectedPatient.age}</span>
                </div>
                <div>
                  <span className="text-gray-600">Giới tính:</span>
                  <span className="ml-2 font-medium">{selectedPatient.gender}</span>
                </div>
                <div>
                  <span className="text-gray-600">Triệu chứng:</span>
                  <span className="ml-2 font-medium">{selectedPatient.symptoms}</span>
                </div>
              </div>
            </div>

            {/* Medical History */}
            {medicalHistory.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Lịch sử bệnh án</h3>
                <div className="space-y-2">
                  {medicalHistory.map((record, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{record.chanDoan || record.diagnosis || 'Chưa có chẩn đoán'}</div>
                          <div className="text-sm text-gray-600">{record.dieuTri || record.treatment || 'Chưa có điều trị'}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.ngayKham ? new Date(record.ngayKham).toLocaleDateString('vi-VN') : record.date || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnosis Form */}
            <form onSubmit={handleSubmitDiagnosis} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chẩn đoán *
                </label>
                <textarea
                  value={diagnosisForm.diagnosis}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, diagnosis: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập chẩn đoán bệnh..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương pháp điều trị *
                </label>
                <textarea
                  value={diagnosisForm.treatment}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, treatment: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập phương pháp điều trị..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={diagnosisForm.notes}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lịch hẹn tái khám
                </label>
                <input
                  type="date"
                  value={diagnosisForm.nextAppointment}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, nextAppointment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDiagnosisModal(false)
                    setSelectedPatient(null)
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  Lưu chẩn đoán
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DoctorPatients