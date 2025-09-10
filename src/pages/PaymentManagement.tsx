import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Payment } from '../types';
import toast from 'react-hot-toast';

const mockPayments: Payment[] = [
  {
    id: 'pay_001',
    userId: 'user_001',
    type: 'ride_payment',
    amount: 25000,
    status: 'completed',
    method: 'wallet',
    description: 'Payment for ride #ride_001',
    createdAt: '2024-01-20T08:30:00Z',
    rideId: 'ride_001',
  },
  {
    id: 'pay_002',
    userId: 'user_002',
    type: 'deposit',
    amount: 100000,
    status: 'completed',
    method: 'card',
    description: 'Wallet top-up via credit card',
    createdAt: '2024-01-20T07:45:00Z',
  },
  {
    id: 'pay_003',
    userId: 'driver_001',
    type: 'withdrawal',
    amount: 150000,
    status: 'pending',
    method: 'bank_transfer',
    description: 'Driver earnings withdrawal',
    createdAt: '2024-01-20T06:20:00Z',
  },
  {
    id: 'pay_004',
    userId: 'user_003',
    type: 'ride_payment',
    amount: 35000,
    status: 'failed',
    method: 'wallet',
    description: 'Payment for ride #ride_002 - Insufficient funds',
    createdAt: '2024-01-19T18:30:00Z',
    rideId: 'ride_002',
  },
  {
    id: 'pay_005',
    userId: 'user_004',
    type: 'deposit',
    amount: 200000,
    status: 'completed',
    method: 'bank_transfer',
    description: 'Wallet top-up via bank transfer',
    createdAt: '2024-01-19T15:15:00Z',
  },
];

const userNames: { [key: string]: string } = {
  user_001: 'John Doe',
  user_002: 'Jane Smith',
  user_003: 'Bob Wilson',
  user_004: 'Alice Johnson',
  driver_001: 'David Lee',
  driver_002: 'Emma Davis',
};

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filterType, setFilterType] = useState<'all' | Payment['type']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Payment['status']>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | Payment['method']>('all');

  const filteredPayments = payments.filter(payment => {
    const matchesType = filterType === 'all' || payment.type === filterType;
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesType && matchesStatus && matchesMethod;
  });

  const handleApproveWithdrawal = (paymentId: string) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'completed' }
          : payment
      )
    );
    toast.success('Withdrawal approved successfully');
  };

  const handleRejectWithdrawal = (paymentId: string) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'failed' }
          : payment
      )
    );
    toast.success('Withdrawal rejected');
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return styles[status];
  };

  const getTypeIcon = (type: Payment['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpIcon className="h-4 w-4 text-blue-500" />;
      case 'ride_payment':
        return <CreditCardIcon className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getMethodBadge = (method: Payment['method']) => {
    const styles = {
      wallet: 'bg-purple-100 text-purple-800',
      card: 'bg-blue-100 text-blue-800',
      bank_transfer: 'bg-gray-100 text-gray-800',
    };
    return styles[method];
  };

  const totalRevenue = payments.filter(p => p.type === 'ride_payment' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalDeposits = payments.filter(p => p.type === 'deposit' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingWithdrawals = payments.filter(p => p.type === 'withdrawal' && p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor transactions, deposits, withdrawals, and payment processing
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Revenue', 
            value: `${totalRevenue.toLocaleString()}đ`, 
            color: 'bg-green-500',
            icon: BanknotesIcon,
            change: '+12.5%'
          },
          { 
            label: 'Total Deposits', 
            value: `${totalDeposits.toLocaleString()}đ`, 
            color: 'bg-blue-500',
            icon: ArrowDownIcon,
            change: '+8.3%'
          },
          { 
            label: 'Pending Withdrawals', 
            value: `${pendingWithdrawals.toLocaleString()}đ`, 
            color: 'bg-yellow-500',
            icon: ArrowUpIcon,
            change: '3 requests'
          },
          { 
            label: 'Failed Transactions', 
            value: payments.filter(p => p.status === 'failed').length, 
            color: 'bg-red-500',
            icon: XCircleIcon,
            change: '-2 from yesterday'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            className="input-field"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="ride_payment">Ride Payments</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            className="input-field"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value as any)}
          >
            <option value="all">All Methods</option>
            <option value="wallet">Wallet</option>
            <option value="card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </motion.div>

      {/* Payments Table */}
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
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{payment.id}</div>
                      <div className="text-sm text-gray-500">{payment.description}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(payment.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {userNames[payment.userId]?.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {userNames[payment.userId]}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {payment.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(payment.type)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {payment.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      payment.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {payment.type === 'withdrawal' ? '-' : '+'}
                      {payment.amount.toLocaleString()}đ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodBadge(payment.method)}`}>
                      {payment.method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {payment.type === 'withdrawal' && payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveWithdrawal(payment.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(payment.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payments found matching your criteria.</p>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Withdrawals</h3>
          <div className="space-y-3">
            {payments.filter(p => p.type === 'withdrawal' && p.status === 'pending').slice(0, 3).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{userNames[payment.userId]}</p>
                  <p className="text-xs text-gray-500">{payment.amount.toLocaleString()}đ</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveWithdrawal(payment.id)}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRejectWithdrawal(payment.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deposits</h3>
          <div className="space-y-3">
            {payments.filter(p => p.type === 'deposit' && p.status === 'completed').slice(0, 3).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{userNames[payment.userId]}</p>
                  <p className="text-xs text-gray-500">
                    +{payment.amount.toLocaleString()}đ via {payment.method.replace('_', ' ')}
                  </p>
                </div>
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Failed Transactions</h3>
          <div className="space-y-3">
            {payments.filter(p => p.status === 'failed').slice(0, 3).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{userNames[payment.userId]}</p>
                  <p className="text-xs text-gray-500">{payment.amount.toLocaleString()}đ</p>
                </div>
                <XCircleIcon className="h-5 w-5 text-red-500" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}