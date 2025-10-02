import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { type StudentVerification } from '../../types/verification.types';
import { formatDate } from '../../utils/formatters';
import './VerificationCard.css';

interface StudentVerificationCardProps {
  student: StudentVerification;
  index: number;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

const StudentVerificationCard: React.FC<StudentVerificationCardProps> = ({
  student,
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
      await onApprove(student.verification_id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(student.verification_id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (student.status) {
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
        className="verification-card"
      >
        <div className="card-header">
          <div className="user-info">
            <div className="avatar">
              <AcademicCapIcon className="avatar-icon" />
            </div>
            <div className="user-details">
              <h3 className="user-name">{student.full_name}</h3>
              <p className="user-email">{student.email}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="card-body">
          <div className="info-row">
            <DocumentTextIcon className="info-icon" />
            <span className="info-label">Student ID:</span>
            <span className="info-value">{student.student_id}</span>
          </div>

          {student.university && (
            <div className="info-row">
              <AcademicCapIcon className="info-icon" />
              <span className="info-label">University:</span>
              <span className="info-value">{student.university}</span>
            </div>
          )}

          <div className="info-row">
            <CalendarIcon className="info-icon" />
            <span className="info-label">Submitted:</span>
            <span className="info-value">{formatDate(student.created_at)}</span>
          </div>

          {student.document_url && (
            <div className="document-preview">
              <img 
                src={student.document_url} 
                alt="Student Card"
                className="preview-image"
                loading="lazy"
              />
            </div>
          )}

          {student.rejection_reason && (
            <div className="notes">
              <p className="notes-label">Rejection Reason:</p>
              <p className="notes-text">{student.rejection_reason}</p>
            </div>
          )}
        </div>

        {student.status === 'PENDING' && (
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
              Please provide a reason for rejecting this student's verification:
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

export default React.memo(StudentVerificationCard);
