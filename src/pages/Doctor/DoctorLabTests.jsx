import React, { useEffect, useMemo, useState } from 'react'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { Calendar, FlaskConical, ClipboardList } from 'lucide-react'

const DoctorLabTests = () => {
  const [labTests, setLabTests] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [resultUpdating, setResultUpdating] = useState(false)

  const [requestForm, setRequestForm] = useState({
    patientId: '',
    testType: '',
    testDate: '',
    notes: ''
  })

  const [resultForm, setResultForm] = useState({
    labTestId: null,
    ketQua: '',
    ghiChu: ''
  })

  const patientOptions = useMemo(
    () => patients.map((p) => ({ value: p.id, label: `${p.patientCode} - ${p.name}` })),
    [patients]
  )

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [labTestResponse, patientsResponse] = await Promise.all([
          doctorAPI.getLabTests(),
          doctorAPI.getPatients({ page: 0, size: 200 })
        ])

        const labTestsData = labTestResponse.content || labTestResponse.data || labTestResponse || []
        setLabTests(labTestsData)

        const patientsData = patientsResponse.content || patientsResponse.data || []
        const mappedPatients = patientsData.map((patient) => ({
          id: patient.benhnhanId || patient.id,
          name: patient.hoTen || patient.name || 'Không xác định',
          patientCode:
            patient.maBenhNhan ||
            patient.patientCode ||
            `BN${String(patient.benhnhanId || patient.id).padStart(3, '0')}`
        }))
        setPatients(mappedPatients)
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu xét nghiệm:', err)
        alert('Không tải được danh sách xét nghiệm')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const refreshLabTests = async () => {
    try {
      const response = await doctorAPI.getLabTests()
      const labTestsData = response.content || response.data || response || []
      setLabTests(labTestsData)
    } catch (err) {
      console.error('Lỗi khi tải lại xét nghiệm:', err)
    }
  }

  const handleRequestLabTest = async (e) => {
    e.preventDefault()
    if (!requestForm.patientId || !requestForm.testType || !requestForm.testDate) {
      alert('Vui lòng điền đầy đủ thông tin xét nghiệm')
      return
    }

    try {
      setCreating(true)
      await doctorAPI.createLabTest({
        benhnhanId: parseInt(requestForm.patientId, 10),
        loaiXetNghiem: requestForm.testType,
        ngayTest: requestForm.testDate,
        ghiChu: requestForm.notes
      })
      await refreshLabTests()
      setRequestForm({
        patientId: '',
        testType: '',
        testDate: '',
        notes: ''
      })
      alert('Tạo yêu cầu xét nghiệm thành công!')
    } catch (err) {
      console.error('Lỗi khi tạo xét nghiệm:', err)
      alert('Không thể tạo xét nghiệm: ' + (err.message || 'Vui lòng thử lại'))
    } finally {
      setCreating(false)
    }
  }

  const handleResultSubmit = async (e) => {
    e.preventDefault()
    if (!resultForm.labTestId || !resultForm.ketQua) {
      alert('Vui lòng nhập kết quả xét nghiệm')
      return
    }

    try {
      setResultUpdating(true)
      await doctorAPI.updateLabTestResult(resultForm.labTestId, {
        ketQua: resultForm.ketQua,
        ghiChu: resultForm.ghiChu
      })
      await refreshLabTests()
      setResultForm({
        labTestId: null,
        ketQua: '',
        ghiChu: ''
      })
      alert('Cập nhật kết quả thành công!')
    } catch (err) {
      console.error('Lỗi khi cập nhật kết quả xét nghiệm:', err)
      alert('Không thể cập nhật kết quả: ' + (err.message || 'Vui lòng thử lại'))
    } finally {
      setResultUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu xét nghiệm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý xét nghiệm</h1>
          <p className="text-gray-600 mt-1">Tạo yêu cầu và cập nhật kết quả xét nghiệm cho bệnh nhân</p>
        </div>
        <Button variant="outline" onClick={refreshLabTests}>
          Tải lại
        </Button>
      </div>

      <Card title="Tạo yêu cầu xét nghiệm">
        <form onSubmit={handleRequestLabTest} className="space-y-4">
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
                {patientOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại xét nghiệm *</label>
              <input
                type="text"
                value={requestForm.testType}
                onChange={(e) => setRequestForm({ ...requestForm, testType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ví dụ: Công thức máu, X-quang..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày xét nghiệm *</label>
              <input
                type="date"
                value={requestForm.testDate}
                onChange={(e) => setRequestForm({ ...requestForm, testDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <input
                type="text"
                value={requestForm.notes}
                onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Yêu cầu thêm cho phòng xét nghiệm..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={creating}>
              {creating ? 'Đang tạo...' : 'Tạo yêu cầu'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Danh sách xét nghiệm">
        {labTests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Chưa có xét nghiệm nào
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bệnh nhân
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại xét nghiệm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày xét nghiệm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kết quả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {labTests.map((labTest) => (
                    <tr key={labTest.labtestId || labTest.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {labTest.benhnhan?.hoTen || labTest.benhnhan?.name || 'Không xác định'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {labTest.benhnhan?.maBenhNhan || labTest.benhnhan?.patientCode || ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{labTest.loaiXetNghiem || 'N/A'}</div>
                        {labTest.ghiChu && <div className="text-xs text-gray-500">{labTest.ghiChu}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {labTest.ngayTest
                              ? new Date(labTest.ngayTest).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {labTest.ketQua ? (
                          <div className="font-medium text-green-600">{labTest.ketQua}</div>
                        ) : (
                          <span className="text-sm text-gray-400">Chưa có kết quả</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setResultForm({
                              labTestId: labTest.labtestId || labTest.id,
                              ketQua: labTest.ketQua || '',
                              ghiChu: ''
                            })
                          }
                        >
                          Cập nhật kết quả
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {resultForm.labTestId && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-500" />
                  Nhập kết quả xét nghiệm
                </h3>
                <form onSubmit={handleResultSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kết quả *</label>
                    <textarea
                      value={resultForm.ketQua}
                      onChange={(e) => setResultForm({ ...resultForm, ketQua: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setResultForm({
                          labTestId: null,
                          ketQua: '',
                          ghiChu: ''
                        })
                      }
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={resultUpdating}>
                      {resultUpdating ? 'Đang lưu...' : 'Lưu kết quả'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default DoctorLabTests


