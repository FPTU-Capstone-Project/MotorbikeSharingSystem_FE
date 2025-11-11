import React, { useState } from 'react';
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  PhotoIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Bike } from 'lucide-react';
import toast from 'react-hot-toast';

interface VehicleFormData {
  plateNumber: string;
  model: string;
  color: string;
  year: string;
  insuranceExpiry: string;
}

interface DocumentFiles {
  registration: File | null;
  insurance: File | null;
  frontPhoto: File | null;
  sidePhoto: File | null;
  platePhoto: File | null;
}

export default function DriverVehicleVerification() {
  const [vehicleData, setVehicleData] = useState<VehicleFormData>({
    plateNumber: '',
    model: '',
    color: '',
    year: '',
    insuranceExpiry: '',
  });

  const [documents, setDocuments] = useState<DocumentFiles>({
    registration: null,
    insurance: null,
    frontPhoto: null,
    sidePhoto: null,
    platePhoto: null,
  });

  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (documentType: keyof DocumentFiles, file: File) => {
    setDocuments(prev => ({ ...prev, [documentType]: file }));

    // Create preview for image files
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [documentType]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (documentType: keyof DocumentFiles) => {
    setDocuments(prev => ({ ...prev, [documentType]: null }));
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[documentType];
      return newPreviews;
    });
  };

  const validateForm = (): boolean => {
    if (!vehicleData.plateNumber || !vehicleData.model || !vehicleData.color || !vehicleData.year || !vehicleData.insuranceExpiry) {
      toast.error('Please fill in all vehicle information fields');
      return false;
    }

    if (!documents.registration || !documents.insurance) {
      toast.error('Vehicle registration and insurance certificate are required');
      return false;
    }

    if (!documents.frontPhoto || !documents.sidePhoto || !documents.platePhoto) {
      toast.error('All three vehicle photos are required (front, side, plate closeup)');
      return false;
    }

    // Validate insurance expiry date
    const insuranceDate = new Date(vehicleData.insuranceExpiry);
    if (insuranceDate < new Date()) {
      toast.error('Insurance has expired. Please provide a valid insurance certificate');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setVerificationStatus('pending');
      toast.success('Vehicle verification submitted successfully! Please wait for admin approval.');
    }, 2000);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="mt-2 text-gray-600">
            Submit your vehicle documents for verification to start accepting rides
          </p>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationStatus !== 'none' && (
        <div className={`card ${
          verificationStatus === 'approved' ? 'bg-green-50 border-green-200' :
          verificationStatus === 'rejected' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {verificationStatus === 'approved' && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
              {verificationStatus === 'rejected' && <XCircleIcon className="h-6 w-6 text-red-600" />}
              {verificationStatus === 'pending' && <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                verificationStatus === 'approved' ? 'text-green-800' :
                verificationStatus === 'rejected' ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                {verificationStatus === 'approved' && 'Vehicle Verified'}
                {verificationStatus === 'rejected' && 'Verification Rejected'}
                {verificationStatus === 'pending' && 'Verification Pending'}
              </h3>
              <div className={`mt-2 text-sm ${
                verificationStatus === 'approved' ? 'text-green-700' :
                verificationStatus === 'rejected' ? 'text-red-700' :
                'text-yellow-700'
              }`}>
                <p>
                  {verificationStatus === 'approved' && 'Your vehicle has been verified. You can now accept ride requests.'}
                  {verificationStatus === 'rejected' && 'Your verification was rejected. Please check your documents and resubmit.'}
                  {verificationStatus === 'pending' && 'Your vehicle verification is under review. This usually takes 1-2 business days.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bike className="h-6 w-6 mr-2 text-blue-500" />
            Vehicle Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plate Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="plateNumber"
                value={vehicleData.plateNumber}
                onChange={handleInputChange}
                placeholder="e.g., 29A-12345"
                className="input-field"
                required
                disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={handleInputChange}
                placeholder="e.g., Honda Wave RSX"
                className="input-field"
                required
                disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="color"
                value={vehicleData.color}
                onChange={handleInputChange}
                placeholder="e.g., Red"
                className="input-field"
                required
                disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={vehicleData.year}
                onChange={handleInputChange}
                className="input-field"
                required
                disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="insuranceExpiry"
                value={vehicleData.insuranceExpiry}
                onChange={handleInputChange}
                className="input-field"
                required
                disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
              />
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2 text-green-500" />
            Required Documents
          </h2>

          <div className="space-y-6">
            {/* Vehicle Registration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-1 text-green-500" />
                Vehicle Registration <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">Upload a clear photo of your vehicle registration certificate</p>
              {!documents.registration ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CloudArrowUpIcon className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files && handleFileUpload('registration', e.target.files[0])}
                    disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
                  />
                </label>
              ) : (
                <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{documents.registration.name}</span>
                    </div>
                    {verificationStatus !== 'pending' && verificationStatus !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('registration')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {previews.registration && (
                    <img src={previews.registration} alt="Registration preview" className="mt-2 rounded-lg max-h-48 object-contain" />
                  )}
                </div>
              )}
            </div>

            {/* Insurance Certificate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-1 text-blue-500" />
                Insurance Certificate <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">Upload a valid insurance certificate</p>
              {!documents.insurance ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CloudArrowUpIcon className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files && handleFileUpload('insurance', e.target.files[0])}
                    disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
                  />
                </label>
              ) : (
                <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{documents.insurance.name}</span>
                    </div>
                    {verificationStatus !== 'pending' && verificationStatus !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('insurance')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {previews.insurance && (
                    <img src={previews.insurance} alt="Insurance preview" className="mt-2 rounded-lg max-h-48 object-contain" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Photos */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PhotoIcon className="h-6 w-6 mr-2 text-purple-500" />
            Vehicle Photos
          </h2>
          <p className="text-sm text-gray-600 mb-4">Please upload clear photos of your vehicle from different angles</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Front Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Front Photo <span className="text-red-500">*</span>
              </label>
              {!documents.frontPhoto ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CloudArrowUpIcon className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">Upload front view</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload('frontPhoto', e.target.files[0])}
                    disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
                  />
                </label>
              ) : (
                <div className="relative border-2 border-green-200 rounded-lg overflow-hidden">
                  {previews.frontPhoto && (
                    <img src={previews.frontPhoto} alt="Front view" className="w-full h-48 object-cover" />
                  )}
                  {verificationStatus !== 'pending' && verificationStatus !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('frontPhoto')}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Side Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Side Photo <span className="text-red-500">*</span>
              </label>
              {!documents.sidePhoto ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CloudArrowUpIcon className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">Upload side view</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload('sidePhoto', e.target.files[0])}
                    disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
                  />
                </label>
              ) : (
                <div className="relative border-2 border-green-200 rounded-lg overflow-hidden">
                  {previews.sidePhoto && (
                    <img src={previews.sidePhoto} alt="Side view" className="w-full h-48 object-cover" />
                  )}
                  {verificationStatus !== 'pending' && verificationStatus !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('sidePhoto')}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Plate Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plate Closeup <span className="text-red-500">*</span>
              </label>
              {!documents.platePhoto ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CloudArrowUpIcon className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">Upload plate closeup</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload('platePhoto', e.target.files[0])}
                    disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}
                  />
                </label>
              ) : (
                <div className="relative border-2 border-green-200 rounded-lg overflow-hidden">
                  {previews.platePhoto && (
                    <img src={previews.platePhoto} alt="Plate closeup" className="w-full h-48 object-cover" />
                  )}
                  {verificationStatus !== 'pending' && verificationStatus !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('platePhoto')}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {verificationStatus !== 'pending' && verificationStatus !== 'approved' && (
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
