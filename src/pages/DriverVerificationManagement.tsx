import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import driverVerificationService, { DriverKycResponse } from '../services/driverVerificationService';

export default function DriverVerificationManagement() {
  const [verifications, setVerifications] = useState<DriverKycResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [selectedVerification, setSelectedVerification] = useState<DriverKycResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [verificationToReject, setVerificationToReject] = useState<DriverKycResponse | null>(null);
  const [backgroundCheckNotes, setBackgroundCheckNotes] = useState('');
  const [showBackgroundCheckModal, setShowBackgroundCheckModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Stats
  const [stats, setStats] = useState({
    total_drivers: 0,
    pending_verifications: 0,
    active_drivers: 0,
    rejected_drivers: 0,
  });

  useEffect(() => {
    fetchVerifications();
    fetchStats();
  }, [filterStatus, currentPage]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const response = await driverVerificationService.getPendingDriverVerifications(
        currentPage,
        pageSize,
        'created_at',
        'desc'
      );
      setVerifications(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Error fetching driver verifications:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách xác minh tài xế');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await driverVerificationService.getDriverVerificationStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch =
      verification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.license_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || verification.driver_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApproveLicense = async (verification: DriverKycResponse) => {
    try {
      setLoading(true);
      await driverVerificationService.approveDriverLicense(verification.user_id, { notes: 'Approved by admin' });
      toast.success(`Đã duyệt bằng lái xe của ${verification.full_name}`);
      await fetchVerifications();
      if (selectedVerification?.user_id === verification.user_id) {
        const updated = await driverVerificationService.getDriverKycById(verification.user_id);
        setSelectedVerification(updated);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt bằng lái');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVehicle = async (verification: DriverKycResponse) => {
    try {
      setLoading(true);
      await driverVerificationService.approveDriverVehicle(verification.user_id, { notes: 'Approved by admin' });
      toast.success(`Đã duyệt đăng ký xe của ${verification.full_name}`);
      await fetchVerifications();
      if (selectedVerification?.user_id === verification.user_id) {
        const updated = await driverVerificationService.getDriverKycById(verification.user_id);
        setSelectedVerification(updated);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt đăng ký xe');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBackgroundCheck = async () => {
    if (!selectedVerification) return;
    try {
      setLoading(true);
      await driverVerificationService.updateBackgroundCheck(selectedVerification.user_id, {
        status: 'approved',
        notes: backgroundCheckNotes,
        criminal_record_clear: true,
        driving_record_clear: true,
      });
      toast.success(`Đã duyệt kiểm tra lý lịch của ${selectedVerification.full_name}`);
      setShowBackgroundCheckModal(false);
      setBackgroundCheckNotes('');
      await fetchVerifications();
      const updated = await driverVerificationService.getDriverKycById(selectedVerification.user_id);
      setSelectedVerification(updated);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt kiểm tra lý lịch');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!verificationToReject || !rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setLoading(true);
      await driverVerificationService.rejectDriverVerification(verificationToReject.user_id, { reason: rejectionReason });
      toast.error(`Đã từ chối hồ sơ tài xế ${verificationToReject.full_name}`);
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
      setVerificationToReject(null);
      await fetchVerifications();
      await fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể từ chối hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (verification: DriverKycResponse) => {
    try {
      setLoading(true);
      const fullData = await driverVerificationService.getDriverKycById(verification.user_id);
      setSelectedVerification(fullData);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết tài xế');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã duyệt</span>;
      case 'rejected':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Từ chối</span>;
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      case 'not_started':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Chưa bắt đầu</span>;
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Hoạt động</span>;
      case 'suspended':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Tạm ngưng</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xác Minh Tài Xế</h1>
          <p className="mt-2 text-gray-600">Quản lý và duyệt bằng lái xe, đăng ký xe, kiểm tra lý lịch tài xế</p>
        </div>
        <button onClick={() => { setCurrentPage(0); fetchVerifications(); fetchStats(); }} disabled={loading} className="btn-primary flex items-center mt-4 sm:mt-0 disabled:opacity-50">
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Tổng số', value: stats.total_drivers, icon: UserIcon, color: 'bg-blue-500' },
          { label: 'Chờ duyệt', value: stats.pending_verifications, icon: ClockIcon, color: 'bg-yellow-500' },
          { label: 'Đang hoạt động', value: stats.active_drivers, icon: CheckCircleIcon, color: 'bg-green-500' },
          { label: 'Từ chối', value: stats.rejected_drivers, icon: XCircleIcon, color: 'bg-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm theo tên, email, MSSV, số bằng lái..." className="input-field pl-10 w-full sm:w-96" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="input-field" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(0); }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Hoạt động</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số bằng lái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVerifications.map((verification) => (
                    <tr key={verification.user_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{verification.full_name}</div>
                            <div className="text-sm text-gray-500">{verification.email}</div>
                            <div className="text-xs text-gray-400">MSSV: {verification.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{verification.license_number || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{getStatusBadge(verification.license_status || 'pending')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(verification.driver_status)}
                        <div className="text-xs text-gray-500 mt-1">KTRA lý lịch: {getStatusBadge(verification.background_check_status || 'not_started')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {verification.total_rides && verification.total_rides > 0 ? (
                          <>
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span className="font-medium">{verification.rating_average?.toFixed(1)}</span>
                            </div>
                            <div className="text-xs text-gray-400">{verification.total_rides} chuyến</div>
                          </>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => openDetailModal(verification)} className="text-blue-600 hover:text-blue-900 flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Xem chi tiết
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
                <p className="mt-2 text-gray-500">Không tìm thấy yêu cầu xác minh tài xế nào.</p>
              </div>
            )}
          </>
        )}
      </div>

      {showDetailModal && selectedVerification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDetailModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Chi tiết xác minh tài xế</h3>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-500">
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Thông tin tài xế
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-sm text-gray-500">Họ và tên</p><p className="text-base font-medium text-gray-900">{selectedVerification.full_name}</p></div>
                    <div><p className="text-sm text-gray-500">MSSV</p><p className="text-base font-medium text-gray-900">{selectedVerification.student_id}</p></div>
                    <div><p className="text-sm text-gray-500">Email</p><p className="text-base font-medium text-gray-900">{selectedVerification.email}</p></div>
                    <div><p className="text-sm text-gray-500">Số điện thoại</p><p className="text-base font-medium text-gray-900">{selectedVerification.phone}</p></div>
                    <div><p className="text-sm text-gray-500">Số bằng lái</p><p className="text-base font-medium text-gray-900">{selectedVerification.license_number || 'N/A'}</p></div>
                    <div><p className="text-sm text-gray-500">Trạng thái tài xế</p>{getStatusBadge(selectedVerification.driver_status)}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-500" />
                    Trạng thái xác minh
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-sm text-gray-500">Bằng lái xe</p>{getStatusBadge(selectedVerification.license_status || 'pending')}</div>
                    <div><p className="text-sm text-gray-500">Đăng ký xe</p>{getStatusBadge(selectedVerification.vehicle_registration_status || 'pending')}</div>
                    <div><p className="text-sm text-gray-500">Kiểm tra lý lịch</p>{getStatusBadge(selectedVerification.background_check_status || 'not_started')}</div>
                  </div>
                  {selectedVerification.background_check_notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Ghi chú kiểm tra lý lịch</p>
                      <p className="text-sm text-gray-900">{selectedVerification.background_check_notes}</p>
                    </div>
                  )}
                  {selectedVerification.rejection_reason && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Lý do từ chối</p>
                      <p className="text-sm text-red-600">{selectedVerification.rejection_reason}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedVerification.license_document_url && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <IdentificationIcon className="h-5 w-5 mr-2 text-blue-500" />
                          Ảnh bằng lái xe
                        </h4>
                        {selectedVerification.license_status === 'pending' && (
                          <button onClick={() => handleApproveLicense(selectedVerification)} disabled={loading} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Duyệt bằng lái
                          </button>
                        )}
                      </div>
                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img src={selectedVerification.license_document_url} alt="Bằng lái xe" className="w-full h-auto object-contain max-h-96" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=License+Image+Not+Available'; }} />
                      </div>
                    </div>
                  )}

                  {selectedVerification.vehicle_registration_url && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-500" />
                          Ảnh đăng ký xe
                        </h4>
                        {selectedVerification.vehicle_registration_status === 'pending' && (
                          <button onClick={() => handleApproveVehicle(selectedVerification)} disabled={loading} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Duyệt đăng ký xe
                          </button>
                        )}
                      </div>
                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img src={selectedVerification.vehicle_registration_url} alt="Đăng ký xe" className="w-full h-auto object-contain max-h-96" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Vehicle+Registration+Not+Available'; }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedVerification.driver_status === 'pending' && (
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  {selectedVerification.background_check_status !== 'approved' && (
                    <button onClick={() => setShowBackgroundCheckModal(true)} disabled={loading} className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-blue-300 text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50">
                      <ShieldCheckIcon className="h-5 w-5 mr-2" />
                      Kiểm tra lý lịch
                    </button>
                  )}
                  <button onClick={() => { setVerificationToReject(selectedVerification); setShowRejectModal(true); }} disabled={loading} className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showBackgroundCheckModal && selectedVerification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowBackgroundCheckModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Kiểm tra lý lịch</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">Kiểm tra lý lịch của <span className="font-semibold">{selectedVerification.full_name}</span>. Vui lòng nhập ghi chú về kết quả kiểm tra.</p>
                      <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" rows={4} placeholder="Ví dụ: Hồ sơ lý lịch sạch, không có tiền án tiền sự..." value={backgroundCheckNotes} onChange={(e) => setBackgroundCheckNotes(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button onClick={handleApproveBackgroundCheck} disabled={loading} className="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">Xác nhận đạt</button>
                <button onClick={() => { setShowBackgroundCheckModal(false); setBackgroundCheckNotes(''); }} disabled={loading} className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Từ chối hồ sơ tài xế</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">Bạn đang từ chối hồ sơ tài xế của <span className="font-semibold">{verificationToReject.full_name}</span>. Vui lòng nhập lý do từ chối.</p>
                      <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" rows={4} placeholder="Nhập lý do từ chối..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button onClick={handleReject} disabled={loading} className="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">Xác nhận từ chối</button>
                <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); setVerificationToReject(null); }} disabled={loading} className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
