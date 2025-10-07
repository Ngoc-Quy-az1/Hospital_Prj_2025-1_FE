# Hệ thống quản lý bệnh viện

Một ứng dụng web hiện đại để quản lý bệnh viện với React và Vite, hỗ trợ nhiều vai trò người dùng khác nhau.

## 🚀 Tính năng chính

### 👨‍💼 Quản trị viên (Admin)
- Quản lý người dùng (bác sĩ, y tá, bệnh nhân)
- Quản lý lịch hẹn
- Quản lý khoa phòng
- Báo cáo thống kê
- Cài đặt hệ thống

### 👨‍⚕️ Bác sĩ
- Quản lý lịch làm việc
- Xem danh sách bệnh nhân
- Quản lý lịch hẹn khám
- Hồ sơ bệnh án
- Đơn thuốc

### 👩‍⚕️ Y tá
- Chăm sóc bệnh nhân
- Đo dấu hiệu sinh tồn
- Quản lý thuốc
- Quản lý phòng bệnh
- Lịch làm việc

### 🤒 Bệnh nhân
- Đặt lịch khám
- Xem lịch sử khám bệnh
- Xem đơn thuốc
- Thanh toán hóa đơn
- Thông tin cá nhân

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Date Handling**: date-fns

## 📦 Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd hospital-management-system
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy ứng dụng**
```bash
npm run dev
```

4. **Mở trình duyệt**
Truy cập: http://localhost:3000

## 🔐 Thông tin đăng nhập demo

### Quản trị viên
- Email: `admin@hospital.com`
- Password: `admin123`

### Bác sĩ
- Email: `doctor@hospital.com`
- Password: `doctor123`

### Y tá
- Email: `nurse@hospital.com`
- Password: `nurse123`

### Bệnh nhân
- Email: `patient@email.com`
- Password: `patient123`

## 📁 Cấu trúc dự án

```
src/
├── components/          # Các component tái sử dụng
│   ├── Common/         # Component chung (Button, Modal, Table...)
│   └── Layout/         # Component layout (Header, Sidebar...)
├── contexts/           # React Context cho state management
│   ├── AuthContext.jsx # Quản lý authentication
│   └── HospitalContext.jsx # Quản lý dữ liệu bệnh viện
├── pages/              # Các trang chính
│   ├── Admin/          # Trang dành cho admin
│   ├── Doctor/         # Trang dành cho bác sĩ
│   ├── Nurse/          # Trang dành cho y tá
│   ├── Patient/        # Trang dành cho bệnh nhân
│   ├── Auth/           # Trang đăng nhập
│   └── Home/           # Trang chủ
├── App.jsx             # Component chính
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## 🎨 Giao diện

- **Responsive Design**: Tương thích với mọi thiết bị
- **Dark/Light Mode**: Hỗ trợ chế độ sáng/tối
- **Modern UI**: Giao diện hiện đại với Tailwind CSS
- **Accessibility**: Tuân thủ các tiêu chuẩn accessibility

## 🔧 Scripts có sẵn

```bash
npm run dev      # Chạy development server
npm run build    # Build cho production
npm run preview  # Preview build production
npm run lint     # Chạy ESLint
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive, tương thích với:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔒 Bảo mật

- Xác thực người dùng với JWT
- Phân quyền theo vai trò
- Bảo vệ routes
- Validation dữ liệu đầu vào

## 🚀 Deployment

### Build cho production
```bash
npm run build
```

### Deploy với Vercel
```bash
npm install -g vercel
vercel
```

### Deploy với Netlify
```bash
npm run build
# Upload thư mục dist lên Netlify
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tác giả

- **Hospital Management Team** - *Initial work*

## 🙏 Lời cảm ơn

- [React](https://reactjs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide React](https://lucide.dev/) - Icon library

## 📞 Liên hệ

- Email: info@hospital.com
- Phone: 0123 456 789
- Address: 123 Đường ABC, Quận 1, TP.HCM

---

⭐ Nếu dự án này hữu ích, hãy cho chúng tôi một star!
