import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      refresh: 'Refresh'
    },
    nav: {
      dashboard: 'Dashboard',
      users: 'Users', 
      rides: 'Rides',
      payments: 'Payments',
      safety: 'Safety',
      analytics: 'Analytics'
    },
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Monitor your motorbike sharing system performance and key metrics',
      totalUsers: 'Total Users',
      activeRides: 'Active Rides',
      totalRevenue: 'Total Revenue',
      sosAlerts: 'SOS Alerts',
      revenueTrend: 'Revenue Trend',
      rideStatusDistribution: 'Ride Status Distribution',
      monthlyRides: 'Monthly Rides',
      recentActivity: 'Recent Activity',
      completed: 'Completed',
      ongoing: 'Ongoing',
      cancelled: 'Cancelled'
    },
    users: {
      title: 'User Management',
      subtitle: 'Manage registered users and drivers',
      searchPlaceholder: 'Search users, rides, or transactions...',
      addUser: 'Add New User',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      verifiedDrivers: 'Verified Drivers',
      suspendedUsers: 'Suspended Users'
    },
    header: {
      searchPlaceholder: 'Search users, rides, or transactions...',
      notifications: 'Notifications',
      profile: 'Profile',
      adminUser: 'Admin User'
    }
  },
  vi: {
    common: {
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Thành công',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      save: 'Lưu',
      delete: 'Xóa',
      edit: 'Chỉnh sửa',
      search: 'Tìm kiếm',
      refresh: 'Làm mới'
    },
    nav: {
      dashboard: 'Bảng Điều Khiển',
      users: 'Người Dùng',
      rides: 'Chuyến Đi',
      payments: 'Thanh Toán',
      safety: 'An Toàn',
      analytics: 'Phân Tích'
    },
    dashboard: {
      title: 'Tổng Quan Bảng Điều Khiển',
      subtitle: 'Theo dõi hiệu suất hệ thống chia sẻ xe máy và các chỉ số quan trọng',
      totalUsers: 'Tổng Người Dùng',
      activeRides: 'Chuyến Đi Đang Hoạt Động',
      totalRevenue: 'Tổng Doanh Thu',
      sosAlerts: 'Cảnh Báo SOS',
      revenueTrend: 'Xu Hướng Doanh Thu',
      rideStatusDistribution: 'Phân Bố Trạng Thái Chuyến Đi',
      monthlyRides: 'Chuyến Đi Hàng Tháng',
      recentActivity: 'Hoạt Động Gần Đây',
      completed: 'Đã Hoàn Thành',
      ongoing: 'Đang Diễn Ra',
      cancelled: 'Đã Hủy'
    },
    users: {
      title: 'Quản Lý Người Dùng',
      subtitle: 'Quản lý người dùng đã đăng ký và tài xế',
      searchPlaceholder: 'Tìm kiếm người dùng, chuyến đi hoặc giao dịch...',
      addUser: 'Thêm Người Dùng Mới',
      totalUsers: 'Tổng Người Dùng',
      activeUsers: 'Người Dùng Hoạt Động',
      verifiedDrivers: 'Tài Xế Đã Xác Minh',
      suspendedUsers: 'Người Dùng Bị Đình Chỉ'
    },
    header: {
      searchPlaceholder: 'Tìm kiếm người dùng, chuyến đi hoặc giao dịch...',
      notifications: 'Thông Báo',
      profile: 'Hồ Sơ',
      adminUser: 'Người Quản Trị'
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    react: {
      useSuspense: false,
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em']
    }
  });

export default i18n;