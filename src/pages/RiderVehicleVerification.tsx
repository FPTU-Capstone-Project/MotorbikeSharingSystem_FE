import React, { useState } from 'react';
import { CloudArrowUpIcon, CheckCircleIcon, XCircleIcon, PhotoIcon, IdentificationIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type DocFile = File | null;

interface RiderVehicleDocs {
  ownershipCard: DocFile; // cavet/registration card image or pdf
  insurance: DocFile;
  frontPhoto: DocFile;
  sidePhoto: DocFile;
  platePhoto: DocFile;
}

export default function RiderVehicleVerification() {
  const [docs, setDocs] = useState<RiderVehicleDocs>({
    ownershipCard: null,
    insurance: null,
    frontPhoto: null,
    sidePhoto: null,
    platePhoto: null,
  });
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [rejectionReason, setRejectionReason] = useState('');

  const onUpload = (key: keyof RiderVehicleDocs, file: File) => {
    setDocs(prev => ({ ...prev, [key]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [key]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (key: keyof RiderVehicleDocs) => {
    setDocs(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => {
      const next = { ...prev } as Record<string, string | undefined>;
      delete next[key as string];
      return next as Record<string, string>;
    });
  };

  const validate = () => {
    if (!docs.ownershipCard) {
      toast.error('Ownership/registration card is required');
      return false;
    }
    if (!docs.insurance) {
      toast.error('Insurance document is required');
      return false;
    }
    if (!docs.frontPhoto || !docs.sidePhoto || !docs.platePhoto) {
      toast.error('All three vehicle photos are required');
      return false;
    }
    return true;
  };

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    // TODO: integrate real API. For now, simulate.
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus('pending');
      toast.success('Rider vehicle documents submitted. Please wait for review.');
    }, 1200);
  };

  const disabled = status === 'pending' || status === 'approved';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rider Vehicle Documents</h1>
        <p className="mt-2 text-gray-600">Upload proof of ownership and required photos for your motorbike.</p>
      </div>

      {status !== 'none' && (
        <div className={`card ${
          status === 'approved' ? 'bg-green-50 border-green-200' :
          status === 'rejected' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {status === 'approved' && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
              {status === 'rejected' && <XCircleIcon className="h-6 w-6 text-red-600" />}
              {status === 'pending' && <DocumentTextIcon className="h-6 w-6 text-yellow-600" />}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                status === 'approved' ? 'text-green-800' :
                status === 'rejected' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {status === 'approved' && 'Verified'}
                {status === 'rejected' && 'Rejected'}
                {status === 'pending' && 'Pending Review'}
              </h3>
              <p className={`mt-2 text-sm ${
                status === 'approved' ? 'text-green-700' :
                status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {status === 'approved' && 'You can now request shared rides as a verified rider.'}
                {status === 'rejected' && `Reason: ${rejectionReason || 'Please re-check documents and resubmit.'}`}
                {status === 'pending' && 'Your submission is under review (1-2 business days).'}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <IdentificationIcon className="h-6 w-6 mr-2 text-indigo-500" />
            Ownership & Insurance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadField
              label="Ownership/Registration Card"
              required
              file={docs.ownershipCard}
              preview={previews.ownershipCard}
              onSelect={(f) => onUpload('ownershipCard', f)}
              onRemove={() => removeFile('ownershipCard')}
              disabled={disabled}
            />
            <UploadField
              label="Insurance Document"
              required
              file={docs.insurance}
              preview={previews.insurance}
              onSelect={(f) => onUpload('insurance', f)}
              onRemove={() => removeFile('insurance')}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PhotoIcon className="h-6 w-6 mr-2 text-purple-500" />
            Vehicle Photos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UploadField
              label="Front Photo"
              required
              file={docs.frontPhoto}
              preview={previews.frontPhoto}
              onSelect={(f) => onUpload('frontPhoto', f)}
              onRemove={() => removeFile('frontPhoto')}
              disabled={disabled}
              imageOnly
            />
            <UploadField
              label="Side Photo"
              required
              file={docs.sidePhoto}
              preview={previews.sidePhoto}
              onSelect={(f) => onUpload('sidePhoto', f)}
              onRemove={() => removeFile('sidePhoto')}
              disabled={disabled}
              imageOnly
            />
            <UploadField
              label="Plate Closeup"
              required
              file={docs.platePhoto}
              preview={previews.platePhoto}
              onSelect={(f) => onUpload('platePhoto', f)}
              onRemove={() => removeFile('platePhoto')}
              disabled={disabled}
              imageOnly
            />
          </div>
        </div>

        {!disabled && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-8 py-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Submit for Verification
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function UploadField({
  label,
  required,
  file,
  preview,
  onSelect,
  onRemove,
  disabled,
  imageOnly,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  preview?: string;
  onSelect: (f: File) => void;
  onRemove: () => void;
  disabled?: boolean;
  imageOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {!file ? (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <CloudArrowUpIcon className="w-10 h-10 mb-2 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">{imageOnly ? 'PNG, JPG up to 10MB' : 'PNG, JPG, PDF up to 10MB'}</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={imageOnly ? 'image/*' : 'image/*,application/pdf'}
            onChange={(e) => e.target.files && onSelect(e.target.files[0])}
            disabled={disabled}
          />
        </label>
      ) : (
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">{file.name}</span>
            </div>
            {!disabled && (
              <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-800">
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {preview && imageOnly && (
            <img src={preview} alt={`${label} preview`} className="mt-2 rounded-lg max-h-48 object-contain" />
          )}
        </div>
      )}
    </div>
  );
}





