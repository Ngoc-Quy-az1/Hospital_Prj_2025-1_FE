import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ 
  currentPage = 0, 
  totalPages = 0, 
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  showPageSize = true,
  onPageSizeChange
}) => {
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page)
    }
  }

  // Tính toán các trang hiển thị
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      // Hiển thị tất cả các trang nếu ít hơn maxVisible
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Hiển thị một số trang xung quanh trang hiện tại
      let start = Math.max(0, currentPage - 2)
      let end = Math.min(totalPages - 1, start + maxVisible - 1)
      
      // Điều chỉnh nếu gần cuối
      if (end - start < maxVisible - 1) {
        start = Math.max(0, end - maxVisible + 1)
      }
      
      // Thêm trang đầu nếu không bắt đầu từ 0
      if (start > 0) {
        pages.push(0)
        if (start > 1) {
          pages.push('...')
        }
      }
      
      // Thêm các trang trong khoảng
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      // Thêm trang cuối nếu không kết thúc ở trang cuối
      if (end < totalPages - 1) {
        if (end < totalPages - 2) {
          pages.push('...')
        }
        pages.push(totalPages - 1)
      }
    }
    
    return pages
  }

  if (totalPages <= 1 && !showPageSize) {
    return null
  }

  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Thông tin số lượng */}
      <div className="text-sm text-gray-600">
        Hiển thị <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span> trong tổng số <span className="font-medium">{totalElements}</span> mục
      </div>

      <div className="flex items-center gap-4">
        {/* Chọn số lượng mục mỗi trang */}
        {showPageSize && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Hiển thị:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        {/* Nút phân trang */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Nút Previous */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Số trang */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">
                      ...
                    </span>
                  )
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
                    }`}
                  >
                    {page + 1}
                  </button>
                )
              })}
            </div>

            {/* Nút Next */}
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage >= totalPages - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pagination

