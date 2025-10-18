import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSessionCountdown } from '../hooks/useTokenMonitoring';
import SessionStatus from '../components/SessionStatus';

/**
 * Test component to demonstrate token expiration functionality
 * This can be used for testing purposes
 */
export default function TokenExpiryTest() {
  const { logout } = useAuth();
  const { formattedTime, isTokenValid, isExpiringSoon } = useSessionCountdown();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Token Expiration Test
        </h1>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Current Session Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Token Valid:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                  isTokenValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isTokenValid ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Time Until Expiry:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {formattedTime}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Expiring Soon:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                  isExpiringSoon ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isExpiringSoon ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Session Status Component
            </h2>
            <SessionStatus showWarning={true} />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Test Actions
            </h2>
            <div className="space-x-4">
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Force Logout (Test)
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              How It Works
            </h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Token is monitored every 30 seconds</li>
              <li>• Warning appears when less than 5 minutes remain</li>
              <li>• Automatic refresh attempted when token is about to expire</li>
              <li>• User is notified and redirected to login on expiration</li>
              <li>• All auth data is cleared on logout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
