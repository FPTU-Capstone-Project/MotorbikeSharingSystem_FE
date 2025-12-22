import React, { useEffect, useMemo, useState } from "react";
import { BellIcon, CheckCircleIcon, TrashIcon, EyeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { notificationService } from "../services/notificationService";
import { NotificationDetail, NotificationSummary } from "../types";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import { formatDateTime } from "../utils/dateUtils";

const priorityColors: Record<string, string> = {
  HIGH: "bg-rose-100 text-rose-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-emerald-100 text-emerald-700",
};

const typeLabels: Record<string, string> = {
  SYSTEM: "Hệ thống",
  RIDE: "Chuyến đi",
  PAYMENT: "Thanh toán",
  PROMOTION: "Khuyến mãi",
  ALERT: "Cảnh báo",
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [selected, setSelected] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.list(page, size);
      setNotifications(res.data || []);
      setTotalPages(res.pagination?.total_pages ?? 1);
      setTotalRecords(res.pagination?.total_records ?? res.data?.length ?? 0);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const openNotification = async (notif: NotificationSummary) => {
    try {
      const detail = await notificationService.get(notif.notifId);
      setSelected(detail);
      if (!notif.isRead) {
        await notificationService.markRead(notif.notifId);
        setNotifications((prev) =>
          prev.map((n) => (n.notifId === notif.notifId ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể mở thông báo");
    }
  };

  const handleMarkRead = async (notifId: number) => {
    try {
      setActionLoading(true);
      await notificationService.markRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.notifId === notifId ? { ...n, isRead: true } : n))
      );
      if (selected?.notifId === notifId) {
        setSelected({ ...selected, isRead: true });
      }
    } catch (err) {
      toast.error("Không thể đánh dấu đã đọc");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (selected) {
        setSelected({ ...selected, isRead: true });
      }
    } catch (err) {
      toast.error("Không thể đánh dấu tất cả đã đọc");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (notifId: number) => {
    if (!window.confirm("Xóa thông báo này?")) return;
    try {
      setActionLoading(true);
      await notificationService.delete(notifId);
      setNotifications((prev) => prev.filter((n) => n.notifId !== notifId));
      if (selected?.notifId === notifId) {
        setSelected(null);
      }
      toast.success("Đã xóa thông báo");
    } catch (err) {
      toast.error("Không thể xóa thông báo");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Xóa tất cả thông báo?")) return;
    try {
      setActionLoading(true);
      await notificationService.deleteAll();
      setNotifications([]);
      setSelected(null);
      toast.success("Đã xóa tất cả thông báo");
    } catch (err) {
      toast.error("Không thể xóa tất cả thông báo");
    } finally {
      setActionLoading(false);
    }
  };

  const renderPriority = (priority: string) => {
    const cls = priorityColors[priority] || "bg-slate-100 text-slate-700";
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>{priority}</span>;
  };

  const renderType = (type: string) => {
    const label = typeLabels[type] || type;
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">{label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BellIcon className="h-8 w-8 text-indigo-600" />
            Trung tâm thông báo
          </h1>
          <p className="text-gray-600 mt-1">Theo dõi và xử lý thông báo hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            onClick={handleMarkAllRead}
            disabled={actionLoading || unreadCount === 0}
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </button>
          <button
            className="btn-secondary border-rose-200 text-rose-600 hover:text-rose-700 hover:border-rose-300"
            onClick={handleDeleteAll}
            disabled={actionLoading || notifications.length === 0}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Xóa tất cả
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
                {unreadCount} chưa đọc
              </span>
              <span className="text-sm text-gray-500">{totalRecords} tổng số</span>
            </div>
            <button className="btn-secondary flex items-center" onClick={loadNotifications} disabled={loading}>
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="py-10 text-center text-gray-500">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Không có thông báo</div>
            ) : (
              <AnimatePresence>
                {notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.notifId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`p-4 rounded-xl hover:bg-indigo-50/60 cursor-pointer transition ${notif.isRead ? "bg-white" : "bg-indigo-50/80 border border-indigo-100"
                      }`}
                    onClick={() => openNotification(notif)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{notif.title}</h3>
                          {renderType(notif.type)}
                          {renderPriority(notif.priority)}
                          {!notif.isRead && (
                            <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                              Mới
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDateTime(notif.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notif.isRead && (
                          <button
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRead(notif.notifId);
                            }}
                            disabled={actionLoading}
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                        <button
                          className="text-rose-500 hover:text-rose-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.notifId);
                          }}
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={size}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPage(0);
                setSize(newSize);
              }}
              loading={loading}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>

        <div className="card h-full">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <EyeIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết thông báo</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {renderType(selected.type)}
                {renderPriority(selected.priority)}
                {selected.isRead ? (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    Đã đọc
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    Chưa đọc
                  </span>
                )}
              </div>
              <h4 className="text-xl font-bold text-gray-900">{selected.title}</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              {selected.payload && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-700">
                  {selected.payload}
                </div>
              )}
              <div className="text-sm text-gray-500 space-y-1">
                <p>Gửi lúc: {formatDateTime(selected.sentAt)}</p>
                <p>Tạo lúc: {formatDateTime(selected.createdAt)}</p>
                <p>Đọc lúc: {formatDateTime(selected.readAt)}</p>
                <p>Hết hạn: {formatDateTime(selected.expiresAt)}</p>
              </div>
              {!selected.isRead && (
                <button
                  className="btn-primary w-full"
                  onClick={() => handleMarkRead(selected.notifId)}
                  disabled={actionLoading}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BellIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm">Chọn một thông báo để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
