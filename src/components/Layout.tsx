import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  MapIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { MotorbikeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/AuthContext";
import SessionStatus from "./SessionStatus";
import ThemeToggle from "./ThemeToggle";
import toast from "react-hot-toast";
import { notificationService } from "../services/notificationService";
import { NotificationDetail, NotificationSummary } from "../types";
import { formatDateTime } from "../utils/dateUtils";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Tổng quan", href: "/dashboard", icon: HomeIcon },
  { name: "Người dùng", href: "/users", icon: UsersIcon },
  { name: "Tuyến đường", href: "/routes", icon: MapIcon },
  { name: "Quản lý xác minh", href: "/verification", icon: DocumentCheckIcon },
  { name: "Quản lý xe", href: "/vehicle-verification", icon: MotorbikeIcon },
  { name: "Chuyến đi chia sẻ", href: "/rides", icon: MapIcon },
  {
    name: "Tài chính",
    href: "/payments",
    icon: CreditCardIcon,
    submenu: [
      { name: "Quản lý tài chính", href: "/payments", icon: CreditCardIcon },
      { name: "Quản lý rút tiền", href: "/payouts", icon: ArrowUpIcon },
    ],
  },
  { name: "Cấu hình giá", href: "/pricing", icon: DocumentTextIcon },
  { name: "Báo cáo", href: "/reports", icon: DocumentTextIcon },
  { name: "An toàn", href: "/safety", icon: ShieldCheckIcon },
  // { name: "Phân tích", href: "/analytics", icon: ChartBarIcon },
  { name: "Thông báo", href: "/notifications", icon: BellIcon },
];

const Layout = memo(({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNoti, setShowNoti] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [notiLoading, setNotiLoading] = useState(false);
  const [selectedNoti, setSelectedNoti] = useState<NotificationDetail | null>(null);
  const notiRef = useRef<HTMLDivElement | null>(null);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    toast.success("Đăng xuất thành công");
    navigate("/login");
  }, [logout, navigate]);

  const loadNotifications = useCallback(async () => {
    try {
      setNotiLoading(true);
      const res = await notificationService.list(0, 5);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được thông báo");
    } finally {
      setNotiLoading(false);
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setSelectedNoti((prev) => (prev ? { ...prev, isRead: true } : prev));
    } catch {
      toast.error("Không thể đánh dấu tất cả đã đọc");
    }
  }, []);

  const handleMarkRead = useCallback(async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.notifId === id ? { ...n, isRead: true } : n)));
      setSelectedNoti((prev) => (prev && prev.notifId === id ? { ...prev, isRead: true } : prev));
    } catch {
      toast.error("Không thể đánh dấu đã đọc");
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.notifId !== id));
      if (selectedNoti?.notifId === id) {
        setSelectedNoti(null);
      }
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  }, [selectedNoti]);

  const openDetail = useCallback(async (id: number) => {
    try {
      const detail = await notificationService.get(id);
      setSelectedNoti(detail);
      if (!detail.isRead) {
        await handleMarkRead(id);
      }
    } catch {
      toast.error("Không thể mở thông báo");
    }
  }, [handleMarkRead]);

  useEffect(() => {
    if (showNoti) {
      loadNotifications();
    }
  }, [showNoti, loadNotifications]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (showNoti && notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setShowNoti(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showNoti]);

  return (
    <div
      className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-950 transition-all ease-in-out"
      style={{
        willChange: "background-color",
        transform: "translateZ(0)",
        transitionDuration: "400ms",
      }}
    >
      {/* Dark-mode mesh gradient background */}
      <div className="hidden dark:block fixed inset-0 -z-10 mesh-gradient-dark animate-mesh" />
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={closeSidebar}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl lg:hidden border-r border-white/20 dark:bg-slate-900/95 dark:border-slate-800/80 dark:shadow-black/40"
          >
            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 dark:border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-slate-200">
                    MSSUS
                  </h1>
                  <p className="text-xs text-gray-500 font-medium dark:text-slate-400">
                    Cổng quản trị
                  </p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all duration-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent location={location} closeSidebar={closeSidebar} />
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between">
                <SessionStatus showWarning={true} />
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl dark:bg-slate-950/70 dark:border-slate-800 dark:shadow-black/40">
            <div className="flex items-center h-20 px-6 border-b border-gray-100 dark:border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-slate-200">
                    MSSUS
                  </h1>
                  <p className="text-sm text-gray-500 font-medium dark:text-slate-400">
                    Trang quản trị
                  </p>
                </div>
              </div>
            </div>
            <SidebarContent location={location} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header
          className="relative z-30 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm dark:bg-slate-950/60 dark:border-slate-800 dark:shadow-black/30 transition-all ease-in-out"
          style={{
            willChange: "background-color, border-color",
            transform: "translateZ(0)",
            transitionDuration: "400ms",
          }}
        >
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex items-center">
              <button
                onClick={openSidebar}
                className="p-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all duration-200 lg:hidden dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <div className="relative">
                  {/* <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                  </div> */}
                  {/* <input
                    className="w-80 pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-300 transition-all duration-200 text-sm placeholder-gray-400 backdrop-blur-sm dark:bg-slate-900/60 dark:border-slate-700/60 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/40 dark:focus:border-indigo-400"
                    placeholder="Tìm kiếm người dùng, chuyến đi hoặc giao dịch..."
                    type="search"
                  /> */}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <SessionStatus className="hidden lg:block text-sm" />
              <ThemeToggle className="hidden lg:inline-flex" />
              <div className="relative" ref={notiRef}>
                <button
                  className="relative p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl transition-all duration-200 group dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80"
                  onClick={() => setShowNoti((prev) => !prev)}
                >
                  <BellIcon className="h-6 w-6" />
                  {notifications.some((n) => !n.isRead) && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-semibold shadow-lg">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </button>
                {showNoti && (
                  <div className="absolute right-0 mt-3 w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 p-4 z-[2000] dark:bg-slate-900 dark:border-slate-800 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Thông báo</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {notifications.filter((n) => !n.isRead).length} chưa đọc
                        </p>
                      </div>
                      <button
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                        onClick={handleMarkAllRead}
                        disabled={notiLoading}
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {notiLoading ? (
                        <div className="text-sm text-gray-500 py-6 text-center">Đang tải...</div>
                      ) : notifications.length === 0 ? (
                        <div className="text-sm text-gray-500 py-6 text-center">Không có thông báo</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.notifId}
                            className={`p-3 rounded-xl border transition cursor-pointer ${
                              n.isRead
                                ? "border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/80"
                                : "border-indigo-100 bg-indigo-50/70 dark:bg-indigo-950/40"
                            }`}
                            onClick={() => openDetail(n.notifId)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{n.title}</p>
                                <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
                                <p className="text-[11px] text-gray-400 mt-1">
                                  {formatDateTime(n.createdAt)}
                                </p>
                              </div>
                              {!n.isRead && (
                                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-semibold">
                                  Mới
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <button
                                className="text-indigo-600 hover:text-indigo-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkRead(n.notifId);
                                }}
                                disabled={notiLoading}
                              >
                                Đã đọc
                              </button>
                              <span className="text-gray-300">•</span>
                              <button
                                className="text-rose-500 hover:text-rose-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(n.notifId);
                                }}
                                disabled={notiLoading}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-indigo-700">
                      <button
                        className="hover:underline"
                        onClick={() => {
                          setShowNoti(false);
                          navigate("/notifications");
                        }}
                      >
                        Xem tất cả
                      </button>
                      <button
                        className="hover:underline"
                        onClick={() => {
                          setShowNoti(false);
                          setSelectedNoti(null);
                        }}
                      >
                        Đóng
                      </button>
                    </div>
                    {selectedNoti && (
                      <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:bg-slate-800/80 dark:border-slate-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{selectedNoti.title}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{selectedNoti.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3 bg-gray-50/80 rounded-2xl px-4 py-2 border border-gray-200/60 hover:bg-white/80 transition-all duration-200 dark:bg-slate-900/70 dark:border-slate-700/80 dark:hover:bg-slate-800/80">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
                  <span className="text-sm font-bold text-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {user?.fullName || "Quản trị viên"}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {user?.email || "Tài khoản quản trị"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 dark:hover:bg-red-500/10"
                title="Đăng xuất"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 text-slate-900 dark:text-slate-100">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});

Layout.displayName = "Layout";

const SidebarContent = memo(
  ({
    location,
    closeSidebar,
  }: {
    location: any;
    closeSidebar?: () => void;
  }) => {
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

    const toggleMenu = (menuName: string) => {
      setExpandedMenus((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(menuName)) {
          newSet.delete(menuName);
        } else {
          newSet.add(menuName);
        }
        return newSet;
      });
    };

    // Auto-expand Finance menu if on payments or payouts page
    useEffect(() => {
      if (location.pathname === '/payments' || location.pathname === '/payouts') {
        setExpandedMenus((prev) => new Set(prev).add('Tài chính'));
      }
    }, [location.pathname]);

    return (
      <nav className="flex-1 px-6 py-8 space-y-3 text-slate-600 dark:text-slate-300 transition-colors duration-300">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href || (item.submenu && item.submenu.some(sub => location.pathname === sub.href));
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus.has(item.name);

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <div>
                <div className="flex items-center">
                  <Link
                    to={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "group flex-1 flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:scale-105 dark:text-slate-300 dark:hover:from-slate-800 dark:hover:to-slate-900 dark:hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeBackground"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "relative mr-4 h-5 w-5 transition-all duration-300",
                        isActive
                          ? "text-white drop-shadow-sm"
                          : "text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 dark:text-slate-400 dark:group-hover:text-indigo-400"
                      )}
                      aria-hidden="true"
                    />
                    <span className="relative">{item.name}</span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-2 h-2 bg-white/60 rounded-full"
                      />
                    )}
                  </Link>
                  {hasSubmenu && (
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "ml-2 p-2 rounded-lg transition-colors",
                        isActive
                          ? "text-white hover:bg-white/20"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800"
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {hasSubmenu && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-2 space-y-1"
                  >
                    {item.submenu!.map((subItem) => {
                      const isSubActive = location.pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          onClick={closeSidebar}
                          className={cn(
                            "group flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300",
                            isSubActive
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                          )}
                        >
                          <subItem.icon className="mr-3 h-4 w-4" />
                          <span>{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}

        <div className="pt-8 mt-8 border-t border-gray-100 dark:border-slate-800/80">
          {/* <div className="px-4 py-3">
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-slate-400">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-green-500/50"></div>
              <span>Trạng thái hệ thống: Hoạt động</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 dark:text-slate-500">
              v2.1.0 • Cập nhật 2 giờ trước
            </p>
          </div> */}
        </div>
      </nav>
    );
  }
);

SidebarContent.displayName = "SidebarContent";

export default Layout;
