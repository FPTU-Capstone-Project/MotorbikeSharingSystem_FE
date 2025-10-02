import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  TruckIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { VerificationAPI } from '../api/verification.api';
import { useApi } from '../utils/hooks';
import { VerificationStatus } from '../types/verification.types';
import { ErrorState, LoadingState } from '../components/ErrorStates';
import StudentVerificationCard from '../components/verification/StudentVerificationCard';
import DriverVerificationCard from '../components/verification/DriverVerificationCard';
import VerificationStats from '../components/verification/VerificationStats';
import './VerificationManagement.css';

type TabType = 'students' | 'drivers';

const VerificationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch Students
  const {
    data: studentsData,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useApi(
    () => VerificationAPI.getPendingStudents({ 
      page: currentPage, 
      page_size: pageSize,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      search: searchQuery || undefined
    }),
    {
      enabled: activeTab === 'students',
    }
  );

  // Fetch Drivers
  const {
    data: driversData,
    loading: driversLoading,
    error: driversError,
    refetch: refetchDrivers,
  } = useApi(
    () => VerificationAPI.getPendingDrivers({ 
      page: currentPage, 
      page_size: pageSize,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      search: searchQuery || undefined
    }),
    {
      enabled: activeTab === 'drivers',
    }
  );

  // Fetch Driver Stats
  const { data: driverStats } = useApi(
    () => VerificationAPI.getDriverStats(),
    {
      enabled: activeTab === 'drivers',
    }
  );

  // Memoized filtered data
  const filteredStudents = useMemo(() => {
    if (!studentsData?.data) return [];
    return studentsData.data;
  }, [studentsData]);

  const filteredDrivers = useMemo(() => {
    if (!driversData?.data) return [];
    return driversData.data;
  }, [driversData]);

  // Handlers
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setStatusFilter('ALL');
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filter: VerificationStatus | 'ALL') => {
    setStatusFilter(filter);
    setCurrentPage(1);
  }, []);

  const handleApproveStudent = useCallback(async (id: number) => {
    try {
      await VerificationAPI.approveStudent(id, {
        notes: 'Approved by admin'
      });
      refetchStudents();
    } catch (error) {
      console.error('Approve student error:', error);
    }
  }, [refetchStudents]);

  const handleRejectStudent = useCallback(async (id: number, reason: string) => {
    try {
      await VerificationAPI.rejectStudent(id, {
        reason,
        notes: 'Rejected by admin'
      });
      refetchStudents();
    } catch (error) {
      console.error('Reject student error:', error);
    }
  }, [refetchStudents]);

  const handleApproveDriver = useCallback(async (id: number) => {
    try {
      await VerificationAPI.approveDriverLicense(id, {
        notes: 'License approved by admin'
      });
      refetchDrivers();
    } catch (error) {
      console.error('Approve driver error:', error);
    }
  }, [refetchDrivers]);

  const handleRejectDriver = useCallback(async (id: number, reason: string) => {
    try {
      await VerificationAPI.rejectDriver(id, {
        verification_type: 'DRIVER_LICENSE' as any,
        reason,
        notes: 'Rejected by admin'
      });
      refetchDrivers();
    } catch (error) {
      console.error('Reject driver error:', error);
    }
  }, [refetchDrivers]);

  const handleRefresh = useCallback(() => {
    if (activeTab === 'students') {
      refetchStudents();
    } else {
      refetchDrivers();
    }
  }, [activeTab, refetchStudents, refetchDrivers]);

  // Render helpers
  const isLoading = activeTab === 'students' ? studentsLoading : driversLoading;
  const error = activeTab === 'students' ? studentsError : driversError;
  const currentData = activeTab === 'students' ? filteredStudents : filteredDrivers;
  const totalPages = activeTab === 'students' 
    ? studentsData?.total_pages || 0 
    : driversData?.total_pages || 0;

  return (
    <div className="verification-management">
      {/* Header */}
      <div className="verification-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <DocumentTextIcon className="page-icon" />
              Verification Management
            </h1>
            <p className="page-description">
              Review and manage student and driver verification requests
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="btn-refresh"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`icon ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="verification-tabs">
        <button
          onClick={() => handleTabChange('students')}
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
        >
          <UserIcon className="tab-icon" />
          <span>Student Verification</span>
          {studentsData && (
            <span className="badge">{studentsData.total}</span>
          )}
        </button>
        <button
          onClick={() => handleTabChange('drivers')}
          className={`tab ${activeTab === 'drivers' ? 'active' : ''}`}
        >
          <TruckIcon className="tab-icon" />
          <span>Driver Verification</span>
          {driversData && (
            <span className="badge">{driversData.total}</span>
          )}
        </button>
      </div>

      {/* Driver Stats - Only show for drivers tab */}
      {activeTab === 'drivers' && driverStats && (
        <VerificationStats stats={driverStats} />
      )}

      {/* Filters */}
      <div className="verification-filters">
        <div className="search-box">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'students' ? 'students' : 'drivers'}...`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-dropdown">
          <FunnelIcon className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value as any)}
            className="filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="verification-content">
        {error && (
          <ErrorState 
            type="api-error"
            message={error.message}
            onRetry={handleRefresh}
          />
        )}

        {isLoading && <LoadingState message="Loading verifications..." />}

        {!isLoading && !error && currentData.length === 0 && (
          <ErrorState 
            type="no-data"
            title="No Verifications Found"
            message={`No ${activeTab === 'students' ? 'student' : 'driver'} verifications found. Try adjusting your filters or search criteria.`}
          />
        )}

        {!isLoading && !error && currentData.length > 0 && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="verification-grid"
              >
                {activeTab === 'students' ? (
                  filteredStudents.map((student, index) => (
                    <StudentVerificationCard
                      key={student.verification_id}
                      student={student}
                      index={index}
                      onApprove={handleApproveStudent}
                      onReject={handleRejectStudent}
                    />
                  ))
                ) : (
                  filteredDrivers.map((driver, index) => (
                    <DriverVerificationCard
                      key={driver.verification_id}
                      driver={driver}
                      index={index}
                      onApprove={handleApproveDriver}
                      onReject={handleRejectDriver}
                    />
                  ))
                )}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(VerificationManagement);
