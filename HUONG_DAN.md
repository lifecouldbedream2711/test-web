# 🏥 Hệ thống Đặt lịch Khám bệnh

Hệ thống quản lý đặt lịch khám bệnh trực tuyến với 21 trang đầy đủ chức năng cho Bệnh nhân, Bác sĩ và Quản trị viên.

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cách chạy ứng dụng](#cách-chạy-ứng-dụng)
- [Tài khoản thử nghiệm](#tài-khoản-thử-nghiệm)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Chức năng](#chức-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)

## 🔧 Yêu cầu hệ thống

Trước khi chạy ứng dụng, hãy đảm bảo máy tính của bạn đã cài đặt:

- **Node.js** phiên bản 18.0 trở lên
- **npm** phiên bản 9.0 trở lên (đi kèm với Node.js)

Kiểm tra phiên bản đã cài:
```bash
node --version
npm --version
```

## 📦 Cài đặt

### Bước 1: Clone repository (nếu chưa có)

```bash
git clone https://github.com/lifecouldbedream2711/test-web.git
cd test-web
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

Lệnh này sẽ cài đặt tất cả các thư viện cần thiết (Material-UI, React Router, Axios, v.v.)

## 🚀 Cách chạy ứng dụng

### Chạy ở chế độ Development (Phát triển)

```bash
npm run dev
```

Sau khi chạy lệnh, ứng dụng sẽ khởi động tại:
```
➜  Local:   http://localhost:5173/
```

Mở trình duyệt và truy cập địa chỉ trên để sử dụng ứng dụng.

### Build cho Production (Sản xuất)

```bash
npm run build
```

Build sẽ được tạo trong thư mục `dist/`

### Xem trước bản build

```bash
npm run preview
```

### Kiểm tra lỗi code (Linting)

```bash
npm run lint
```

## 👥 Tài khoản thử nghiệm

### Đăng nhập với vai trò khác nhau:

#### 🏥 **Quản trị viên (Admin)**
```
Email: admin@hospital.vn
Mật khẩu: 123456
```
- Truy cập: http://localhost:5173/admin/login
- Quản lý toàn bộ hệ thống

#### 👨‍⚕️ **Bác sĩ (Doctor)**
```
Email: bs.nguyenvana@hospital.vn
Mật khẩu: 123456
```
- Truy cập: http://localhost:5173/doctor/login
- Xem lịch khám và khám bệnh

#### 🙋 **Bệnh nhân (Patient)**
```
Email: patient1@gmail.com
Mật khẩu: 123456
```
- Truy cập: http://localhost:5173/patient/login
- Đặt lịch khám và xem lịch sử

Hoặc có thể **đăng ký tài khoản mới** tại: http://localhost:5173/patient/register

## 📁 Cấu trúc dự án

```
test-web/
├── src/
│   ├── components/           # Các component tái sử dụng
│   │   ├── common/          # Button, Input, Modal, Card, Navbar...
│   │   ├── patient/         # Component riêng cho bệnh nhân
│   │   ├── admin/           # AdminLayout
│   │   └── doctor/          # DoctorLayout
│   │
│   ├── pages/               # Trang web (21 trang)
│   │   ├── patient/         # 8 trang bệnh nhân
│   │   ├── admin/           # 10 trang quản trị
│   │   └── doctor/          # 3 trang bác sĩ
│   │
│   ├── services/            # API calls (9 service files)
│   │   ├── authService.ts
│   │   ├── patientService.ts
│   │   ├── doctorService.ts
│   │   ├── adminService.ts
│   │   └── ...
│   │
│   ├── contexts/            # React Context (AuthContext)
│   ├── types/               # TypeScript interfaces
│   ├── mocks/               # Dữ liệu giả (8 JSON files)
│   └── utils/               # Helper functions
│
├── public/                  # Static files
├── package.json             # Dependencies và scripts
└── vite.config.ts           # Cấu hình Vite
```

## ✨ Chức năng

### 🙋 Module Bệnh nhân (8 trang)

1. **Đăng ký** - Tạo tài khoản mới
2. **Đăng nhập** - Xác thực và vào hệ thống
3. **Dashboard** - Trang chủ với thống kê lịch hẹn
4. **Thông tin cá nhân** - Cập nhật profile
5. **Đặt lịch khám** - Quy trình đặt lịch 4 bước:
   - Bước 1: Chọn chuyên khoa
   - Bước 2: Chọn dịch vụ và bác sĩ
   - Bước 3: Chọn ngày và ca làm
   - Bước 4: Chọn khung giờ và xác nhận
6. **Lịch hẹn của tôi** - Quản lý lịch hẹn (5 trạng thái)
7. **Lịch sử khám** - Xem các lần khám đã hoàn tất
8. **Chi tiết lần khám** - Xem hồ sơ và đơn thuốc

### 🏥 Module Quản trị (10 trang)

1. **Đăng nhập Admin**
2. **Dashboard** - Thống kê tổng quan
3. **Quản lý tài khoản** - CRUD users (3 tabs: Bệnh nhân/Bác sĩ/Admin)
4. **Quản lý bác sĩ** - Thêm bác sĩ và gán chuyên khoa
5. **Quản lý chuyên khoa** - CRUD specialties
6. **Quản lý dịch vụ** - CRUD services
7. **Quản lý ca làm** - Tạo và quản lý ca làm bác sĩ
8. **Duyệt lịch hẹn** - Phê duyệt/từ chối lịch hẹn
9. **Check-in** - Check-in bệnh nhân
10. **Theo dõi lịch hẹn** - Xem tất cả lịch hẹn với bộ lọc

### 👨‍⚕️ Module Bác sĩ (3 trang)

1. **Đăng nhập Doctor**
2. **Dashboard** - Xem lịch khám với bộ lọc
3. **Khám bệnh** - Ghi hồ sơ khám, kê đơn thuốc, hoàn tất

## 🛠️ Công nghệ sử dụng

### Frontend Framework
- **React 19** - Thư viện UI
- **TypeScript** - Ngôn ngữ lập trình
- **Vite 7** - Build tool

### UI & Styling
- **Material-UI v7** - Component library
- **Emotion** - CSS-in-JS

### Routing & Forms
- **React Router v6** - Điều hướng trang
- **React Hook Form** - Quản lý form
- **Yup** - Validation schema

### State Management
- **React Context API** - Authentication state
- **Zustand** - Global state (nếu cần)

### HTTP & Date
- **Axios** - HTTP client
- **date-fns** - Xử lý ngày tháng

### Notifications
- **react-toastify** - Toast messages

## 📊 Dữ liệu Mock

Hệ thống sử dụng dữ liệu giả (mock data) trong thư mục `src/mocks/`:

- **8 chuyên khoa** y tế (Tim mạch, Da liễu, Nhi khoa, v.v.)
- **25 dịch vụ** khám chữa bệnh
- **12 bác sĩ** với thông tin đầy đủ
- **25 bệnh nhân**
- **60 ca làm việc** trong 7 ngày tới
- **40 lịch hẹn** với các trạng thái khác nhau
- **15 hồ sơ khám bệnh** và đơn thuốc

## 🎨 Giao diện

- ✅ Responsive design (tương thích mobile)
- ✅ Giao diện đẹp với màu gradient
- ✅ Form validation đầy đủ
- ✅ Loading states
- ✅ Toast notifications
- ✅ Confirmation dialogs
- ✅ Nhãn tiếng Việt

## 🔐 Bảo mật

- Xác thực JWT (lưu trong localStorage)
- Protected routes theo vai trò (PATIENT/DOCTOR/ADMIN)
- Validation đầy đủ ở client-side

## 📝 Lưu ý

- Đây là ứng dụng **frontend-only** với mock data
- Để kết nối backend thật, cần cập nhật các service trong `src/services/`
- Dữ liệu sẽ bị reset khi reload trang (vì dùng mock data)

## 🐛 Gặp vấn đề?

### Port 5173 đã được sử dụng?
```bash
# Thay đổi port trong package.json
"dev": "vite --port 3000"
```

### Lỗi khi npm install?
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Không thấy thay đổi sau khi sửa code?
- Vite có Hot Module Replacement (HMR), tự động reload
- Nếu không thấy, thử hard refresh: `Ctrl + Shift + R` (Windows/Linux) hoặc `Cmd + Shift + R` (Mac)

## 📞 Hỗ trợ

Nếu có câu hỏi hoặc gặp lỗi, vui lòng tạo issue trên GitHub repository.

---

**Phát triển bởi:** Copilot Agent  
**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 04/02/2026  

Chúc bạn sử dụng hệ thống hiệu quả! 🎉
