# Project: EduMarket - Sàn thương mại điện tử tài liệu giảng dạy

## 1. Thông tin dự án (Context)
### Mục tiêu
Xây dựng sàn thương mại điện tử cho phép mua bán tài liệu giảng dạy (giáo án, đề thi, slide).
- **Người bán**: Giáo viên, giảng viên upload tài liệu để kiếm tiền.
- **Người mua**: Giáo viên khác, sinh viên, phụ huynh mua tài liệu tham khảo.
- **Mô hình doanh thu**: Thu phí hoa hồng (Commission) trên mỗi lượt bán.

### Tính năng cốt lõi (USP)
- **Preview an toàn**: Cho phép xem trước 20-30% nội dung, làm mờ phần còn lại.
- **Bảo vệ bản quyền**: Đóng dấu watermark tự động lên file PDF.
- **Tìm kiếm thông minh**: Tìm theo môn, lớp, loại tài liệu.

### Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS, Shadcn/UI.
- **Backend**: NestJS (Hexagonal Architecture), TypeORM.
- **Database**: PostgreSQL (Lưu data + Full-text Search).
- **Cache**: Redis.
- **Storage**: MinIO / AWS S3 (Lưu file gốc và file preview).

## 2. Kế hoạch thực hiện (Implementation Plan)

### Phase 1: Khởi tạo & Cơ sở hạ tầng
- [x] Khởi tạo Monorepo: Backend (NestJS) & Frontend (Next.js).
- [x] Cấu hình Docker Compose: PostgreSQL, Redis, MinIO.
- [x] Thiết lập kiến trúc Hexagonal cho NestJS.
- [x] Cấu hình Tailwind CSS & Shadcn/UI cho Frontend.
- [x] Thiết lập Theme & Typography (Primary Color: #0F62FE or #00B5AD).

### Phase 2: Authentication & Users
- [ ] Thiết kế Database Schema: Users, Roles (Admin, Vendor, Buyer).
- [ ] API: Register, Login (JWT), Profile.
- [ ] UI: Trang Đăng nhập / Đăng ký (Clean, Academic style).
- [ ] UI: User Profile & Settings.

### Phase 3: Quản lý Tài liệu (Core Product)
- [ ] **Backend**:
    - [ ] Schema: Document, Category, Price.
    - [ ] API Upload file (Multipart -> S3/MinIO).
    - [ ] Worker xử lý file: Tạo bản Preview (PDF split/blur) + Watermark.
- [ ] **Frontend - Client**:
    - [ ] **Trang chủ (Homepage)**:
        - [ ] Hero Section với thanh tìm kiếm lớn ("Google cho tài liệu").
        - [ ] Danh mục (Categories) dạng Grid.
        - [ ] Carousel "Tài liệu nổi bật".
    - [ ] **Trang Chi tiết (Document Detail)**:
        - [ ] PDF Viewer (Preview 3-5 trang đầu, làm mờ trang sau).
        - [ ] Sticky Sidebar: Nút Mua, Thông tin file, Profile người bán.
    - [ ] **Seller Studio (Kênh người bán)**:
        - [ ] Upload Flow: Kéo thả file -> Nhập thông tin -> Giá.
        - [ ] Quản lý danh sách tài liệu.

### Phase 4: Mua bán & Thanh toán
- [ ] **Backend**:
    - [ ] Schema: Orders, Transactions, Wallets.
    - [ ] API: Add to Cart, Checkout (Mock Payment).
    - [ ] Job: Cấp quyền tải file sau khi thanh toán thành công.
- [ ] **Frontend**:
    - [ ] UI Giỏ hàng (Cart).
    - [ ] UI Thanh toán & Kết quả giao dịch.
    - [ ] Trang "Tài liệu của tôi" (Purchased Documents) với link tải bảo mật.

### Phase 5: Admin & Hoàn thiện
- [ ] **Admin Dashboard**:
    - [ ] Thẻ số liệu: Doanh thu, Tài liệu chờ duyệt, User mới.
    - [ ] Biểu đồ doanh thu.
- [ ] **Moderation Queue (Duyệt tài liệu)**:
    - [ ] Split View: Danh sách bên trái - Viewer bên phải.
    - [ ] Action: Approve / Reject (kèm lý do).
- [ ] **Finance**: Quản lý đối soát & Rút tiền.
- [ ] **Search Engine**: Tối ưu Full-text Search trên PostgreSQL.
- [ ] **Reviews**: Chức năng đánh giá & bình luận.

## 3. UI/UX Design Guidelines
- **Phong cách**: Clean, Content-first, Academic.
- **Màu chủ đạo**: Blue (#0F62FE) hoặc Teal (#00B5AD).
- **Background**: Light Gray (#F4F6F8) để nổi bật nội dung trắng.
- **Text**: Dark Gray (#1A202C) cho tiêu đề, Gray (#4A5568) cho nội dung.