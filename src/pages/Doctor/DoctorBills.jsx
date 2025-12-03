import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../services/api'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { FileText } from 'lucide-react'

const DoctorBills = () => {
  const [bills, setBills] = useState([])
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  })
  const [filters, setFilters] = useState({
    patientId: '',
    status: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadBills = async (page = 0, size = 20) => {
    setLoading(true)
    setError(null)
    try {
      const response = await doctorAPI.getBills({
        patientId: filters.patientId || undefined,
        status: filters.status || undefined,
        page,
        size
      })
      const data = response.content || response.data || []
      setBills(data)
      setPageInfo({
        page: response.number ?? page,
        size: response.size ?? size,
        totalPages: response.totalPages ?? 0,
        totalElements: response.totalElements ?? data.length
      })
    } catch (err) {
      console.error('Lỗi khi tải hóa đơn bác sĩ:', err)
      setError(err.message || 'Không thể tải hóa đơn')
      setBills([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBills(0, pageInfo.size)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilter = async (e) => {
    e.preventDefault()
    await loadBills(0, pageInfo.size)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hóa đơn liên quan</h1>
          <p className="text-gray-600 mt-1">Theo dõi các hóa đơn của bệnh nhân bạn phụ trách</p>
        </div>
        <Button variant="outline" onClick={() => loadBills(pageInfo.page, pageInfo.size)}>
          Tải lại
        </Button>
      </div>

      <Card title="Bộ lọc">
        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID bệnh nhân</label>
            <input
              type="number"
              value={filters.patientId}
              onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập ID nếu muốn lọc"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PENDING">Chưa thanh toán</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full md:w-auto">
              Áp dụng
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Danh sách hóa đơn">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải hóa đơn...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Chưa có hóa đơn nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã hóa đơn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày lập
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.hoaDonId || bill.id}>
                    <td className="px-4 py-3 font-medium text-blue-600">
                      {bill.maHoaDon || bill.billCode || `HD${bill.hoaDonId || bill.id}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {bill.benhnhan?.hoTen || bill.benhnhan?.name || 'Không xác định'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {bill.benhnhan?.maBenhNhan || bill.benhnhan?.patientCode || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {bill.ngayLap
                        ? new Date(bill.ngayLap).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {bill.tongTien ? `${Number(bill.tongTien).toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {bill.trangThai || bill.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default DoctorBills


