I. Giao diện Client (Người mua & Người bán)
Phong cách chủ đạo: Sạch (Clean), Tập trung vào nội dung (Content-first), Tạo cảm giác tin cậy (Academic). Tham khảo: SlideShare, Scribd, Coursera, Udemy.
1. Trang chủ (Homepage) - "Google cho tài liệu"
•	Hero Section (Phần đầu trang):
o	Đặt thanh Tìm kiếm (Search Bar) thật lớn ở giữa trung tâm. Đây là tính năng quan trọng nhất.
o	Placeholder: "Tìm giáo án, đề thi toán, luận văn..."
o	Nút "Upload tài liệu" nổi bật ở góc phải (Call-to-Action cho người bán).
•	Categories (Danh mục): Dạng Grid (lưới) các icon/thẻ: Tiểu học, THCS, THPT, Đại học, Ngoại ngữ, Kỹ năng mềm.
•	Section "Tài liệu nổi bật": Hiển thị dạng Carousel (trượt ngang). Mỗi thẻ tài liệu gồm:
o	Thumbnail (Ảnh bìa trang đầu tiên của tài liệu).
o	Tiêu đề (Tối đa 2 dòng).
o	Giá tiền (Màu nổi bật).
o	Đánh giá sao (ví dụ: 4.5 ⭐).
o	Avatar người bán (Tạo uy tín).
2. Trang Chi tiết Tài liệu (Document Detail) - "Nơi chốt đơn"
Chia bố cục màn hình tỉ lệ 7:3 (hoặc 2/3 và 1/3).
•	Cột trái (70%) - Trình xem trước (Previewer):
o	Đây là "trái tim" của trang này. Hiển thị tài liệu dạng PDF Viewer cuộn dọc.
o	Hiệu ứng làm mờ (Blur/Overlay): Cho xem rõ 3-5 trang đầu. Các trang sau làm mờ đi hoặc hiện thông báo "Mua để xem tiếp 20 trang còn lại".
o	Trên bề mặt file có đóng dấu Watermark chéo mờ tên Website.
•	Cột phải (30%) - Thông tin & Mua hàng (Sticky Sidebar):
o	Nút "Mua ngay - 20.000đ" to, màu nổi bật, dính chặt khi cuộn trang.
o	Thông tin file: Định dạng (Word/PDF), Số trang, Dung lượng.
o	Profile người bán + Nút "Theo dõi".
o	Mô tả chi tiết tài liệu.
3. Trang Quản lý của Người bán (Seller Studio)
•	Giao diện giống như Youtube Studio.
•	Upload Flow: Kéo thả file -> Hệ thống tự tách trang đầu làm ảnh bìa -> Nhập giá -> Nhập Tags.
•	Thống kê: Biểu đồ đường thể hiện doanh thu theo ngày/tháng.
________________________________________
II. Giao diện Admin (Quản trị hệ thống)
Phong cách chủ đạo: Dạng Dashboard, Mật độ thông tin cao (Data-dense), Dễ thao tác (Utility-first). Tham khảo: Ant Design Pro, Mantine Admin.
1. Dashboard (Tổng quan)
Hiển thị 4 thẻ số liệu quan trọng (Metric Cards) trên cùng:
1.	Doanh thu hôm nay (Tổng tiền vào).
2.	Tài liệu chờ duyệt (Cần xử lý gấp).
3.	Người dùng mới.
4.	Báo cáo vi phạm (Copyright issue).
2. Trang Duyệt tài liệu (Moderation Queue) - Quan trọng nhất
Đây là trang Admin sẽ dùng nhiều nhất. Nên thiết kế chia đôi màn hình (Split View):
•	Danh sách bên trái: List các tài liệu đang ở trạng thái PENDING. Hiển thị: Tên, Người đăng, Thời gian đăng.
•	Vùng xem bên phải:
o	Hiển thị nội dung file (Viewer).
o	Các nút hành động nhanh (Action Buttons):
	✅ Duyệt (Approve): Tài liệu public ngay lập tức.
	❌ Từ chối (Reject): Hiện popup chọn lý do (Vi phạm bản quyền, Nội dung rác, Sai danh mục...) để gửi mail cho user.
3. Trang Quản lý tài chính (Finance)
•	Bảng liệt kê các giao dịch nạp/rút tiền.
•	Màu sắc phân biệt rõ ràng: Tiền vào (Xanh lá), Tiền ra/Rút (Đỏ).
•	Tính năng "Đối soát": Checkbox để xác nhận đã chuyển khoản cho người bán.
________________________________________
III. Bảng màu & Typography (Gợi ý)
Để tạo cảm giác giáo dục, tin cậy, bạn nên dùng Palette màu Xanh Dương (Blue) hoặc Xanh Ngọc (Teal).
•	Primary Color (Màu chủ đạo): #0F62FE (IBM Blue) hoặc #00B5AD (Teal - giống Udemy). Dùng cho nút Mua, Header, Link.
•	Background: #F4F6F8 (Xám rất nhạt) để làm nổi bật các khối nội dung màu trắng.
•	Text Color:
o	Tiêu đề: #1A202C (Gần đen).
o	Nội dung: #4A5568 (Xám đậm - đỡ mỏi mắt khi đọc tài liệu).
•	Warning/Error: Đỏ cam (cho nút Báo cáo vi phạm).
________________________________________
IV. Công cụ giúp bạn hiện thực hóa
Vì bạn là dân kỹ thuật (Technical), tôi khuyên không nên vẽ từ đầu (scratch). Hãy dùng các thư viện UI có sẵn Component:
1.	Nếu dùng React/Next.js (Client):
o	Mantine UI hoặc Chakra UI: Rất đẹp, hiện đại, dễ tùy biến.
o	Shadcn/ui: Đang rất hot, clean, code nằm ngay trong project của bạn, dễ chỉnh sửa.
2.	Nếu dùng React (Admin):
o	Ant Design (AntD): Vua của dòng Admin Dashboard, có sẵn Table, Form, Upload rất mạnh.
o	Refine: Framework chuyên để build Admin Dashboard cực nhanh (kết nối thẳng với API Backend).

