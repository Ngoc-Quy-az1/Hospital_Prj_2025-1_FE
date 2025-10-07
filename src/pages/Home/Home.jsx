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
  Star
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Hệ thống quản lý bệnh viện
              <span className="text-blue-600 block">hiện đại và hiệu quả</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Nền tảng toàn diện giúp quản lý bác sĩ, y tá, bệnh nhân và lịch hẹn một cách chuyên nghiệp. 
              Tối ưu hóa quy trình làm việc và nâng cao chất lượng dịch vụ y tế.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Bắt đầu ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                Xem demo
              </button>
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
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
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-lg mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Tại sao chọn hệ thống của chúng tôi?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quản lý tập trung</h3>
                    <p className="text-gray-600">Tất cả thông tin được quản lý tập trung, dễ dàng truy cập và cập nhật</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bảo mật cao</h3>
                    <p className="text-gray-600">Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn y tế quốc tế</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Giao diện thân thiện</h3>
                    <p className="text-gray-600">Thiết kế hiện đại, dễ sử dụng cho mọi đối tượng người dùng</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Hỗ trợ 24/7</h3>
                    <p className="text-gray-600">Đội ngũ hỗ trợ kỹ thuật sẵn sàng giúp đỡ mọi lúc</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Thống kê hiệu quả</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tiết kiệm thời gian</span>
                    <span className="text-2xl font-bold">80%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tăng hiệu suất</span>
                    <span className="text-2xl font-bold">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Hài lòng khách hàng</span>
                    <span className="text-2xl font-bold">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-xl text-gray-600">
              Những phản hồi tích cực từ người dùng hệ thống
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn bệnh viện đã tin tưởng sử dụng hệ thống của chúng tôi
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đăng nhập ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
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
