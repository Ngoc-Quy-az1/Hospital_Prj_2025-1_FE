# 🚀 Hướng dẫn Deploy

## Chuẩn bị

1. **Đảm bảo code đã được commit và push lên GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Kiểm tra build local (tùy chọn)**
   ```bash
   npm run build
   npm run preview  # Xem preview build
   ```

## Các phương án Deploy

### 1. Vercel (Khuyến nghị - Dễ nhất)

**Ưu điểm:** 
- Tự động deploy từ GitHub
- SSL miễn phí
- CDN toàn cầu
- Hỗ trợ Vite tốt

**Các bước:**
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub
3. Click "Add New Project"
4. Chọn repository của bạn
5. Vercel tự động detect Vite, không cần cấu hình thêm
6. Click "Deploy"
7. (Tùy chọn) Thêm Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://hospital-prj-2025-1-be.onrender.com`

**Kết quả:** Bạn sẽ nhận được URL như: `https://your-project.vercel.app`

---

### 2. Netlify

**Ưu điểm:**
- Dễ sử dụng
- Hỗ trợ GitHub integration
- SSL miễn phí

**Các bước:**
1. Truy cập [netlify.com](https://netlify.com)
2. Đăng nhập bằng GitHub
3. Click "Add new site" → "Import an existing project"
4. Chọn repository của bạn
5. Cấu hình build:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. (Tùy chọn) Thêm Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://hospital-prj-2025-1-be.onrender.com`
7. Click "Deploy site"

**Kết quả:** Bạn sẽ nhận được URL như: `https://your-project.netlify.app`

---

### 3. Render

**Ưu điểm:**
- Miễn phí
- Hỗ trợ nhiều loại service

**Các bước:**
1. Truy cập [render.com](https://render.com)
2. Đăng nhập bằng GitHub
3. Click "New +" → "Static Site"
4. Connect GitHub repository
5. Cấu hình:
   - Name: `hospital-frontend` (hoặc tên bạn muốn)
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
6. Thêm Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://hospital-prj-2025-1-be.onrender.com`
7. Click "Create Static Site"

**Kết quả:** Bạn sẽ nhận được URL như: `https://your-project.onrender.com`

---

## Sau khi Deploy

1. **Kiểm tra ứng dụng:**
   - Truy cập URL đã deploy
   - Mở Developer Tools (F12)
   - Kiểm tra Console và Network tab

2. **Test các chức năng:**
   - Đăng nhập
   - Điều hướng giữa các trang
   - Gọi API

3. **Kiểm tra CORS:**
   - Nếu gặp lỗi CORS, đảm bảo backend đã cấu hình CORS cho domain frontend

## Troubleshooting

### Lỗi: "Failed to fetch" hoặc CORS error
- **Nguyên nhân:** Backend chưa cấu hình CORS cho domain frontend
- **Giải pháp:** Cấu hình backend để cho phép origin của frontend

### Lỗi: "404 Not Found" khi refresh trang
- **Nguyên nhân:** Server chưa cấu hình SPA routing
- **Giải pháp:** Đã được xử lý trong `vercel.json` và `netlify.toml` (redirect tất cả về `/index.html`)

### Build failed
- Kiểm tra lỗi trong build log
- Đảm bảo tất cả dependencies đã được cài đặt
- Kiểm tra Node version (nên dùng Node 18+)

## Lưu ý quan trọng

1. **Environment Variables:**
   - API URL mặc định đã được set trong code: `https://hospital-prj-2025-1-be.onrender.com`
   - Chỉ cần thêm biến môi trường nếu muốn override

2. **CORS:**
   - Backend cần cấu hình CORS để cho phép domain frontend
   - Thêm domain frontend vào danh sách allowed origins trong backend

3. **HTTPS:**
   - Tất cả các platform trên đều cung cấp SSL miễn phí
   - Đảm bảo API cũng dùng HTTPS

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
- Build logs trên platform
- Browser console
- Network tab trong Developer Tools
- Backend logs


