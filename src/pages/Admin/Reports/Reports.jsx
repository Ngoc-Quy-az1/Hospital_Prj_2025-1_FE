import React, { useState } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  Activity,
  Download,
  Eye,
  Filter,
  FileText,
  PieChart,
  LineChart
} from 'lucide-react'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [showReportModal, setShowReportModal] = useState(false)

  // Dữ liệu mẫu thống kê
  const statsData = {
    totalPatients: 1250,
    totalRevenue: 2500000000,
    totalAppointments: 850,
    totalStaff: 120,
    patientGrowth: 15.2,
    revenueGrowth: 8.7,
    appointmentGrowth: -2.1,
    staffGrowth: 5.3
  }

  const departmentStats = [
    { name: 'Khoa Tim mạch', patients: 280, revenue: 650000000, growth: 12.5 },
    { name: 'Khoa Nội', patients: 320, revenue: 480000000, growth: 8.3 },
    { name: 'Khoa Ngoại', patients: 250, revenue: 750000000, growth: 15.7 },
    { name: 'Khoa Sản', patients: 180, revenue: 320000000, growth: 6.2 },
    { name: 'Khoa Nhi', patients: 220, revenue: 300000000, growth: 9.8 }
  ]

  const monthlyRevenue = [
    { month: 'Tháng 1', revenue: 180000000, patients: 95 },
    { month: 'Tháng 2', revenue: 195000000, patients: 102 },
    { month: 'Tháng 3', revenue: 210000000, patients: 108 },
    { month: 'Tháng 4', revenue: 225000000, patients: 115 },
    { month: 'Tháng 5', revenue: 240000000, patients: 120 },
    { month: 'Tháng 6', revenue: 255000000, patients: 125 }
  ]

  const reportTypes = [
    {
      id: 'patient-report',
      title: 'Báo cáo bệnh nhân',
      description: 'Thống kê số lượng bệnh nhân theo tháng/khoa',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'revenue-report',
      title: 'Báo cáo doanh thu',
      description: 'Thống kê doanh thu theo loại dịch vụ',
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 'appointment-report',
      title: 'Báo cáo lịch hẹn',
      description: 'Thống kê lịch hẹn và hiệu suất khám',
      icon: Calendar,
      color: 'purple'
    },
    {
      id: 'staff-report',
      title: 'Báo cáo nhân viên',
      description: 'Thống kê hiệu suất làm việc nhân viên',
      icon: Activity,
      color: 'orange'
    },
    {
      id: 'medicine-report',
      title: 'Báo cáo thuốc',
      description: 'Thống kê sử dụng thuốc và tồn kho',
      icon: FileText,
      color: 'red'
    },
    {
      id: 'financial-report',
      title: 'Báo cáo tài chính',
      description: 'Báo cáo tổng hợp tài chính',
      icon: BarChart3,
      color: 'indigo'
    }
  ]

  const handleGenerateReport = (reportType) => {
    setSelectedReport(reportType)
    setShowReportModal(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Thống kê & Báo cáo</h1>
            <p className="text-sky-100">Báo cáo tổng hợp và thống kê bệnh viện</p>
          </div>
          <div className="flex gap-3">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/70"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/70"
              placeholder="Đến ngày"
            />
          </div>
        </div>
      </div>

      {/* Overview Stats */}
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
            <div className="text-4xl font-bold text-gray-900 mb-1">{statsData.totalPatients.toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-sm ${getGrowthColor(statsData.patientGrowth)}`}>
              {getGrowthIcon(statsData.patientGrowth)}
              <span>{statsData.patientGrowth}%</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng doanh thu</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{formatCurrency(statsData.totalRevenue)}</div>
            <div className={`flex items-center gap-1 text-sm ${getGrowthColor(statsData.revenueGrowth)}`}>
              {getGrowthIcon(statsData.revenueGrowth)}
              <span>{statsData.revenueGrowth}%</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng lịch hẹn</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{statsData.totalAppointments.toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-sm ${getGrowthColor(statsData.appointmentGrowth)}`}>
              {getGrowthIcon(statsData.appointmentGrowth)}
              <span>{statsData.appointmentGrowth}%</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng nhân viên</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{statsData.totalStaff}</div>
            <div className={`flex items-center gap-1 text-sm ${getGrowthColor(statsData.staffGrowth)}`}>
              {getGrowthIcon(statsData.staffGrowth)}
              <span>{statsData.staffGrowth}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Performance */}
      <Card title="Hiệu suất theo khoa">
        <div className="space-y-4">
          {departmentStats.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{dept.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>{dept.patients} bệnh nhân</span>
                  <span>{formatCurrency(dept.revenue)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm ${getGrowthColor(dept.growth)}`}>
                {getGrowthIcon(dept.growth)}
                <span>{dept.growth}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card title="Doanh thu theo tháng">
        <div className="space-y-4">
          {monthlyRevenue.map((month, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{month.month}</span>
                  <span className="text-sm text-gray-600">{month.patients} bệnh nhân</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(month.revenue / 300000000) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Report Types */}
      <Card title="Loại báo cáo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map(report => {
            const Icon = report.icon
            return (
              <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-${report.color}-100`}>
                    <Icon className={`w-6 h-6 text-${report.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    Xem
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => console.log('Download report:', report.id)}
                  >
                    Tải xuống
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            icon={<BarChart3 className="w-4 h-4" />}
            onClick={() => handleGenerateReport('dashboard')}
          >
            Dashboard tổng quan
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={() => console.log('Export all reports')}
          >
            Xuất tất cả báo cáo
          </Button>
          <Button
            variant="outline"
            icon={<Calendar className="w-4 h-4" />}
            onClick={() => handleGenerateReport('monthly')}
          >
            Báo cáo tháng
          </Button>
          <Button
            variant="outline"
            icon={<TrendingUp className="w-4 h-4" />}
            onClick={() => handleGenerateReport('trend')}
          >
            Phân tích xu hướng
          </Button>
        </div>
      </Card>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Báo cáo chi tiết"
        size="xl"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {reportTypes.find(r => r.id === selectedReport)?.title || 'Báo cáo'}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<Download className="w-4 h-4" />}
                onClick={() => console.log('Download report:', selectedReport)}
              >
                Tải xuống
              </Button>
              <Button
                variant="outline"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => console.log('Print report:', selectedReport)}
              >
                In báo cáo
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Từ {new Date(dateRange.startDate).toLocaleDateString('vi-VN')} đến {new Date(dateRange.endDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Report Content based on selected report */}
          {selectedReport === 'patient-report' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Thống kê bệnh nhân theo khoa</h4>
              <div className="space-y-3">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">{dept.name}</div>
                      <div className="text-sm text-gray-600">{dept.patients} bệnh nhân</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(dept.revenue)}</div>
                      <div className={`text-sm ${getGrowthColor(dept.growth)}`}>
                        {dept.growth > 0 ? '+' : ''}{dept.growth}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'revenue-report' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Thống kê doanh thu theo tháng</h4>
              <div className="space-y-3">
                {monthlyRevenue.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">{month.month}</div>
                      <div className="text-sm text-gray-600">{month.patients} bệnh nhân</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(month.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'appointment-report' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Thống kê lịch hẹn</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">850</div>
                  <div className="text-sm text-gray-600">Tổng lịch hẹn</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">780</div>
                  <div className="text-sm text-gray-600">Đã hoàn thành</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">70</div>
                  <div className="text-sm text-gray-600">Chờ xử lý</div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'staff-report' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Thống kê nhân viên</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">120</div>
                  <div className="text-sm text-gray-600">Tổng nhân viên</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">45</div>
                  <div className="text-sm text-gray-600">Bác sĩ</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">60</div>
                  <div className="text-sm text-gray-600">Y tá</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">15</div>
                  <div className="text-sm text-gray-600">Nhân viên khác</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowReportModal(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Reports










