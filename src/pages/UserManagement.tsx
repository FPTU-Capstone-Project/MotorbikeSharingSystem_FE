import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowDownOnSquareStackIcon,
  CheckCircleIcon,
  UsersIcon,
  AcademicCapIcon,
  NoSymbolIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { Bike, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserManagementItem } from '../types';
import { getAllUsers, suspendUser, activateUser, createUser, CreateUserPayload } from '../services/profileService';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import StatSummaryCard from '../components/StatSummaryCard';
import { formatUserId } from '../utils/formatters';

export default function UserManagement() {
  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'rider' | 'driver'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPayload, setCreatePayload] = useState<CreateUserPayload>({ email: '', userType: 'USER' });
  const [createLoading, setCreateLoading] = useState(false);

  // Load users from API with pagination
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers(page, size);
        setUsers(response.data || []);
        setTotalPages(response.pagination?.total_pages ?? 1);
        setTotalRecords(response.pagination?.total_records ?? (response.data?.length || 0));
      } catch (error) {
        console.error('Failed to load users:', error);
        toast.error('Không tải được danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [page, size]);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.user_id).includes(searchTerm);

    const hasRider = !!user.rider_profile;
    const hasDriver = !!user.driver_profile;
    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'driver' ? hasDriver : hasRider);

    const userStatus = (user.status || '').toLowerCase();
    const matchesStatus =
      filterStatus === 'all' ||
      userStatus === filterStatus ||
      (filterStatus === 'inactive' && (userStatus === 'pending' || userStatus === 'email_verifying'));

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserStatusMeta = (status: string) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'ACTIVE':
        return { label: 'Đang hoạt động', classes: 'bg-green-100 text-green-800' };
      case 'SUSPENDED':
        return { label: 'Tạm khóa', classes: 'bg-red-100 text-red-800' };
      case 'INACTIVE':
        return { label: 'Không hoạt động', classes: 'bg-gray-100 text-gray-800' };
      case 'PENDING':
      case 'EMAIL_VERIFYING':
        return { label: 'Chờ kích hoạt', classes: 'bg-amber-100 text-amber-800' };
      default:
        return { label: 'Không xác định', classes: 'bg-slate-100 text-slate-700' };
    }
  };

  const getProfileStatusMeta = (status?: string) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'ACTIVE':
        return { label: 'Hoạt động', classes: 'bg-emerald-100 text-emerald-800' };
      case 'PENDING':
        return { label: 'Chờ duyệt', classes: 'bg-amber-100 text-amber-800' };
      case 'INACTIVE':
        return { label: 'Không hoạt động', classes: 'bg-gray-100 text-gray-800' };
      case 'SUSPENDED':
        return { label: 'Tạm khóa', classes: 'bg-red-100 text-red-800' };
      case 'REJECTED':
        return { label: 'Bị từ chối', classes: 'bg-rose-100 text-rose-800' };
      default:
        return { label: 'Chưa có', classes: 'bg-slate-100 text-slate-700' };
    }
  };

  const renderProfileChip = (label: string, status?: string) => {
    const meta = getProfileStatusMeta(status);
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${meta.classes}`}>
        <span>{label}</span>
        <span className="opacity-80">• {meta.label}</span>
      </span>
    );
  };

  const renderProfileDetails = (
    label: string,
    profile?: UserManagementItem['rider_profile'] | UserManagementItem['driver_profile'],
    extras?: React.ReactNode
  ) => {
    if (!profile) {
      return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-800">{label}</div>
          <p className="text-sm text-slate-500 mt-1">Chưa tạo hồ sơ</p>
        </div>
      );
    }

    const meta = getProfileStatusMeta(profile.status);

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${meta.classes}`}>{meta.label}</span>
        </div>
        <div className="mt-3 text-sm text-slate-600 space-y-1">
          {'rider_id' in profile && (
            <p>Mã hồ sơ: {profile.rider_id}</p>
          )}
          {'driver_id' in profile && (
            <p>Mã hồ sơ: {profile.driver_id}</p>
          )}
          {profile.created_at && <p>Tạo ngày: {new Date(profile.created_at).toLocaleDateString()}</p>}
          {extras}
        </div>
      </div>
    );
  };

  const handleSuspendUser = async (userId: number, userName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn tạm khóa người dùng "${userName}"?`)) {
      try {
        await suspendUser(userId);
        toast.success(`Người dùng "${userName}" đã bị tạm khóa`);
        
        // Reload users after suspension
        const response = await getAllUsers(page, size);
        setUsers(response.data || []);
        setTotalPages(response.pagination?.total_pages ?? 1);
        setTotalRecords(response.pagination?.total_records ?? (response.data?.length || 0));
      } catch (error) {
        console.error('Failed to suspend user:', error);
        toast.error('Không thể tạm khóa người dùng');
      }
    }
  };

  const handleActivateUser = async (userId: number, userName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn kích hoạt người dùng "${userName}"?`)) {
      try {
        await activateUser(userId);
        toast.success(`Người dùng "${userName}" đã được kích hoạt`);
        
        // Reload users after activation
        const response = await getAllUsers(page, size);
        setUsers(response.data || []);
        setTotalPages(response.pagination?.total_pages ?? 1);
        setTotalRecords(response.pagination?.total_records ?? (response.data?.length || 0));
      } catch (error) {
        console.error('Failed to activate user:', error);
        toast.error('Không thể kích hoạt người dùng');
      }
    }
  };

  const handleCreateUser = async () => {
    if (!createPayload.email?.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    try {
      setCreateLoading(true);
      await createUser(createPayload);
      toast.success('Đã tạo tài khoản và gửi mật khẩu tới email');
      setShowCreateModal(false);
      setCreatePayload({ email: '', userType: 'USER' });
      const response = await getAllUsers(page, size);
      setUsers(response.data || []);
      setTotalPages(response.pagination?.total_pages ?? 1);
      setTotalRecords(response.pagination?.total_records ?? (response.data?.length || 0));
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Không thể tạo tài khoản');
    } finally {
      setCreateLoading(false);
    }
  };

  const stats = [
    {
      label: 'Tổng số người dùng',
      value: totalRecords || users.length,
      icon: UsersIcon,
      gradient: 'from-blue-600 to-indigo-600',
      backgroundGradient: 'from-blue-50 to-blue-100',
      detail: `${totalRecords} hồ sơ đã tải`,
    },
    {
      label: 'Hành khách',
      value: users.filter(u => !u.driver_profile).length,
      icon: AcademicCapIcon,
      gradient: 'from-indigo-600 to-sky-600',
      backgroundGradient: 'from-indigo-50 to-sky-100',
      detail: 'Bao gồm mọi hồ sơ hành khách',
    },
    {
      label: 'Tài xế',
      value: users.filter(u => u.driver_profile).length,
      icon: Bike,
      gradient: 'from-purple-600 to-fuchsia-600',
      backgroundGradient: 'from-purple-50 to-fuchsia-100',
      detail: 'Tài xế đã hoàn tất đăng ký',
    },
    {
      label: 'Đang hoạt động',
      value: users.filter(u => u.status === 'ACTIVE').length,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-600 to-teal-600',
      backgroundGradient: 'from-emerald-50 to-teal-100',
      detail: 'Có thể đặt và nhận chuyến',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-2 text-gray-600">
            Theo dõi tài khoản hành khách, tài xế, trạng thái xác thực và hoạt động liên quan
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200/50 transition-all duration-200"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            Tạo tài khoản
          </button>
        </div>
        {/* Removed Add New User button as requested */}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
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
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                className="input-field pl-10 w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <select
                className="input-field"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="rider">Hành khách</option>
                <option value="driver">Tài xế</option>
              </select>
              <select
                className="input-field"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Bộ lọc nâng cao
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Tạo tài khoản</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Nhập email và vai trò. Hệ thống sẽ tạo mật khẩu ngẫu nhiên và gửi tới email này.
                  </p>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCreateModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="input-field w-full"
                    placeholder="user@example.com"
                    value={createPayload.email}
                    onChange={(e) => setCreatePayload({ ...createPayload, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <div className="flex space-x-3">
                    {(['USER', 'ADMIN'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setCreatePayload({ ...createPayload, userType: role })}
                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          createPayload.userType === role
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {role === 'USER' ? 'Người dùng' : 'Quản trị'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                >
                  Hủy
                </button>
                <button
                  className="btn-primary"
                  onClick={handleCreateUser}
                  disabled={createLoading}
                >
                  {createLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hồ sơ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xác thực
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt động cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="mt-2 text-gray-500">Đang tải danh sách người dùng...</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const isVerified = user.email_verified && user.phone_verified;
                    const userStatusMeta = getUserStatusMeta(user.status);
                    const avatarFallback =
                      (user.full_name || user.email || 'U').trim().charAt(0).toUpperCase() || 'U';
                    const isExpanded = expandedUserId === user.user_id;
                    const riderExtras = user.rider_profile ? (
                      <>
                        <p>Số chuyến: {user.rider_profile.total_rides?.toLocaleString?.('vi-VN') || 0}</p>
                        <p>Tổng chi: {(user.rider_profile.total_spent ?? 0).toLocaleString('vi-VN')} đ</p>
                      </>
                    ) : null;
                    const driverExtras = user.driver_profile ? (
                      <>
                        <p>Bằng lái: {user.driver_profile.license_number || 'Chưa cung cấp'}</p>
                        <p>Chuyến chia sẻ: {user.driver_profile.total_shared_rides?.toLocaleString?.('vi-VN') || 0}</p>
                        <p>Đánh giá: {user.driver_profile.rating_avg ?? '—'}</p>
                      </>
                    ) : null;

                    return (
                      <React.Fragment key={user.user_id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.profile_photo_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.profile_photo_url}
                                  alt={user.full_name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                  <span className="text-sm">{avatarFallback}</span>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-xs text-gray-400">ID: {formatUserId(user.user_id)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.user_type === 'ADMIN' ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                Quản trị viên
                              </span>
                            ) : (
                              <div className="flex flex-col space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {renderProfileChip('Hành khách', user.rider_profile?.status)}
                                  {renderProfileChip('Tài xế', user.driver_profile?.status)}
                                </div>
                                <button
                                  className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                  onClick={() => setExpandedUserId(isExpanded ? null : user.user_id)}
                                >
                                  {isExpanded ? 'Thu gọn hồ sơ' : 'Xem chi tiết hồ sơ'}
                                  {isExpanded ? (
                                    <ChevronUpIcon className="h-4 w-4 ml-1" />
                                  ) : (
                                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userStatusMeta.classes}`}>
                              {userStatusMeta.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.user_type === 'ADMIN' ? (
                              <span className="text-sm text-gray-400">—</span>
                            ) : isVerified ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircleIcon className="h-5 w-5 mr-1" />
                                <span className="text-sm">Đã xác thực</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-yellow-600">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                                <span className="text-sm">Đang chờ</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {user.status.toLowerCase() === 'suspended' ? (
                                <button className="text-green-600 hover:text-green-900 p-1 rounded flex items-center"
                                  onClick={() => handleActivateUser(user.user_id, user.full_name || `Người dùng ${user.user_id}`)}
                                  title="Kích hoạt người dùng">
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                              ) : (
                                <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded flex items-center"
                                  onClick={() => handleSuspendUser(user.user_id, user.full_name || `Người dùng ${user.user_id}`)}
                                  title="Tạm khóa người dùng">
                                  <NoSymbolIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                        {isExpanded && user.user_type !== 'ADMIN' && (
                          <tr>
                            <td colSpan={6} className="px-6 pb-6 pt-0 bg-gray-50">
                              <div className="mt-2 grid gap-4 md:grid-cols-2">
                                {renderProfileDetails('Hồ sơ hành khách', user.rider_profile, riderExtras)}
                                {renderProfileDetails('Hồ sơ tài xế', user.driver_profile, driverExtras)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
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
          pageSizeOptions={[10, 20, 50, 100]}
        />
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500">Không tìm thấy người dùng phù hợp với tiêu chí.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
