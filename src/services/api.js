// API Base Configuration
// In development, use localhost:8090
// In production, use full URL or environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:8090' : 'https://hospital-prj-2025-1-be.onrender.com')

// API Client Class
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('token')
  }

  // Set authentication token
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('token')
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle 401 Unauthorized - Try to refresh token
      if (response.status === 401 && endpoint !== '/api/auth/refresh') {
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (refreshToken) {
          try {
            // Try to refresh token
            const refreshResponse = await fetch(`${this.baseURL}/api/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken: refreshToken }),
            })
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              
              // Save new token
              this.setToken(refreshData.accessToken)
              localStorage.setItem('token', refreshData.accessToken)
              if (refreshData.refreshToken) {
                localStorage.setItem('refreshToken', refreshData.refreshToken)
              }
              
              // Retry request with new token
              const newConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  Authorization: `Bearer ${refreshData.accessToken}`,
                }
              }
              
              const retryResponse = await fetch(url, newConfig)
              
              if (!retryResponse.ok) {
                const errorData = await retryResponse.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`)
              }
              
              // Xử lý phản hồi JSON an toàn khi retry
              const contentType = retryResponse.headers.get('content-type')
              if (contentType && contentType.includes('application/json')) {
                const rawText = await retryResponse.text()
                try {
                  return rawText ? JSON.parse(rawText) : {}
                } catch (parseErr) {
                  const error = new SyntaxError('Invalid JSON from server (after refresh)')
                  error.details = rawText.slice(0, 500)
                  throw error
                }
              }
              
              return retryResponse
            } else {
              // Refresh token failed, logout
              this.setToken(null)
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('hospital_user')
              window.location.href = '/login'
              throw new Error('Session expired')
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            this.setToken(null)
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('hospital_user')
            window.location.href = '/login'
            throw new Error('Session expired')
          }
        } else {
          // No refresh token available
          this.setToken(null)
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Xử lý phản hồi JSON an toàn: backend có thể trả JSON không hợp lệ
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const rawText = await response.text()
        try {
          return rawText ? JSON.parse(rawText) : {}
        } catch (parseErr) {
          const error = new SyntaxError('Invalid JSON from server')
          error.details = rawText.slice(0, 500)
          throw error
        }
      }
      
      return response
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options })
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    })
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options })
  }

  // Download file (for Excel, PDF, etc.)
  async downloadFile(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const config = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.blob()
    } catch (error) {
      console.error('File Download Error:', error)
      throw error
    }
  }
}

// Create API client instance
const apiClient = new ApiClient()

// Authentication APIs
export const authAPI = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  register: (userData) => apiClient.post('/api/auth/register', userData),
  verifyOTP: (otpData) => apiClient.post('/api/auth/verify-register-otp', otpData),
  resendOTP: (email) => apiClient.post('/api/auth/resend-register-otp', { email }),
  refresh: (refreshToken) => apiClient.post('/api/auth/refresh', { refreshToken }),
  debugOTP: (email) => apiClient.get(`/api/auth/debug-otp/${email}`),
  logout: () => apiClient.post('/api/auth/logout'),
  forgotPassword: (data) => apiClient.post('/api/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/api/auth/reset-password', data),
}

// Patient APIs
export const patientAPI = {
  // Profile management
  getProfile: () => apiClient.get('/api/patient/profile'),
  updateProfile: (data) => apiClient.put('/api/patient/profile', data),
  register: (data) => apiClient.post('/api/patient/register', data),

  // Doctors for booking
  getDoctors: ({ page = 0, size = 6 } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('size', size)
    return apiClient.get(`/api/patient/doctors?${params.toString()}`)
  },

  // Appointments
  getAppointments: () => apiClient.get('/api/patient/appointments'),
  bookAppointment: (data) => apiClient.post('/api/patient/appointments', data),
  updateAppointment: (id, data) => apiClient.put(`/api/patient/appointments/${id}`, data),
  cancelAppointment: (id) => apiClient.put(`/api/patient/appointments/${id}/cancel`),

  // Prescriptions
  getPrescriptions: () => apiClient.get('/api/patient/prescriptions'),
  getPrescriptionDetail: (id) => apiClient.get(`/api/patient/prescriptions/${id}`),

  // Bills and payments
  getBills: () => apiClient.get('/api/patient/bills'),
  getBillDetail: (id) => apiClient.get(`/api/patient/bills/${id}`),
  payBill: (id, data) => apiClient.post(`/api/patient/bills/${id}/pay`, data),

  // Lab results
  getLabResults: () => apiClient.get('/api/patient/lab-results'),
  getLabResultDetail: (id) => apiClient.get(`/api/patient/lab-results/${id}`),

  // Medical history
  getMedicalHistory: () => apiClient.get('/api/patient/medical-history'),
}

// Doctor APIs
export const doctorAPI = {
  // Profile management
  getProfile: () => apiClient.get('/api/doctor/profile'),
  updateProfile: (data) => apiClient.put('/api/doctor/profile', data),

  // Appointments
  getAppointments: ({ status, date, page = 0, size = 100 } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (date) params.set('date', date)
    if (page !== undefined) params.set('page', page)
    if (size !== undefined) params.set('size', size)
    const query = params.toString()
    return apiClient.get(`/api/doctor/appointments${query ? `?${query}` : ''}`)
  },
  approveAppointment: (id) => apiClient.put(`/api/doctor/appointments/${id}/approve`),
  rejectAppointment: (id) => apiClient.put(`/api/doctor/appointments/${id}/reject`),
  completeAppointment: (id) => apiClient.put(`/api/doctor/appointments/${id}/complete`),

  // Prescriptions
  getPrescriptions: ({ patientId, page = 0, size = 20 } = {}) => {
    const params = new URLSearchParams()
    if (patientId) params.set('patientId', patientId)
    if (page !== undefined) params.set('page', page)
    if (size !== undefined) params.set('size', size)
    const query = params.toString()
    return apiClient.get(`/api/doctor/prescriptions${query ? `?${query}` : ''}`)
  },
  getPrescriptionDetail: (id) => apiClient.get(`/api/doctor/prescriptions/${id}`),
  createPrescription: (data) => apiClient.post('/api/doctor/prescriptions', data),
  getMedicines: ({ search, page = 0, size = 1000 } = {}) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (page !== undefined) params.set('page', page)
    if (size !== undefined) params.set('size', size)
    const query = params.toString()
    return apiClient.get(`/api/doctor/medicines${query ? `?${query}` : ''}`)
  },

  // Lab tests
  getLabTests: () => apiClient.get('/api/doctor/lab-tests'),
  createLabTest: (data) => apiClient.post('/api/doctor/lab-tests', data),
  updateLabTestResult: (id, data) => apiClient.put(`/api/doctor/lab-tests/${id}/results`, data),

  // Surgeries
  getSurgeryRequests: () => apiClient.get('/api/doctor/surgeries/requests'),
  getSurgerySchedule: () => apiClient.get('/api/doctor/surgeries/schedule'),
  createSurgeryRequest: (data) => apiClient.post('/api/doctor/surgeries/request', data),

  // Schedule
  getSchedule: ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    const query = params.toString()
    return apiClient.get(`/api/doctor/schedule${query ? `?${query}` : ''}`)
  },
  updateSchedule: (data) => apiClient.post('/api/doctor/schedule', data),

  // Patients
  getPatientStats: () => apiClient.get('/api/doctor/patients/stats'),
  getPatients: ({ search, appointmentStatus, page = 0, size = 20 } = {}) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (appointmentStatus) params.set('appointmentStatus', appointmentStatus)
    if (page !== undefined) params.set('page', page)
    if (size !== undefined) params.set('size', size)
    const query = params.toString()
    return apiClient.get(`/api/doctor/patients${query ? `?${query}` : ''}`)
  },
  getPatientMedicalHistory: (id, { page = 0, size = 10 } = {}) => {
    const params = new URLSearchParams()
    if (page !== undefined) params.set('page', page)
    if (size !== undefined) params.set('size', size)
    const query = params.toString()
    return apiClient.get(`/api/doctor/patients/${id}/medical-history${query ? `?${query}` : ''}`)
  },
  getPatientAppointments: (patientId, page = 0, size = 100) => {
    const params = new URLSearchParams()
    if (patientId) params.set('patientId', patientId)
    params.set('page', page)
    params.set('size', size)
    return apiClient.get(`/api/doctor/appointments?${params.toString()}`)
  },

  // Medical records
  getMedicalRecords: ({ patientId, page = 0, size = 100 } = {}) => {
    const params = new URLSearchParams()
    if (patientId) params.set('patientId', patientId)
    if (page !== undefined) params.set('page', page)
    if (size !== undefined) params.set('size', size)
    const query = params.toString()
    return apiClient.get(`/api/doctor/medical-records${query ? `?${query}` : ''}`)
  },
  createMedicalRecord: (data) => apiClient.post('/api/doctor/medical-records', data),

  // Bills
  getBills: ({ patientId, status, page = 0, size = 20 } = {}) => {
    const params = new URLSearchParams()
    if (patientId) params.set('patientId', patientId)
    if (status) params.set('status', status)
    if (page !== undefined) params.set('page', page)
    if (size !== undefined) params.set('size', size)
    const query = params.toString()
    return apiClient.get(`/api/doctor/bills${query ? `?${query}` : ''}`)
  },

  // Dashboard Statistics
  getDashboardStats: (date) => {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    const query = params.toString()
    return apiClient.get(`/api/doctor/dashboard/stats${query ? `?${query}` : ''}`)
  },
  getAppointmentStats: (date) => {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    const query = params.toString()
    return apiClient.get(`/api/doctor/appointments/stats${query ? `?${query}` : ''}`)
  },
  getPrescriptionStats: (date) => {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    const query = params.toString()
    return apiClient.get(`/api/doctor/prescriptions/stats${query ? `?${query}` : ''}`)
  },
}

// Admin APIs
export const adminAPI = {
  // User management
  getUsers: (page = 0, size = 20) => apiClient.get(`/api/admin/users?page=${page}&size=${size}`),
  getUserDetail: (id) => apiClient.get(`/api/admin/users/${id}`),
  createUser: (data) => apiClient.post('/api/admin/users', data),
  updateUser: (id, data) => apiClient.put(`/api/admin/users/${id}`, data),
  toggleUserStatus: (id) => apiClient.put(`/api/admin/users/${id}/toggle-status`),
  deleteUser: (id) => apiClient.delete(`/api/admin/users/${id}`),

  // Doctor management
  getDoctors: (page = 0, size = 20, { search, position, departmentId, startDate, endDate, sortField, sortDir } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('size', size)
    if (search) params.set('search', search)
    if (position) params.set('position', position)
    if (departmentId) params.set('phongbanId', departmentId)
    if (startDate || endDate) {
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      return apiClient.get(`/api/admin/doctors/by-date?${params.toString()}`)
    }
    return apiClient.get(`/api/admin/doctors?${params.toString()}`)
  },
  countDoctors: () => apiClient.get('/api/admin/doctors/count'),
  getDoctorById: (id) => apiClient.get(`/api/admin/doctors/${id}`),
  createDoctor: (data) => apiClient.post('/api/admin/doctors', data),
  updateDoctor: (id, data) => apiClient.put(`/api/admin/doctors/${id}`, data),
  deleteDoctor: (id) => apiClient.delete(`/api/admin/doctors/${id}`),

  // Staff management
  getStaff: (page = 0, size = 20, { search, chucVu, departmentId, startDate, endDate, sortField, sortDir } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('size', size)
    if (search) params.set('search', search)
    if (chucVu) params.set('chucVu', chucVu)
    if (departmentId) params.set('phongbanId', departmentId)
    if (startDate || endDate) {
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      return apiClient.get(`/api/admin/staff/by-date?${params.toString()}`)
    }
    return apiClient.get(`/api/admin/staff?${params.toString()}`)
  },
  countStaff: () => apiClient.get('/api/admin/staff/count'),
  getStaffById: (id) => apiClient.get(`/api/admin/staff/${id}`),
  countNurses: () => apiClient.get('/api/admin/nurses/count'),
  createStaff: (data) => apiClient.post('/api/admin/staff', data),
  updateStaff: (id, data) => apiClient.put(`/api/admin/staff/${id}`, data),
  deleteStaff: (id) => apiClient.delete(`/api/admin/staff/${id}`),

  // Department management
  getDepartments: () => apiClient.get('/api/admin/departments'),
  createDepartment: (data) => apiClient.post('/api/admin/departments', data),
  updateDepartment: (id, data) => apiClient.put(`/api/admin/departments/${id}`, data),
  deleteDepartment: (id) => apiClient.delete(`/api/admin/departments/${id}`),

  // Shift frame management
  getShiftFrames: () => apiClient.get('/api/admin/shift-frames'),
  checkShiftFrame: ({ startTime, endTime }) => {
    if (!startTime || !endTime) {
      return Promise.reject(new Error('Thiếu thông tin giờ bắt đầu hoặc kết thúc'))
    }
    const params = new URLSearchParams()
    params.set('startTime', startTime)
    params.set('endTime', endTime)
    return apiClient.get(`/api/admin/shift-frames/check?${params.toString()}`)
  },

  // Medicine management
  getMedicines: (page = 0, size = 20, { search, nhaSanXuat, nhomThuoc, dangBaoChe, expiringBefore, sortField, sortDir } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('size', size)
    if (search) params.set('search', search)
    if (nhaSanXuat) params.set('nhaSanXuat', nhaSanXuat)
    if (nhomThuoc) params.set('nhomThuoc', nhomThuoc)
    if (dangBaoChe) params.set('dangBaoChe', dangBaoChe)
    if (expiringBefore) params.set('expiringBefore', expiringBefore)
    if (sortField) {
      const dir = (sortDir || 'asc').toLowerCase()
      params.set('sort', `${sortField},${dir}`)
    }
    return apiClient.get(`/api/admin/medicines?${params.toString()}`)
  },
  getMedicineStats: () => apiClient.get('/api/admin/medicines/stats'),
  getDosageForms: () => apiClient.get('/api/admin/medicines/dosage-forms'),
  getGroups: () => apiClient.get('/api/admin/medicines/groups'),
  createMedicine: (data) => apiClient.post('/api/admin/medicines', data),
  updateMedicine: (id, data) => apiClient.put(`/api/admin/medicines/${id}`, data),
  deleteMedicine: (id) => apiClient.delete(`/api/admin/medicines/${id}`),

  // Reports
  getOverviewReport: () => apiClient.get('/api/admin/reports/overview'),
  getRevenueReport: () => apiClient.get('/api/admin/reports/revenue'),
  getAppointmentsReport: () => apiClient.get('/api/admin/reports/appointments'),
  getMedicinesReport: () => apiClient.get('/api/admin/reports/medicines'),
  getUserActivityReport: () => apiClient.get('/api/admin/reports/user-activity'),

  // Patient management
  getPatients: (page = 0, size = 20, { search, gender, status, minAge, maxAge } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('size', size)
    if (search) params.set('search', search)
    if (gender) params.set('gender', gender)
    if (status) params.set('status', status)
    if (minAge) params.set('minAge', minAge)
    if (maxAge) params.set('maxAge', maxAge)
    return apiClient.get(`/api/admin/patients?${params.toString()}`)
  },
  getPatientById: (id) => apiClient.get(`/api/admin/patients/${id}`),
  getPatientMedicalRecords: (id) => apiClient.get(`/api/admin/patients/${id}/medical-records`),
  createPatient: (data) => apiClient.post('/api/admin/patients', data),
  updatePatient: (id, data) => apiClient.put(`/api/admin/patients/${id}`, data),
  deletePatient: (id) => apiClient.delete(`/api/admin/patients/${id}`),
  getPatientStats: () => apiClient.get('/api/admin/patients/stats'),

  // Prescription management
  getPrescriptions: (page = 0, size = 20, { search, doctorId, patientId } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('size', size)
    if (search) params.set('search', search)
    if (doctorId) params.set('doctorId', doctorId)
    if (patientId) params.set('patientId', patientId)
    return apiClient.get(`/api/admin/prescriptions?${params.toString()}`)
  },
  getPrescriptionDetail: (id) => apiClient.get(`/api/admin/prescriptions/${id}`),

  // Lab test management
  getLabTests: (page = 0, size = 20, { search, doctorId, patientId } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('size', size)
    if (search) params.set('search', search)
    if (doctorId) params.set('doctorId', doctorId)
    if (patientId) params.set('patientId', patientId)
    return apiClient.get(`/api/admin/lab-tests?${params.toString()}`)
  },
  getLabTestDetail: (id) => apiClient.get(`/api/admin/lab-tests/${id}`),

  // Invoice management
  getInvoices: (page = 0, size = 20, { search, status } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('size', size)
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    return apiClient.get(`/api/admin/invoices?${params.toString()}`)
  },
  getInvoiceDetail: (id) => apiClient.get(`/api/admin/invoices/${id}`),
  getInvoiceStats: () => apiClient.get('/api/admin/invoices/stats'),

  // System configuration
  getConfig: () => apiClient.get('/api/admin/config'),
  updateConfig: (data) => apiClient.put('/api/admin/config', data),
  createBackup: () => apiClient.post('/api/admin/backup'),
  getAuditLogs: () => apiClient.get('/api/admin/audit-logs'),

  // Schedule management (lịch trực/ca trực)
  getSchedules: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.mode) queryParams.set('mode', params.mode)
    if (params.date) queryParams.set('date', params.date)
    if (params.departmentId) queryParams.set('departmentId', params.departmentId)
    if (params.bacsiId) queryParams.set('bacsiId', params.bacsiId)
    if (params.page !== undefined) queryParams.set('page', params.page)
    if (params.size !== undefined) queryParams.set('size', params.size)
    if (params.sort) queryParams.set('sort', params.sort)
    const queryString = queryParams.toString()
    return apiClient.get(`/api/admin/shifts${queryString ? '?' + queryString : ''}`)
  },
  getShiftById: (id) => apiClient.get(`/api/admin/shifts/${id}`),
  createSchedule: (data) => apiClient.post('/api/admin/shifts', data),
  updateSchedule: (id, data) => apiClient.put(`/api/admin/shifts/${id}`, data),
  deleteSchedule: (id) => apiClient.delete(`/api/admin/shifts/${id}`),
  confirmShift: (id, confirmed) => apiClient.put(`/api/admin/shifts/${id}/confirm?confirmed=${confirmed}`),
  getShiftSummary: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.date) queryParams.set('date', params.date)
    if (params.departmentId) queryParams.set('departmentId', params.departmentId)
    const queryString = queryParams.toString()
    return apiClient.get(`/api/admin/shifts/summary${queryString ? '?' + queryString : ''}`)
  },
  // Doctors list used for schedule management (tránh trùng tên với getDoctors quản lý bác sĩ)
  getShiftDoctors: (departmentId = null) => {
    const queryString = departmentId ? `?departmentId=${departmentId}` : ''
    return apiClient.get(`/api/admin/shifts/doctors${queryString}`)
  },
  getShiftFramesFromShifts: () => apiClient.get('/api/admin/shifts/shift-frames'),
  exportShifts: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.date) queryParams.set('date', params.date)
    if (params.mode) queryParams.set('mode', params.mode)
    if (params.departmentId) queryParams.set('departmentId', params.departmentId)
    const queryString = queryParams.toString()
    return apiClient.downloadFile(`/api/admin/shifts/export${queryString ? '?' + queryString : ''}`)
  },
}

// Pharmacy APIs
export const pharmacyAPI = {
  // Medicine management
  getMedicines: () => apiClient.get('/api/pharmacy/medicines'),
  getMedicineDetail: (id) => apiClient.get(`/api/pharmacy/medicines/${id}`),
  updateMedicine: (id, data) => apiClient.put(`/api/pharmacy/medicines/${id}`, data),

  // Inventory management
  getInventory: () => apiClient.get('/api/pharmacy/inventory'),
  getInventoryDetail: (id) => apiClient.get(`/api/pharmacy/inventory/${id}`),
  importInventory: (data) => apiClient.post('/api/pharmacy/inventory/import', data),
  updateInventoryQuantity: (id, data) => apiClient.put(`/api/pharmacy/inventory/${id}/quantity`, data),
  getExpiringMedicines: () => apiClient.get('/api/pharmacy/inventory/expiring'),
  getLowStockMedicines: () => apiClient.get('/api/pharmacy/inventory/low-stock'),

  // Prescription management
  getPendingPrescriptions: () => apiClient.get('/api/pharmacy/prescriptions/pending'),
  getPrescriptionDetail: (id) => apiClient.get(`/api/pharmacy/prescriptions/${id}`),
  processPrescription: (id, data) => apiClient.put(`/api/pharmacy/prescriptions/${id}/process`, data),
  completePrescription: (id) => apiClient.put(`/api/pharmacy/prescriptions/${id}/complete`),
  rejectPrescription: (id, data) => apiClient.put(`/api/pharmacy/prescriptions/${id}/reject`, data),
  getPrescriptionHistory: () => apiClient.get('/api/pharmacy/prescriptions/history'),

  // Orders
  getOrders: () => apiClient.get('/api/pharmacy/orders'),
  getOrderDetail: (id) => apiClient.get(`/api/pharmacy/orders/${id}`),
  confirmOrder: (id) => apiClient.put(`/api/pharmacy/orders/${id}/confirm`),
  rejectOrder: (id, data) => apiClient.put(`/api/pharmacy/orders/${id}/reject`, data),

  // Reports
  getInventoryReport: () => apiClient.get('/api/pharmacy/reports/inventory'),
  getStockMovementReport: () => apiClient.get('/api/pharmacy/reports/stock-movement'),
  getMedicineUsageReport: () => apiClient.get('/api/pharmacy/reports/medicine-usage'),

  // Bills
  getBills: () => apiClient.get('/api/pharmacy/bills'),
}

// Lab APIs
export const labAPI = {
  // Test management
  getPendingTests: () => apiClient.get('/api/lab/tests/pending'),
  getTestDetail: (id) => apiClient.get(`/api/lab/tests/${id}`),
  startTest: (id) => apiClient.put(`/api/lab/tests/${id}/start`),
  updateTestResult: (id, data) => apiClient.put(`/api/lab/tests/${id}/results`, data),
  completeTest: (id) => apiClient.put(`/api/lab/tests/${id}/complete`),
  rejectTest: (id, data) => apiClient.put(`/api/lab/tests/${id}/reject`, data),
  getTestHistory: () => apiClient.get('/api/lab/tests/history'),

  // Sample management
  getSamples: () => apiClient.get('/api/lab/samples'),
  receiveSample: (data) => apiClient.post('/api/lab/samples/receive', data),
  updateSampleStatus: (id, data) => apiClient.put(`/api/lab/samples/${id}/status`, data),

  // Equipment management
  getEquipment: () => apiClient.get('/api/lab/equipment'),
  updateEquipmentStatus: (id, data) => apiClient.put(`/api/lab/equipment/${id}/status`, data),
  reportEquipmentIssue: (id, data) => apiClient.post(`/api/lab/equipment/${id}/report-issue`, data),

  // Reports
  getActivityReport: () => apiClient.get('/api/lab/reports/activity'),
  getTestResultsReport: () => apiClient.get('/api/lab/reports/test-results'),
  getEquipmentReport: () => apiClient.get('/api/lab/reports/equipment'),

  // By doctor and patient
  getTestsByDoctor: (id) => apiClient.get(`/api/lab/tests/by-doctor/${id}`),
  getTestsByPatient: (id) => apiClient.get(`/api/lab/tests/by-patient/${id}`),
}

// Accountant APIs
export const accountantAPI = {
  // Bill management
  getBills: () => apiClient.get('/api/accountant/bills'),
  getBillDetail: (id) => apiClient.get(`/api/accountant/bills/${id}`),
  createBill: (data) => apiClient.post('/api/accountant/bills', data),
  updateBill: (id, data) => apiClient.put(`/api/accountant/bills/${id}`, data),
  confirmBill: (id) => apiClient.put(`/api/accountant/bills/${id}/confirm`),
  cancelBill: (id) => apiClient.put(`/api/accountant/bills/${id}/cancel`),

  // Payment management
  getPayments: () => apiClient.get('/api/accountant/payments'),
  getPaymentDetail: (id) => apiClient.get(`/api/accountant/payments/${id}`),
  confirmPayment: (id) => apiClient.put(`/api/accountant/payments/${id}/confirm`),
  rejectPayment: (id, data) => apiClient.put(`/api/accountant/payments/${id}/reject`, data),
  refundPayment: (id, data) => apiClient.post(`/api/accountant/payments/${id}/refund`, data),

  // Payment history
  getPaymentHistory: () => apiClient.get('/api/accountant/payment-history'),

  // Reports
  getRevenueReport: ({ startDate, endDate, groupBy } = {}) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (groupBy) params.set('groupBy', groupBy)
    return apiClient.get(`/api/accountant/reports/revenue?${params.toString()}`)
  },
  getBillsReport: ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return apiClient.get(`/api/accountant/reports/bills?${params.toString()}`)
  },
  getPaymentsReport: ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return apiClient.get(`/api/accountant/reports/payments?${params.toString()}`)
  },
  getFinancialSummaryReport: ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return apiClient.get(`/api/accountant/reports/financial-summary?${params.toString()}`)
  },

  // Debt management
  getDebts: () => apiClient.get('/api/accountant/debts'),
  updateDebtStatus: (id, data) => apiClient.put(`/api/accountant/debts/${id}/status`, data),

  // Service fees
  getServiceFees: () => apiClient.get('/api/accountant/service-fees'),
  updateServiceFee: (id, data) => apiClient.put(`/api/accountant/service-fees/${id}`, data),
}

// Nurse APIs
export const nurseAPI = {
  // Profile management
  getProfile: () => apiClient.get('/api/nurse/profile'),
  updateProfile: (data) => apiClient.put('/api/nurse/profile', data),

  // Patient management
  getAssignedPatients: () => apiClient.get('/api/nurse/assigned-patients'),
  getPatientDetail: (id) => apiClient.get(`/api/nurse/patients/${id}`),
  updatePatientCondition: (id, data) => apiClient.put(`/api/nurse/patients/${id}/condition`, data),
  addCareNote: (id, data) => apiClient.post(`/api/nurse/patients/${id}/care-notes`, data),
  getCareHistory: (id) => apiClient.get(`/api/nurse/patients/${id}/care-history`),

  // Room management
  getRooms: () => apiClient.get('/api/nurse/rooms'),
  getRoomDetail: (id) => apiClient.get(`/api/nurse/rooms/${id}`),
  updateRoomStatus: (id, data) => apiClient.put(`/api/nurse/rooms/${id}/status`, data),
  reportRoomIssue: (id, data) => apiClient.post(`/api/nurse/rooms/${id}/report-issue`, data),

  // Prescription management
  getPrescriptionsToAdminister: () => apiClient.get('/api/nurse/prescriptions/to-administer'),
  administerPrescription: (id) => apiClient.put(`/api/nurse/prescriptions/${id}/administer`),

  // Vital signs
  addVitalSigns: (id, data) => apiClient.post(`/api/nurse/patients/${id}/vital-signs`, data),
  getVitalSignsHistory: (id) => apiClient.get(`/api/nurse/patients/${id}/vital-signs-history`),

  // Schedule
  getSchedule: () => apiClient.get('/api/nurse/schedule'),
  updateSchedule: (data) => apiClient.post('/api/nurse/schedule', data),

  // Reports
  getCareActivityReport: () => apiClient.get('/api/nurse/reports/care-activity'),
  getRoomStatusReport: () => apiClient.get('/api/nurse/reports/room-status'),
}

// Export API client for direct access if needed
export { apiClient }
export default {
  auth: authAPI,
  patient: patientAPI,
  doctor: doctorAPI,
  admin: adminAPI,
  pharmacy: pharmacyAPI,
  lab: labAPI,
  accountant: accountantAPI,
  nurse: nurseAPI,
}

