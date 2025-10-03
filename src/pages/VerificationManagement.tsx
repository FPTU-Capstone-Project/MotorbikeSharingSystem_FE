import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { fetchAllVerifications } from '../services/verificationService';
import { VerificationItem } from '../types';
import { userService } from '../services/apiService';
import { approveVerification, rejectVerification } from '../services/verificationService';

export default function VerificationManagement() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<'ALL' | VerificationItem['status']>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | VerificationItem['type']>('ALL');

  const [selected, setSelected] = useState<VerificationItem | null>(null);
  const [userNames, setUserNames] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pendingCount = useMemo(() => items.filter(v => v.status === 'PENDING').length, [items]);
  const approvedCount = useMemo(() => items.filter(v => v.status === 'APPROVED').length, [items]);
  const rejectedCount = useMemo(() => items.filter(v => v.status === 'REJECTED').length, [items]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((v) => {
      const matchesType = filterType === 'ALL' || v.type === filterType;
      const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    const matchesSearch =
        term.length === 0 ||
        (v.metadata?.toLowerCase().includes(term) ?? false) ||
        v.type.toLowerCase().includes(term) ||
        v.status.toLowerCase().includes(term) ||
        String(v.user_id).includes(term) ||
        String(v.verification_id).includes(term);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [items, searchTerm, filterType, filterStatus]);


  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchAllVerifications(page, size, {
          type: filterType === 'ALL' ? undefined : filterType,
          status: filterStatus === 'ALL' ? undefined : filterStatus,
        });
        if (!isMounted) return;
        setItems(res.data);
        setTotalPages(res.pagination.total_pages);
        setTotalRecords(res.pagination.total_records);
        // fetch user names for visible rows
        // Extract names from metadata or create mock data for testing
        const entries = res.data.map(v => {
          // Try to extract name from metadata JSON
          let name = `User ID: ${v.user_id}`;
          try {
            if (v.metadata) {
              const meta =JSON.parse(v.metadata);
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
        setError(e?.message || 'Failed to load verifications');
        toast.error('Failed to load verifications');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [page, size, filterStatus, filterType]);

  const openDetailModal = (verification: VerificationItem) => {
    setSelected(verification);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verification Management</h1>
          <p className="mt-2 text-gray-600">Review and manage verification requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500">
              <XCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[36rem]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
                placeholder="Search by metadata, status, type, user id..."
                className="input-field pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
              className="input-field"
              value={filterType}
              onChange={(e) => {
                setPage(0);
                setFilterType(e.target.value as any);
              }}
            >
              <option value="ALL">All types</option>
              <option value="STUDENT_ID">STUDENT_ID</option>
              <option value="DRIVER_LICENSE">DRIVER_LICENSE</option>
              <option value="DRIVER_DOCUMENTS">DRIVER_DOCUMENTS</option>
              <option value="VEHICLE_REGISTRATION">VEHICLE_REGISTRATION</option>
              <option value="BACKGROUND_CHECK">BACKGROUND_CHECK</option>
            </select>
          <select
            className="input-field"
            value={filterStatus}
              onChange={(e) => {
                setPage(0);
                setFilterStatus(e.target.value as any);
              }}
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              className="input-field pr-10"
              value={size}
              onChange={(e) => {
                setPage(0);
                setSize(Number(e.target.value));
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
          </select>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((v) => (
                <tr key={v.verification_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">#{v.verification_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{userNames[Number(v.user_id)] || `User ID: ${v.user_id}`}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[220px]">{v.metadata || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{v.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      v.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : v.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {v.status === 'APPROVED' && 'Approved'}
                      {v.status === 'REJECTED' && 'Rejected'}
                      {v.status === 'PENDING' && 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(v.created_at).toLocaleDateString('vi-VN')}
                    <div className="text-xs text-gray-400">
                      {new Date(v.created_at).toLocaleTimeString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {v.verified_at ? (
                      <>
                        {new Date(v.verified_at).toLocaleDateString('vi-VN')}
                        <div className="text-xs text-gray-400">{new Date(v.verified_at).toLocaleTimeString('vi-VN')}</div>
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
                      View details
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
            <p className="mt-2 text-gray-500">No verification requests found.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">Page {page + 1} / {Math.max(totalPages, 1)}</div>
          <div className="space-x-2">
            <button
              className="btn btn-secondary px-4 py-2 disabled:opacity-50"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary px-4 py-2 disabled:opacity-50"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
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
                        Verification details
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
                        Verification info
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Verification ID</p>
                          <p className="text-base font-medium text-gray-900">#{selected.verification_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">User</p>
                          <p className="text-base font-medium text-gray-900">{userNames[Number(selected.user_id)] || `User ID: ${selected.user_id}`}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="text-base font-medium text-gray-900">{selected.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            selected.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : selected.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selected.status === 'APPROVED' && 'Approved'}
                            {selected.status === 'REJECTED' && 'Rejected'}
                            {selected.status === 'PENDING' && 'Pending'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created at</p>
                          <p className="text-base font-medium text-gray-900">
                            {new Date(selected.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Verified at</p>
                          <p className="text-base font-medium text-gray-900">
                            {selected.verified_at ? new Date(selected.verified_at).toLocaleString('vi-VN') : '—'}
                          </p>
                        </div>
                      </div>

                      {selected.status !== 'PENDING' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Verified by</p>
                              <p className="text-base font-medium text-gray-900">{selected.verified_by || '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Verified at</p>
                              <p className="text-base font-medium text-gray-900">
                                {selected.verified_at ? new Date(selected.verified_at).toLocaleString('vi-VN') : '—'}
                              </p>
                            </div>
                          </div>
                          {selected.rejection_reason && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-500">Rejection reason</p>
                              <p className="text-base font-medium text-red-600">{selected.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      {selected.document_url && selected.document_type === 'IMAGE' && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-green-500" />
                            Attached document
                        </h4>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                              src={selected.document_url}
                              alt="Document"
                            className="w-full h-auto object-contain max-h-96"
                          />
                        </div>
                        </div>
                      )}
                      {selected.document_url && selected.document_type === 'PDF' && (
                        <a
                          href={selected.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open PDF document
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                {selected.status === 'PENDING' && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={async () => {
                        if (!selected) return;
                        try {
                          setActionLoading(true);
                          await approveVerification(selected.verification_id, selected.user_id, selected.type);
                          toast.success('Approved successfully');
                          setShowDetailModal(false);
                          setSelected(null);
                          // refresh current page
                          const res = await fetchAllVerifications(page, size, {
                            type: filterType === 'ALL' ? undefined : filterType,
                            status: filterStatus === 'ALL' ? undefined : filterStatus,
                          });
                          setItems(res.data);
                          setTotalPages(res.pagination.total_pages);
                          setTotalRecords(res.pagination.total_records);
                        } catch {
                          toast.error('Approve failed');
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Approve
                    </button>
                <button
                      disabled={actionLoading}
                      onClick={async () => {
                        if (!selected) return;
                        const reason = window.prompt('Enter rejection reason');
                        if (reason === null) return;
                        try {
                          setActionLoading(true);
                          await rejectVerification(selected.verification_id, selected.user_id, selected.type, reason);
                          toast.success('Rejected successfully');
                          setShowDetailModal(false);
                          setSelected(null);
                          const res = await fetchAllVerifications(page, size, {
                            type: filterType === 'ALL' ? undefined : filterType,
                            status: filterStatus === 'ALL' ? undefined : filterStatus,
                          });
                          setItems(res.data);
                          setTotalPages(res.pagination.total_pages);
                          setTotalRecords(res.pagination.total_records);
                        } catch {
                          toast.error('Reject failed');
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject
                </button>
                  </>
                )}
                <button
                  onClick={closeDetailModal}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal mặc định: chỉ hiển thị chi tiết và nút Đóng */}
    </div>
  );
}
