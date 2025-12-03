import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

// Select tuỳ biến: luôn hiển thị danh sách xuống dưới bằng cách render qua portal
const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn...',
  className = '',
  disabled = false,
}) => {
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState({})

  const selectedOption = options.find(o => o.value === value) || null

  const close = () => setOpen(false)
  const toggle = () => !disabled && setOpen(prev => !prev)

  // Tính toán vị trí menu luôn bên dưới trigger
  const positionMenu = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const top = rect.bottom + window.scrollY + 4 // 4px gap
    const left = rect.left + window.scrollX
    const width = rect.width
    setMenuStyle({
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      zIndex: 9999,
    })
  }

  useLayoutEffect(() => {
    if (open) positionMenu()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onScrollOrResize = () => positionMenu()
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !triggerRef.current.contains(e.target)) {
        close()
      }
    }
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    document.addEventListener('click', onClickOutside)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
      document.removeEventListener('click', onClickOutside)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-full ${className}`}
      >
        <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
      </button>

      {open && createPortal(
        <div ref={menuRef} style={menuStyle}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">Không có lựa chọn</div>
            )}
            {options.map(opt => (
              <button
                key={opt.value ?? opt.label}
                type="button"
                onClick={() => { onChange && onChange({ target: { value: opt.value } }); close() }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${value === opt.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Select



