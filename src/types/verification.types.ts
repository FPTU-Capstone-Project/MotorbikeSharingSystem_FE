/**
 * Verification Types
 * Type definitions for student and driver verification system
 */

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum VerificationType {
  STUDENT_ID = 'STUDENT_ID',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  DRIVER_DOCUMENTS = 'DRIVER_DOCUMENTS'
}

export enum DocumentType {
  IMAGE = 'IMAGE',
  PDF = 'PDF'
}

// Base Verification Interface
export interface BaseVerification {
  verification_id: number;
  user_id: number;
  type: VerificationType;
  status: VerificationStatus;
  document_url?: string;
  document_type?: DocumentType;
  rejection_reason?: string;
  verified_by?: number;
  verified_at?: string;
  expires_at?: string;
  metadata?: string;
  created_at: string;
}

// Student Verification
export interface StudentVerification extends BaseVerification {
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  university?: string;
  major?: string;
  enrollment_year?: number;
}

export interface StudentVerificationDetail extends StudentVerification {
  documents: VerificationDocument[];
  history: VerificationHistory[];
}

// Driver Verification
export interface DriverVerification extends BaseVerification {
  driver_id: number;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_verified: boolean;
  documents_verified: boolean;
  vehicle_verified: boolean;
  background_check_status: VerificationStatus;
  rating_avg?: number;
}

export interface DriverKYCDetail {
  driver_id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_expiry?: string;
  license_document_url?: string;
  identity_document_url?: string;
  vehicle_registration_url?: string;
  insurance_document_url?: string;
  background_check_status: VerificationStatus;
  background_check_date?: string;
  background_check_notes?: string;
  verifications: BaseVerification[];
  created_at: string;
}

// Verification Document
export interface VerificationDocument {
  document_id: number;
  verification_id: number;
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

// Verification History
export interface VerificationHistory {
  history_id: number;
  verification_id: number;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  performed_by?: number;
  performed_by_name?: string;
  reason?: string;
  created_at: string;
}

// Driver Stats
export interface DriverVerificationStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  pending_license: number;
  pending_documents: number;
  pending_vehicle: number;
  pending_background_check: number;
  avg_processing_time_hours: number;
  today_processed: number;
}

// API Request/Response Types
export interface ApproveStudentRequest {
  notes?: string;
}

export interface RejectStudentRequest {
  reason: string;
  notes?: string;
}

export interface BulkApproveStudentsRequest {
  verification_ids: number[];
  notes?: string;
}

export interface ApproveDriverDocsRequest {
  document_types: VerificationType[];
  notes?: string;
}

export interface ApproveDriverLicenseRequest {
  license_expiry?: string;
  notes?: string;
}

export interface ApproveDriverVehicleRequest {
  vehicle_id: number;
  notes?: string;
}

export interface RejectDriverRequest {
  verification_type: VerificationType;
  reason: string;
  notes?: string;
}

export interface UpdateBackgroundCheckRequest {
  status: VerificationStatus;
  notes?: string;
  check_date?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Query Parameters
export interface VerificationQueryParams {
  page?: number;
  page_size?: number;
  status?: VerificationStatus;
  sort_by?: 'created_at' | 'updated_at' | 'full_name';
  sort_order?: 'asc' | 'desc';
  search?: string;
}
