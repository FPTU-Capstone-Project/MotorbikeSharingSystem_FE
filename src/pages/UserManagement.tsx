import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { User } from '../types';
import toast from 'react-hot-toast';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@student.fpt.edu.vn',
    name: 'John Doe',
    role: 'student',
    isVerified: true,
    studentId: 'SE150001',
    phoneNumber: '+84 901 234 567',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff',
    createdAt: '2024-01-15T08:30:00Z',
    lastActive: '2024-01-20T14:22:00Z',
    status: 'active',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+84 901 234 568',
    },
  },
  {
    id: '2',
    email: 'mike.driver@student.fpt.edu.vn',
    name: 'Mike Johnson',
    role: 'driver',
    isVerified: false,
    studentId: 'SE150002',
    phoneNumber: '+84 901 234 569',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=10b981&color=fff',
    createdAt: '2024-01-16T09:15:00Z',
    lastActive: '2024-01-20T16:45:00Z',
    status: 'active',
  },
  {
    id: '3',
    email: 'sarah.wilson@student.fpt.edu.vn',
    name: 'Sarah Wilson',
    role: 'student',
    isVerified: true,
    studentId: 'SE150003',
    phoneNumber: '+84 901 234 570',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=ef4444&color=fff',
    createdAt: '2024-01-17T10:00:00Z',
    lastActive: '2024-01-19T12:30:00Z',
    status: 'inactive',
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'driver'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Memoized stats for performance
  const stats = useMemo(() => [
    { label: 'Total Users', value: users.length, color: 'bg-blue-500' },
    { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'bg-green-500' },
    { label: 'Drivers', value: users.filter(u => u.role === 'driver').length, color: 'bg-purple-500' },
    { label: 'Pending Verification', value: users.filter(u => !u.isVerified).length, color: 'bg-yellow-500' },
  ], [users]);

  // Optimized handlers with useCallback
  const handleVerifyUser = useCallback((userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isVerified: true }
          : user
      )
    );
    toast.success('User verified successfully');
  }, []);

  const handleSuspendUser = useCallback((userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'suspended' }
          : user
      )
    );
    toast.success('User suspended successfully');
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast.success('User deleted successfully');
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage student and driver accounts, verification status, and user activities
          </p>
        </div>
        <button className="btn-primary flex items-center mt-4 sm:mt-0">
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            className="card-interactive gpu-accelerated"
          >
            <div className="flex items-center">
              <motion.div 
                className={`p-3 rounded-lg ${stat.color}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <span className="text-white font-bold text-lg">{stat.value}</span>
              </motion.div>
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
        transition={{ delay: 0.3 }}
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
                onChange={handleSearchChange}
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
          <button className="btn-secondary flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Advanced Filters
          </button>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <motion.tr 
                  key={user.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.02,
                    duration: 0.2,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  className="table-row gpu-accelerated"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">ID: {user.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'driver' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isVerified ? (
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
                    {new Date(user.lastActive).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 click-feedback"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 click-feedback"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </motion.button>
                      {!user.isVerified && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.1 }}
                          onClick={() => handleVerifyUser(user.id)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 click-feedback"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </motion.button>
                      )}
                      {user.status !== 'suspended' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.1 }}
                          onClick={() => handleSuspendUser(user.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50 click-feedback"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 click-feedback"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}