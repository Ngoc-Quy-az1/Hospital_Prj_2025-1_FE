import React, { useState, useEffect } from 'react'
import Card from '../../../components/Common/Card';
import Button from '../../../components/Common/Button';
import Modal from '../../../components/Common/Modal';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Bell,
  Download,
  Filter,
  Search,
  Stethoscope,
  UserCheck,
  Activity
} from 'lucide-react'
import { adminAPI } from '../../../services/api';

const SAMPLE_SCHEDULES = [
  {
    id: 1,
    date: '2024-01-15',
    shift: 'Ca sáng',
    department: 'Khoa Tim mạch',
    staff: [
      { id: 1, name: 'BS. Nguyễn Văn An', position: 'Bác sĩ', status: 'confirmed' },
      { id: 2, name: 'YT. Trần Thị Bình', position: 'Y tá', status: 'confirmed' },
      { id: 3, name: 'ĐD. Lê Văn Cường', position: 'Điều dưỡng', status: 'pending' }
    ],
    notes: 'Ca trực bình thường'
  },
  {
    id: 2,
    date: '2024-01-15',
    shift: 'Ca chiều',
    department: 'Khoa Nội',
    staff: [
      { id: 4, name: 'BS. Phạm Thị Dung', position: 'Bác sĩ', status: 'confirmed' },
      { id: 5, name: 'YT. Hoàng Văn Em', position: 'Y tá', status: 'confirmed' }
    ],
    notes: ''
  },
  {
    id: 3,
    date: '2024-01-16',
    shift: 'Ca sáng',
    department: 'Khoa Ngoại',
    staff: [
      { id: 6, name: 'BS. Vũ Thị Phương', position: 'Bác sĩ', status: 'confirmed' },
      { id: 7, name: 'YT. Đặng Văn Giang', position: 'Y tá', status: 'confirmed' },
      { id: 8, name: 'ĐD. Bùi Thị Hoa', position: 'Điều dưỡng', status: 'confirmed' }
    ],
    notes: 'Ca trực có ca phẫu thuật'
  }
]

const DEFAULT_DEPARTMENTS = [
  { id: 'dept-heart', name: 'Khoa Tim mạch' },
  { id: 'dept-internal', name: 'Khoa Nội' },
  { id: 'dept-surgery', name: 'Khoa Ngoại' },
  { id: 'dept-ob', name: 'Khoa Sản' },
  { id: 'dept-pediatrics', name: 'Khoa Nhi' }
]

const DEFAULT_SHIFT_FRAMES = [
  { id: 'shift-morning', tenKhung: 'Ca sáng', gioBatDau: '07:00', gioKetThuc: '11:30' },
  { id: 'shift-afternoon', tenKhung: 'Ca chiều', gioBatDau: '13:00', gioKetThuc: '17:00' },
  { id: 'shift-evening', tenKhung: 'Ca tối', gioBatDau: '17:00', gioKetThuc: '21:30' },
  { id: 'shift-night', tenKhung: 'Ca đêm', gioBatDau: '21:30', gioKetThuc: '07:00' }
]

const normalizeTimeString = (timeValue) => {
  if (timeValue === null || timeValue === undefined) return ''
  if (typeof timeValue === 'string') {
    if (timeValue.includes(':')) {
      const [hour = '00', minute = '00'] = timeValue.split(':')
      return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
    }
    if (!Number.isNaN(Number(timeValue))) {
      const numeric = Number(timeValue)
      return `${String(numeric).padStart(2, '0')}:00`
    }
    return timeValue
  }
  if (typeof timeValue === 'number') {
    return `${String(timeValue).padStart(2, '0')}:00`
  }
  if (typeof timeValue === 'object' && timeValue !== null) {
    const hour = timeValue.hour ?? timeValue.Hours ?? ''
    const minute = timeValue.minute ?? timeValue.Minutes ?? '00'
    if (hour !== '') {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    }
  }
  return ''
}

const normalizeShiftFrame = (frame = {}) => {
  const rawId = frame.id ?? frame.shiftFrameId ?? frame.maKhung ?? frame.code ?? frame.tenKhung
  return {
    id: rawId !== undefined && rawId !== null ? String(rawId) : undefined,
    tenKhung: frame.tenKhung ?? frame.name ?? frame.tenCa ?? frame.label ?? '',
    gioBatDau: normalizeTimeString(frame.gioBatDau ?? frame.startTime ?? frame.gioBatDauStr),
    gioKetThuc: normalizeTimeString(frame.gioKetThuc ?? frame.endTime ?? frame.gioKetThucStr)
  }
}

const buildShiftFrameLabel = (frame = {}) => {
  const name = frame.tenKhung ?? frame.name ?? ''
  const start = normalizeTimeString(frame.gioBatDau || frame.startTime)
  const end = normalizeTimeString(frame.gioKetThuc || frame.endTime)
  if (start && end) {
    return `${name} (${start} - ${end})`
  }
  return name
}

const extractListFromResponse = (response) => {
  if (Array.isArray(response)) return response
  if (response?.content && Array.isArray(response.content)) return response.content
  if (response?.data && Array.isArray(response.data)) return response.data
  return []
}

const getScheduleDepartmentName = (schedule = {}) => {
  return (
    schedule.department ||
    schedule.phongbanName ||
    schedule.phongBan?.tenPhongBan ||
    schedule.phongban?.tenPhongban ||
    schedule.departmentName ||
    schedule.department?.name ||
    ''
  )
}

const getScheduleDate = (schedule = {}) => {
  return schedule.date || schedule.ngayTruc || schedule.ngaytruc || ''
}

const getScheduleShiftLabel = (schedule = {}) => {
  return (
    schedule.shift ||
    schedule.khungGioLabel ||
    schedule.shiftLabel ||
    schedule.shiftFrameCode ||
    schedule.tenKhung ||
    schedule.khungGio?.tenKhungGio ||
    schedule.khungGio?.tenKhung ||
    ''
  )
}

const getScheduleShiftFrameId = (schedule = {}) => {
  const rawId = (
    schedule.shiftFrameId ||
    schedule.khungGioId ||
    schedule.khungGio?.id ||
    schedule.khungGio?.khungGioId ||
    schedule.khungGio?.shiftFrameId ||
    schedule.shiftFrameCode
  )
  return rawId || rawId === 0 ? String(rawId) : ''
}

const getScheduleStartTime = (schedule = {}) => {
  return normalizeTimeString(
    schedule.gioBatDau ||
    schedule.startTime ||
    schedule.khungGio?.gioBatDau ||
    schedule.khungGio?.startTime
  )
}

const getScheduleEndTime = (schedule = {}) => {
  return normalizeTimeString(
    schedule.gioKetThuc ||
    schedule.endTime ||
    schedule.khungGio?.gioKetThuc ||
    schedule.khungGio?.endTime
  )
}

const mapScheduleData = (data = []) => {
  if (!Array.isArray(data)) return []
  return data.map(schedule => {
    const derivedStaff = Array.isArray(schedule.staff) && schedule.staff.length > 0
      ? schedule.staff
      : schedule.bacsiId
        ? [{
            id: schedule.bacsiId,
            name: schedule.bacsiName,
            position: 'Bác sĩ',
            status: schedule.xacNhan ? 'confirmed' : 'pending'
          }]
        : []

    return {
      ...schedule,
      id: schedule.id ?? schedule.lichtrucId ?? schedule.shiftId ?? schedule.lichTrucId ?? schedule.lichtrucbanId,
      date: getScheduleDate(schedule),
      shift: getScheduleShiftLabel(schedule),
      shiftFrameId: getScheduleShiftFrameId(schedule),
      gioBatDau: getScheduleStartTime(schedule),
      gioKetThuc: getScheduleEndTime(schedule),
      department: getScheduleDepartmentName(schedule),
      staff: derivedStaff,
      notes: schedule.notes ?? schedule.ghiChu ?? schedule.note ?? ''
    }
  })
}

const createEmptyScheduleForm = () => ({
  date: '',
  shift: '',
  shiftFrameId: '',
  gioBatDau: '',
  gioKetThuc: '',
  department: '',
  bacsiId: null,
  staff: [],
  notes: ''
})

const ScheduleManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // week, month, day
  const [selectedDepartment, setSelectedDepartment] = useState('')

  const [schedules, setSchedules] = useState(() => mapScheduleData(SAMPLE_SCHEDULES))

  // Dữ liệu mẫu nhân viên
  const [staff, setStaff] = useState([
    { id: 1, name: 'BS. Nguyễn Văn An', position: 'Bác sĩ', department: 'Khoa Tim mạch' },
    { id: 2, name: 'YT. Trần Thị Bình', position: 'Y tá', department: 'Khoa Tim mạch' },
    { id: 3, name: 'ĐD. Lê Văn Cường', position: 'Điều dưỡng', department: 'Khoa Tim mạch' },
    { id: 4, name: 'BS. Phạm Thị Dung', position: 'Bác sĩ', department: 'Khoa Nội' },
    { id: 5, name: 'YT. Hoàng Văn Em', position: 'Y tá', department: 'Khoa Nội' },
    { id: 6, name: 'BS. Vũ Thị Phương', position: 'Bác sĩ', department: 'Khoa Ngoại' },
    { id: 7, name: 'YT. Đặng Văn Giang', position: 'Y tá', department: 'Khoa Ngoại' },
    { id: 8, name: 'ĐD. Bùi Thị Hoa', position: 'Điều dưỡng', department: 'Khoa Ngoại' }
  ])

  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS)
  const [shiftFrames, setShiftFrames] = useState(DEFAULT_SHIFT_FRAMES)
  const [doctors, setDoctors] = useState([])
  const [shiftSummary, setShiftSummary] = useState({
    totalShifts: 0,
    confirmedShifts: 0,
    pendingShifts: 0
  })
  const [shiftFrameCheck, setShiftFrameCheck] = useState({
    startTime: '',
    endTime: '',
    status: null,
    message: ''
  })
  const [checkingShiftFrame, setCheckingShiftFrame] = useState(false)

  const [formData, setFormData] = useState(createEmptyScheduleForm())

  const shiftOptions = (shiftFrames && shiftFrames.length) ? shiftFrames : DEFAULT_SHIFT_FRAMES

  const filteredSchedules = selectedDepartment 
    ? schedules.filter(schedule => getScheduleDepartmentName(schedule) === selectedDepartment)
    : schedules

  // Nhóm lịch trực theo ngày
  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.date]) {
      acc[schedule.date] = []
    }
    acc[schedule.date].push(schedule)
    return acc
  }, {})

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await adminAPI.getDepartments()
        const departmentsData = extractListFromResponse(response)

        // Normalize department data
        const normalizedDepartments = departmentsData
          .map(dept => ({
            id: dept.phongbanId || dept.departmentId || dept.id,
            name: dept.tenPhongban || dept.tenPhongBan || dept.tenKhoa || dept.name || ''
          }))
          .filter(dept => dept.name && dept.name.trim() !== '')

        if (normalizedDepartments.length > 0) {
          setDepartments(normalizedDepartments)
        } else {
          console.warn('No departments found in API response, using defaults')
          setDepartments(DEFAULT_DEPARTMENTS)
        }
      } catch (error) {
        console.error('Failed to load departments:', error)
        setDepartments(DEFAULT_DEPARTMENTS)
      }
    }

    fetchDepartments()
  }, [])

  // Fetch shift frames from API
  useEffect(() => {
    const fetchShiftFrames = async () => {
      try {
        // Try new API first, fallback to old one
        let response
        try {
          response = await adminAPI.getShiftFramesFromShifts()
        } catch (e) {
          response = await adminAPI.getShiftFrames()
        }
        const framesData = extractListFromResponse(response)

        const normalizedFrames = framesData
          .map(frame => ({
            id: frame.id || frame.khunggiotrucId || frame.khungGioTrucId,
            tenKhung: frame.tenKhung || frame.khungGioLabel || `${frame.gioBatDau || ''} - ${frame.gioKetThuc || ''}`,
            gioBatDau: normalizeTimeString(frame.gioBatDau),
            gioKetThuc: normalizeTimeString(frame.gioKetThuc)
          }))
          .filter(frame => frame.id)

        setShiftFrames(normalizedFrames.length ? normalizedFrames : DEFAULT_SHIFT_FRAMES)
      } catch (error) {
        console.error('Failed to load shift frames:', error)
        setShiftFrames(DEFAULT_SHIFT_FRAMES)
      }
    }

    fetchShiftFrames()
  }, [])

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await adminAPI.getDoctors()
        const doctorsData = Array.isArray(response) ? response : extractListFromResponse(response)
        setDoctors(doctorsData || [])
      } catch (error) {
        console.error('Failed to load doctors:', error)
        setDoctors([])
      }
    }

    fetchDoctors()
  }, [])

  // Fetch shift summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await adminAPI.getShiftSummary({
          date: currentDate.toISOString().split('T')[0],
          departmentId: selectedDepartment ? departments.find(d => d.name === selectedDepartment)?.id : null
        })
        if (response) {
          setShiftSummary({
            totalShifts: response.totalShifts || 0,
            confirmedShifts: response.confirmedShifts || 0,
            pendingShifts: response.pendingShifts || 0
          })
        }
      } catch (error) {
        console.error('Failed to load shift summary:', error)
      }
    }

    fetchSummary()
  }, [currentDate, selectedDepartment, departments])

  // Fetch schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const selectedDept = departments.find(d => d.name === selectedDepartment)
        const params = {
          mode: viewMode,
          date: currentDate.toISOString().split('T')[0],
          departmentId: selectedDept?.id,
          page: 0,
          size: 100
        }
        const response = await adminAPI.getSchedules(params)
        const schedulesData = extractListFromResponse(response)

        const mappedSchedules = mapScheduleData(schedulesData)
        setSchedules(mappedSchedules.length > 0 ? mappedSchedules : [])
      } catch (error) {
        console.error('Failed to load schedules:', error)
        setSchedules([])
      }
    }

    fetchSchedules()
  }, [viewMode, currentDate, selectedDepartment, departments]);

  const handleAddSchedule = () => {
    setFormData({
      ...createEmptyScheduleForm(),
      date: new Date().toISOString().split('T')[0]
    })
    setShowAddModal(true)
  }

  const handleEditSchedule = async (schedule) => {
    setSelectedSchedule(schedule)
    
    // Fetch full schedule details if we have an ID
    let fullSchedule = schedule
    if (schedule.id) {
      try {
        const response = await adminAPI.getShiftById(schedule.id)
        fullSchedule = response
      } catch (error) {
        console.error('Failed to fetch schedule details:', error)
      }
    }
    
    setFormData({
      ...createEmptyScheduleForm(),
      date: getScheduleDate(fullSchedule) || '',
      shift: getScheduleShiftLabel(fullSchedule) || '',
      shiftFrameId: fullSchedule.khungGioTrucId || fullSchedule.khunggiotrucId || '',
      gioBatDau: getScheduleStartTime(fullSchedule) || '',
      gioKetThuc: getScheduleEndTime(fullSchedule) || '',
      department: getScheduleDepartmentName(fullSchedule) || '',
      bacsiId: fullSchedule.bacsiId || null,
      staff: fullSchedule.bacsiId ? [{
        id: fullSchedule.bacsiId,
        name: fullSchedule.bacsiName || '',
        position: 'Bác sĩ',
        status: fullSchedule.xacNhan ? 'confirmed' : 'pending'
      }] : [],
      notes: fullSchedule.ghiChu || fullSchedule.notes || ''
    })
    setShowEditModal(true)
  }

  const handleShiftSelection = (frameId) => {
    if (!frameId) {
      setFormData(prev => ({
        ...prev,
        shiftFrameId: '',
        shift: '',
        gioBatDau: '',
        gioKetThuc: ''
      }))
      return
    }

    const targetFrame = shiftOptions.find(frame => String(frame.id) === String(frameId))

    setFormData(prev => ({
      ...prev,
      shiftFrameId: frameId,
      shift: targetFrame?.tenKhung || prev.shift,
      gioBatDau: targetFrame?.gioBatDau || '',
      gioKetThuc: targetFrame?.gioKetThuc || ''
    }))
  }

  const handleShiftFrameCheckRequest = async () => {
    if (!shiftFrameCheck.startTime || !shiftFrameCheck.endTime) {
      setShiftFrameCheck(prev => ({
        ...prev,
        status: null,
        message: 'Vui lòng chọn cả giờ bắt đầu và kết thúc.'
      }))
      return
    }

    setCheckingShiftFrame(true)
    try {
      const isAvailable = await adminAPI.checkShiftFrame({
        startTime: shiftFrameCheck.startTime,
        endTime: shiftFrameCheck.endTime
      })
      setShiftFrameCheck(prev => ({
        ...prev,
        status: !!isAvailable,
        message: isAvailable
          ? 'Khung giờ khả dụng, bạn có thể tạo mới.'
          : 'Khung giờ bị trùng hoặc không hợp lệ.'
      }))
    } catch (error) {
      setShiftFrameCheck(prev => ({
        ...prev,
        status: false,
        message: error.message || 'Không thể kiểm tra khung giờ.'
      }))
    } finally {
      setCheckingShiftFrame(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Find department ID from name
      const selectedDept = departments.find(d => d.name === formData.department)
      if (!selectedDept) {
        alert('Vui lòng chọn phòng ban')
        return
      }

      // Prepare data according to ShiftDTO format
      const submitData = {
        bacsiId: formData.bacsiId || formData.staff?.[0]?.id,
        phongbanId: selectedDept.id,
        khungGioTrucId: formData.shiftFrameId,
        ngayTruc: formData.date,
        ghiChu: formData.notes || ''
      }

      if (!submitData.bacsiId) {
        alert('Vui lòng chọn bác sĩ')
        return
      }

      if (!submitData.khungGioTrucId) {
        alert('Vui lòng chọn ca trực')
        return
      }

      if (!submitData.ngayTruc) {
        alert('Vui lòng chọn ngày trực')
        return
      }
      
      console.log('Submitting schedule:', submitData)
      console.log('Is edit mode:', showEditModal, 'Selected schedule:', selectedSchedule)
      
      if (showEditModal && selectedSchedule && selectedSchedule.id) {
        // Cập nhật lịch qua API
        console.log('Updating schedule with ID:', selectedSchedule.id)
        await adminAPI.updateSchedule(selectedSchedule.id, submitData);
        alert('Cập nhật lịch trực thành công!')
      } else {
        // Thêm lịch mới qua API
        console.log('Creating new schedule')
        await adminAPI.createSchedule(submitData);
        alert('Tạo lịch trực thành công!')
      }
      
      // Refetch lại danh sách ca trực sau thêm/sửa
      const selectedDeptForRefetch = departments.find(d => d.name === selectedDepartment)
      const params = {
        mode: viewMode,
        date: currentDate.toISOString().split('T')[0],
        departmentId: selectedDeptForRefetch?.id,
        page: 0,
        size: 100
      }
      const res = await adminAPI.getSchedules(params);
      setSchedules(mapScheduleData(extractListFromResponse(res)));
      
      // Refetch summary
      const summaryRes = await adminAPI.getShiftSummary({
        date: currentDate.toISOString().split('T')[0],
        departmentId: selectedDeptForRefetch?.id
      })
      if (summaryRes) {
        setShiftSummary({
          totalShifts: summaryRes.totalShifts || 0,
          confirmedShifts: summaryRes.confirmedShifts || 0,
          pendingShifts: summaryRes.pendingShifts || 0
        })
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedSchedule(null);
      setFormData(createEmptyScheduleForm())
    } catch (error) {
      console.error('Error saving schedule:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu lịch trực'
      alert(errorMessage)
    }
  }

  const handleDeleteSchedule = async (id) => {
    if (!id) {
      alert('Không tìm thấy ID của lịch trực cần xóa')
      return
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa lịch trực này?')) {
      try {
        console.log('Deleting schedule with ID:', id)
        await adminAPI.deleteSchedule(id);
        alert('Xóa lịch trực thành công!')
        
        const selectedDept = departments.find(d => d.name === selectedDepartment)
        const params = {
          mode: viewMode,
          date: currentDate.toISOString().split('T')[0],
          departmentId: selectedDept?.id,
          page: 0,
          size: 100
        }
        const res = await adminAPI.getSchedules(params);
        setSchedules(mapScheduleData(extractListFromResponse(res)));
        
        // Refetch summary
        const summaryRes = await adminAPI.getShiftSummary({
          date: currentDate.toISOString().split('T')[0],
          departmentId: selectedDept?.id
        })
        if (summaryRes) {
          setShiftSummary({
            totalShifts: summaryRes.totalShifts || 0,
            confirmedShifts: summaryRes.confirmedShifts || 0,
            pendingShifts: summaryRes.pendingShifts || 0
          })
        }
      } catch (error) {
        console.error('Error deleting schedule:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa lịch trực'
        alert(errorMessage)
      }
    }
  }

  const handleConfirmShift = async (id, confirmed) => {
    try {
      await adminAPI.confirmShift(id, confirmed);
      const selectedDept = departments.find(d => d.name === selectedDepartment)
      const params = {
        mode: viewMode,
        date: currentDate.toISOString().split('T')[0],
        departmentId: selectedDept?.id,
        page: 0,
        size: 100
      }
      const res = await adminAPI.getSchedules(params);
      setSchedules(mapScheduleData(extractListFromResponse(res)));
    } catch (error) {
      console.error('Error confirming shift:', error)
      alert(error.message || 'Có lỗi xảy ra khi xác nhận ca trực')
    }
  }

  const getShiftIcon = (shift) => {
    switch (shift) {
      case 'Ca sáng': return <Activity className="w-4 h-4 text-yellow-500" />
      case 'Ca chiều': return <Activity className="w-4 h-4 text-orange-500" />
      case 'Ca tối': return <Activity className="w-4 h-4 text-blue-500" />
      case 'Ca đêm': return <Activity className="w-4 h-4 text-purple-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getPositionIcon = (position) => {
    switch (position) {
      case 'Bác sĩ': return <Stethoscope className="w-4 h-4 text-blue-600" />
      case 'Y tá': return <UserCheck className="w-4 h-4 text-green-600" />
      case 'Điều dưỡng': return <Users className="w-4 h-4 text-purple-600" />
      default: return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    // Chỉ hiển thị badge cho confirmed hoặc rejected, bỏ pending
    if (status === 'pending') {
      return null
    }
    
    const statusConfig = {
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      confirmed: 'Đã xác nhận',
      rejected: 'Từ chối'
    }
    
    if (!statusConfig[status]) {
      return null
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // Tính toán thống kê (sử dụng từ API summary hoặc fallback)
  const totalSchedules = shiftSummary.totalShifts || schedules.length;
  
  // Tính tổng ca trực trong tuần hiện tại
  const getWeekTotal = () => {
    const today = new Date(currentDate)
    const dayOfWeek = today.getDay() // 0 = CN, 1 = T2, ...
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    const weekSchedules = schedules.filter(s => {
      const scheduleDate = s.date || s.ngayTruc
      if (typeof scheduleDate === 'string') {
        const date = new Date(scheduleDate)
        date.setHours(0, 0, 0, 0)
        return date >= startOfWeek && date <= endOfWeek
      }
      return false
    })
    
    return weekSchedules.length
  }
  
  const weekTotal = getWeekTotal()

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý lịch trực</h1>
            <p className="text-blue-100">Quản lý lịch làm việc và phân công ca trực cho nhân viên</p>
          </div>
          <div className="flex gap-3">
            {/* <Button
              variant="outline"
              icon={<Bell className="w-4 h-4" />}
              onClick={() => console.log('Send notifications')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Gửi thông báo
            </Button> */}
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddSchedule}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Tạo lịch trực
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Tổng ca trực */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng ca trực</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{totalSchedules}</div>
            <div className="text-sm text-gray-500">Trong khoảng thời gian đã chọn</div>
          </div>
        </Card>

        {/* Card 2: Số phòng ban */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Số phòng ban</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{departments.length}</div>
            <div className="text-sm text-gray-500">Đang hoạt động</div>
          </div>
        </Card>

        {/* Card 3: Số bác sĩ */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Số bác sĩ</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{doctors.length}</div>
            <div className="text-sm text-gray-500">Có sẵn</div>
          </div>
        </Card>

        {/* Card 4: Ca trực tuần này */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Ca trực tuần này</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{weekTotal}</div>
            <div className="text-sm text-gray-500">Tuần hiện tại</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm" className="shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              onClick={() => setViewMode('day')}
              size="sm"
            >
              Ngày
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => setViewMode('week')}
              size="sm"
            >
              Tuần
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              onClick={() => setViewMode('month')}
              size="sm"
            >
              Tháng
            </Button>
          </div>

          <input
            type="date"
            value={currentDate.toISOString().split('T')[0]}
            onChange={(e) => setCurrentDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map(dept => {
              const deptName = typeof dept === 'string' ? dept : (dept.name || '')
              const deptId = typeof dept === 'string' ? dept : (dept.id || deptName)
              return (
                <option key={deptId} value={deptName}>
                  {deptName || 'Phòng ban'}
                </option>
              )
            })}
          </select>

          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={async () => {
              try {
                const selectedDept = departments.find(d => d.name === selectedDepartment)
                const params = new URLSearchParams()
                if (currentDate) params.set('date', currentDate.toISOString().split('T')[0])
                if (viewMode) params.set('mode', viewMode)
                if (selectedDept?.id) params.set('departmentId', selectedDept.id)
                
                const token = localStorage.getItem('token')
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
                const url = `${apiBaseUrl}/api/admin/shifts/export?${params.toString()}`
                
                const response = await fetch(url, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                })
                
                if (!response.ok) {
                  throw new Error('Không thể tải file Excel')
                }
                
                const blob = await response.blob()
                const downloadUrl = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = downloadUrl
                
                // Generate filename
                let filename = 'lich_truc'
                if (currentDate) {
                  filename += '_' + currentDate.toISOString().split('T')[0]
                }
                if (selectedDept?.id) {
                  filename += '_dept' + selectedDept.id
                }
                filename += '.xlsx'
                
                link.download = filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(downloadUrl)
              } catch (error) {
                console.error('Error exporting:', error)
                alert('Có lỗi xảy ra khi xuất lịch trực: ' + (error.message || 'Unknown error'))
              }
            }}
          >
            Xuất lịch trực
          </Button>
        </div>
      </Card>

      <Card title="Khung giờ trực ban">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {shiftOptions.map(frame => (
              <div
                key={frame.id || frame.tenKhung}
                className="border border-gray-200 rounded-lg px-4 py-3 min-w-[180px]"
              >
                <div className="font-medium text-gray-900">{frame.tenKhung}</div>
                <div className="text-sm text-gray-500">
                  {frame.gioBatDau && frame.gioKetThuc
                    ? `${frame.gioBatDau} - ${frame.gioKetThuc}`
                    : 'Chưa xác định thời gian'}
                </div>
              </div>
            ))}
            {shiftOptions.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có khung giờ nào.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={shiftFrameCheck.startTime}
                onChange={(e) => setShiftFrameCheck(prev => ({
                  ...prev,
                  startTime: e.target.value,
                  status: null,
                  message: ''
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={shiftFrameCheck.endTime}
                onChange={(e) => setShiftFrameCheck(prev => ({
                  ...prev,
                  endTime: e.target.value,
                  status: null,
                  message: ''
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-transparent mb-1">
                Kiểm tra
              </label>
              <Button
                type="button"
                onClick={handleShiftFrameCheckRequest}
                disabled={checkingShiftFrame}
              >
                {checkingShiftFrame ? 'Đang kiểm tra...' : 'Kiểm tra trùng khung'}
              </Button>
            </div>
            <div>
              {shiftFrameCheck.message && (
                <p className={`text-sm ${
                  shiftFrameCheck.status === null
                    ? 'text-gray-600'
                    : shiftFrameCheck.status
                      ? 'text-green-600'
                      : 'text-red-600'
                }`}>
                  {shiftFrameCheck.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule Calendar View */}
      <Card title="Lịch trực theo ngày">
        {Object.keys(groupedSchedules).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Không có lịch trực nào</p>
            <Button
              className="mt-4"
              onClick={handleAddSchedule}
            >
              Tạo lịch trực đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSchedules)
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .map(([date, daySchedules]) => (
                <div key={date} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(date).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {daySchedules.length} ca trực
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {daySchedules.map(schedule => (
                      <div key={schedule.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getShiftIcon(schedule.shift)}
                            <span className="font-medium text-gray-900">
                              {schedule.shift}
                              {(schedule.gioBatDau && schedule.gioKetThuc) && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({schedule.gioBatDau} - {schedule.gioKetThuc})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<Edit className="w-3 h-3" />}
                              onClick={() => handleEditSchedule(schedule)}
                            />
                            <Button
                              size="sm"
                              variant="danger"
                              icon={<Trash2 className="w-3 h-3" />}
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            />
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <div className="font-medium">{schedule.department}</div>
                        </div>

                        <div className="space-y-1">
                          {schedule.bacsiName ? (
                            <div className="flex items-center text-xs">
                              <div className="flex items-center gap-1">
                                <Stethoscope className="w-3 h-3 text-blue-600" />
                                <span className="text-gray-700">{schedule.bacsiName}</span>
                              </div>
                              {schedule.xacNhan && getStatusBadge('confirmed')}
                            </div>
                          ) : (schedule.staff || []).map((member, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                {getPositionIcon(member.position)}
                                <span className="text-gray-700">{member.name}</span>
                              </div>
                              {getStatusBadge(member.status)}
                            </div>
                          ))}
                        </div>

                        {schedule.notes && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            {schedule.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Schedule Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedSchedule(null)
        }}
        title={showEditModal ? "Sửa lịch trực" : "Tạo lịch trực mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày trực *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ca trực *
              </label>
              <select
                value={formData.shiftFrameId}
                onChange={(e) => handleShiftSelection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn ca trực</option>
                {shiftOptions.map(frame => {
                  const key = frame.id || frame.tenKhung
                  return (
                    <option key={key} value={frame.id}>
                      {buildShiftFrameLabel(frame)}
                    </option>
                  )
                })}
              </select>
              {formData.gioBatDau && formData.gioKetThuc && (
                <p className="text-xs text-gray-500 mt-1">
                  Thời gian: {formData.gioBatDau} - {formData.gioKetThuc}
                </p>
              )}
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
                {departments.map(dept => {
                  const deptName = typeof dept === 'string' ? dept : (dept.name || '')
                  const deptId = typeof dept === 'string' ? dept : (dept.id || deptName)
                  return (
                    <option key={deptId} value={deptName}>
                      {deptName || 'Phòng ban'}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn bác sĩ *
            </label>
            <select
              value={formData.bacsiId || ''}
              onChange={(e) => {
                const doctorId = e.target.value ? parseInt(e.target.value) : null
                const selectedDoctor = doctors.find(d => d.id === doctorId)
                setFormData({
                  ...formData,
                  bacsiId: doctorId,
                  staff: selectedDoctor ? [{
                    id: selectedDoctor.id,
                    name: selectedDoctor.name,
                    position: selectedDoctor.position || 'Bác sĩ',
                    status: 'pending'
                  }] : []
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Chọn bác sĩ</option>
              {doctors
                .filter(doctor => !formData.department || doctor.departmentId === departments.find(d => d.name === formData.department)?.id)
                .map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.position ? `(${doctor.position})` : ''} {doctor.departmentName ? `- ${doctor.departmentName}` : ''}
                  </option>
                ))}
            </select>
            {formData.bacsiId && (
              <p className="mt-1 text-xs text-gray-500">
                Đã chọn: {doctors.find(d => d.id === formData.bacsiId)?.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ghi chú về ca trực..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Lưu ý:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Nhân viên sẽ nhận thông báo về lịch trực mới</li>
              <li>• Có thể thay đổi phân công trước 24h</li>
              <li>• Cần đảm bảo đủ nhân lực cho mỗi ca trực</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedSchedule(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Tạo lịch trực"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ScheduleManagement

