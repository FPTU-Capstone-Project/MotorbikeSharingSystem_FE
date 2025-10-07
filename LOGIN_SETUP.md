# 🔐 LOGIN SYSTEM SETUP - ADMIN DASHBOARD

## ✅ ĐÃ HOÀN THÀNH

Login system đã được tích hợp đầy đủ vào Admin Dashboard!

---

## 📋 CÁC THAY ĐỔI

### 1. **Login Page** (`/src/pages/LoginPage.tsx`)
- Beautiful gradient background with animated blobs
- Email & Password fields với validation
- Show/Hide password toggle
- Remember me checkbox
- Demo credentials displayed
- Loading state khi login

### 2. **Authentication Context** (`/src/contexts/AuthContext.tsx`)
- `useAuth()` hook để access user info
- `login(email, password)` - Call backend API
- `logout()` - Clear tokens & redirect
- Auto-load user từ localStorage
- Token management (access + refresh)

### 3. **Protected Routes** (`/src/components/ProtectedRoute.tsx`)
- Wrap tất cả dashboard routes
- Auto redirect to `/login` nếu chưa login
- Loading state khi check authentication

### 4. **Updated Layout** (`/src/components/Layout.tsx`)
- Display user info (name, email) từ AuthContext
- Logout button với icon
- Toast notification khi logout

### 5. **Updated App** (`/src/App.tsx`)
- AuthProvider wrap toàn bộ app
- Login route: `/login` (public)
- Tất cả routes khác: Protected
- Catch-all redirect to `/`

### 6. **Updated API Utils** (`/src/utils/api.ts`)
- Auto inject `Authorization: Bearer {token}` header
- Better error handling với status codes

---

## 🚀 CÁCH SỬ DỤNG

### **Bước 1: Start Backend**
```bash
cd MotorbikeSharingSystem_BE
./dev.sh
```

Backend phải chạy trên: `http://localhost:8080`

### **Bước 2: Start Frontend**
```bash
cd MotorbikeSharingSystem_FE
npm start
```

Frontend sẽ mở tại: `http://localhost:3000`

### **Bước 3: Login**

App sẽ **TỰ ĐỘNG redirect** sang `/login` vì chưa có token.

**Admin Credentials:**
```
Email: admin@mssus.com
Password: Password1!
```

Nhập thông tin và click **Sign in**

### **Bước 4: Sử dụng Dashboard**

Sau khi login thành công:
- ✅ Token được lưu vào localStorage
- ✅ User info được lưu vào state
- ✅ Auto redirect về Dashboard (/)
- ✅ Tất cả API requests tự động có Authorization header
- ✅ User name hiển thị ở header
- ✅ Có thể Logout bằng button ở góc phải

---

## 🔄 FLOW HOÀN CHỈNH

```
1. User vào http://localhost:3000
   ↓
2. ProtectedRoute check: Có token không?
   - KHÔNG → Redirect to /login
   - CÓ → Cho vào Dashboard
   ↓
3. User nhập email/password và click Sign in
   ↓
4. LoginPage gọi useAuth().login(email, password)
   ↓
5. AuthContext call API: POST /api/v1/auth/login
   ↓
6. Backend trả về: accessToken, refreshToken, userId
   ↓
7. AuthContext lưu:
   - localStorage.setItem('token', accessToken)
   - localStorage.setItem('user', JSON.stringify(userData))
   - setToken(accessToken)
   - setUser(userData)
   ↓
8. Auto redirect về Dashboard (/)
   ↓
9. Layout hiển thị user name ở header
   ↓
10. Mỗi API call tự động có: Authorization: Bearer {token}
   ↓
11. User click Logout
   ↓
12. AuthContext.logout():
    - Clear localStorage
    - Clear state
    - Redirect to /login
```

---

## 🎯 API INTEGRATION

### **Login API**
```typescript
POST /api/v1/auth/login

Request:
{
  "email": "admin@mssus.com",
  "password": "Password1!",
  "targetProfile": "rider"
}

Response:
{
  "userId": 1,
  "userType": "ADMIN",
  "activeProfile": "rider",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": 3600
}
```

### **Get Profile API** (Optional - Called after login)
```typescript
GET /api/v1/me
Headers: Authorization: Bearer {token}

Response:
{
  "userId": 1,
  "email": "admin@mssus.com",
  "fullName": "Admin User",
  "userType": "ADMIN",
  "activeProfile": "rider"
}
```

### **Logout API** (Optional - Fire and forget)
```typescript
POST /api/v1/auth/logout
Headers: Authorization: Bearer {token}

Response:
{
  "message": "Logged out successfully"
}
```

---

## 🛡️ SECURITY FEATURES

1. **JWT Token Authentication**
   - Access token stored in localStorage
   - Auto-injected trong mọi API request
   - Token checked trước mỗi protected route

2. **Protected Routes**
   - Tất cả dashboard pages require authentication
   - Auto redirect to login nếu không có token

3. **Token Persistence**
   - Token survive page refresh
   - Auto-load user on app mount

4. **Secure Logout**
   - Clear all tokens from localStorage
   - Clear user state
   - Optional backend logout call

---

## 📝 TEST ACCOUNTS

### Admin Account (Production)
```
Email: admin@mssus.com
Password: Password1!
```

### Other Test Accounts (If seeded)
```
Student:
Email: nguyen.van.a@student.hcmut.edu.vn
Password: Password1!

Driver:
Email: pham.van.h@student.hcmut.edu.vn
Password: Password1!
```

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Login failed"
- ✅ Check backend đang chạy: http://localhost:8080
- ✅ Check credentials đúng: `admin@mssus.com` / `Password1!`
- ✅ Xem console log để biết lỗi cụ thể

### Lỗi: "Unauthorized" khi approve/reject
- ✅ Login lại để lấy token mới
- ✅ Check token còn valid (expire sau 1 hour)

### Lỗi: Infinite redirect loop
- ✅ Clear localStorage: `localStorage.clear()`
- ✅ Refresh page

### Token expired
- ✅ Logout và login lại
- ✅ (Future) Auto refresh token mechanism

---

## 🚧 FUTURE IMPROVEMENTS

- [ ] Token auto-refresh mechanism
- [ ] Remember me functionality (extend token expiry)
- [ ] Forgot password flow
- [ ] Session timeout warning
- [ ] Multi-factor authentication
- [ ] Login activity tracking
- [ ] Role-based UI rendering

---

## 📂 FILES CREATED/MODIFIED

**Created:**
- `/src/pages/LoginPage.tsx` - Login UI
- `/src/contexts/AuthContext.tsx` - Auth state management
- `/src/components/ProtectedRoute.tsx` - Route protection

**Modified:**
- `/src/App.tsx` - Added AuthProvider, login route, protected routes
- `/src/components/Layout.tsx` - Added user info, logout button
- `/src/utils/api.ts` - Added auto token injection

---

## ✅ CHECKLIST

- [x] Login Page UI
- [x] API integration với backend
- [x] Token storage (localStorage)
- [x] Protected Routes
- [x] Auto redirect to login
- [x] User info display
- [x] Logout functionality
- [x] Toast notifications
- [x] Loading states
- [x] Error handling

---

**🎉 LOGIN SYSTEM ĐÃ HOÀN THÀNH!**

Bây giờ bạn có thể:
1. Start backend
2. Start frontend
3. Auto redirect to login
4. Login với admin credentials
5. Sử dụng dashboard với authentication đầy đủ!
