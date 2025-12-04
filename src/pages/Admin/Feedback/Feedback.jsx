import React, { useState } from 'react'
import Card from '../../../components/Common/Card'
import Button from '../../../components/Common/Button'
import Modal from '../../../components/Common/Modal'
import Table from '../../../components/Common/Table'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  User,
  Calendar,
  Mail,
  Phone,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Heart
} from 'lucide-react'

const Feedback = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  // Dữ liệu mẫu phản hồi
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      feedbackCode: 'PH001',
      patientName: 'Nguyễn Thị An',
      patientPhone: '0123456789',
      patientEmail: 'nguyenthian@email.com',
      type: 'Khiếu nại',
      priority: 'Cao',
      subject: 'Chất lượng dịch vụ khám bệnh',
      content: 'Tôi không hài lòng với thái độ phục vụ của nhân viên lễ tân. Họ tỏ ra thiếu kiên nhẫn và không giải thích rõ ràng quy trình khám bệnh.',
      status: 'Chờ xử lý',
      assignedTo: '',
      createdAt: '2024-01-15 10:30:00',
      updatedAt: '2024-01-15 10:30:00',
      resolvedAt: null,
      rating: 2,
      response: '',
      category: 'Dịch vụ'
    },
    {
      id: 2,
      feedbackCode: 'PH002',
      patientName: 'Trần Văn Bình',
      patientPhone: '0123456790',
      patientEmail: 'tranvanbinh@email.com',
      type: 'Góp ý',
      priority: 'Trung bình',
      subject: 'Đề xuất cải thiện',
      content: 'Bệnh viện nên lắp thêm máy lọc nước ở các tầng để bệnh nhân tiện sử dụng.',
      status: 'Đang xử lý',
      assignedTo: 'Phòng Dịch vụ',
      createdAt: '2024-01-16 14:20:00',
      updatedAt: '2024-01-17 09:15:00',
      resolvedAt: null,
      rating: 4,
      response: 'Cảm ơn bạn đã góp ý. Chúng tôi sẽ xem xét đề xuất này.',
      category: 'Cơ sở vật chất'
    },
    {
      id: 3,
      feedbackCode: 'PH003',
      patientName: 'Lê Thị Cường',
      patientPhone: '0123456791',
      patientEmail: 'lethicuong@email.com',
      type: 'Khen ngợi',
      priority: 'Thấp',
      subject: 'Cảm ơn bác sĩ',
      content: 'Tôi rất cảm ơn BS. Nguyễn Văn An đã tận tình chăm sóc và điều trị cho tôi. Bác sĩ rất chu đáo và chuyên nghiệp.',
      status: 'Đã xử lý',
      assignedTo: 'Phòng Dịch vụ',
      createdAt: '2024-01-17 16:45:00',
      updatedAt: '2024-01-18 08:30:00',
      resolvedAt: '2024-01-18 08:30:00',
      rating: 5,
      response: 'Cảm ơn bạn đã phản hồi tích cực. Chúng tôi sẽ chuyển lời cảm ơn đến bác sĩ.',
      category: 'Nhân viên'
    }
  ])

  // Removed hardcoded data - should come from API
  const feedbackTypes = []
  const priorities = []
  const statuses = []
  const categories = []
  const departments = []

  const [formData, setFormData] = useState({
    feedbackCode: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    type: '',
    priority: 'Trung bình',
    subject: '',
    content: '',
    status: 'Chờ xử lý',
    assignedTo: '',
    rating: 5,
    response: '',
    category: ''
  })

  // Lọc phản hồi
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.feedbackCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || feedback.status === filterStatus
    const matchesType = !filterType || feedback.type === filterType
    const matchesPriority = !filterPriority || feedback.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const handleAddFeedback = () => {
    const newCode = `PH${String(feedbacks.length + 1).padStart(3, '0')}`
    
    setFormData({
      feedbackCode: newCode,
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      type: '',
      priority: 'Trung bình',
      subject: '',
      content: '',
      status: 'Chờ xử lý',
      assignedTo: '',
      rating: 5,
      response: '',
      category: ''
    })
    setShowAddModal(true)
  }

  const handleEditFeedback = (feedback) => {
    setSelectedFeedback(feedback)
    setFormData(feedback)
    setShowEditModal(true)
  }

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback)
    setShowViewModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (showEditModal && selectedFeedback) {
      setFeedbacks(feedbacks.map(feedback => 
        feedback.id === selectedFeedback.id ? { 
          ...feedback, 
          ...formData,
          updatedAt: new Date().toLocaleString('vi-VN'),
          resolvedAt: formData.status === 'Đã xử lý' ? new Date().toLocaleString('vi-VN') : feedback.resolvedAt
        } : feedback
      ))
      setShowEditModal(false)
    } else {
      const newFeedback = {
        id: feedbacks.length + 1,
        ...formData,
        createdAt: new Date().toLocaleString('vi-VN'),
        updatedAt: new Date().toLocaleString('vi-VN'),
        resolvedAt: null
      }
      setFeedbacks([...feedbacks, newFeedback])
      setShowAddModal(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Chờ xử lý': 'bg-yellow-100 text-yellow-800',
      'Đang xử lý': 'bg-blue-100 text-blue-800',
      'Đã xử lý': 'bg-green-100 text-green-800',
      'Đã đóng': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'Thấp': 'bg-green-100 text-green-800',
      'Trung bình': 'bg-yellow-100 text-yellow-800',
      'Cao': 'bg-orange-100 text-orange-800',
      'Khẩn cấp': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      'Khiếu nại': 'bg-red-100 text-red-800',
      'Góp ý': 'bg-blue-100 text-blue-800',
      'Khen ngợi': 'bg-green-100 text-green-800',
      'Hỗ trợ kỹ thuật': 'bg-purple-100 text-purple-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    )
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  // Cột cho bảng phản hồi
  const feedbackColumns = [
    {
      key: 'feedbackCode',
      label: 'Mã PH',
      render: (value, row) => (
        <div className="font-medium text-blue-600">{value}</div>
      )
    },
    {
      key: 'patientName',
      label: 'Người gửi',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.patientPhone}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Loại',
      render: (value) => getTypeBadge(value)
    },
    {
      key: 'subject',
      label: 'Tiêu đề',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Độ ưu tiên',
      render: (value) => getPriorityBadge(value)
    },
    {
      key: 'rating',
      label: 'Đánh giá',
      render: (value) => (
        <div className="flex items-center gap-1">
          {getRatingStars(value)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {value === 'Đã xử lý' ? <CheckCircle className="w-4 h-4 text-green-600" /> : 
           value === 'Đang xử lý' ? <Clock className="w-4 h-4 text-blue-600" /> : 
           <AlertTriangle className="w-4 h-4 text-yellow-600" />}
          {getStatusBadge(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewFeedback(row)}
          >
            Xem
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditFeedback(row)}
          >
            Sửa
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý phản hồi & hỗ trợ</h1>
            <p className="text-fuchsia-100">Quản lý phản hồi, khiếu nại và hỗ trợ bệnh nhân</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddFeedback}
            className="bg-white text-fuchsia-600 hover:bg-fuchsia-50"
          >
            Thêm phản hồi
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Tổng phản hồi</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{feedbacks.length}</div>
            <div className="text-sm text-gray-500">Tất cả phản hồi</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Chờ xử lý</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {feedbacks.filter(f => f.status === 'Chờ xử lý').length}
            </div>
            <div className="text-sm text-gray-500">Đang chờ phản hồi</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Đã xử lý</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {feedbacks.filter(f => f.status === 'Đã xử lý').length}
            </div>
            <div className="text-sm text-gray-500">Đã hoàn thành</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-gray-500">Khen ngợi</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {feedbacks.filter(f => f.type === 'Khen ngợi').length}
            </div>
            <div className="text-sm text-gray-500">Phản hồi tích cực</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Bộ lọc và tìm kiếm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm phản hồi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại</option>
            {feedbackTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả độ ưu tiên</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Feedback Table */}
      <Card title="Danh sách phản hồi">
        <Table
          data={filteredFeedbacks}
          columns={feedbackColumns}
          searchable={false}
        />
      </Card>

      {/* Add/Edit Feedback Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedFeedback(null)
        }}
        title={showEditModal ? "Sửa phản hồi" : "Thêm phản hồi mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã phản hồi
              </label>
              <input
                type="text"
                value={formData.feedbackCode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại phản hồi *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn loại phản hồi</option>
                {feedbackTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên người gửi *
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.patientPhone}
                onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.patientEmail}
                onChange={(e) => setFormData({...formData, patientEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Độ ưu tiên *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phân công cho
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn bộ phận</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung phản hồi *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đánh giá (1-5 sao)
            </label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({...formData, rating: index + 1})}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${index < formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{formData.rating}/5 sao</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phản hồi từ bệnh viện
            </label>
            <textarea
              value={formData.response}
              onChange={(e) => setFormData({...formData, response: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập phản hồi từ bệnh viện..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedFeedback(null)
              }}
            >
              Hủy
            </Button>
            <Button type="submit">
              {showEditModal ? "Cập nhật" : "Thêm phản hồi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Feedback Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedFeedback(null)
        }}
        title="Chi tiết phản hồi"
        size="lg"
      >
        {selectedFeedback && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin phản hồi</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã phản hồi:</span>
                    <span className="font-medium">{selectedFeedback.feedbackCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại:</span>
                    {getTypeBadge(selectedFeedback.type)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Độ ưu tiên:</span>
                    {getPriorityBadge(selectedFeedback.priority)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(selectedFeedback.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="font-medium">{selectedFeedback.category}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin người gửi</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{selectedFeedback.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedFeedback.patientPhone}</span>
                  </div>
                  {selectedFeedback.patientEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedFeedback.patientEmail}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{selectedFeedback.rating}/5 sao</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Nội dung phản hồi</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{selectedFeedback.subject}</h4>
                <p className="text-gray-700">{selectedFeedback.content}</p>
              </div>
            </div>

            {/* Response */}
            {selectedFeedback.response && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Phản hồi từ bệnh viện</h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-blue-800">{selectedFeedback.response}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Lịch sử xử lý</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Tạo phản hồi</div>
                    <div className="text-sm text-gray-600">{selectedFeedback.createdAt}</div>
                  </div>
                </div>
                {selectedFeedback.updatedAt !== selectedFeedback.createdAt && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Edit className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Cập nhật lần cuối</div>
                      <div className="text-sm text-gray-600">{selectedFeedback.updatedAt}</div>
                    </div>
                  </div>
                )}
                {selectedFeedback.resolvedAt && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Đã xử lý</div>
                      <div className="text-sm text-gray-600">{selectedFeedback.resolvedAt}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment */}
            {selectedFeedback.assignedTo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Được phân công cho:</h4>
                <p className="text-yellow-800">{selectedFeedback.assignedTo}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedFeedback(null)
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditFeedback(selectedFeedback)
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Feedback
