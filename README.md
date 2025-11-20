# Hướng dẫn triển khai dự án Quản lý sân Pickleball

Dự án này cung cấp ứng dụng quản lý sân pickleball sử dụng **Node.js**, **Express** và cơ sở dữ liệu **MySQL**. Dưới đây là các bước để thiết lập và chạy ứng dụng trên máy của bạn.

## 1. Chuẩn bị môi trường

1. **Cài đặt Node.js**: đảm bảo đã cài Node.js (phiên bản >= 16). Bạn có thể tải tại [nodejs.org](https://nodejs.org/).
2. **Cài đặt MySQL**: cài đặt và khởi động MySQL Server. Tạo một cơ sở dữ liệu mới (ví dụ `pickleball`) và cấp quyền truy cập cho user của bạn. Ghi nhớ các thông số kết nối (host, port, user, password, database).
3. **Cài đặt các thư viện cần thiết**: trong thư mục dự án, chạy:

   ```bash
   npm install express cors mysql2
   ```

   Thư viện `mysql2` được dùng để kết nối MySQL theo dạng promise. `express` và `cors` là các phụ thuộc của API.

## 2. Cấu hình thông số kết nối MySQL

Ứng dụng đọc các biến môi trường để kết nối tới MySQL. Bạn có thể tạo file `.env` hoặc thiết lập biến môi trường trong terminal với các giá trị sau:

```bash
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=<tên_user>
export MYSQL_PASSWORD=<mật_khẩu>
export MYSQL_DATABASE=pickleball
```

Thay thế `<tên_user>` và `<mật_khẩu>` bằng thông tin phù hợp của bạn. Nếu không khai báo, ứng dụng sẽ mặc định dùng `root` không mật khẩu và database là `pickleball` trên `localhost` port `3306`.

## 3. Khởi tạo và seed cơ sở dữ liệu

Chạy script `init_db.js` để tạo bảng và dữ liệu mẫu trong MySQL. Script sẽ xóa các bảng cũ (nếu có) và tạo lại bảng với cấu trúc mới, đồng thời thêm một số bản ghi mẫu để bạn thử nghiệm.

```bash
node init_db.js
```

Khi chạy thành công, script in ra `Database initialized` và đóng kết nối.

## 4. Chạy ứng dụng

Sau khi CSDL đã được khởi tạo, chạy server API bằng lệnh:

```bash
node index.js
```

Theo mặc định, server lắng nghe tại cổng `3000`. Bạn có thể truy cập giao diện web ở `http://localhost:3000/` và sử dụng các API có đường dẫn `/api/*`.

## 5. Cấu trúc dự án

- **index.js**: server Express, định nghĩa các API và kết nối MySQL.
- **init_db.js**: script tạo và seed database MySQL.
- **index.html**: giao diện người dùng đơn giản (SPA) để tương tác với API.
- **slides/**: thư mục chứa file trình chiếu (không ảnh hưởng tới chạy ứng dụng).
- **database.sqlite**: file CSDL SQLite cũ (giữ lại để tham khảo, ứng dụng không còn dùng).

## 6. Gợi ý triển khai production

Khi triển khai thực tế:

1. Sử dụng **nginx** hoặc **Apache** làm reverse proxy để phục vụ file tĩnh (`index.html`) và chuyển tiếp các yêu cầu `/api` tới Node.js.
2. Thiết lập biến môi trường an toàn cho thông tin MySQL. Không commit mật khẩu vào mã nguồn.
3. Bật `pm2` hoặc `forever` để chạy Node.js daemon trên server.
4. Sao lưu cơ sở dữ liệu định kỳ.

## 7. Mở rộng hoặc tuỳ biến

Bạn có thể sửa đổi schema trong `init_db.js` và logic ở `index.js` để bổ sung tính năng như gửi thông báo, thanh toán online, tích hợp lịch, v.v. Khi thay đổi schema, hãy chạy lại script khởi tạo (chú ý sẽ mất dữ liệu cũ) hoặc viết script migration.
