import React from 'react'
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react'

const Table = ({
  columns,
  data,
  onSort,
  sortField,
  sortDirection,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  className = '',
  onRowClick,
  rowKey = 'id',
  selectedRowId,
  noHorizontalScroll = false
}) => {
  const handleSort = (field) => {
    if (onSort) {
      onSort(field)
    }
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 opacity-30" />
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}>
      <div className={noHorizontalScroll ? 'overflow-x-visible' : 'overflow-x-auto'}>
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.field || column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && renderSortIcon(column.field || column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedRowId !== undefined && row[rowKey] === selectedRowId
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => {
                    const fieldKey = column.field || column.key;
                    const cellValue = row[fieldKey];
                    const isActionsColumn = column.key === 'actions';
                    return (
                      <td 
                        key={colIndex} 
                        className={`px-6 py-4 ${isActionsColumn ? 'align-middle' : 'whitespace-nowrap'}`}
                      >
                        {column.render ? column.render(cellValue, row, rowIndex) : cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
