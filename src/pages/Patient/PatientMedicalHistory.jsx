import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { patientAPI } from '../../services/api'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Activity
} from 'lucide-react'

const PatientMedicalHistory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [medicalHistory, setMedicalHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Load lịch sử khám bệnh thật từ API
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await patientAPI.getMedicalHistory()
        const items = res || []

        const statusMap = {
          HOAN_THANH: 'Hoàn thành',
          DANG_DIEU_TRI: 'Đang điều trị',
          HUY: 'Hủy',
        }

        const mapped = items.map((ba) => {
          const ngayKham = ba.ngayKham || ba.ngayNhapVien || null
          let dateStr = ''
          if (ngayKham) {
            const d = new Date(ngayKham)
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0]
            } else {
              dateStr = String(ngayKham).split('T')[0]
            }
          }

          return {
            id: ba.benhanId,
            date: dateStr,
            doctor: ba.bacsi?.hoTen || 'Bác sĩ',
            department: ba.bacsi?.phongban?.tenPhongban || '',
            diagnosis: ba.hoSoKham?.chanDoan || '',
            symptoms: ba.hoSoKham?.trieuChung || '',
            treatment: ba.phacDoDieuTri || '',
            status: statusMap[ba.trangThai] || 'Hoàn thành',
            notes: ba.ghiChu || '',
          }
        })

        setMedicalHistory(mapped)
      } catch (error) {
        console.error('Lỗi tải lịch sử khám bệnh:', error)
        setMedicalHistory([])
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const filteredHistory = medicalHistory.filter(record => {
    const matchesSearch = 
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800'
      case 'Đang điều trị':
        return 'bg-blue-100 text-blue-800'
      case 'Hủy':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetail = (record) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
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
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử khám bệnh</h1>
          <p className="text-gray-600 mt-1">Xem lại các lần khám bệnh trước đây</p>
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
                  placeholder="Tìm kiếm theo bác sĩ, chẩn đoán, triệu chứng..."
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
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đang điều trị">Đang điều trị</option>
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
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng lần khám</p>
                <p className="text-2xl font-bold text-gray-900">{medicalHistory.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {medicalHistory.filter(r => r.status === 'Hoàn thành').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang điều trị</p>
                <p className="text-2xl font-bold text-gray-900">
                  {medicalHistory.filter(r => r.status === 'Đang điều trị').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bác sĩ đã khám</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(medicalHistory.map(r => r.doctor)).size}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Medical History List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách lịch sử khám bệnh</h2>
          
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy lịch sử khám bệnh nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{record.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{record.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{record.department}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Chẩn đoán</h4>
                          <p className="text-gray-600">{record.diagnosis}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Triệu chứng</h4>
                          <p className="text-gray-600">{record.symptoms}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Điều trị</h4>
                          <p className="text-gray-600">{record.treatment}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Ghi chú</h4>
                          <p className="text-gray-600">{record.notes}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        icon={<Eye className="w-4 h-4" />} 
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetail(record)}
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

      {/* Medical Record Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Chi tiết lần khám ngày {selectedRecord.date}
              </h3>
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
                  <p className="text-sm text-gray-500">Bác sĩ</p>
                  <p className="font-medium text-gray-900">{selectedRecord.doctor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khoa</p>
                  <p className="font-medium text-gray-900">{selectedRecord.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedRecord.status
                    )}`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Chẩn đoán</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedRecord.diagnosis || 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Triệu chứng</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedRecord.symptoms || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Phác đồ điều trị</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedRecord.treatment || 'Chưa cập nhật'}
                </p>
              </div>

              {selectedRecord.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Ghi chú của bác sĩ</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {selectedRecord.notes}
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

export default PatientMedicalHistory










