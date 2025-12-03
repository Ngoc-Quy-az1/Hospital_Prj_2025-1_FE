import React, { useState, useEffect } from 'react'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { accountantAPI } from '../../services/api'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart
} from 'lucide-react'

const FinancialReports = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Load report data
  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [revenueReport, financialSummary] = await Promise.all([
        accountantAPI.getRevenueReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          groupBy: 'day',
        }),
        accountantAPI.getFinancialSummaryReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      ])

      setReportData({
        revenue: revenueReport || {},
        summary: financialSummary || {},
      })
    } catch (e) {
      console.error(e)
      setError('Không tải được báo cáo')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format) => {
    console.log('Export report to:', format)
    // TODO: Implement export functionality
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const summary = reportData?.summary || {}
  const revenue = reportData?.revenue || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo tài chính</h1>
          <p className="text-gray-600 mt-1">Theo dõi và phân tích doanh thu hệ thống</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={() => handleExport('excel')}
          >
            Xuất Excel
          </Button>
          <Button
            variant="outline"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => handleExport('pdf')}
          >
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card title="Chọn thời gian">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={fetchReportData}
              icon={<Calendar className="w-4 h-4" />}
            >
              Xem báo cáo
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tổng doanh thu</p>
              <p className="text-3xl font-bold mt-2">
                {revenue.totalRevenue?.toLocaleString('vi-VN') || 0} VNĐ
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-100" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng hóa đơn</p>
              <p className="text-3xl font-bold mt-2">{revenue.totalBills || 0}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-100" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Hóa đơn đã thanh toán</p>
              <p className="text-3xl font-bold mt-2">{revenue.paidBills || 0}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-100" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Hóa đơn chờ thanh toán</p>
              <p className="text-3xl font-bold mt-2">{revenue.pendingBills || 0}</p>
            </div>
            <PieChart className="w-12 h-12 text-orange-100" />
          </div>
        </Card>
      </div>

      {/* Financial Summary */}
      {summary && (
        <Card title="Tóm tắt tài chính">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Tổng quan</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Doanh thu</span>
                  <span className="font-bold text-green-600">
                    {summary.totalRevenue?.toLocaleString('vi-VN') || 0} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Chi phí</span>
                  <span className="font-bold text-red-600">
                    {summary.totalExpenses?.toLocaleString('vi-VN') || 0} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Lợi nhuận ròng</span>
                  <span className="font-bold text-blue-600">
                    {summary.netProfit?.toLocaleString('vi-VN') || 0} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Tỷ suất lợi nhuận</span>
                  <span className="font-bold">
                    {summary.profitMargin || 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Phân tích hóa đơn</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Tổng hóa đơn</span>
                  <span className="font-bold">{summary.bills?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Đã thanh toán</span>
                  <span className="font-bold text-green-600">{summary.bills?.paid || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Chờ thanh toán</span>
                  <span className="font-bold text-yellow-600">{summary.bills?.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Quá hạn</span>
                  <span className="font-bold text-red-600">{summary.bills?.overdue || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Methods */}
      {revenue.byPaymentMethod && (
        <Card title="Phân tích phương thức thanh toán">
          <div className="space-y-4">
            {revenue.byPaymentMethod.map((method, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-medium">{method.method}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">{method.percentage}%</span>
                  <span className="font-bold">
                    {method.amount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chart Placeholder */}
      <Card title="Biểu đồ doanh thu theo thời gian">
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default FinancialReports


