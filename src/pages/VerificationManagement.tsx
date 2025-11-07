import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { fetchAllVerifications } from '../services/verificationService';
import { VerificationItem } from '../types';
import { approveVerification, rejectVerification } from '../services/verificationService';
import Pagination from '../components/Pagination';
import StatSummaryCard from '../components/StatSummaryCard';

export default function VerificationManagement() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<'ALL' | VerificationItem['status']>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | VerificationItem['type']>('ALL');

  const [selected, setSelected] = useState<VerificationItem | null>(null);
  const [userNames, setUserNames] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Bulk review state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkItems, setBulkItems] = useState<VerificationItem[]>([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  // Approve/Reject modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Use client-side filtering since backend doesn't support filters yet
  const allFilteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((v) => {
      const matchesType = filterType === 'ALL' || v.type === filterType;
      const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
      const matchesSearch =
        term.length === 0 ||
        String(v.user_id).includes(term) ||
        String(v.verification_id).includes(term);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [items, searchTerm, filterType, filterStatus]);

  const pendingCount = useMemo(() => allFilteredItems.filter(v => v.status === 'PENDING').length, [allFilteredItems]);
  const approvedCount = useMemo(() => allFilteredItems.filter(v => v.status === 'APPROVED').length, [allFilteredItems]);
  const rejectedCount = useMemo(() => allFilteredItems.filter(v => v.status === 'REJECTED').length, [allFilteredItems]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterType, filterStatus]);

  // Calculate pagination based on filtered data
  const filteredTotalRecords = allFilteredItems.length;
  const filteredTotalPages = Math.ceil(filteredTotalRecords / size);
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const filteredItems = allFilteredItems.slice(startIndex, endIndex);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        // Load all data to enable proper filtering
        const res = await fetchAllVerifications(0, 1000); // Load large number to get all data
        if (!isMounted) return;
        setItems(res.data);
        // fetch user names for visible rows
        // Extract names from metadata or create mock data for testing
        const entries = res.data.map((v: any) => {
          // Try to extract name from metadata JSON
          let name = `${v.user_id}`;
          try {
            if (v.metadata) {
              const meta = JSON.parse(v.metadata);
              if (meta.full_name) name = meta.full_name;
              else if (meta.name) name = meta.name;
              else if (meta.student_name) name = meta.student_name;
            }
          } catch (e) {
            console.log('Failed to parse metadata:', v.metadata);
          }
          return [v.user_id, name] as const;
        });

        // Remove duplicates
        const uniqueEntries = Array.from(
          new Map(entries).entries()
        );
        if (!isMounted) return;
        setUserNames(Object.fromEntries(uniqueEntries));
      } catch (e: any) {
        if (!isMounted) return;
        toast.error('Không tải được danh sách xác minh');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []); // Only load once on mount

  const openDetailModal = (verification: VerificationItem) => {
    setSelected(verification);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelected(null);
  };

  // Helper function to refresh all data
  const refreshData = async () => {
    try {
      const res = await fetchAllVerifications(0, 1000);
      setItems(res.data);
    } catch (e: any) {
      toast.error('Không thể làm mới dữ liệu');
    }
  };

  // Handlers
  const handleApprove = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      await approveVerification(selected.verification_id, Number(selected.user_id), selected.type, approveNotes || undefined);
      toast.success('Phê duyệt thành công');
      setShowApproveModal(false);
      setApproveNotes('');
      setShowDetailModal(false);
      setSelected(null);
      await refreshData();
    } catch (error: any) {
      console.error('Approve failed:', error);
      toast.error(error?.message || 'Phê duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setActionLoading(true);
      await rejectVerification(selected.verification_id, Number(selected.user_id), selected.type, rejectReason.trim());
      toast.success('Từ chối thành công');
      setShowRejectModal(false);
      setRejectReason('');
      setShowDetailModal(false);
      setSelected(null);
      await refreshData();
    } catch (error: any) {
      console.error('Reject failed:', error);
      toast.error(error?.message || 'Từ chối thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk review handlers
  const bulkCurrent = () => bulkItems[bulkIndex];
  const advanceBulk = () => {
    const next = bulkIndex + 1;
    if (next >= bulkItems.length) {
      setShowBulkModal(false);
      setBulkItems([]);
      setBulkIndex(0);
      setBulkRejectReason('');
      setSelectedIds([]);
      refreshData();
    } else {
      setBulkIndex(next);
      setBulkRejectReason('');
    }
  };

  const handleBulkApprove = async () => {
    const current = bulkCurrent();
    if (!current) return;
    try {
      setBulkLoading(true);
      await approveVerification(current.verification_id, Number(current.user_id), current.type, undefined);
      toast.success(`Đã phê duyệt #${current.verification_id}`);
      advanceBulk();
    } catch (error: any) {
      toast.error(error?.message || 'Phê duyệt thất bại');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    const current = bulkCurrent();
    if (!current) return;
    if (!bulkRejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setBulkLoading(true);
      await rejectVerification(current.verification_id, Number(current.user_id), current.type, bulkRejectReason.trim());
      toast.success(`Đã từ chối #${current.verification_id}`);
      advanceBulk();
    } catch (error: any) {
      toast.error(error?.message || 'Từ chối thất bại');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkSkip = () => {
    advanceBulk();
  };

  const stats = [
    {
      label: 'Tổng',
      value: filteredTotalRecords,
      icon: DocumentTextIcon,
      gradient: 'from-blue-600 to-indigo-600',
      backgroundGradient: 'from-blue-50 to-blue-100',
      detail: `${items.length} bản ghi đã tải`,
    },
    {
      label: 'Đang chờ',
      value: pendingCount,
      icon: ClockIcon,
      gradient: 'from-amber-500 to-orange-500',
      backgroundGradient: 'from-amber-50 to-orange-100',
      detail: 'Chờ duyệt',
    },
    {
      label: 'Đã duyệt',
      value: approvedCount,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-600 to-teal-600',
      backgroundGradient: 'from-emerald-50 to-teal-100',
      detail: 'Xác minh thành công',
    },
    {
      label: 'Bị từ chối',
      value: rejectedCount,
      icon: XCircleIcon,
      gradient: 'from-rose-600 to-red-600',
      backgroundGradient: 'from-rose-50 to-red-100',
      detail: 'Cần bổ sung',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý xác minh</h1>
          <p className="mt-2 text-gray-600">Xem và xử lý các yêu cầu xác minh</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatSummaryCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              gradient={stat.gradient}
              backgroundGradient={stat.backgroundGradient}
              detail={stat.detail}
            />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[64rem]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã xác minh và ID người dùng"
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input-field"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="ALL">Tất cả loại</option>
              <option value="STUDENT_ID">STUDENT_ID</option>
              <option value="DRIVER_LICENSE">DRIVER_LICENSE</option>
              <option value="DRIVER_DOCUMENTS">DRIVER_DOCUMENTS</option>
              <option value="VEHICLE_REGISTRATION">VEHICLE_REGISTRATION</option>
              <option value="BACKGROUND_CHECK">BACKGROUND_CHECK</option>
            </select>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="ml-3 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={selectedIds.length === 0 || actionLoading}
              onClick={() => {
                const pending = allFilteredItems.filter(i => i.status === 'PENDING' && selectedIds.includes(i.verification_id));
                if (pending.length === 0) {
                  toast.error('Vui lòng chọn ít nhất một mục ĐANG CHỜ');
                  return;
                }
                setBulkItems(pending);
                setBulkIndex(0);
                setBulkRejectReason('');
                setShowBulkModal(true);
              }}
            >
              Duyệt hàng loạt
            </button>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={(() => {
                      const pending = filteredItems.filter(i => i.status === 'PENDING');
                      return pending.length > 0 && pending.every(i => selectedIds.includes(i.verification_id));
                    })()}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pending = filteredItems.filter(i => i.status === 'PENDING');
                        setSelectedIds(pending.map(i => i.verification_id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã xác minh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tạo lúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duyệt lúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((v) => (
                <tr key={v.verification_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={v.status !== 'PENDING'}
                      checked={v.status === 'PENDING' && selectedIds.includes(v.verification_id)}
                      onChange={(e) => {
                        if (v.status !== 'PENDING') return;
                        setSelectedIds((prev) => e.target.checked
                          ? Array.from(new Set([...prev, v.verification_id]))
                          : prev.filter(id => id !== v.verification_id));
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{v.verification_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{userNames[Number(v.user_id)] || ` ${v.user_id}`}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{v.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${v.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : v.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {v.status === 'APPROVED' && 'Đã duyệt'}
                      {v.status === 'REJECTED' && 'Bị từ chối'}
                      {v.status === 'PENDING' && 'Đang chờ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      // Backend sends UTC with 'Z' suffix, but it's actually Vietnam time
                      // Remove 'Z' and treat as local Vietnam time
                      const timestamp = v.created_at.replace('Z', '');
                      const date = new Date(timestamp);
                      return date.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      });
                    })()}
                    <div className="text-xs text-gray-400">
                      {(() => {
                        const timestamp = v.created_at.replace('Z', '');
                        const date = new Date(timestamp);
                        return date.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {v.verified_at ? (
                      <>
                        {(() => {
                          const timestamp = v.verified_at.replace('Z', '');
                          const date = new Date(timestamp);
                          return date.toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          });
                        })()}
                        <div className="text-xs text-gray-400">
                          {(() => {
                            const timestamp = v.verified_at.replace('Z', '');
                            const date = new Date(timestamp);
                            return date.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            });
                          })()}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openDetailModal(v)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">Không có yêu cầu xác minh.</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={filteredTotalPages}
          totalRecords={filteredTotalRecords}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPage(0);
            setSize(newSize);
          }}
          loading={loading}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </motion.div>

      {/* Detail Modal */}
      {showDetailModal && selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closeDetailModal} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Chi tiết xác minh
                      </h3>
                      <button
                        onClick={closeDetailModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Verification Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <IdentificationIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Thông tin xác minh
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Mã xác minh</p>
                          <p className="text-base font-medium text-gray-900">#{selected.verification_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Người dùng</p>
                          <p className="text-base font-medium text-gray-900">{userNames[Number(selected.user_id)] || `${selected.user_id}`}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Loại</p>
                          <p className="text-base font-medium text-gray-900">{selected.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trạng thái</p>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${selected.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : selected.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {selected.status === 'APPROVED' && 'Đã duyệt'}
                            {selected.status === 'REJECTED' && 'Bị từ chối'}
                            {selected.status === 'PENDING' && 'Đang chờ'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tạo lúc</p>
                          <p className="text-base font-medium text-gray-900">
                            {(() => {
                              const timestamp = selected.created_at.replace('Z', '');
                              const date = new Date(timestamp);
                              return date.toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              });
                            })()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duyệt lúc</p>
                          <p className="text-base font-medium text-gray-900">
                            {selected.verified_at ? (() => {
                              const timestamp = selected.verified_at.replace('Z', '');
                              const date = new Date(timestamp);
                              return date.toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              });
                            })() : '—'}
                          </p>
                        </div>

                        {/* Metadata (moved from table) */}
                        {selected.metadata && (
                          <div className="mt-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                              <DocumentTextIcon className="h-4 w-4 mr-2 text-indigo-500" />
                              Dữ liệu kèm theo
                            </h5>
                            {(() => {
                              try {
                                const metaObj = JSON.parse(selected.metadata as any);
                                if (metaObj && typeof metaObj === 'object') {
                                  const entries = Object.entries(metaObj);
                                  return (
                                    <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-56 overflow-auto">
                                      {entries.length === 0 ? (
                                        <div className="text-xs text-gray-500">Không có dữ liệu</div>
                                      ) : (
                                        <ul className="space-y-1">
                                          {entries.map(([k, v]) => (
                                            <li key={k} className="text-xs text-gray-700">
                                              <span className="font-semibold text-gray-900">{k}:</span> {String(v)}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                }
                              } catch (e) {
                                // fallthrough to raw text
                              }
                              return (
                                <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-56 overflow-auto">
                                  <div className="text-xs text-gray-700 break-words whitespace-pre-wrap">{selected.metadata}</div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      {selected.status !== 'PENDING' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Người duyệt</p>
                              <p className="text-base font-medium text-gray-900">{selected.verified_by || '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Duyệt lúc</p>
                              <p className="text-base font-medium text-gray-900">
                                {selected.verified_at ? new Date(selected.verified_at).toLocaleString('vi-VN') : '—'}
                              </p>
                            </div>
                          </div>
                          {selected.rejection_reason && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-500">Lý do từ chối</p>
                              <p className="text-base font-medium text-red-600">{selected.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-green-500" />
                          Hình ảnh tài liệu ({(() => {
                            if (!selected.document_url) return 0;
                            const urls = selected.document_url.split(',').filter(u => u.trim());
                            return urls.length;
                          })()})
                        </h4>
                        <div className="space-y-3">
                          {(() => {
                            // Parse multiple URLs from comma-separated string
                            if (!selected.document_url) {
                              return (
                                <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-[200px]">
                                  <div className="text-center">
                                    <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg font-medium">Không có tài liệu</p>
                                  </div>
                                </div>
                              );
                            }

                            const urls = selected.document_url.split(',').map(u => u.trim()).filter(u => u);

                            if (urls.length === 0) {
                              return (
                                <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-[200px]">
                                  <div className="text-center">
                                    <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg font-medium">Không có tài liệu</p>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {urls.map((url, index) => (
                                  <div key={index} className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      {selected.type === 'STUDENT_ID'
                                        ? (index === 0 ? 'Front (Mặt trước)' : 'Back (Mặt sau)')
                                        : `Document ${index + 1}`}
                                    </p>
                                    {selected.document_type === 'IMAGE' ? (
                                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <img
                                          src={url}
                                          alt={`Document ${index + 1}`}
                                          className="w-full h-auto object-contain max-h-80"
                                          onError={(e) => {
                                            console.error('Image load error:', url);
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%236b7280" font-size="16"%3EFailed to load image%3C/text%3E%3C/svg%3E';
                                          }}
                                        />
                                      </div>
                                    ) : selected.document_type === 'PDF' ? (
                                      <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 flex items-center justify-center min-h-[150px]">
                                        <div className="text-center">
                                          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                          <p className="text-gray-500 text-sm font-medium">Tài liệu PDF</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 flex items-center justify-center min-h-[150px]">
                                        <div className="text-center">
                                          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                          <p className="text-gray-500 text-sm font-medium">Không rõ loại</p>
                                        </div>
                                      </div>
                                    )}
                                    <div className="text-center">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                      >
                                        <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                                        Mở tab mới
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                {selected.status === 'PENDING' && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() => setShowApproveModal(true)}
                      className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Phê duyệt
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => setShowRejectModal(true)}
                      className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Từ chối
                    </button>
                  </>
                )}
                <button
                  onClick={closeDetailModal}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal mặc định: chỉ hiển thị chi tiết và nút Đóng */}
      {/* Approve Modal */}
      {showApproveModal && selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowApproveModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận phê duyệt</h3>
                <p className="mt-2 text-sm text-gray-600">Phê duyệt yêu cầu #{selected.verification_id} cho người dùng {userNames[Number(selected.user_id)] || `${selected.user_id}`}</p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tuỳ chọn)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Thêm ghi chú cho phê duyệt này..."
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setApproveNotes('');
                  }}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowRejectModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Từ chối xác minh</h3>
                <p className="mt-2 text-sm text-gray-600">Bạn đang từ chối yêu cầu #{selected.verification_id} của người dùng {userNames[Number(selected.user_id)] || `${selected.user_id}`}. Vui lòng nhập lý do.</p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Review Modal */}
      {showBulkModal && bulkItems.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowBulkModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">Duyệt hàng loạt ({bulkIndex + 1}/{bulkItems.length})</h3>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                {(() => {
                  const cur = bulkItems[bulkIndex];
                  if (!cur) return null;
                  return (
                    <div className="space-y-4">
                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Mã xác minh</p>
                          <p className="text-base font-medium text-gray-900">#{cur.verification_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Người dùng</p>
                          <p className="text-base font-medium text-gray-900">{userNames[Number(cur.user_id)] || `${cur.user_id}`}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Loại</p>
                          <p className="text-base font-medium text-gray-900">{cur.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trạng thái</p>
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Đang chờ</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tạo lúc</p>
                          <p className="text-base font-medium text-gray-900">
                            {(() => {
                              const ts = (cur.created_at || '').replace?.('Z','') || cur.created_at;
                              const d = ts ? new Date(ts) : null;
                              return d ? d.toLocaleString('vi-VN', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' }) : '—';
                            })()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duyệt lúc</p>
                          <p className="text-base font-medium text-gray-900">
                            {cur.verified_at ? (() => {
                              const ts = (cur.verified_at || '').replace?.('Z','') || cur.verified_at;
                              const d = ts ? new Date(ts) : null;
                              return d ? d.toLocaleString('vi-VN', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' }) : '—';
                            })() : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-2 text-indigo-500" />
                          Tài liệu
                        </h5>
                        {(() => {
                          try {
                            const type = (cur as any).document_type;
                            const url = (cur as any).document_url as string | undefined;
                            if (!url) {
                              return (
                                <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-[150px]">
                                  <div className="text-center">
                                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm font-medium">Không có tài liệu</p>
                                  </div>
                                </div>
                              );
                            }
                            const urls = url.split(',').map(u => u.trim()).filter(Boolean);
                            if (urls.length === 0) {
                              return (
                                <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-[150px]">
                                  <div className="text-center">
                                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm font-medium">Không có tài liệu</p>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {urls.map((u, idx) => (
                                  <div key={idx} className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      {cur.type === 'STUDENT_ID' ? (idx === 0 ? 'Mặt trước' : 'Mặt sau') : `Tài liệu ${idx + 1}`}
                                    </p>
                                    {type === 'IMAGE' ? (
                                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <img
                                          src={u}
                                          alt={`Document ${idx + 1}`}
                                          className="w-full h-auto object-contain max-h-80"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%236b7280" font-size="16"%3EFailed to load image%3C/text%3E%3C/svg%3E';
                                          }}
                                        />
                                      </div>
                                    ) : type === 'PDF' ? (
                                      <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 flex items-center justify-center min-h-[150px]">
                                        <div className="text-center">
                                          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm font-medium">Tài liệu PDF</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 flex items-center justify-center min-h-[150px]">
                                        <div className="text-center">
                                          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm font-medium">Không rõ loại</p>
                                        </div>
                                      </div>
                                    )}
                                    <div className="text-center">
                                      <a
                                        href={u}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                      >
                                        <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                                        Open in new tab
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          } catch (e) {
                            return null;
                          }
                        })()}
                      </div>

                      {/* Bulk reject reason */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối (tuỳ chọn)</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          rows={3}
                          placeholder="Nhập lý do để từ chối, để trống nếu phê duyệt"
                          value={bulkRejectReason}
                          onChange={(e) => setBulkRejectReason(e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  disabled={bulkLoading}
                  onClick={handleBulkApprove}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {bulkLoading ? 'Đang xử lý...' : 'Phê duyệt'}
                </button>
                <button
                  disabled={bulkLoading}
                  onClick={handleBulkReject}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Từ chối
                </button>
                <button
                  disabled={bulkLoading}
                  onClick={handleBulkSkip}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
