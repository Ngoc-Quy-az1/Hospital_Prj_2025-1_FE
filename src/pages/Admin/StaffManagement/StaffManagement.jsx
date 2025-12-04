import React, { useState, useEffect } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { adminAPI } from '../../../services/api'
import { 
  Users, 
  Building, 
  Building2,
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  Filter,
  Plus,
  Eye,
  Stethoscope,
  UserCheck
} from 'lucide-react'

const StaffManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterPosition, setFilterPosition] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Dữ liệu từ API
  const [staff, setStaff] = useState([])  // Nhân viên từ bảng NhanVien
  const [doctors, setDoctors] = useState([])  // Bác sĩ từ bảng BacSi
  const [departments, setDepartments] = useState([])
  const [totalStaff, setTotalStaff] = useState(0)
  const [totalDoctors, setTotalDoctors] = useState(0)
  const [activeStaff, setActiveStaff] = useState(0)
  const [activeDoctors, setActiveDoctors] = useState(0)
  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [viewType, setViewType] = useState('staff') // 'staff' | 'doctor' | 'departments'
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Load dữ liệu từ API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load staff (áp dụng khi viewType = staff)
        const staffResponse = viewType === 'staff'
          ? await adminAPI.getStaff(page, size, {
              search: searchTerm || undefined,
              chucVu: filterPosition || undefined,
              departmentId: filterDepartment ? (departments.find(d => d.name === filterDepartment)?.id) : undefined,
              startDate: startDateFilter || undefined,
              endDate: endDateFilter || undefined,
            })
          : { content: [], totalPages: 0 }
        const fetchedStaff = Array.isArray(staffResponse)
          ? staffResponse
          : (staffResponse.content || staffResponse.data || [])
        const formattedStaff = fetchedStaff.map(s => ({
          id: s.nhanvien_id || s.nhanvienId,
          name: s.ho_ten || s.hoTen || '-',
          email: s.email || '',
          phone: s.so_dien_thoai || s.soDienThoai || s.sdt || '',
          position: s.chuc_vu || s.chucVu || '',
          department: s.tenPhongBan || s.phongban?.tenPhongban || '',
          avatarUrl: s.anh_url || s.anhUrl || '',
          hireDate: s.ngay_vao_lam || s.ngayVaoLam || null,
          salary: s.luong ?? null,
          contractType: s.loaiHopDong || '',
          status: s.trang_thai || s.trangThai || 'đang làm việc'
        }))
        
        // Load doctors (áp dụng khi viewType = doctor)
        const doctorsResponse = viewType === 'doctor'
          ? await adminAPI.getDoctors(page, size, {
              search: searchTerm || undefined,
              departmentId: filterDepartment ? (departments.find(d => d.name === filterDepartment)?.id) : undefined,
              startDate: startDateFilter || undefined,
              endDate: endDateFilter || undefined,
            })
          : { content: [], totalPages: 0 }
        const fetchedDoctors = Array.isArray(doctorsResponse)
          ? doctorsResponse
          : (doctorsResponse.content || doctorsResponse.data || [])
        const formattedDoctors = fetchedDoctors.map(d => ({
          id: d.bacsi_id || d.bacsiId || d.bacSiId,
          name: d.ho_ten || d.hoTen || d.hoten || '-',
          email: d.email || '',
          phone: d.sdt || '',
          position: d.position || '',
          department: d.tenPhongBan || d.tenPhongban || d.phongban?.tenPhongban || '',
          avatarUrl: d.url_avt || d.urlAvt || '',
          hireDate: d.ngay_vao_lam || d.ngayVaoLam || null,
          salary: d.muc_luong !== undefined ? d.muc_luong : (d.mucLuong !== undefined ? d.mucLuong : null),
          contractType: d.loai_hop_dong || d.loaiHopDong || '',
          idNumber: d.so_cmnd_cccd || d.soCmndCccd || '',
          emergencyContact: d.lien_he_khan_cap || d.lienHeKhanCap || '',
          address: d.dia_chi || d.diaChi || '',
          phongbanId: d.phongban_id || d.phongbanId || null,
          status: d.trang_thai || d.trangThai || 'đang làm việc'
        }))
        
        setStaff(formattedStaff)
        setDoctors(formattedDoctors)
        setTotalPages(viewType === 'doctor' ? (doctorsResponse.totalPages || 0) : (staffResponse.totalPages || 0))

        // Tính số đang hoạt động từ dữ liệu hiện có trên trang
        setActiveStaff(formattedStaff.filter(s => (s.status || '').toLowerCase().includes('đang làm việc')).length)
        setActiveDoctors(formattedDoctors.filter(d => (d.status || '').toLowerCase().includes('đang làm việc')).length)
        
        // Load departments
        const deptResponse = await adminAPI.getDepartments()
        const fetchedDepts = Array.isArray(deptResponse) ? deptResponse : []
        const formattedDepts = fetchedDepts.map(d => ({
          id: d.phongbanId || d.phongban_id || d.id,
          name: d.tenPhongban || d.ten_phong_ban || d.name,
          description: d.nhiemVu || d.nhiem_vu || d.moTa || d.mo_ta || d.description || '',
          head: d.truongKhoa || d.truong_khoa || d.head || '',
          staffCount: d.soNhanVien || d.so_nhan_vien || d.staffCount || 0
        }))
        setDepartments(formattedDepts)
        
        setError(null)
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu nhân viên:', err)
        setError('Không thể tải dữ liệu nhân viên')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [searchTerm, filterDepartment, filterPosition, page, size, viewType, startDateFilter, endDateFilter])

  // Reset chi tiết khi đổi loại hiển thị (bác sĩ/nhân viên)
  useEffect(() => {
    setSelectedStaff(null)
    setShowEditModal(false)
    setShowAddModal(false)
    setFormData({
      name: '', email: '', phone: '', position: '', department: '', hireDate: '', salary: '', contractType: '', address: '', idNumber: '', emergencyContact: '', status: ''
    })
  }, [viewType])

  // Debug: Log selectedStaff changes
  useEffect(() => {
    console.log('selectedStaff changed:', selectedStaff)
    console.log('selectedStaff?.id:', selectedStaff?.id)
    console.log('selectedStaff?.name:', selectedStaff?.name)
    console.log('viewType:', viewType)
  }, [selectedStaff, viewType])

  // Load tổng số bác sĩ/nhân viên một lần tại mount (tránh lặp nhiều lần)
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [staffCountResponse, doctorCountResponse] = await Promise.all([
          adminAPI.countStaff(),
          adminAPI.countDoctors(),
        ])
        // Backend trả về object { total: <number> }, cần extract giá trị
        setTotalStaff(staffCountResponse?.total || staffCountResponse || 0)
        setTotalDoctors(doctorCountResponse?.total || doctorCountResponse || 0)
      } catch (err) {
        console.error('Lỗi khi tải số lượng nhân viên/bác sĩ:', err)
      }
    }
    loadCounts()
  }, [])

  // Removed hardcoded data - should come from API
  const staffPositions = []

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hireDate: '',
    salary: '',
    contractType: '',
    address: '',
    idNumber: '',
    emergencyContact: '',
    status: ''
  })

  // Merge staff và doctors để hiển thị
  const allStaff = viewType === 'doctor' ? doctors : viewType === 'staff' ? staff : departments
  
  // Lọc nhân viên theo tìm kiếm
  const filteredStaff = allStaff.filter(item => {
    if (viewType === 'departments') {
      const matchesSearch = !searchTerm || (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    }
    const matchesSearch = !searchTerm || 
                         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.phone.includes(searchTerm)
    const matchesDepartment = !filterDepartment || item.department === filterDepartment
    const matchesPosition = viewType === 'doctor' ? true : (!filterPosition || item.position === filterPosition)
    return matchesSearch && matchesDepartment && matchesPosition
  })
  
  const handleAddStaff = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      hireDate: '',
      salary: '',
      contractType: '',
      address: '',
      idNumber: '',
      emergencyContact: '',
      status: ''
    })
    setShowAddModal(true)
  }

  const handleEditStaff = (employee) => {
    setSelectedStaff(employee)
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      hireDate: employee.hireDate || '',
      salary: employee.salary || '',
      contractType: employee.contractType || '',
      address: employee.address || '',
      idNumber: employee.idNumber || '',
      emergencyContact: employee.emergencyContact || '',
      status: employee.status || ''
    })
    setShowEditModal(true)
  }

  // Hiển thị chi tiết ở khu vực ngoài modal
  const handleViewStaff = async (employee) => {
    if (!employee || !employee.id) {
      console.error('Invalid employee data:', employee)
      return
    }
    
    console.log('handleViewStaff called with employee:', employee)
    console.log('viewType:', viewType)
    
    // Set selectedStaff ngay lập tức với dữ liệu từ employee để hiển thị ngay
    setSelectedStaff(employee)
    setShowEditModal(false)
    setShowAddModal(false)
    
    // Fetch chi tiết từ API và update sau
    try {
      let detailedData
      if (viewType === 'doctor') {
        // Fetch chi tiết bác sĩ từ API
        const response = await adminAPI.getDoctorById(employee.id)
        console.log('Doctor API response:', response)
        detailedData = {
          id: response.bacsiId || response.bacsi_id || response.bacSiId || employee.id,
          name: response.hoTen || response.ho_ten || response.hoten || employee.name || '-',
          email: response.email || employee.email || '',
          phone: response.sdt || employee.phone || '',
          position: response.position || employee.position || '',
          department: response.tenPhongBan || response.tenPhongban || response.phongban?.tenPhongban || employee.department || '',
          avatarUrl: response.urlAvt || response.url_avt || employee.avatarUrl || '',
          hireDate: response.ngayVaoLam || response.ngay_vao_lam || employee.hireDate || null,
          salary: response.mucLuong !== undefined ? response.mucLuong : (response.muc_luong !== undefined ? response.muc_luong : employee.salary),
          contractType: response.loaiHopDong || response.loai_hop_dong || employee.contractType || '',
          idNumber: response.soCmndCccd || response.so_cmnd_cccd || employee.idNumber || '',
          emergencyContact: response.lienHeKhanCap || response.lien_he_khan_cap || employee.emergencyContact || '',
          address: response.diaChi || response.dia_chi || employee.address || '',
          phongbanId: response.phongbanId || response.phongban_id || employee.phongbanId || null,
          status: response.trangThai || response.trang_thai || employee.status || 'đang làm việc'
        }
      } else {
        // Fetch chi tiết nhân viên từ API
        console.log('Fetching staff details for ID:', employee.id)
        const response = await adminAPI.getStaffById(employee.id)
        console.log('Staff API response:', response)
        console.log('Response type:', typeof response)
        console.log('Response keys:', response ? Object.keys(response) : 'null')
        
        // Map response từ API (camelCase từ Jackson)
        detailedData = {
          id: response.nhanvienId || employee.id,
          name: response.hoTen || employee.name || '-',
          email: response.email || employee.email || '',
          phone: response.soDienThoai || employee.phone || '',
          position: response.chucVu || employee.position || '',
          department: response.tenPhongBan || (response.phongban?.tenPhongban) || employee.department || '',
          avatarUrl: response.anhUrl || employee.avatarUrl || '',
          hireDate: response.ngayVaoLam || employee.hireDate || null,
          salary: response.luong != null ? response.luong : (employee.salary ?? null),
          contractType: response.loaiHopDong || employee.contractType || '',
          status: response.trangThai || employee.status || 'đang làm việc',
          phongbanId: response.phongbanId || (response.phongban?.phongbanId) || employee.phongbanId || null
        }
        
        console.log('Mapped detailedData:', detailedData)
      }
      
      // Update selectedStaff với dữ liệu từ API
      if (detailedData) {
        console.log('Updating selectedStaff with API data:', detailedData)
        setSelectedStaff(detailedData)
      }
    } catch (error) {
      console.error('Error loading staff details:', error)
      console.error('Error details:', error.response || error.message || error)
      // Giữ lại employee data nếu API fail
      console.log('Keeping employee data due to error')
    }
  }

  const exportToCSV = () => {
    const escape = (val) => {
      if (val == null) return ''
      const s = String(val)
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }
    let headers = []
    let rows = []
    if (viewType === 'doctor') {
      headers = ['Họ tên','Email','Số điện thoại','Chức vụ','Phòng ban','Ảnh']
      rows = filteredStaff.map(d => [d.name, d.email, d.phone, d.position, d.department, d.avatarUrl || ''])
    } else if (viewType === 'staff') {
      headers = ['Họ tên','Email','Số điện thoại','Chức vụ','Phòng ban','Ngày vào làm','Lương','Trạng thái']
      rows = filteredStaff.map(s => [s.name, s.email, s.phone, s.position, s.department, s.hireDate || '', s.salary ?? '', s.status || ''])
    } else {
      headers = ['Tên phòng ban','Mô tả']
      rows = filteredStaff.map(d => [d.name, d.description || d.nhiemVu || ''])
    }
    const utf8BOM = '\uFEFF'
    const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n')
    const blob = new Blob([utf8BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const filename = viewType === 'doctor' ? 'doctors.csv' : viewType === 'staff' ? 'staff.csv' : 'departments.csv'
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (showEditModal && selectedStaff) {
        if (viewType === 'doctor') {
          // Cập nhật bác sĩ
          const deptId = departments.find(d => d.name === (formData.department || selectedStaff.department))?.id
          const payload = {
            hoTen: formData.name,
            email: formData.email,
            sdt: formData.phone,
            position: formData.position || undefined,
            phongbanId: deptId,
            urlAvt: selectedStaff.avatarUrl || undefined,
            trangThai: formData.status || selectedStaff.status
          }
          await adminAPI.updateDoctor(selectedStaff.id, payload)
        } else {
          // Cập nhật nhân viên
          const deptId = departments.find(d => d.name === (formData.department || selectedStaff.department))?.id
          const payload = {
            hoTen: formData.name,
            chucVu: formData.position,
            ngayVaoLam: formData.hireDate,
            luong: formData.salary,
            phongbanId: deptId,
            anhUrl: selectedStaff.avatarUrl || undefined,
            soDienThoai: formData.phone,
            trangThai: formData.status || selectedStaff.status || undefined
          }
          await adminAPI.updateStaff(selectedStaff.id, payload)
        }
      } else {
        // Thêm nhân viên mới
        const deptId = departments.find(d => d.name === formData.department)?.id
        const payload = {
          hoTen: formData.name,
          chucVu: formData.position,
          ngayVaoLam: formData.hireDate,
          luong: formData.salary,
          phongbanId: deptId,
          anhUrl: undefined,
          soDienThoai: formData.phone,
          trangThai: formData.status || undefined
        }
        await adminAPI.createStaff(payload)
      }
      
      // Reload dữ liệu sau khi cập nhật với filters hiện tại
      if (viewType === 'doctor') {
        const doctorsResponse = await adminAPI.getDoctors(page, size, {
          search: searchTerm || undefined,
          departmentId: filterDepartment ? (departments.find(d => d.name === filterDepartment)?.id) : undefined,
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined,
        })
        const fetchedDoctors = doctorsResponse.content || doctorsResponse.data || []
        const formattedDoctors = fetchedDoctors.map(d => ({
          id: d.bacsi_id || d.bacsiId || d.bacSiId,
          name: d.ho_ten || d.hoTen || d.hoten || '-',
          email: d.email || '',
          phone: d.sdt || '',
          position: d.position || '',
          department: d.tenPhongBan || d.tenPhongban || d.phongban?.tenPhongban || '',
          avatarUrl: d.url_avt || d.urlAvt || '',
          hireDate: d.ngay_vao_lam || d.ngayVaoLam || null,
          salary: d.muc_luong !== undefined ? d.muc_luong : (d.mucLuong !== undefined ? d.mucLuong : null),
          contractType: d.loai_hop_dong || d.loaiHopDong || '',
          idNumber: d.so_cmnd_cccd || d.soCmndCccd || '',
          emergencyContact: d.lien_he_khan_cap || d.lienHeKhanCap || '',
          address: d.dia_chi || d.diaChi || '',
          phongbanId: d.phongban_id || d.phongbanId || null,
          status: d.trang_thai || d.trangThai || 'đang làm việc'
        }))
        setDoctors(formattedDoctors)
        setTotalPages(doctorsResponse.totalPages || 0)
      } else {
        const staffResponse = await adminAPI.getStaff(page, size, {
          search: searchTerm || undefined,
          chucVu: filterPosition || undefined,
          departmentId: filterDepartment ? (departments.find(d => d.name === filterDepartment)?.id) : undefined,
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined,
        })
        const fetchedStaff = staffResponse.content || staffResponse.data || []
        const formattedStaff = fetchedStaff.map(s => ({
          id: s.nhanvien_id || s.nhanvienId,
          name: s.ho_ten || s.hoTen || '-',
          email: s.email || '',
          phone: s.so_dien_thoai || s.soDienThoai || s.sdt || '',
          position: s.chuc_vu || s.chucVu || '',
          department: s.tenPhongBan || s.phongban?.tenPhongban || '',
          avatarUrl: s.anh_url || s.anhUrl || '',
          hireDate: s.ngay_vao_lam || s.ngayVaoLam || null,
          salary: s.luong ?? null,
          contractType: s.loaiHopDong || '',
          status: s.trang_thai || s.trangThai || 'đang làm việc'
        }))
        setStaff(formattedStaff)
        setTotalPages(staffResponse.totalPages || 0)
      }
      
      setShowEditModal(false)
      setShowAddModal(false)
      setSelectedStaff(null)
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        hireDate: '',
        salary: '',
        contractType: '',
        address: '',
        idNumber: '',
        emergencyContact: ''
      })
    } catch (err) {
      console.error('Lỗi khi cập nhật nhân viên:', err)
      setError('Không thể cập nhật nhân viên')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      setLoading(true)
      try {
        await adminAPI.deleteStaff(id)
        
        // Reload dữ liệu sau khi xóa với filters hiện tại
        if (viewType === 'staff') {
          const staffResponse = await adminAPI.getStaff(page, size, {
            search: searchTerm || undefined,
            chucVu: filterPosition || undefined,
            departmentId: filterDepartment ? (departments.find(d => d.name === filterDepartment)?.id) : undefined,
            startDate: startDateFilter || undefined,
            endDate: endDateFilter || undefined,
          })
          const fetchedStaff = staffResponse.content || staffResponse.data || []
          const formattedStaff = fetchedStaff.map(s => ({
            id: s.nhanvien_id || s.nhanvienId,
            name: s.ho_ten || s.hoTen || '-',
            email: s.email || '',
            phone: s.so_dien_thoai || s.soDienThoai || s.sdt || '',
            position: s.chuc_vu || s.chucVu || '',
            department: s.tenPhongBan || s.phongban?.tenPhongban || '',
            avatarUrl: s.anh_url || s.anhUrl || '',
            hireDate: s.ngay_vao_lam || s.ngayVaoLam || null,
            salary: s.luong ?? null,
            contractType: s.loaiHopDong || '',
            status: s.trang_thai || s.trangThai || 'đang làm việc'
          }))
          setStaff(formattedStaff)
          setTotalPages(staffResponse.totalPages || 0)
        }
      } catch (err) {
        console.error('Lỗi khi xóa nhân viên:', err)
        setError('Không thể xóa nhân viên')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteDoctor = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) {
      setLoading(true)
      try {
        await adminAPI.deleteDoctor(id)
        // Reload dữ liệu sau khi xóa với filters hiện tại
        const doctorsResponse = await adminAPI.getDoctors(page, size, {
          search: searchTerm || undefined,
          departmentId: filterDepartment ? (departments.find(d => d.name === filterDepartment)?.id) : undefined,
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined,
        })
        const fetchedDoctors = doctorsResponse.content || doctorsResponse.data || []
        const formattedDoctors = fetchedDoctors.map(d => ({
          id: d.bacsi_id || d.bacsiId || d.bacSiId,
          name: d.ho_ten || d.hoTen || d.hoten || '-',
          email: d.email || '',
          phone: d.sdt || '',
          position: d.position || '',
          department: d.tenPhongBan || d.tenPhongban || d.phongban?.tenPhongban || '',
          avatarUrl: d.url_avt || d.urlAvt || '',
          hireDate: d.ngay_vao_lam || d.ngayVaoLam || null,
          salary: d.muc_luong !== undefined ? d.muc_luong : (d.mucLuong !== undefined ? d.mucLuong : null),
          contractType: d.loai_hop_dong || d.loaiHopDong || '',
          idNumber: d.so_cmnd_cccd || d.soCmndCccd || '',
          emergencyContact: d.lien_he_khan_cap || d.lienHeKhanCap || '',
          address: d.dia_chi || d.diaChi || '',
          phongbanId: d.phongban_id || d.phongbanId || null,
          status: d.trang_thai || d.trangThai || 'đang làm việc'
        }))
        setDoctors(formattedDoctors)
        setTotalPages(doctorsResponse.totalPages || 0)
      } catch (err) {
        console.error('Lỗi khi xóa bác sĩ:', err)
        setError('Không thể xóa bác sĩ')
      } finally {
        setLoading(false)
      }
    }
  }

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    const statusConfig = {
      'đang làm việc': 'bg-green-100 text-green-800',
      'nghỉ': 'bg-red-100 text-red-800',
      'đã nghỉ': 'bg-red-100 text-red-800',
      'đã nghỉ hưu': 'bg-yellow-100 text-yellow-800',
      'nghỉ hưu': 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[s] || 'bg-gray-100 text-gray-800'}`}>
        {status || '—'}
      </span>
    )
  }

  // Cột cho bảng nhân viên/bác sĩ
  const baseNameColumn = {
    key: 'name',
    label: 'Họ tên',
    render: (value, row) => {
      const displayName = value || row.name || '-';
      return (
        <div className="flex items-center gap-4">
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border cursor-zoom-in"
              onClick={(e) => { e.stopPropagation(); setPreviewImageUrl(row.avatarUrl); setIsPreviewOpen(true); }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              {String(displayName || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{displayName}</div>
          </div>
        </div>
      );
    }
  }

  const staffColumns = [
    baseNameColumn,
    {
      key: 'position',
      label: 'Chức vụ'
    },
    {
      key: 'department',
      label: 'Phòng ban'
    },
    {
      key: 'phone',
      label: 'Số điện thoại'
    },
    {
      key: 'hireDate',
      label: 'Ngày vào làm',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
    {
      key: 'salary',
      label: 'Lương',
      render: (value) => (value != null && !isNaN(value)) ? `${parseInt(value).toLocaleString('vi-VN')} VNĐ` : '-'
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (value, row) => (
        <div className="flex gap-2 items-center justify-center">
          <Button
            size="sm"
            variant="outline"
            icon={<Eye className="w-4 h-4" />}
            onClick={(e) => { e.stopPropagation(); handleViewStaff(row); }}
          >
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={(e) => { e.stopPropagation(); handleEditStaff(row); }}
          >
            Sửa
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e) => { e.stopPropagation(); handleDeleteStaff(row.id); }}
          >
            Xóa
          </Button>
        </div>
      )
    }
  ]

  const doctorColumns = [
    baseNameColumn,
    { key: 'position', label: 'Chức vụ' },
    { key: 'department', label: 'Phòng ban' },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'status', label: 'Trạng thái', render: (value) => getStatusBadge(value) },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (value, row) => (
        <div className="flex gap-2 items-center justify-center">
          <Button 
            size="sm" 
            variant="outline" 
            icon={<Eye className="w-4 h-4" />}
            onClick={(e) => { e.stopPropagation(); handleViewStaff(row); }}
          >
            Xem
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            icon={<Edit className="w-4 h-4" />}
            onClick={(e) => { e.stopPropagation(); handleEditStaff(row); }}
          >
            Sửa
          </Button>
          <Button 
            size="sm" 
            variant="danger" 
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e) => { e.stopPropagation(); handleDeleteDoctor(row.id); }}
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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý nhân viên</h1>
            <p className="text-indigo-100">Quản lý thông tin nhân viên và phòng ban</p>
          </div>
          <div className="flex gap-3">
            <Button
              icon={<UserPlus className="w-4 h-4" />}
              onClick={handleAddStaff}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Thêm nhân viên
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => { setViewType('staff'); setPage(0); }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng nhân viên</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{totalStaff.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Tất cả nhân viên</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => { setViewType('staff'); setPage(0); }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đang hoạt động</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{activeStaff.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Nhân viên đang làm việc</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => { setViewType('doctor'); setPage(0); }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng bác sĩ</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{totalDoctors.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Bác sĩ trong hệ thống</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => { setViewType('departments'); }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Phòng ban</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{departments.length}</div>
            <div className="text-sm text-gray-500">Tổng số phòng ban</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title={`Bộ lọc và tìm kiếm (${viewType === 'staff' ? 'Nhân viên' : viewType === 'doctor' ? 'Bác sĩ' : 'Phòng ban'})`}>
        <div className="space-y-4">
          {/* Hàng 1 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Loại</label>
              <select
                value={viewType}
                onChange={(e) => { setViewType(e.target.value); setPage(0); setSelectedStaff(null); setShowEditModal(false); setShowAddModal(false); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="staff">Nhân viên</option>
                <option value="doctor">Bác sĩ</option>
                <option value="departments">Phòng ban</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={viewType === 'staff' ? 'Tìm kiếm nhân viên...' : viewType === 'doctor' ? 'Tìm kiếm bác sĩ...' : 'Tìm kiếm phòng ban...'}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => { setStartDateFilter(e.target.value); setPage(0); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => { setEndDateFilter(e.target.value); setPage(0); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Hàng 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {viewType !== 'departments' && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => { setFilterDepartment(e.target.value); setPage(0); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả phòng ban</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            )}

            {viewType === 'staff' && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                <select
                  value={filterPosition}
                  onChange={(e) => { setFilterPosition(e.target.value); setPage(0); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả chức vụ</option>
                  {staffPositions.map(position => (
                    <option key={position} value={position}>{position || '—'}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={viewType === 'staff' ? 'md:col-span-2 flex flex-col' : viewType === 'doctor' ? 'md:col-span-3 flex flex-col' : 'md:col-span-4 flex flex-col'}>
              <label className="text-sm font-medium text-gray-700 mb-1 invisible">Action</label>
              <Button
                variant="outline"
                icon={<Download className="w-4 h-4" />}
                onClick={exportToCSV}
                className="w-full md:w-auto"
              >
                Xuất danh sách
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* List + Detail in two side-by-side panels */}
      {viewType === 'departments' ? (
        <Card title="Danh sách phòng ban">
          <Table
            data={filteredStaff.map(d => ({
              name: d.name,
              description: d.description || d.nhiemVu || '—',
            }))}
            columns={[
              { key: 'name', label: 'Tên phòng ban' },
              { key: 'description', label: 'Nhiệm vụ/Mô tả' },
            ]}
            searchable={false}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <Card title={viewType === 'staff' ? 'Danh sách nhân viên' : 'Danh sách bác sĩ'}>
            <Table
              data={filteredStaff}
              columns={viewType === 'doctor' ? doctorColumns : staffColumns}
              searchable={false}
              onRowClick={(row) => handleViewStaff(row)}
              selectedRowId={selectedStaff?.id}
              rowKey="id"
            />
          </Card>
          <Card title={viewType === 'doctor' ? 'Thông tin bác sĩ' : 'Thông tin nhân viên'}>
            {selectedStaff ? (
              <div className="space-y-4">
                {selectedStaff.avatarUrl && (
                  <div className="flex flex-col items-center mb-4">
                    <img
                      src={selectedStaff.avatarUrl}
                      alt={selectedStaff.name || (viewType === 'doctor' ? 'Bác sĩ' : 'Nhân viên')}
                      className="w-24 h-24 rounded-full object-cover border cursor-pointer mb-2"
                      onClick={() => window.open(selectedStaff.avatarUrl, '_blank')}
                    />
                    <span className="text-sm text-gray-500">Nhấp để xem lớn</span>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                    <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{selectedStaff.name || '-'}</div>
                  </div>
                  {(viewType === 'doctor' || selectedStaff.email) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{selectedStaff.email || '-'}</div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                    <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{selectedStaff.phone || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Chức vụ</label>
                    <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{selectedStaff.position || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phòng ban</label>
                    <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{selectedStaff.department || '-'}</div>
                  </div>
                  {(viewType === 'staff' || viewType === 'doctor') && selectedStaff.hireDate && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày vào làm</label>
                      <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                        {selectedStaff.hireDate ? new Date(selectedStaff.hireDate).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </div>
                  )}
                  {(viewType === 'staff' || viewType === 'doctor') && selectedStaff.salary != null && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mức lương</label>
                      <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                        {selectedStaff.salary != null ? `${parseInt(selectedStaff.salary).toLocaleString('vi-VN')} VNĐ` : '-'}
                      </div>
                    </div>
                  )}
                  {selectedStaff.contractType && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Loại hợp đồng</label>
                      <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{selectedStaff.contractType || '-'}</div>
                    </div>
                  )}
                  {selectedStaff.idNumber && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Số CMND/CCCD</label>
                      <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{selectedStaff.idNumber || '-'}</div>
                    </div>
                  )}
                  {selectedStaff.emergencyContact && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Liên hệ khẩn cấp</label>
                      <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{selectedStaff.emergencyContact || '-'}</div>
                    </div>
                  )}
                  {selectedStaff.address && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                      <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 min-h-[50px]">{selectedStaff.address || '-'}</div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                    <div className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                      {getStatusBadge(selectedStaff.status)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8 text-base">Chọn một {viewType === 'doctor' ? 'bác sĩ' : 'nhân viên'} để xem chi tiết</div>
            )}
          </Card>
        </div>
      )}

      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsPreviewOpen(false)}
        >
          <img
            src={previewImageUrl}
            alt="Preview"
            className="max-w-[90vw] max-height-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-gray-600">Trang {page + 1}/{Math.max(totalPages, 1)}</span>
        <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => Math.max(p - 1, 0))}>Trước</Button>
        <Button variant="outline" disabled={(page + 1) >= totalPages} onClick={() => setPage(p => p + 1)}>Sau</Button>
      </div>

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedStaff(null)
        }}
        title={showEditModal ? (viewType === 'doctor' ? 'Thông tin bác sĩ' : 'Sửa thông tin nhân viên') : 'Thêm nhân viên mới'}
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
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              />
            </div>

            {viewType === 'doctor' && (
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
            )}

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
                Chức vụ
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Nhập chức vụ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng ban *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              >
                <option value="">Chọn phòng ban</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">—</option>
                <option value="đang làm việc">đang làm việc</option>
                <option value="đã nghỉ">đã nghỉ</option>
                <option value="đã nghỉ hưu">đã nghỉ hưu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày vào làm *
              </label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={viewType !== 'doctor'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mức lương *
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={viewType !== 'doctor'}
              />
            </div>

            {viewType === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại hợp đồng *
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  >
                  <option value="">Chọn loại hợp đồng</option>
                  <option value="Hợp đồng dài hạn">Hợp đồng dài hạn</option>
                  <option value="Hợp đồng ngắn hạn">Hợp đồng ngắn hạn</option>
                  <option value="Thử việc">Thử việc</option>
                </select>
              </div>
            )}

            {viewType === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số CMND/CCCD *
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  />
              </div>
            )}

            {viewType === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liên hệ khẩn cấp
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {viewType === 'doctor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedStaff(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Thêm nhân viên"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Department Management Modal */}
      <Modal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        title="Quản lý phòng ban"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Danh sách phòng ban</h3>
            <Button icon={<Plus className="w-4 h-4" />}>
              Thêm phòng ban
            </Button>
          </div>

          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-600">Trưởng khoa: {dept.head}</p>
                    <p className="text-sm text-gray-500">Số nhân viên: {dept.staffCount}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" icon={<Edit className="w-4 h-4" />}>
                      Sửa
                    </Button>
                    <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />}>
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StaffManagement
