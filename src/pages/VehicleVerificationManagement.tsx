import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  TruckIcon,
  ClockIcon,
  UserIcon,
  PhotoIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { VehicleVerification } from '../types';
import { PageResponse } from '../utils/api';
import { DriverKycItemDTO } from '../types';
import { approveDriverVehicle, fetchPendingDriverKycs, rejectDriver } from '../services/verificationService';
import toast from 'react-hot-toast';

// Load from backend

export default function VehicleVerificationManagement() {
  const [verifications, setVerifications] = useState<VehicleVerification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedVerification, setSelectedVerification] = useState<VehicleVerification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [verificationToReject, setVerificationToReject] = useState<VehicleVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    // TODO: Backend chưa có API /verification/drivers (getAll)
    // Hiện tại chỉ có /verification/drivers/pending
    // Tạm thời comment để không load API

    // let ignore = false;
    // const load = async () => {
    //   try {
    //     setLoading(true);
    //     const res = await fetchPendingDriverKycs(page, pageSize);
    //     if (ignore) return;
    //     // Map to table rows: we show vehicle verification line per driver
    //     const rows: VehicleVerification[] = res.data.map((d: any, idx) => {
    //       const vehicle = d.verifications?.find((v: any) => v.type === 'VEHICLE_REGISTRATION');
    //       return {
    //         id: `${d.user_id || d.userId}-${idx}`,
    //         driverId: String(d.user_id || d.userId),
    //         vehicleId: `veh-${d.user_id || d.userId}`,
    //         driverName: d.full_name || d.fullName || 'N/A',
    //         driverEmail: d.email || 'N/A',
    //         driverPhone: d.phone || 'N/A',
    //         plateNumber: 'N/A',
    //         model: 'N/A',
    //         color: 'N/A',
    //         year: new Date().getFullYear(),
    //         insuranceExpiry: new Date().toISOString().slice(0,10),
    //         status: (vehicle?.status || 'PENDING').toLowerCase() as any,
    //         verificationType: 'vehicle_registration',
    //         documents: {
    //           registrationUrl: vehicle?.document_url || vehicle?.documentUrl,
    //         },
    //         submittedAt: vehicle?.created_at || vehicle?.createdAt || '',
    //       };
    //     });
    //     setVerifications(rows);
    //   } catch (e: any) {
    //     console.error(e);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // load();
    // return () => { ignore = true; };

    setVerifications([]); // Tạm thời set empty array
  }, [page]);

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch =
      (verification.driverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (verification.driverEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (verification.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (verification.model || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || verification.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const approvedCount = verifications.filter(v => v.status === 'approved').length;
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length;

  const handleApprove = async (verification: VehicleVerification) => {
    try {
      await approveDriverVehicle(Number(verification.driverId), 'Approved vehicle registration');
      toast.success(`Approved vehicle verification for ${verification.driverName}`);
      setShowDetailModal(false);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Approve failed');
    }
  };

  const handleReject = async () => {
    if (!verificationToReject) return;
    if (!rejectionReason.trim()) {
      toast.error('Please enter rejection reason');
      return;
    }
    try {
      await rejectDriver(Number(verificationToReject.driverId), rejectionReason, 'Rejected by admin');
      toast.success(`Rejected vehicle verification for ${verificationToReject.driverName}`);
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
      setVerificationToReject(null);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Reject failed');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Verification</h1>
          <p className="mt-2 text-gray-600">
            Manage and approve vehicle registrations, insurance certificates, and vehicle photos
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{verifications.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
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
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by driver name, email, plate number, model..."
              className="input-field pl-10 w-full sm:w-96"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Verifications Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plate Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insurance Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{verification.driverName}</div>
                        <div className="text-sm text-gray-500">{verification.driverEmail}</div>
                        <div className="text-xs text-gray-400">{verification.driverPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{verification.model}</div>
                    <div className="text-sm text-gray-500">{verification.color} - {verification.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 bg-yellow-100 px-3 py-1 rounded-md inline-block">
                      {verification.plateNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(verification.insuranceExpiry).toLocaleDateString('en-US')}
                    </div>
                    <div className={`text-xs ${
                      new Date(verification.insuranceExpiry) < new Date()
                        ? 'text-red-600 font-semibold'
                        : 'text-green-600'
                    }`}>
                      {new Date(verification.insuranceExpiry) < new Date() ? 'Expired' : 'Valid'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      verification.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : verification.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {verification.status === 'approved' && 'Approved'}
                      {verification.status === 'rejected' && 'Rejected'}
                      {verification.status === 'pending' && 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(verification.submittedAt).toLocaleDateString('en-US')}
                    <div className="text-xs text-gray-400">
                      {new Date(verification.submittedAt).toLocaleTimeString('en-US')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openDetailModal(verification)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVerifications.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No vehicle verification requests found.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedVerification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDetailModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Vehicle Verification Details
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
                        Driver Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.driverName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.driverEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.driverPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            selectedVerification.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : selectedVerification.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedVerification.status === 'approved' && 'Approved'}
                            {selectedVerification.status === 'rejected' && 'Rejected'}
                            {selectedVerification.status === 'pending' && 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <TruckIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Vehicle Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Plate Number</p>
                          <p className="text-base font-bold text-gray-900 bg-yellow-100 px-3 py-1 rounded-md inline-block">
                            {selectedVerification.plateNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Model</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Color</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.color}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Insurance Expiry</p>
                          <p className={`text-base font-medium ${
                            new Date(selectedVerification.insuranceExpiry) < new Date()
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                            {new Date(selectedVerification.insuranceExpiry).toLocaleDateString('en-US')}
                            {new Date(selectedVerification.insuranceExpiry) < new Date() && ' (Expired)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Submitted At</p>
                          <p className="text-base font-medium text-gray-900">
                            {new Date(selectedVerification.submittedAt).toLocaleString('en-US')}
                          </p>
                        </div>
                      </div>

                      {selectedVerification.status !== 'pending' && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Reviewed By</p>
                              <p className="text-base font-medium text-gray-900">{selectedVerification.verifiedBy}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Reviewed At</p>
                              <p className="text-base font-medium text-gray-900">
                                {selectedVerification.verifiedAt && new Date(selectedVerification.verifiedAt).toLocaleString('en-US')}
                              </p>
                            </div>
                          </div>
                          {selectedVerification.rejectionReason && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-500">Rejection Reason</p>
                              <p className="text-base font-medium text-red-600">{selectedVerification.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-green-500" />
                        Verification Documents
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Registration Document */}
                        {selectedVerification.documents.registrationUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-500" />
                              Vehicle Registration
                            </h5>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={selectedVerification.documents.registrationUrl}
                                alt="Vehicle Registration"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}

                        {/* Insurance Certificate */}
                        {selectedVerification.documents.insuranceUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <ShieldCheckIcon className="h-4 w-4 mr-1 text-blue-500" />
                              Insurance Certificate
                            </h5>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={selectedVerification.documents.insuranceUrl}
                                alt="Insurance Certificate"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}

                        {/* Front Photo */}
                        {selectedVerification.documents.frontPhotoUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <PhotoIcon className="h-4 w-4 mr-1 text-purple-500" />
                              Front Photo
                            </h5>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={selectedVerification.documents.frontPhotoUrl}
                                alt="Front Photo"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}

                        {/* Side Photo */}
                        {selectedVerification.documents.sidePhotoUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <PhotoIcon className="h-4 w-4 mr-1 text-purple-500" />
                              Side Photo
                            </h5>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={selectedVerification.documents.sidePhotoUrl}
                                alt="Side Photo"
                                className="w-full h-auto object-contain max-h-64"
                              />
                            </div>
                          </div>
                        )}

                        {/* Plate Photo */}
                        {selectedVerification.documents.platePhotoUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <PhotoIcon className="h-4 w-4 mr-1 text-yellow-500" />
                              Plate Number Closeup
                            </h5>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={selectedVerification.documents.platePhotoUrl}
                                alt="Plate Number"
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

              {selectedVerification.status === 'pending' && (
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    onClick={() => handleApprove(selectedVerification)}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(selectedVerification)}
                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                      Reject Vehicle Verification
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        You are rejecting the vehicle verification for <span className="font-semibold">{verificationToReject.driverName}</span> ({verificationToReject.plateNumber}).
                        Please provide a reason for rejection.
                      </p>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter rejection reason..."
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
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setVerificationToReject(null);
                  }}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
