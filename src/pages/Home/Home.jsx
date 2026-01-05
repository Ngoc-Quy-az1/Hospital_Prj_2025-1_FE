import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  Stethoscope, 
  UserCheck, 
  Users,
  Calendar,
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  TrendingUp,
  MessageCircle
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Stethoscope,
      title: 'Quản lý bác sĩ',
      description: 'Theo dõi lịch làm việc, chuyên khoa và thông tin bác sĩ',
      color: 'bg-blue-500'
    },
    {
      icon: UserCheck,
      title: 'Quản lý y tá',
      description: 'Điều phối ca trực, chăm sóc bệnh nhân và theo dõi dấu hiệu sinh tồn',
      color: 'bg-green-500'
    },
    {
      icon: Users,
      title: 'Quản lý bệnh nhân',
      description: 'Lưu trữ hồ sơ bệnh án, lịch sử khám và thông tin cá nhân',
      color: 'bg-purple-500'
    },
    {
      icon: Calendar,
      title: 'Lịch hẹn thông minh',
      description: 'Đặt lịch khám trực tuyến, quản lý lịch trình và nhắc nhở',
      color: 'bg-orange-500'
    }
  ]

  const stats = [
    { label: 'Bác sĩ', value: '50+', icon: Stethoscope },
    { label: 'Y tá', value: '100+', icon: UserCheck },
    { label: 'Bệnh nhân', value: '1000+', icon: Users },
    { label: 'Lịch hẹn/ngày', value: '200+', icon: Calendar }
  ]

  const testimonials = [
    {
      name: 'BS. Nguyễn Văn A',
      role: 'Trưởng khoa Tim mạch',
      content: 'Hệ thống giúp tôi quản lý lịch làm việc và bệnh nhân hiệu quả hơn rất nhiều.',
      rating: 5
    },
    {
      name: 'ĐD. Trần Thị B',
      role: 'Điều dưỡng trưởng',
      content: 'Giao diện thân thiện, dễ sử dụng. Việc chăm sóc bệnh nhân trở nên chuyên nghiệp hơn.',
      rating: 5
    },
    {
      name: 'Anh Nguyễn Văn C',
      role: 'Bệnh nhân',
      content: 'Đặt lịch khám trực tuyến rất tiện lợi, không cần phải đến bệnh viện sớm để chờ.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bệnh viện ABC</h1>
                <p className="text-sm text-gray-600">Hệ thống quản lý bệnh viện</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background gradient đơn giản, bỏ ảnh ngoài để tránh lỗi hiển thị */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/90"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Bệnh viện đạt chuẩn quốc tế JCI
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Hệ thống quản lý bệnh viện
              <span className="text-blue-300 block">thông minh & hiện đại</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Nền tảng công nghệ tiên tiến giúp quản lý toàn diện bác sĩ, y tá, bệnh nhân và lịch hẹn. 
              Nâng cao chất lượng dịch vụ y tế với trải nghiệm số hóa chuyên nghiệp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Đăng nhập hệ thống
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Chat với Bot
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                <Phone className="w-5 h-5" />
                Liên hệ tư vấn
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-sm text-blue-200">Bác sĩ chuyên khoa</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm text-blue-200">Dịch vụ khẩn cấp</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">1000+</div>
                <div className="text-sm text-blue-200">Bệnh nhân hài lòng</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">15+</div>
                <div className="text-sm text-blue-200">Năm kinh nghiệm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Công nghệ tiên tiến
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống được thiết kế để đáp ứng mọi nhu cầu quản lý của bệnh viện hiện đại
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Bệnh viện ABC</span>
              </div>
              <p className="text-gray-400">
                Hệ thống quản lý bệnh viện hiện đại, đáng tin cậy
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Trang chủ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Giới thiệu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Liên hệ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Hỗ trợ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Quản lý bác sĩ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Quản lý y tá</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Quản lý bệnh nhân</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Lịch hẹn</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@hospital.com</li>
                <li>📞 0123 456 789</li>
                <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bệnh viện ABC. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
