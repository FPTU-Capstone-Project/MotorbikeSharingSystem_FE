import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { SOSAlert } from '../types';
import toast from 'react-hot-toast';

const mockSOSAlerts: SOSAlert[] = [
  {
    id: 'sos_001',
    userId: 'user_001',
    rideId: 'ride_001',
    location: {
      lat: 21.0285,
      lng: 105.8542,
      address: 'Near FPT University Hanoi, Hoa Lac',
    },
    status: 'active',
    description: 'Accident reported - need immediate assistance',
    createdAt: '2024-01-20T08:30:00Z',
  },
  {
    id: 'sos_002',
    userId: 'user_002',
    location: {
      lat: 21.0245,
      lng: 105.8412,
      address: 'Keangnam Hanoi Landmark Tower area',
    },
    status: 'resolved',
    description: 'Vehicle breakdown - assistance provided',
    createdAt: '2024-01-19T15:45:00Z',
    resolvedAt: '2024-01-19T16:20:00Z',
    resolvedBy: 'admin_001',
  },
  {
    id: 'sos_003',
    userId: 'driver_001',
    rideId: 'ride_003',
    location: {
      lat: 21.0278,
      lng: 105.8342,
      address: 'Times City, Hanoi - Main Gate',
    },
    status: 'false_alarm',
    description: 'False alarm - accidental activation',
    createdAt: '2024-01-19T12:15:00Z',
    resolvedAt: '2024-01-19T12:25:00Z',
    resolvedBy: 'admin_002',
  },
];

const userNames: { [key: string]: string } = {
  user_001: 'John Doe',
  user_002: 'Jane Smith',
  driver_001: 'David Lee',
};

const safetyMetrics = [
  {
    title: 'Active Alerts',
    value: mockSOSAlerts.filter(alert => alert.status === 'active').length,
    color: 'bg-red-500',
    icon: ExclamationTriangleIcon,
  },
  {
    title: 'Resolved Today',
    value: mockSOSAlerts.filter(alert => 
      alert.status === 'resolved' && 
      new Date(alert.createdAt).toDateString() === new Date().toDateString()
    ).length,
    color: 'bg-green-500',
    icon: CheckCircleIcon,
  },
  {
    title: 'Avg Response Time',
    value: '4.2 min',
    color: 'bg-blue-500',
    icon: ClockIcon,
  },
  {
    title: 'Verified Drivers',
    value: '85%',
    color: 'bg-purple-500',
    icon: ShieldCheckIcon,
  },
];

export default function SafetyManagement() {
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>(mockSOSAlerts);
  const [filterStatus, setFilterStatus] = useState<'all' | SOSAlert['status']>('all');
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);

  const filteredAlerts = sosAlerts.filter(alert => 
    filterStatus === 'all' || alert.status === filterStatus
  );

  const handleResolveAlert = (alertId: string) => {
    setSOSAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'admin_current'
            }
          : alert
      )
    );
    toast.success('SOS alert resolved successfully');
  };

  const handleMarkFalseAlarm = (alertId: string) => {
    setSOSAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'false_alarm',
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'admin_current'
            }
          : alert
      )
    );
    toast.success('Alert marked as false alarm');
  };

  const getStatusBadge = (status: SOSAlert['status']) => {
    const styles = {
      active: 'bg-red-100 text-red-800 animate-pulse',
      resolved: 'bg-green-100 text-green-800',
      false_alarm: 'bg-gray-100 text-gray-800',
    };
    return styles[status];
  };

  const getStatusIcon = (status: SOSAlert['status']) => {
    switch (status) {
      case 'active':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'false_alarm':
        return <XMarkIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor SOS alerts, driver verification status, and safety incidents
          </p>
        </div>
        <button className="btn-primary flex items-center mt-4 sm:mt-0">
          <PhoneIcon className="h-5 w-5 mr-2" />
          Emergency Contacts
        </button>
      </div>

      {/* Safety Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {safetyMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Alerts - Priority Section */}
      {sosAlerts.filter(alert => alert.status === 'active').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6"
        >
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-lg font-semibold text-red-800">Active Emergency Alerts</h2>
          </div>
          <div className="space-y-3">
            {sosAlerts.filter(alert => alert.status === 'active').map(alert => (
              <div key={alert.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-gray-900">{userNames[alert.userId]}</p>
                      <p className="text-sm text-gray-600">{alert.location.address}</p>
                      <p className="text-sm text-red-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-secondary text-sm">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      View Map
                    </button>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleMarkFalseAlarm(alert.id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      False Alarm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="false_alarm">False Alarms</option>
          </select>
        </div>
      </motion.div>

      {/* SOS Alerts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{alert.id}</div>
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {alert.description}
                      </div>
                      {alert.rideId && (
                        <div className="text-xs text-blue-600">Ride: {alert.rideId}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {userNames[alert.userId]}
                        </div>
                        <div className="text-sm text-gray-500">ID: {alert.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 truncate">
                          {alert.location.address}
                        </div>
                        <div className="text-xs text-gray-500">
                          {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(alert.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(alert.status)}`}>
                        {alert.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {alert.resolvedAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Resolved: {new Date(alert.resolvedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {alert.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMarkFalseAlarm(alert.id)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          >
                            <XMarkIcon className="h-4 w-4" />
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
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No SOS alerts found matching your criteria.</p>
          </div>
        )}
      </motion.div>

      {/* Driver Verification Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Driver Safety Verification</h3>
          <button className="btn-secondary">Manage Verifications</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">127</div>
            <div className="text-sm text-gray-600 mt-1">Verified Drivers</div>
            <div className="text-xs text-green-600 mt-2">Background checked</div>
          </div>
          <div className="text-center p-6 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">23</div>
            <div className="text-sm text-gray-600 mt-1">Pending Verification</div>
            <div className="text-xs text-yellow-600 mt-2">Awaiting review</div>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">5</div>
            <div className="text-sm text-gray-600 mt-1">Rejected</div>
            <div className="text-xs text-red-600 mt-2">Failed verification</div>
          </div>
        </div>
      </motion.div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  SOS Alert Details - #{selectedAlert.id}
                </h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Alert Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Alert Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(selectedAlert.status)}
                      <span className="ml-2 font-semibold capitalize">
                        {selectedAlert.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-semibold">
                      {new Date(selectedAlert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedAlert.description}</p>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{userNames[selectedAlert.userId]}</p>
                  <p className="text-sm text-gray-600">User ID: {selectedAlert.userId}</p>
                  {selectedAlert.rideId && (
                    <p className="text-sm text-blue-600">Associated Ride: {selectedAlert.rideId}</p>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedAlert.location.address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Coordinates: {selectedAlert.location.lat}, {selectedAlert.location.lng}
                  </p>
                  <button className="btn-primary mt-3 text-sm">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    View on Map
                  </button>
                </div>
              </div>

              {/* Resolution Info */}
              {selectedAlert.resolvedAt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Resolution</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Resolved on:</p>
                    <p className="font-semibold">
                      {new Date(selectedAlert.resolvedAt).toLocaleString()}
                    </p>
                    {selectedAlert.resolvedBy && (
                      <p className="text-sm text-gray-600 mt-1">
                        Resolved by: {selectedAlert.resolvedBy}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              {selectedAlert.status === 'active' && (
                <>
                  <button
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Resolve Alert
                  </button>
                  <button
                    onClick={() => {
                      handleMarkFalseAlarm(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    False Alarm
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedAlert(null)}
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