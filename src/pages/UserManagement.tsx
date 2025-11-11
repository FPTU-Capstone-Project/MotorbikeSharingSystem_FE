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
} from '@heroicons/react/24/outline';
import { Bike, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserManagementItem } from '../types';
import { getAllUsers, suspendUser, activateUser } from '../services/profileService';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import StatSummaryCard from '../components/StatSummaryCard';

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

    // Determine user role based on profiles
    const userRole = user.driver_profile ? 'driver' : 'rider';
    const matchesRole = filterRole === 'all' || userRole === filterRole;

    // Map status to match filter options
    const userStatus = user.status.toLowerCase();
    const matchesStatus = filterStatus === 'all' || userStatus === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const stats = [
    {
      label: 'Tổng số người dùng',
      value: users.length,
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
            onClick={() => toast.success('Open Create Staff modal (to be implemented)')}
          >
            <Plus className="h-4 w-4" />
            Tạo tài khoản nhân viên
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
                  Vai trò
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
                    const userRole = user.driver_profile ? 'driver' : 'rider';
                    const userRoleLabel = userRole === 'driver' ? 'Tài xế' : 'Hành khách';
                    const isVerified = user.email_verified && user.phone_verified;
                    const statusLabel =
                      user.status === 'ACTIVE'
                        ? 'Đang hoạt động'
                        : user.status === 'INACTIVE'
                          ? 'Không hoạt động'
                          : 'Tạm khóa';

                    return (
                      <motion.tr
                        key={user.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profile_photo_url}
                              alt=""
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">ID: {user.user_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userRole === 'driver'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                            }`}>
                            {userRoleLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'INACTIVE'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isVerified ? (
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
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 p-1 rounded flex items-center"
                              title="Xem chi tiết người dùng">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 p-1 rounded flex items-center"
                              title="Xuất dữ liệu người dùng">
                              <ArrowDownOnSquareStackIcon className="h-4 w-4" />
                            </button>
                            
                            {/* Show suspend button for active users, activate button for suspended users */}
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
