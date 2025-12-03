import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { patientAPI } from '../../services/api'
import { 
  Pill, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  User,
  Stethoscope,
  Clock,
  AlertCircle
} from 'lucide-react'

const PatientPrescriptions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Load đơn thuốc thật từ API bệnh nhân
  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const res = await patientAPI.getPrescriptions()
        const items = res || []

        const mapped = items.map((dt) => {
          const ngayKe = dt.ngayKe
          let dateStr = ''
          if (ngayKe) {
            const d = new Date(ngayKe)
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0]
            } else {
              dateStr = String(ngayKe).split('T')[0]
            }
          }

          return {
            id: dt.donthuocId,
            date: dateStr,
            doctor: dt.bacsi?.hoTen || 'Bác sĩ',
            department: dt.bacsi?.phongban?.tenPhongban || '',
            medicines:
              dt.danhSachChiTiet?.map((ct) => ({
                name: ct.thuoc?.tenThuoc || 'Thuốc',
                dosage: ct.lieuDung || '',
                frequency: ct.soLanUong || '',
                duration: ct.soNgayUong ? `${ct.soNgayUong} ngày` : '',
              })) || [],
            // Hiện tại DB chưa có trạng thái nhận thuốc, để mặc định
            status: 'Đã nhận thuốc',
            notes: dt.ghiChu || '',
            totalCost: 0,
          }
        })

        setPrescriptions(mapped)
      } catch (error) {
        console.error('Lỗi tải đơn thuốc bệnh nhân:', error)
        setPrescriptions([])
      } finally {
        setLoading(false)
      }
    }

    loadPrescriptions()
  }, [])

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medicines.some(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã nhận thuốc':
        return 'bg-green-100 text-green-800'
      case 'Chưa nhận thuốc':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hủy':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetail = (prescription) => {
    setSelectedPrescription(prescription)
    setShowDetailModal(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Đơn thuốc</h1>
          <p className="text-gray-600 mt-1">Quản lý các đơn thuốc đã được kê</p>
        </div>
        <Button icon={<Download className="w-4 h-4" />} variant="secondary">
          Xuất báo cáo
        </Button>
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
                  placeholder="Tìm kiếm theo bác sĩ, thuốc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đã nhận thuốc">Đã nhận thuốc</option>
                <option value="Chưa nhận thuốc">Chưa nhận thuốc</option>
                <option value="Hủy">Hủy</option>
              </select>
              <Button icon={<Filter className="w-4 h-4" />} variant="secondary">
                Bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng đơn thuốc</p>
                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Pill className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã nhận thuốc</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'Đã nhận thuốc').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chưa nhận thuốc</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'Chưa nhận thuốc').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pill className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(prescriptions.reduce((sum, p) => sum + p.totalCost, 0))}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Prescriptions List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách đơn thuốc</h2>
          
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy đơn thuốc nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{prescription.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{prescription.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{prescription.department}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Danh sách thuốc:</h4>
                        <div className="space-y-2">
                          {prescription.medicines.map((medicine, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <Pill className="w-4 h-4 text-blue-600" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{medicine.name}</p>
                                <p className="text-sm text-gray-600">
                                  {medicine.dosage} - {medicine.frequency} - {medicine.duration}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Ghi chú:</h4>
                          <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                            <AlertCircle className="w-4 h-4 inline mr-2 text-yellow-600" />
                            {prescription.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900">
                          Tổng chi phí: {formatCurrency(prescription.totalCost)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        icon={<Eye className="w-4 h-4" />} 
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetail(prescription)}
                      >
                        Xem chi tiết
                      </Button>
                      <Button 
                        icon={<Download className="w-4 h-4" />} 
                        variant="secondary"
                        size="sm"
                      >
                        Tải về
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Prescription Detail Modal */}
      {showDetailModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn thuốc</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày kê đơn</p>
                  <p className="font-medium text-gray-900">{selectedPrescription.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bác sĩ kê đơn</p>
                  <p className="font-medium text-gray-900">{selectedPrescription.doctor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khoa</p>
                  <p className="font-medium text-gray-900">{selectedPrescription.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedPrescription.status
                    )}`}
                  >
                    {selectedPrescription.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Danh sách thuốc</h4>
                <div className="space-y-2">
                  {selectedPrescription.medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <Pill className="w-4 h-4 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage && <span>{med.dosage}</span>}
                          {med.frequency && (
                            <span>
                              {med.dosage ? ' • ' : ''}
                              {med.frequency}
                            </span>
                          )}
                          {med.duration && (
                            <span>
                              {(med.dosage || med.frequency) ? ' • ' : ''}
                              {med.duration}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ghi chú</h4>
                  <p className="text-gray-800 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 inline mr-2 text-yellow-600" />
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientPrescriptions










