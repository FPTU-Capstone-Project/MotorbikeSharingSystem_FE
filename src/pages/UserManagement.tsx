import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { UserManagementItem } from '../types';
import { getAllUsers } from '../services/profileService';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'driver'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers(0, 1000); // Load all users for client-side filtering
        setUsers(response.data || []);
      } catch (error) {
        console.error('Failed to load users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.user_id).includes(searchTerm);

    // Determine user role based on profiles
    const userRole = user.driver_profile ? 'driver' : 'student';
    const matchesRole = filterRole === 'all' || userRole === filterRole;
    
    // Map status to match filter options
    const userStatus = user.status.toLowerCase();
    const matchesStatus = filterStatus === 'all' || userStatus === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleVerifyUser = async (userId: string) => {
    try {
      // TODO: Implement verify user API call
      setUsers(prev => 
        prev.map(user => 
          user.user_id === Number(userId) 
            ? { ...user, email_verified: true, phone_verified: true }
            : user
        )
      );
      toast.success('User verified successfully');
    } catch (error) {
      console.error('Failed to verify user:', error);
      toast.error('Failed to verify user');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      // TODO: Implement suspend user API call
      setUsers(prev => 
        prev.map(user => 
          user.user_id === Number(userId) 
            ? { ...user, status: 'SUSPENDED' }
            : user
        )
      );
      toast.success('User suspended successfully');
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // TODO: Implement delete user API call
      setUsers(prev => prev.filter(user => user.user_id !== Number(userId)));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const statColors = [
    { from: 'from-blue-500', to: 'to-blue-600' },
    { from: 'from-green-500', to: 'to-emerald-600' },
    { from: 'from-purple-500', to: 'to-indigo-600' },
    { from: 'from-yellow-500', to: 'to-orange-500' },
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage student and driver accounts, verification status, and user activities
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center mt-4 sm:mt-0"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add New User
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: users.length },
          { label: 'Students', value: users.filter(u => !u.driver_profile).length },
          { label: 'Drivers', value: users.filter(u => u.driver_profile).length },
          { label: 'Active Users', value: users.filter(u => u.status === 'ACTIVE').length },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.1 }}
            className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${statColors[index].from} ${statColors[index].to} shadow-lg`}>
                <span className="text-white font-bold text-lg">{stat.value}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            </div>
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
                placeholder="Search users..."
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
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="driver">Drivers</option>
              </select>
              <select
                className="input-field"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Advanced Filters
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
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
                      <p className="mt-2 text-gray-500">Loading users...</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const userRole = user.driver_profile ? 'driver' : 'student';
                    const isVerified = user.email_verified && user.phone_verified;
                    
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userRole === 'driver' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {userRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'INACTIVE'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isVerified ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircleIcon className="h-5 w-5 mr-1" />
                              <span className="text-sm">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-600">
                              <XCircleIcon className="h-5 w-5 mr-1" />
                              <span className="text-sm">Pending</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 p-1 rounded flex items-center">
                              <EyeIcon className="h-4 w-4" />
                              
                            </button>

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

        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500">No users found matching your criteria.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}