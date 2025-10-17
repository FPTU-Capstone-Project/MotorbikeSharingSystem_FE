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
import { Bike, Plus } from 'lucide-react';
import { VehicleVerification } from '../types';
import { approveDriverVehicle, rejectDriver } from '../services/verificationService';
import { vehicleService } from '../services/vehicleService';
import toast from 'react-hot-toast';

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
  const pageSize = 10;
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
        console.error(e);
        toast.error(e?.message || 'Failed to load vehicles');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [page, sortBy, sortDir]);

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

  const handleApprove = async (verification: VehicleVerification) => {
    try {
      await approveDriverVehicle(Number(verification.driverId), 'Approved vehicle registration');
      toast.success(`Approved vehicle for ${verification.driverName}`);
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
      toast.success(`Rejected vehicle for ${verificationToReject.driverName}`);
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
      setVerificationToReject(null);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Reject failed');
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
      toast.success('Vehicle created');
      setShowCreateModal(false);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Create vehicle failed');
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
      toast.success('Vehicle updated');
      setShowEditModal(false);
      setSelectedForEdit(null);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Update vehicle failed');
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
      toast.success('Vehicle deleted');
      setShowDeleteModal(false);
      setSelectedForDelete(null);
      setPage(0);
    } catch (e: any) {
      toast.error(e?.message || 'Delete vehicle failed');
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="mt-2 text-gray-600">
            Manage vehicles, registrations, insurance certificates, and vehicle photos
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200/50 transition-all duration-200"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Create Vehicle
          </button>
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
              <Bike className="h-6 w-6 text-white" />
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
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by driver name, email, plate number, model..."
              className="input-field pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              className="input-field w-44 sm:w-56"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="submittedAt">Submitted</option>
              <option value="driverId">Driver ID</option>
              <option value="plateNumber">Plate</option>
              <option value="status">Status (ACTIVE/MAINTENANCE)</option>
            </select>
            <select
              className="input-field w-28 sm:w-32"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
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
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{verification.driverId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{verification.driverName}</div>
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
                    <div className={`text-xs ${new Date(verification.insuranceExpiry) < new Date()
                        ? 'text-red-600 font-semibold'
                        : 'text-green-600'
                      }`}>
                      {new Date(verification.insuranceExpiry) < new Date() ? 'Expired' : 'Valid'}
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
                      const label = s || 'PENDING';
                      return (
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${pill}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(verification.submittedAt).toLocaleDateString('en-US')}
                    <div className="text-xs text-gray-400">
                      {new Date(verification.submittedAt).toLocaleTimeString('en-US')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openDetailModal(verification)} className="text-blue-600 hover:text-blue-900 p-1 rounded flex items-center">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(verification)} className="text-green-600 hover:text-green-900 p-1 rounded flex items-center">
                        <ArrowDownOnSquareStackIcon className="h-4 w-4" />
                      </button><button onClick={() => openDelete(verification)} className="text-red-600 hover:text-red-900 p-1 rounded flex items-center">
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVerifications.length === 0 && (
          <div className="text-center py-12">
            <Bike className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No vehicles found.</p>
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">Page {page + 1} / {Math.max(totalPages, 1)} • Total {totalRecords}</div>
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
                        Vehicle Details
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
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${selectedVerification.userStatus === 'active'
                              ? 'bg-green-100 text-green-800'
                              : selectedVerification.userStatus === 'inactive'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {selectedVerification.userStatus === 'active' && 'Active'}
                            {selectedVerification.userStatus === 'inactive' && 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Bike className="h-5 w-5 mr-2 text-blue-500" />
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
                          <p className={`text-base font-medium ${new Date(selectedVerification.insuranceExpiry) < new Date()
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
                        Vehicle Documents
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
                                alt="Front view of vehicle"
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
                                alt="Side view of vehicle"
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
                      Reject Vehicle
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        You are rejecting the vehicle for <span className="font-semibold">{verificationToReject.driverName}</span> ({verificationToReject.plateNumber}).
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

      {/* Create Vehicle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowCreateModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Vehicle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                    <input className="input-field" value={form.licensePlate} onChange={(e) => updateForm('licensePlate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input className="input-field" value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input className="input-field" value={form.model} onChange={(e) => updateForm('model', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input className="input-field" type="number" value={form.year} onChange={(e) => updateForm('year', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input className="input-field" value={form.color} onChange={(e) => updateForm('color', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="input-field" value={form.vehicleType} onChange={(e) => updateForm('vehicleType', e.target.value)}>
                      <option value="motorbike">Motorbike</option>
                      <option value="scooter">Scooter</option>
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
                  {saving ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Vehicle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                    <input className="input-field" value={form.licensePlate} onChange={(e) => updateForm('licensePlate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input className="input-field" value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input className="input-field" value={form.model} onChange={(e) => updateForm('model', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input className="input-field" type="number" value={form.year} onChange={(e) => updateForm('year', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input className="input-field" value={form.color} onChange={(e) => updateForm('color', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="input-field" value={form.vehicleType} onChange={(e) => updateForm('vehicleType', e.target.value)}>
                      <option value="motorbike">Motorbike</option>
                      <option value="scooter">Scooter</option>
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
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Vehicle</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete vehicle {selectedForDelete.plateNumber} (Driver {selectedForDelete.driverName})?</p>
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


