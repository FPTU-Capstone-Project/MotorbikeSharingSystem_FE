import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  CalendarIcon,
  IdentificationIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { type DriverVerification } from '../../types/verification.types';
import { formatDate } from '../../utils/formatters';
import './VerificationCard.css';

interface DriverVerificationCardProps {
  driver: DriverVerification;
  index: number;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

const DriverVerificationCard: React.FC<DriverVerificationCardProps> = ({
  driver,
  index,
  onApprove,
  onReject,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(driver.verification_id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(driver.verification_id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (driver.status) {
      case 'PENDING':
        return <span className="status-badge pending">Pending</span>;
      case 'APPROVED':
        return <span className="status-badge approved">Approved</span>;
      case 'REJECTED':
        return <span className="status-badge rejected">Rejected</span>;
      default:
        return null;
    }
  };



  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="verification-card driver-card"
      >
        <div className="card-header">
          <div className="user-info">
            <div className="avatar driver-avatar">
              <TruckIcon className="avatar-icon" />
            </div>
            <div className="user-details">
              <h3 className="user-name">{driver.full_name}</h3>
              <p className="user-email">{driver.email}</p>
            </div>
          </div>
          <div className="badges">
            {getStatusBadge()}
          </div>
        </div>

        <div className="card-body">
          {driver.license_number && (
            <div className="info-row">
              <IdentificationIcon className="info-icon" />
              <span className="info-label">License:</span>
              <span className="info-value">{driver.license_number}</span>
            </div>
          )}

          <div className="info-row">
            <ShieldCheckIcon className="info-icon" />
            <span className="info-label">Docs Verified:</span>
            <span className={`info-value ${driver.documents_verified ? 'text-success' : 'text-warning'}`}>
              {driver.documents_verified ? 'Yes' : 'Pending'}
            </span>
          </div>

          <div className="info-row">
            <TruckIcon className="info-icon" />
            <span className="info-label">Vehicle Verified:</span>
            <span className={`info-value ${driver.vehicle_verified ? 'text-success' : 'text-warning'}`}>
              {driver.vehicle_verified ? 'Yes' : 'Pending'}
            </span>
          </div>

          <div className="info-row">
            <CalendarIcon className="info-icon" />
            <span className="info-label">Submitted:</span>
            <span className="info-value">{formatDate(driver.created_at)}</span>
          </div>

          {driver.document_url && (
            <div className="document-preview">
              <img 
                src={driver.document_url} 
                alt="Driver Document"
                className="preview-image"
                loading="lazy"
              />
            </div>
          )}

          {driver.rejection_reason && (
            <div className="notes">
              <p className="notes-label">Rejection Reason:</p>
              <p className="notes-text">{driver.rejection_reason}</p>
            </div>
          )}
        </div>

        {driver.status === 'PENDING' && (
          <div className="card-actions">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="btn-approve"
            >
              <CheckCircleIcon className="btn-icon" />
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="btn-reject"
            >
              <XCircleIcon className="btn-icon" />
              Reject
            </button>
          </div>
        )}
      </motion.div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">Reject Verification</h3>
            <p className="modal-description">
              Please provide a reason for rejecting this driver's verification:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="modal-textarea"
              rows={4}
            />
            <div className="modal-actions">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-cancel"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="btn-confirm-reject"
              >
                Confirm Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default React.memo(DriverVerificationCard);
