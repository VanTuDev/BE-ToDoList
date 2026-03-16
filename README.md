# UniTracker Backend (NestJS + MongoDB)

API server cho FPT UniTracker.

## Yêu cầu

- Node.js 18+
- MongoDB (chạy local hoặc URI)

## Cài đặt và chạy (local)

**Dùng chung node_modules với FE:** Chỉ cài tại **thư mục gốc** (xem README ở root). Không cần `server/node_modules`.

```bash
# Từ thư mục gốc
npm install
npm run dev          # Chạy cả FE + BE
npm run dev:be       # Chỉ chạy BE (port 4000)
```

**Chạy riêng trong server (nếu cần):** `cd server` rồi `npx nest start --watch` (dùng node_modules từ root).

## Cấu hình

Dùng chung file `.env` tại **thư mục gốc** (xem `.env.example` ở root). Hoặc tạo `.env` trong `server/` nếu chạy BE riêng.

**MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.ujizilr.mongodb.net/unitracker?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
```
- Thay `USER` và `PASSWORD` bằng user/password Atlas.
- Nếu mật khẩu có ký tự đặc biệt (`@`, `#`, `%`, ...) thì encode URL (vd: `@` → `%40`).
- Trên Atlas: **Network Access** → thêm IP (hoặc `0.0.0.0/0` cho mọi IP).
- Ứng dụng dùng **Mongoose** (đã kèm driver), không cần cài thêm package `mongodb`.

## Tài khoản demo (lần đầu chạy)

Để đăng nhập ngay với tài khoản mẫu (SĐT 0399604816, MK 123456), gọi **một lần**:

```bash
curl -X POST http://localhost:4000/api/data/seed-demo
```

Hoặc dùng Postman: **POST** `http://localhost:4000/api/data/seed-demo` (không cần body). Sau đó đăng nhập trên web với SĐT `0399604816` và mật khẩu `123456`. Nếu đã có tài khoản, dùng tab **Đăng ký** trên trang login để tạo tài khoản mới.

## API Endpoints

**Auth (không cần token):**
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/auth/register | Đăng ký (body: `{ "phone", "password" }`) |
| POST | /api/auth/login | Đăng nhập (body: `{ "phone", "password" }` → trả về `token`, `userId`) |

**Data (cần header `Authorization: Bearer <token>`):**
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/data/state | Lấy toàn bộ state (profile, subjects, timetable, tasks...) |
| POST | /api/data/seed-demo | Seed user demo (SĐT 0399604816, MK 123456) + profile + môn học + TKB. Chỉ thêm cho user đó. |
| GET | /api/profile | Lấy profile |
| PATCH | /api/profile | Cập nhật profile |
| GET | /api/subjects | Danh sách môn học |
| POST | /api/subjects | Thêm môn học |
| PATCH | /api/subjects/:id | Sửa môn học |
| DELETE | /api/subjects/:id | Xóa môn học |
| GET | /api/timetable | Danh sách tiết TKB |
| POST | /api/timetable | Thêm tiết TKB |
| DELETE | /api/timetable/:id | Xóa tiết TKB |
| GET | /api/daily-tasks | Việc cần làm |
| POST | /api/daily-tasks | Thêm việc |
| PATCH | /api/daily-tasks/:id/toggle | Đánh dấu hoàn thành |
| DELETE | /api/daily-tasks/:id | Xóa việc |
| POST | /api/daily-tasks/bulk | Thêm nhiều việc (body: `{ "tasks": [{ "title", "priority?" }] }`) |
| POST | /api/daily-tasks/ai-suggest | AI gợi ý 3–5 việc trong ngày (cần GEMINI_API_KEY) |
| GET | /api/study-schedules | Lịch học tự đặt |
| POST | /api/study-schedules | Thêm lịch |
| PATCH | /api/study-schedules/:id/toggle | Đánh dấu hoàn thành |
| DELETE | /api/study-schedules/:id | Xóa lịch |
| GET | /api/study-tasks | Nhiệm vụ học tập |
| PATCH | /api/study-tasks/:id/toggle | Đánh dấu hoàn thành |

## Test bằng Postman

1. Mở Postman → **Import** → chọn file `postman/UniTracker-API.postman_collection.json`.
2. Biến `baseUrl` mặc định là `http://localhost:4000`. Sửa nếu chạy server khác port.
3. Gọi **POST Seed demo** (POST /api/data/seed-demo) một lần để tạo user 0399604816 / 123456 và dữ liệu mẫu. Sau đó **POST Login** để lấy token, rồi gọi **GET Full State** và các API khác với header `Authorization: Bearer <token>`.
