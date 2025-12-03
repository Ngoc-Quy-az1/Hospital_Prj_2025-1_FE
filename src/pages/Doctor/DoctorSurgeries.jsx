import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { Calendar, Activity, ClipboardSignature } from 'lucide-react'

const DoctorSurgeries = () => {
  const [patients, setPatients] = useState([])
  const [requests, setRequests] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [requestForm, setRequestForm] = useState({
    patientId: '',
    surgeryType: '',
    plannedDate: '',
    description: '',
    notes: '',
    estimatedCost: ''
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [patientsRes, requestsRes, scheduleRes] = await Promise.all([
          doctorAPI.getPatients({ page: 0, size: 200 }),
          doctorAPI.getSurgeryRequests(),
          doctorAPI.getSurgerySchedule()
        ])

        const patientsData = patientsRes.content || patientsRes.data || []
        setPatients(
          patientsData.map((patient) => ({
            id: patient.benhnhanId || patient.id,
            name: patient.hoTen || patient.name || 'Không xác định',
            patientCode:
              patient.maBenhNhan ||
              patient.patientCode ||
              `BN${String(patient.benhnhanId || patient.id).padStart(3, '0')}`
          }))
        )

        setRequests(requestsRes.content || requestsRes.data || requestsRes || [])
        setSchedule(scheduleRes.content || scheduleRes.data || scheduleRes || [])
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu phẫu thuật:', err)
        alert('Không thể tải dữ liệu phẫu thuật')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const refreshData = async () => {
    try {
      const [requestsRes, scheduleRes] = await Promise.all([
        doctorAPI.getSurgeryRequests(),
        doctorAPI.getSurgerySchedule()
      ])
      setRequests(requestsRes.content || requestsRes.data || requestsRes || [])
      setSchedule(scheduleRes.content || scheduleRes.data || scheduleRes || [])
    } catch (err) {
      console.error('Lỗi khi tải lại dữ liệu phẫu thuật:', err)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    if (
      !requestForm.patientId ||
      !requestForm.surgeryType ||
      !requestForm.plannedDate ||
      !requestForm.estimatedCost
    ) {
      alert('Vui lòng điền đầy đủ thông tin yêu cầu phẫu thuật')
      return
    }

    try {
      setCreating(true)
      await doctorAPI.createSurgeryRequest({
        benhnhanId: parseInt(requestForm.patientId, 10),
        loaiPhauThuat: requestForm.surgeryType,
        ngayDuKien: requestForm.plannedDate,
        moTa: requestForm.description,
        ghiChu: requestForm.notes,
        chiPhiDuKien: parseFloat(requestForm.estimatedCost)
      })

      await refreshData()
      setRequestForm({
        patientId: '',
        surgeryType: '',
        plannedDate: '',
        description: '',
        notes: '',
        estimatedCost: ''
      })
      alert('Tạo yêu cầu phẫu thuật thành công!')
    } catch (err) {
      console.error('Lỗi khi tạo yêu cầu phẫu thuật:', err)
      alert('Không thể tạo yêu cầu: ' + (err.message || 'Vui lòng thử lại'))
    } finally {
      setCreating(false)
    }
  }

  const getPatientLabel = (patientId) => {
    const patient = patients.find((p) => p.id === patientId)
    return patient ? `${patient.patientCode} - ${patient.name}` : 'Không xác định'
  }

  const formatDateTime = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu phẫu thuật...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phẫu thuật</h1>
          <p className="text-gray-600 mt-1">Tạo yêu cầu và theo dõi lịch phẫu thuật</p>
        </div>
        <Button variant="outline" onClick={refreshData}>
          Tải lại
        </Button>
      </div>

      <Card title="Tạo yêu cầu phẫu thuật">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bệnh nhân *</label>
              <select
                value={requestForm.patientId}
                onChange={(e) => setRequestForm({ ...requestForm, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Chọn bệnh nhân --</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientCode} - {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại phẫu thuật *</label>
              <input
                type="text"
                value={requestForm.surgeryType}
                onChange={(e) => setRequestForm({ ...requestForm, surgeryType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến *</label>
              <input
                type="date"
                value={requestForm.plannedDate}
                onChange={(e) => setRequestForm({ ...requestForm, plannedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí dự kiến (VNĐ) *</label>
              <input
                type="number"
                min="0"
                value={requestForm.estimatedCost}
                onChange={(e) => setRequestForm({ ...requestForm, estimatedCost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={requestForm.description}
              onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mô tả chi tiết về ca phẫu thuật..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={requestForm.notes}
              onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ghi chú thêm..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={creating}>
              {creating ? 'Đang tạo...' : 'Tạo yêu cầu'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Danh sách yêu cầu phẫu thuật">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardSignature className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Chưa có yêu cầu phẫu thuật nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại phẫu thuật
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày dự kiến
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chi phí dự kiến
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.ycptId || request.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{getPatientLabel(request.benhnhan?.benhnhanId)}</div>
                      <div className="text-xs text-gray-500">
                        {request.benhnhan?.hoTen || request.benhnhan?.name || 'Không xác định'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{request.loaiPhauThuat}</div>
                      {request.moTa && <div className="text-xs text-gray-500">{request.moTa}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {request.ngayDuKien
                        ? new Date(request.ngayDuKien).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {request.chiPhiDuKien
                        ? `${Number(request.chiPhiDuKien).toLocaleString('vi-VN')} VNĐ`
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                        {(request.tinhTrang || '').replaceAll('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Lịch phẫu thuật sắp tới">
        {schedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Chưa có lịch phẫu thuật nào
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map((item) => (
              <div
                key={item.caId || item.id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {item.yeuCauPhauThuat?.loaiPhauThuat || 'Phẫu thuật'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Bệnh nhân:{' '}
                    {item.yeuCauPhauThuat?.benhnhan?.hoTen ||
                      item.yeuCauPhauThuat?.benhnhan?.name ||
                      'Không xác định'}
                  </div>
                  {item.kipMo && (
                    <div className="text-xs text-gray-500">Kíp mổ: {item.kipMo}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDateTime(item.ngayGio)}
                  </div>
                  <div>|</div>
                  <div>Phòng: {item.phongPhauThuat || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default DoctorSurgeries

