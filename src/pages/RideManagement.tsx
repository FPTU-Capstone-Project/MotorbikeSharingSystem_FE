import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Ride } from '../types';
import toast from 'react-hot-toast';

const mockRides: Ride[] = [
  {
    id: 'ride_001',
    riderId: 'user_001',
    driverId: 'driver_001',
    pickupLocation: {
      lat: 21.0285,
      lng: 105.8542,
      address: 'FPT University Hanoi, Hoa Lac',
    },
    destination: {
      lat: 21.0245,
      lng: 105.8412,
      address: 'Keangnam Hanoi Landmark Tower',
    },
    status: 'ongoing',
    type: 'shared',
    fare: 25000,
    distance: 12.5,
    duration: 25,
    createdAt: '2024-01-20T08:30:00Z',
    sharedWith: ['user_002', 'user_003'],
    paymentStatus: 'completed',
  },
  {
    id: 'ride_002',
    riderId: 'user_004',
    driverId: 'driver_002',
    pickupLocation: {
      lat: 21.0285,
      lng: 105.8542,
      address: 'FPT University Hanoi, Hoa Lac',
    },
    destination: {
      lat: 21.0278,
      lng: 105.8342,
      address: 'Times City, Hanoi',
    },
    status: 'completed',
    type: 'solo',
    fare: 35000,
    distance: 8.2,
    duration: 18,
    createdAt: '2024-01-20T07:15:00Z',
    completedAt: '2024-01-20T07:33:00Z',
    rating: 4.8,
    feedback: 'Great ride, very safe driver!',
    paymentStatus: 'completed',
  },
  {
    id: 'ride_003',
    riderId: 'user_005',
    driverId: 'driver_003',
    pickupLocation: {
      lat: 21.0285,
      lng: 105.8542,
      address: 'FPT University Hanoi, Hoa Lac',
    },
    destination: {
      lat: 21.0245,
      lng: 105.8412,
      address: 'Lotte Center Hanoi',
    },
    status: 'pending',
    type: 'solo',
    fare: 30000,
    distance: 10.3,
    duration: 22,
    createdAt: '2024-01-20T09:00:00Z',
    paymentStatus: 'pending',
  },
];

const riderNames: { [key: string]: string } = {
  user_001: 'John Doe',
  user_002: 'Jane Smith',
  user_003: 'Bob Wilson',
  user_004: 'Alice Johnson',
  user_005: 'Mike Brown',
};

const driverNames: { [key: string]: string } = {
  driver_001: 'David Lee',
  driver_002: 'Emma Davis',
  driver_003: 'Chris Taylor',
};

export default function RideManagement() {
  const [rides, setRides] = useState<Ride[]>(mockRides);
  const [filterStatus, setFilterStatus] = useState<'all' | Ride['status']>('all');
  const [filterType, setFilterType] = useState<'all' | Ride['type']>('all');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  const filteredRides = rides.filter(ride => {
    const matchesStatus = filterStatus === 'all' || ride.status === filterStatus;
    const matchesType = filterType === 'all' || ride.type === filterType;
    return matchesStatus && matchesType;
  });

  const handleCancelRide = (rideId: string) => {
    setRides(prev => 
      prev.map(ride => 
        ride.id === rideId 
          ? { ...ride, status: 'cancelled' }
          : ride
      )
    );
    toast.success('Đã hủy chuyến thành công');
  };

  const getStatusBadge = (status: Ride['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status];
  };

  const getTypeBadge = (type: Ride['type']) => {
    return type === 'shared' 
      ? 'bg-indigo-100 text-indigo-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const statusLabels: Record<Ride['status'], string> = {
    pending: 'Đang chờ',
    accepted: 'Đã nhận',
    ongoing: 'Đang thực hiện',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
  };

  const typeLabels: Record<Ride['type'], string> = {
    solo: 'Đi riêng',
    shared: 'Đi chung',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý chuyến đi</h1>
          <p className="mt-2 text-gray-600">
            Theo dõi và xử lý yêu cầu chuyến, chuyến đang diễn ra và đã hoàn tất
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Tổng số chuyến', 
            value: rides.length, 
            color: 'bg-blue-500',
            icon: MapPinIcon
          },
          { 
            label: 'Đang thực hiện', 
            value: rides.filter(r => r.status === 'ongoing').length, 
            color: 'bg-purple-500',
            icon: ClockIcon
          },
          { 
            label: 'Chuyến đi chung', 
            value: rides.filter(r => r.type === 'shared').length, 
            color: 'bg-green-500',
            icon: UserIcon
          },
          { 
            label: 'Tổng doanh thu', 
            value: `${rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.fare, 0).toLocaleString('vi-VN')}đ`, 
            color: 'bg-yellow-500',
            icon: CurrencyDollarIcon
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="accepted">Đã nhận</option>
            <option value="ongoing">Đang thực hiện</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            className="input-field"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">Tất cả loại chuyến</option>
            <option value="solo">Đi riêng</option>
            <option value="shared">Đi chung</option>
          </select>
        </div>
      </motion.div>

      {/* Rides Table */}
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
                  Thông tin chuyến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành khách & Tài xế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lộ trình
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái & Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cước phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRides.map((ride) => (
                <tr key={ride.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{ride.id}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(ride.createdAt).toLocaleDateString('vi-VN')} lúc{' '}
                        {new Date(ride.createdAt).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {ride.distance}km • {ride.duration} phút
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Hành khách: {riderNames[ride.riderId]}
                      </div>
                      <div className="text-sm text-gray-500">
                        Tài xế: {driverNames[ride.driverId]}
                      </div>
                      {ride.sharedWith && ride.sharedWith.length > 0 && (
                        <div className="text-xs text-blue-600">
                          +{ride.sharedWith.length} hành khách
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="truncate">{ride.pickupLocation.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="truncate">{ride.destination.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(ride.status)}`}>
                        {statusLabels[ride.status]}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(ride.type)}`}>
                        {typeLabels[ride.type]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ride.fare.toLocaleString('vi-VN')}đ
                      </div>
                      <div className={`text-xs ${
                        ride.paymentStatus === 'completed' 
                          ? 'text-green-600' 
                          : ride.paymentStatus === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {ride.paymentStatus === 'completed'
                          ? 'Đã thanh toán'
                          : ride.paymentStatus === 'pending'
                            ? 'Chờ thanh toán'
                            : 'Thất bại'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRide(ride)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {(ride.status === 'pending' || ride.status === 'accepted') && (
                        <button
                          onClick={() => handleCancelRide(ride.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Hủy chuyến"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No rides found matching your criteria.</p>
          </div>
        )}
      </motion.div>

      {/* Ride Detail Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ride Details - #{selectedRide.id}
                </h3>
                <button
                  onClick={() => setSelectedRide(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Participants */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Participants</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Rider</p>
                    <p className="text-lg font-semibold text-gray-900">{riderNames[selectedRide.riderId]}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Driver</p>
                    <p className="text-lg font-semibold text-gray-900">{driverNames[selectedRide.driverId]}</p>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Route Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pickup Location</p>
                      <p className="text-sm text-gray-600">{selectedRide.pickupLocation.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Destination</p>
                      <p className="text-sm text-gray-600">{selectedRide.destination.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Trip Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-semibold">{selectedRide.distance}km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold">{selectedRide.duration}min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fare</p>
                    <p className="font-semibold">{selectedRide.fare.toLocaleString()}đ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-semibold capitalize">{selectedRide.type}</p>
                  </div>
                </div>
              </div>

              {/* Rating & Feedback */}
              {selectedRide.status === 'completed' && selectedRide.rating && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Rating & Feedback</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">{selectedRide.rating}</span>
                      <span className="text-yellow-400 ml-1">⭐</span>
                    </div>
                    {selectedRide.feedback && (
                      <p className="text-gray-600 italic">"{selectedRide.feedback}"</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedRide(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
