import React, { useState, useEffect } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { adminAPI } from '../../../services/api'
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  Filter,
  Plus,
  Eye,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  CreditCard
} from 'lucide-react'

const PatientManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAge, setFilterAge] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loadingMedicalRecords, setLoadingMedicalRecords] = useState(false)
  const [patientStats, setPatientStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    other: 0,
    dangDieuTri: 0,
    khoiBenh: 0
  })

  // Dữ liệu bệnh nhân từ API
  const [patients, setPatients] = useState([])

  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: '',
    sdt: '',
    email: '',
    diaChi: '',
    ngayNhapVien: ''
  })

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [searchTerm, filterGender, filterStatus, filterAge])

  // Fetch patients from API
  useEffect(() => {
    loadPatients()
    loadPatientStats()
  }, [page, searchTerm, filterGender, filterStatus, filterAge])

  // Load patient stats
  const loadPatientStats = async () => {
    try {
      console.log('Loading patient stats...')
      const stats = await adminAPI.getPatientStats()
      console.log('Patient stats received:', stats)
      setPatientStats({
        total: stats.total || 0,
        male: stats.male || 0,
        female: stats.female || 0,
        other: stats.other || 0,
        dangDieuTri: stats.dangDieuTri || 0,
        khoiBenh: stats.khoiBenh || 0
      })
      console.log('Patient stats set:', {
        total: stats.total || 0,
        male: stats.male || 0,
        female: stats.female || 0,
        other: stats.other || 0,
        dangDieuTri: stats.dangDieuTri || 0,
        khoiBenh: stats.khoiBenh || 0
      })
    } catch (error) {
      console.error('Error loading patient stats:', error)
      console.error('Error details:', error.response || error.message)
      // Set default values on error
      setPatientStats({
        total: 0,
        male: 0,
        female: 0,
        other: 0,
        dangDieuTri: 0,
        khoiBenh: 0
      })
    }
  }

  // Load patients from API
  const loadPatients = async () => {
    setLoading(true)
    try {
      const params = {
        search: searchTerm || undefined,
        gender: filterGender || undefined,
        status: filterStatus || undefined
      }
      
      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key]
        }
      })
      
      console.log('Loading patients with params:', params)
      
      // Calculate age range if filterAge is set
      if (filterAge) {
        const currentYear = new Date().getFullYear()
        if (filterAge === '0-18') {
          // Calculate from date of birth
        } else if (filterAge === '19-35') {
        } else if (filterAge === '36-50') {
        } else if (filterAge === '50+') {
        }
      }
      
      const response = await adminAPI.getPatients(page, 20, params)
      
      // Map API response to component format
      const mappedPatients = response.content?.map(patient => ({
        id: patient.benhnhanId,
        patientCode: `BN${String(patient.benhnhanId).padStart(3, '0')}`,
        name: patient.hoTen,
        dateOfBirth: patient.ngaySinh,
        gender: patient.gioiTinh || 'Khác',
        phone: patient.sdt || '',
        email: patient.email || '',
        address: patient.diaChi || '',
        status: patient.trangThai || 'đang điều trị',
        registrationDate: patient.ngayNhapVien,
        lastVisit: patient.ngayNhapVien,
        soLanKham: patient.soLanKham || 0,
        soDonThuoc: patient.soDonThuoc || 0
      })) || []
      
      setPatients(mappedPatients)
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
      console.log('Loaded patients:', mappedPatients.length, 'Total:', response.totalElements)
    } catch (error) {
      console.error('Error loading patients:', error)
      alert('Không thể tải danh sách bệnh nhân: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // Filtered patients (client-side filtering for age if needed)
  const filteredPatients = patients.filter(patient => {
    if (!filterAge) return true
    
    if (!patient.dateOfBirth) return false
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    
    return (
      (filterAge === '0-18' && age >= 0 && age <= 18) ||
      (filterAge === '19-35' && age >= 19 && age <= 35) ||
      (filterAge === '36-50' && age >= 36 && age <= 50) ||
      (filterAge === '50+' && age > 50)
    )
  })

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
  }

  const handleAddPatient = () => {
    setFormData({
      hoTen: '',
      ngaySinh: '',
      gioiTinh: '',
      sdt: '',
      email: '',
      diaChi: '',
      ngayNhapVien: new Date().toISOString().split('T')[0]
    })
    setShowAddModal(true)
  }

  const handleEditPatient = async (patient) => {
    try {
      const patientDetail = await adminAPI.getPatientById(patient.id)
      setSelectedPatient(patient)
      setFormData({
        hoTen: patientDetail.hoTen || '',
        ngaySinh: patientDetail.ngaySinh || '',
        gioiTinh: patientDetail.gioiTinh || '',
        sdt: patientDetail.sdt || '',
        email: patientDetail.email || '',
        diaChi: patientDetail.diaChi || '',
        ngayNhapVien: patientDetail.ngayNhapVien || ''
      })
      setShowEditModal(true)
    } catch (error) {
      console.error('Error loading patient details:', error)
      alert('Không thể tải thông tin bệnh nhân')
    }
  }

  const handleViewPatient = async (patient) => {
    try {
      // Load patient details
      const patientDetail = await adminAPI.getPatientById(patient.id)
      
      // Map API response to component format
      const mappedPatient = {
        id: patientDetail.benhnhanId,
        patientCode: `BN${String(patientDetail.benhnhanId).padStart(3, '0')}`,
        name: patientDetail.hoTen || patient.name,
        dateOfBirth: patientDetail.ngaySinh || patient.dateOfBirth,
        gender: patientDetail.gioiTinh || patient.gender,
        phone: patientDetail.sdt || patient.phone || '',
        email: patientDetail.email || patient.email || '',
        address: patientDetail.diaChi || patient.address || '',
        status: patientDetail.trangThai || patient.status || 'đang điều trị',
        registrationDate: patientDetail.ngayNhapVien || patient.registrationDate,
        lastVisit: patientDetail.ngayNhapVien || patient.lastVisit,
        soLanKham: patientDetail.soLanKham || patient.soLanKham || 0,
        soDonThuoc: patientDetail.soDonThuoc || patient.soDonThuoc || 0
      }
      
      setSelectedPatient(mappedPatient)
      
      // Load medical records
      setLoadingMedicalRecords(true)
      try {
        const records = await adminAPI.getPatientMedicalRecords(patient.id)
        setMedicalRecords(records || [])
      } catch (error) {
        console.error('Error loading medical records:', error)
        setMedicalRecords([])
      } finally {
        setLoadingMedicalRecords(false)
      }
      
      setShowViewModal(true)
    } catch (error) {
      console.error('Error loading patient details:', error)
      alert('Không thể tải thông tin bệnh nhân: ' + (error.message || 'Unknown error'))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (showEditModal && selectedPatient) {
        // Cập nhật bệnh nhân
        await adminAPI.updatePatient(selectedPatient.id, formData)
        alert('Cập nhật bệnh nhân thành công!')
        setShowEditModal(false)
      } else {
        // Thêm bệnh nhân mới
        await adminAPI.createPatient(formData)
        alert('Thêm bệnh nhân thành công!')
        setShowAddModal(false)
      }
      
      // Reload patients and stats
      await loadPatients()
      await loadPatientStats()
      
      // Reset form
      setFormData({
        hoTen: '',
        ngaySinh: '',
        gioiTinh: '',
        sdt: '',
        email: '',
        diaChi: '',
        ngayNhapVien: ''
      })
      setSelectedPatient(null)
    } catch (error) {
      console.error('Error saving patient:', error)
      alert('Có lỗi xảy ra: ' + (error.message || 'Unknown error'))
    }
  }

  const handleDeletePatient = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) {
      try {
        await adminAPI.deletePatient(id)
        alert('Xóa bệnh nhân thành công!')
        await loadPatients()
        await loadPatientStats()
      } catch (error) {
        console.error('Error deleting patient:', error)
        alert('Có lỗi xảy ra khi xóa bệnh nhân: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    
    // Map database values to display text and colors
    const statusConfig = {
      'đang điều trị': { text: 'Đang điều trị', class: 'bg-blue-100 text-blue-800' },
      'đã xuất viện': { text: 'Đã xuất viện', class: 'bg-green-100 text-green-800' },
      'chuyển viện': { text: 'Chuyển viện', class: 'bg-yellow-100 text-yellow-800' },
      'tử vong': { text: 'Tử vong', class: 'bg-red-100 text-red-800' },
      // Fallback for old values (if any)
      'Đang điều trị': { text: 'Đang điều trị', class: 'bg-blue-100 text-blue-800' },
      'Khỏi bệnh': { text: 'Đã xuất viện', class: 'bg-green-100 text-green-800' },
      'Chuyển viện': { text: 'Chuyển viện', class: 'bg-yellow-100 text-yellow-800' },
      'Tử vong': { text: 'Tử vong', class: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
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
      label: 'Họ tên',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{calculateAge(row.dateOfBirth)} tuổi • {row.gender}</div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Liên hệ',
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-1 text-sm">
            <Phone className="w-3 h-3" />
            {value}
          </div>
          {row.email && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Mail className="w-3 h-3" />
              {row.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'insuranceNumber',
      label: 'BHYT',
      render: (value) => value || 'Không có'
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'lastVisit',
      label: 'Lần khám cuối',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
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
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditPatient(row)}
          >
            Sửa
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDeletePatient(row.id)}
          >
            Xóa
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý bệnh nhân</h1>
            <p className="text-pink-100">Quản lý thông tin bệnh nhân và hồ sơ y tế</p>
          </div>
          <Button
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleAddPatient}
            className="bg-white text-pink-600 hover:bg-pink-50"
          >
            Đăng ký bệnh nhân mới
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
              <div className="text-sm font-medium text-gray-500">Tổng bệnh nhân</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {(patientStats?.total ?? 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Tất cả bệnh nhân</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đã khỏi bệnh</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {(patientStats?.khoiBenh ?? 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Đã hoàn thành điều trị</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đang điều trị</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {(patientStats?.dangDieuTri ?? 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Đang được chăm sóc</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Nam / Nữ</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {(patientStats?.male ?? 0).toLocaleString()} / {(patientStats?.female ?? 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Theo giới tính</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterAge}
            onChange={(e) => setFilterAge(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả độ tuổi</option>
            <option value="0-18">0-18 tuổi</option>
            <option value="19-35">19-35 tuổi</option>
            <option value="36-50">36-50 tuổi</option>
            <option value="50+">Trên 50 tuổi</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="đang điều trị">Đang điều trị</option>
            <option value="đã xuất viện">Đã xuất viện</option>
            <option value="chuyển viện">Chuyển viện</option>
            <option value="tử vong">Tử vong</option>
          </select>

          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={() => console.log('Export patient list')}
          >
            Xuất danh sách
          </Button>
        </div>
      </Card>

      {/* Patient Table */}
      <Card title="Danh sách bệnh nhân">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : (
          <>
            <Table
              data={filteredPatients}
              columns={patientColumns}
              searchable={false}
            />
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              {/* <div className="text-sm text-gray-600">
                Hiển thị {patients.length > 0 ? page * 20 + 1 : 0} - {Math.min((page + 1) * 20, totalElements)} trong tổng số {totalElements.toLocaleString()} bệnh nhân
              </div> */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(Math.max(0, page - 1))} 
                  disabled={page === 0 || loading}
                >
                  Trước
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  Trang {page + 1} / {totalPages || 1}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setPage(page + 1)} 
                  disabled={page >= totalPages - 1 || loading}
                >
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Add/Edit Patient Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedPatient(null)
        }}
        title={showEditModal ? "Sửa thông tin bệnh nhân" : "Đăng ký bệnh nhân mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                value={formData.hoTen}
                onChange={(e) => setFormData({...formData, hoTen: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh *
              </label>
              <input
                type="date"
                value={formData.ngaySinh}
                onChange={(e) => setFormData({...formData, ngaySinh: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính *
              </label>
              <select
                value={formData.gioiTinh}
                onChange={(e) => setFormData({...formData, gioiTinh: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.sdt}
                onChange={(e) => setFormData({...formData, sdt: e.target.value})}
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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày nhập viện
              </label>
              <input
                type="date"
                value={formData.ngayNhapVien}
                onChange={(e) => setFormData({...formData, ngayNhapVien: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ *
            </label>
            <textarea
              value={formData.diaChi}
              onChange={(e) => setFormData({...formData, diaChi: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedPatient(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Đăng ký bệnh nhân"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Patient Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedPatient(null)
          setMedicalRecords([])
        }}
        title="Thông tin chi tiết bệnh nhân"
        size="lg"
      >
        {!selectedPatient ? (
          <div className="text-center py-8 text-gray-500">Đang tải thông tin...</div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã bệnh nhân:</span>
                      <span className="font-medium">{selectedPatient.patientCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="font-medium">{selectedPatient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày sinh:</span>
                      <span className="font-medium">
                        {selectedPatient.dateOfBirth 
                          ? `${new Date(selectedPatient.dateOfBirth).toLocaleDateString('vi-VN')} (${calculateAge(selectedPatient.dateOfBirth)} tuổi)`
                          : 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giới tính:</span>
                      <span className="font-medium">{selectedPatient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      {getStatusBadge(selectedPatient.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedPatient.phone || 'Chưa cập nhật'}</span>
                    </div>
                    {selectedPatient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedPatient.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span>{selectedPatient.address || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin y tế</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Số lần khám</h4>
                  <p className="text-gray-900">{selectedPatient.soLanKham || 0}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Số đơn thuốc</h4>
                  <p className="text-gray-900">{selectedPatient.soDonThuoc || 0}</p>
                </div>
              </div>
            </div>

            {/* Medical Records (Bệnh án) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Bệnh án</h3>
              {loadingMedicalRecords ? (
                <div className="text-center py-4 text-gray-500">Đang tải...</div>
              ) : medicalRecords.length > 0 ? (
                <div className="space-y-3">
                  {medicalRecords.map((record, index) => (
                    <div key={record.benhanId || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            Bệnh án #{record.benhanId}
                          </span>
                        </div>
                      </div>
                      {record.ghiChu && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.ghiChu}</p>
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        {record.hoSoKham && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Hồ sơ khám: #{record.hoSoKham.hosokhamId}
                          </span>
                        )}
                        {record.donThuoc && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Đơn thuốc: #{record.donThuoc.donthuocId}
                          </span>
                        )}
                        {record.labTest && (
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Xét nghiệm: #{record.labTest.labtestId}
                          </span>
                        )}
                        {record.caPhauThuat && (
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Ca phẫu thuật: #{record.caPhauThuat.caId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  Chưa có bệnh án nào
                </div>
              )}
            </div>

            {/* Visit History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Lịch sử khám</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Ngày đăng ký:</span>
                  <span className="font-medium">
                    {selectedPatient.registrationDate ? new Date(selectedPatient.registrationDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lần khám cuối:</span>
                  <span className="font-medium">
                    {selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                {selectedPatient.soLanKham !== undefined && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Số lần khám:</span>
                    <span className="font-medium">{selectedPatient.soLanKham}</span>
                  </div>
                )}
                {selectedPatient.soDonThuoc !== undefined && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Số đơn thuốc:</span>
                    <span className="font-medium">{selectedPatient.soDonThuoc}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedPatient(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditPatient(selectedPatient)
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

export default PatientManagement
