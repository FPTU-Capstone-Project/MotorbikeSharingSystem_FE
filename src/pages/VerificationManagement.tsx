import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface StudentVerification {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl: string; // URL ảnh thẻ sinh viên
  identityCardUrl: string; // URL ảnh CCCD
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

// Mock data mẫu
const mockStudentVerifications: StudentVerification[] = [
  {
    id: '1',
    userId: '101',
    fullName: 'Nguyễn Văn An',
    email: 'annv@student.fpt.edu.vn',
    phone: '0901234567',
    studentId: 'SE171234',
    status: 'pending',
    documentUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=800&h=600&fit=crop', // Ảnh thẻ sinh viên mẫu
    identityCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop', // Ảnh CCCD mẫu
    submittedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    userId: '102',
    fullName: 'Trần Thị Bình',
    email: 'binhtt@student.fpt.edu.vn',
    phone: '0912345678',
    studentId: 'SE171235',
    status: 'pending',
    documentUrl: 'https://images.unsplash.com/photo-1554224311-beee460201f9?w=800&h=600&fit=crop',
    identityCardUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=600&fit=crop',
    submittedAt: '2024-01-20T11:15:00Z',
  },
  {
    id: '3',
    userId: '103',
    fullName: 'Lê Hoàng Cường',
    email: 'cuonglh@student.fpt.edu.vn',
    phone: '0923456789',
    studentId: 'SE171236',
    status: 'approved',
    documentUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop',
    identityCardUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop',
    submittedAt: '2024-01-19T09:00:00Z',
    verifiedAt: '2024-01-19T14:30:00Z',
    verifiedBy: 'Admin Dương',
  },
  {
    id: '4',
    userId: '104',
    fullName: 'Phạm Minh Đức',
    email: 'ducpm@student.fpt.edu.vn',
    phone: '0934567890',
    studentId: 'SE171237',
    status: 'rejected',
    documentUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&h=600&fit=crop',
    identityCardUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&h=600&fit=crop',
    submittedAt: '2024-01-18T15:20:00Z',
    verifiedAt: '2024-01-18T16:45:00Z',
    verifiedBy: 'Admin Đức',
    rejectionReason: 'Ảnh không rõ ràng, vui lòng chụp lại',
  },
  {
    id: '5',
    userId: '105',
    fullName: 'Võ Thị Ế',
    email: 'evt@student.fpt.edu.vn',
    phone: '0945678901',
    studentId: 'SE171238',
    status: 'pending',
    documentUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop',
    identityCardUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop',
    submittedAt: '2024-01-20T13:45:00Z',
  },
];

export default function VerificationManagement() {
  const [verifications, setVerifications] = useState<StudentVerification[]>(mockStudentVerifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedVerification, setSelectedVerification] = useState<StudentVerification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [verificationToReject, setVerificationToReject] = useState<StudentVerification | null>(null);

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch =
      verification.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || verification.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const approvedCount = verifications.filter(v => v.status === 'approved').length;
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length;

  const handleApprove = (verification: StudentVerification) => {
    setVerifications(prev =>
      prev.map(v =>
        v.id === verification.id
          ? {
              ...v,
              status: 'approved',
              verifiedAt: new Date().toISOString(),
              verifiedBy: 'Current Admin',
            }
          : v
      )
    );
    toast.success(`Đã duyệt thẻ sinh viên của ${verification.fullName}`);
    setShowDetailModal(false);
  };

  const handleReject = () => {
    if (!verificationToReject) return;

    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setVerifications(prev =>
      prev.map(v =>
        v.id === verificationToReject.id
          ? {
              ...v,
              status: 'rejected',
              verifiedAt: new Date().toISOString(),
              verifiedBy: 'Current Admin',
              rejectionReason: rejectionReason,
            }
          : v
      )
    );
    toast.error(`Đã từ chối thẻ sinh viên của ${verificationToReject.fullName}`);
    setShowRejectModal(false);
    setShowDetailModal(false);
    setRejectionReason('');
    setVerificationToReject(null);
  };

  const openRejectModal = (verification: StudentVerification) => {
    setVerificationToReject(verification);
    setShowRejectModal(true);
  };

  const openDetailModal = (verification: StudentVerification) => {
    setSelectedVerification(verification);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xác Minh Sinh Viên</h1>
          <p className="mt-2 text-gray-600">
            Quản lý và duyệt thẻ sinh viên, căn cước công dân
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{verifications.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500">
              <XCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Từ chối</p>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, MSSV..."
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
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
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
                  Sinh viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MSSV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{verification.fullName}</div>
                        <div className="text-sm text-gray-500">{verification.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{verification.studentId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{verification.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      verification.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : verification.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {verification.status === 'approved' && 'Đã duyệt'}
                      {verification.status === 'rejected' && 'Từ chối'}
                      {verification.status === 'pending' && 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(verification.submittedAt).toLocaleDateString('vi-VN')}
                    <div className="text-xs text-gray-400">
                      {new Date(verification.submittedAt).toLocaleTimeString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openDetailModal(verification)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
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
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">Không tìm thấy yêu cầu xác minh nào.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedVerification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDetailModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Chi tiết xác minh
                      </h3>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Student Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <IdentificationIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Thông tin sinh viên
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Họ và tên</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">MSSV</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.studentId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Số điện thoại</p>
                          <p className="text-base font-medium text-gray-900">{selectedVerification.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trạng thái</p>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            selectedVerification.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : selectedVerification.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedVerification.status === 'approved' && 'Đã duyệt'}
                            {selectedVerification.status === 'rejected' && 'Từ chối'}
                            {selectedVerification.status === 'pending' && 'Chờ duyệt'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ngày gửi</p>
                          <p className="text-base font-medium text-gray-900">
                            {new Date(selectedVerification.submittedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {selectedVerification.status !== 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Người duyệt</p>
                              <p className="text-base font-medium text-gray-900">{selectedVerification.verifiedBy}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Ngày duyệt</p>
                              <p className="text-base font-medium text-gray-900">
                                {selectedVerification.verifiedAt && new Date(selectedVerification.verifiedAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          {selectedVerification.rejectionReason && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-500">Lý do từ chối</p>
                              <p className="text-base font-medium text-red-600">{selectedVerification.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-green-500" />
                          Ảnh thẻ sinh viên
                        </h4>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedVerification.documentUrl}
                            alt="Thẻ sinh viên"
                            className="w-full h-auto object-contain max-h-96"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <IdentificationIcon className="h-5 w-5 mr-2 text-purple-500" />
                          Ảnh căn cước công dân (CCCD)
                        </h4>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedVerification.identityCardUrl}
                            alt="Căn cước công dân"
                            className="w-full h-auto object-contain max-h-96"
                          />
                        </div>
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
                    Duyệt
                  </button>
                  <button
                    onClick={() => openRejectModal(selectedVerification)}
                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Từ chối
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
                      Từ chối xác minh
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Bạn đang từ chối xác minh của <span className="font-semibold">{verificationToReject.fullName}</span>.
                        Vui lòng nhập lý do từ chối.
                      </p>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={4}
                        placeholder="Nhập lý do từ chối..."
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
                  Xác nhận từ chối
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setVerificationToReject(null);
                  }}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
