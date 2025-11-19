import React, { useEffect, useMemo, useState } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowDownOnSquareStackIcon,
  ClockIcon,
  UserIcon,
  PhotoIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Bike, MotorbikeIcon, Plus } from 'lucide-react';
import { VehicleVerification } from '../types';
import { approveDriverVehicle, rejectDriver } from '../services/verificationService';
import { vehicleService } from '../services/vehicleService';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import StatSummaryCard from '../components/StatSummaryCard';

export default function VehicleManagement() {
  const [verifications, setVerifications] = useState<VehicleVerification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'driverId' | 'model' | 'plateNumber' | 'submittedAt' | 'status'>('submittedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedVerification, setSelectedVerification] = useState<VehicleVerification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [verificationToReject, setVerificationToReject] = useState<VehicleVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // CRUD Modals & Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<VehicleVerification | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<VehicleVerification | null>(null);
  const [form, setForm] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    color: '',
    vehicleType: 'motorbike',
  });

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await vehicleService.getAllVehicles(
          page,
          pageSize,
          sortBy === 'submittedAt' ? 'createdAt' : (sortBy === 'status' ? 'status' : sortBy),
          sortDir
        );

        if (ignore) return;

        const rows: VehicleVerification[] = (res.data || []).map((v: any) => ({
          id: String(v.vehicle_id ?? v.vehicleId),
          driverId: String(v.driver_id ?? v.driverId ?? ''),
          vehicleId: String(v.vehicle_id ?? v.vehicleId ?? ''),
          driverName: v.driver_name ?? v.driverName ?? '—',
          driverEmail: v.driver_email ?? v.driverEmail ?? '—',
          driverPhone: v.driver_phone ?? v.driverPhone ?? '—',
          plateNumber: v.plate_number ?? v.plateNumber ?? '—',
          userStatus: (v.user_status ?? v.userStatus ?? 'active').toString().toLowerCase(),
          model: v.model ?? '—',
          color: v.color ?? '—',
          year: v.year ?? new Date().getFullYear(),
          insuranceExpiry: (v.insurance_expiry ?? v.insuranceExpiry ?? new Date().toISOString()).toString(),
          status: (v.status ?? 'PENDING').toString().toLowerCase(),
          verificationType: 'vehicle_registration',
          documents: {},
          submittedAt: (v.created_at ?? v.createdAt ?? new Date().toISOString()).toString(),
          verifiedAt: v.verified_at ?? v.verifiedAt,
          verifiedBy: v.verified_by ?? v.verifiedBy,
          rejectionReason: v.rejection_reason ?? v.rejectionReason,
        }));
        setVerifications(rows);
        const p = res.pagination || ({} as any);
        setTotalPages((p.total_pages ?? 0) as number);
        setTotalRecords((p.total_records ?? rows.length) as number);
      } catch (e: any) {
        console.error('Lỗi tải danh sách xe:', e);
        toast.error(e?.message || 'Không tải được danh sách xe');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [page, pageSize, sortBy, sortDir]);

  const filteredVerifications = useMemo(() => {
    const base = verifications.filter(verification => {
      const matchesSearch =
        (verification.driverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (verification.driverEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (verification.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (verification.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (verification.id || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'driverId') return (Number(a.driverId) - Number(b.driverId)) * dir;
      if (sortBy === 'plateNumber') return a.plateNumber.localeCompare(b.plateNumber) * dir;
      if (sortBy === 'status') return a.status.localeCompare(b.status) * dir;
      return (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()) * dir;
    });

    return sorted;
  }, [verifications, searchTerm, sortBy, sortDir]);

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const approvedCount = verifications.filter(v => v.status === 'approved').length;
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length;
  const stats = [
    {
      label: 'Tổng số xe',
      value: verifications.length,
      icon: MotorbikeIcon,
      gradient: 'from-blue-600 to-indigo-600',
      backgroundGradient: 'from-blue-50 to-blue-100',
      detail: `${totalRecords} bản ghi đã tải`,
    },
    {
      label: 'Đang chờ',
      value: pendingCount,
      icon: ClockIcon,
      gradient: 'from-amber-500 to-orange-500',
      backgroundGradient: 'from-amber-50 to-orange-100',
      detail: 'Chờ quản trị viên duyệt',
    },
    {
      label: 'Đã duyệt',
      value: approvedCount,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-600 to-teal-600',
      backgroundGradient: 'from-emerald-50 to-teal-100',
      detail: 'Sẵn sàng phân công',
    },
    {
      label: 'Bị từ chối',
      value: rejectedCount,
      icon: XCircleIcon,
      gradient: 'from-rose-600 to-red-600',
      backgroundGradient: 'from-rose-50 to-red-100',
      detail: 'Cần cập nhật từ tài xế',
    },
  ];

  const handleApprove = async (verification: VehicleVerification) => {
    try {
      await approveDriverVehicle(Number(verification.driverId), 'Đã phê duyệt đăng ký xe');
      toast.success(`Đã phê duyệt xe cho ${verification.driverName}`);
      setShowDetailModal(false);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Không thể phê duyệt');
    }
  };

  const handleReject = async () => {
    if (!verificationToReject) return;
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await rejectDriver(Number(verificationToReject.driverId), rejectionReason, 'Bị từ chối bởi quản trị viên');
      toast.success(`Đã từ chối xe của ${verificationToReject.driverName}`);
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
      setVerificationToReject(null);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Không thể từ chối');
    }
  };

  // Create / Edit / Delete handlers
  const openCreate = () => {
    setForm({ licensePlate: '', brand: '', model: '', year: new Date().getFullYear().toString(), color: '', vehicleType: 'motorbike' });
    setShowCreateModal(true);
  };

  const submitCreate = async () => {
    try {
      setSaving(true);
      await vehicleService.createVehicle({
        licensePlate: form.licensePlate,
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        color: form.color,
        vehicleType: form.vehicleType,
      });
      toast.success('Tạo xe thành công');
      setShowCreateModal(false);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Không thể tạo xe');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (v: VehicleVerification) => {
    setSelectedForEdit(v);
    setForm({
      licensePlate: v.plateNumber || '',
      brand: '',
      model: v.model || '',
      year: String(v.year || new Date().getFullYear()),
      color: v.color || '',
      vehicleType: 'motorbike',
    });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!selectedForEdit) return;
    try {
      setSaving(true);
      const id = Number(selectedForEdit.vehicleId || selectedForEdit.id);
      await vehicleService.updateVehicle(id, {
        licensePlate: form.licensePlate,
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        color: form.color,
        vehicleType: form.vehicleType,
      });
      toast.success('Cập nhật xe thành công');
      setShowEditModal(false);
      setSelectedForEdit(null);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Không thể cập nhật xe');
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (v: VehicleVerification) => {
    setSelectedForDelete(v);
    setShowDeleteModal(true);
  };

  const submitDelete = async () => {
    if (!selectedForDelete) return;
    try {
      setSaving(true);
      const id = Number(selectedForDelete.vehicleId || selectedForDelete.id);
      await vehicleService.deleteVehicle(id);
      toast.success('Xóa xe thành công');
      setShowDeleteModal(false);
      setSelectedForDelete(null);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Không thể xóa xe');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const openRejectModal = (verification: VehicleVerification) => {
    setVerificationToReject(verification);
    setShowRejectModal(true);
  };

  const openDetailModal = (verification: VehicleVerification) => {
    setSelectedVerification(verification);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý xe</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Quản lý phương tiện, giấy tờ đăng ký, bảo hiểm và hình ảnh liên quan
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200/50 transition-all duration-200"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Thêm xe
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="h-full"
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên tài xế, email, biển số, dòng xe..."
              className="input-field pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600">Sắp xếp:</span>
            <select
              className="input-field w-44 sm:w-56"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="submittedAt">Ngày gửi</option>
              <option value="driverId">ID tài xế</option>
              <option value="plateNumber">Biển số</option>
              <option value="status">Trạng thái (ACTIVE/MAINTENANCE)</option>
            </select>
            <select
              className="input-field w-28 sm:w-32"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
            >
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Vehicles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  ID tài xế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Tên tài xế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Dòng xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Biển số
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Hạn bảo hiểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {filteredVerifications.map((verification, index) => (
                <motion.tr
                  key={verification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{verification.driverId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{verification.driverName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{verification.model}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{verification.color} - {verification.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-black dark:text-slate-900 bg-yellow-100 dark:bg-yellow-400/30 px-3 py-1 rounded-md inline-block">
                      {verification.plateNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(verification.insuranceExpiry).toLocaleDateString('vi-VN')}
                    </div>
                    <div className={`text-xs ${new Date(verification.insuranceExpiry) < new Date()
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-green-600 dark:text-green-400'
                      }`}>
                      {new Date(verification.insuranceExpiry) < new Date() ? 'Hết hạn' : 'Còn hiệu lực'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const s = (verification.status || '').toUpperCase();
                      const pill = s === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : s === 'MAINTENANCE'
                          ? 'bg-amber-100 text-amber-800'
                          : s === 'INACTIVE'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-800';
                      const label =
                        s === 'ACTIVE'
                          ? 'Hoạt động'
                          : s === 'MAINTENANCE'
                            ? 'Bảo trì'
                            : s === 'INACTIVE'
                              ? 'Không hoạt động'
                              : 'Đang chờ';
                      return (
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${pill}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {new Date(verification.submittedAt).toLocaleDateString('vi-VN')}
                    <div className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(verification.submittedAt).toLocaleTimeString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openDetailModal(verification)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded flex items-center transition-colors" title="Xem chi tiết">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(verification)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded flex items-center transition-colors" title="Chỉnh sửa">
                        <ArrowDownOnSquareStackIcon className="h-4 w-4" />
                      </button><button onClick={() => openDelete(verification)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded flex items-center transition-colors" title="Xóa">
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVerifications.length === 0 && (
          <div className="text-center py-12">
            <Bike className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
            <p className="mt-2 text-gray-500 dark:text-slate-400">Không tìm thấy xe nào.</p>
          </div>
        )}
        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPage(0);
            setPageSize(newSize);
          }}
          loading={loading}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </motion.div>

      {/* Detail Modal */}
      {showDetailModal && selectedVerification && (() => {
        const verification = selectedVerification; // TypeScript guard
        return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-black/60 bg-opacity-75" onClick={() => setShowDetailModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Chi tiết xe
                      </h3>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Driver Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-purple-500" />
                        Thông tin tài xế
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Họ và tên</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{verification.driverName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Email</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{verification.driverEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Số điện thoại</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{verification.driverPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Trạng thái</p>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${verification.userStatus === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : verification.userStatus === 'inactive'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            }`}>
                            {verification.userStatus === 'active' && 'Hoạt động'}
                            {verification.userStatus === 'inactive' && 'Không hoạt động'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Bike className="h-5 w-5 mr-2 text-blue-500" />
                        Thông tin phương tiện
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Biển số</p>
                          <p className="text-base font-bold text-black bg-yellow-100 px-3 py-1 rounded-md inline-block">
                            {verification.plateNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Dòng xe</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{verification.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Màu sắc</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{verification.color}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Năm</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{verification.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Hạn bảo hiểm</p>
                          <p className={`text-base font-medium ${new Date(verification.insuranceExpiry) < new Date()
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                            }`}>
                            {new Date(verification.insuranceExpiry).toLocaleDateString('vi-VN')}
                            {new Date(verification.insuranceExpiry) < new Date() && ' (Hết hạn)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Thời điểm gửi</p>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {new Date(verification.submittedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {verification.status !== 'pending' && (
                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-slate-700">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-slate-400">Người duyệt</p>
                              <p className="text-base font-medium text-gray-900 dark:text-white">{verification.verifiedBy}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-slate-400">Thời điểm duyệt</p>
                              <p className="text-base font-medium text-gray-900 dark:text-white">
                                {verification.verifiedAt ? new Date(verification.verifiedAt).toLocaleString('vi-VN') : '—'}
                              </p>
                            </div>
                          </div>
                          {verification.rejectionReason && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-500 dark:text-slate-400">Lý do từ chối</p>
                              <p className="text-base font-medium text-red-600 dark:text-red-400">{verification.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-green-500" />
                        Tài liệu phương tiện
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Registration Document */}
                        {verification.documents.registrationUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
                              <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-500" />
                              Giấy đăng ký xe
                            </h5>
                            <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                              <img
                                src={verification.documents.registrationUrl}
                                alt="Giấy đăng ký xe"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}

                        {/* Insurance Certificate */}
                        {verification.documents.insuranceUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
                              <ShieldCheckIcon className="h-4 w-4 mr-1 text-blue-500" />
                              Giấy chứng nhận bảo hiểm
                            </h5>
                            <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                              <img
                                src={verification.documents.insuranceUrl}
                                alt="Giấy chứng nhận bảo hiểm"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}

                        {/* Front Photo */}
                        {verification.documents.frontPhotoUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
                              <PhotoIcon className="h-4 w-4 mr-1 text-purple-500" />
                              Ảnh phía trước
                            </h5>
                            <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                              <img
                                src={verification.documents.frontPhotoUrl}
                                alt="Ảnh phía trước của xe"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}

                        {/* Side Photo */}
                        {verification.documents.sidePhotoUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
                              <PhotoIcon className="h-4 w-4 mr-1 text-purple-500" />
                              Ảnh bên hông
                            </h5>
                            <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                              <img
                                src={verification.documents.sidePhotoUrl}
                                alt="Ảnh bên hông của xe"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}

                        {/* Plate Photo */}
                        {verification.documents.platePhotoUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
                              <PhotoIcon className="h-4 w-4 mr-1 text-yellow-500" />
                              Ảnh cận biển số
                            </h5>
                            <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                              <img
                                src={verification.documents.platePhotoUrl}
                                alt="Biển số"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {verification.status === 'pending' && (
                <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    onClick={() => handleApprove(verification)}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => openRejectModal(verification)}
                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Reject Modal */}
      {showRejectModal && verificationToReject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowRejectModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Từ chối xe
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Bạn sắp từ chối xe của <span className="font-semibold">{verificationToReject?.driverName}</span> ({verificationToReject?.plateNumber}).
                        Vui lòng nhập lý do từ chối.
                      </p>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={4}
                        placeholder="Nhập lý do từ chối..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleReject}
                  className="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Xác nhận từ chối
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setVerificationToReject(null);
                  }}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Vehicle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowCreateModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo xe</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biển số</label>
                    <input className="input-field" value={form.licensePlate} onChange={(e) => updateForm('licensePlate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hãng xe</label>
                    <input className="input-field" value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dòng xe</label>
                    <input className="input-field" value={form.model} onChange={(e) => updateForm('model', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                    <input className="input-field" type="number" value={form.year} onChange={(e) => updateForm('year', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                    <input className="input-field" value={form.color} onChange={(e) => updateForm('color', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                    <select className="input-field" value={form.vehicleType} onChange={(e) => updateForm('vehicleType', e.target.value)}>
                      <option value="motorbike">Xe số/côn</option>
                      <option value="scooter">Xe tay ga</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  disabled={saving}
                  onClick={submitCreate}
                  className="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Đang tạo...' : 'Tạo mới'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedForEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowEditModal(false)} />
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa xe</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biển số</label>
                    <input className="input-field" value={form.licensePlate} onChange={(e) => updateForm('licensePlate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hãng xe</label>
                    <input className="input-field" value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dòng xe</label>
                    <input className="input-field" value={form.model} onChange={(e) => updateForm('model', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                    <input className="input-field" type="number" value={form.year} onChange={(e) => updateForm('year', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                    <input className="input-field" value={form.color} onChange={(e) => updateForm('color', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                    <select className="input-field" value={form.vehicleType} onChange={(e) => updateForm('vehicleType', e.target.value)}>
                      <option value="motorbike">Xe số/côn</option>
                      <option value="scooter">Xe tay ga</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  disabled={saving}
                  onClick={submitEdit}
                  className="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Vehicle Modal */}
      {showDeleteModal && selectedForDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Xóa xe</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">Bạn có chắc chắn muốn xóa xe {selectedForDelete?.plateNumber} (Tài xế {selectedForDelete?.driverName})?</p>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  disabled={saving}
                  onClick={submitDelete}
                  className="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
