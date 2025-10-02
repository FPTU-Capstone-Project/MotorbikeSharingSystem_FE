import React from 'react';
import './ErrorStates.css';

interface ErrorStateProps {
  type?: 'api-error' | 'not-implemented' | 'not-found' | 'no-data' | 'unauthorized' | 'server-error';
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  showRetry?: boolean;
  onRetry?: () => void;
}

/**
 * Error State Component
 * Displays beautiful error states with SVG illustrations
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'api-error',
  title,
  message,
  action,
  showRetry = true,
  onRetry
}) => {
  const errorConfigs = {
    'api-error': {
      title: title || 'API Connection Error',
      message: message || 'Unable to connect to the server. Please check your connection and try again.',
      illustration: (
        <svg viewBox="0 0 200 200" className="error-illustration">
          <defs>
            <linearGradient id="grad-error" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fc8181', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f56565', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Server icon with error */}
          <rect x="60" y="50" width="80" height="100" rx="8" fill="url(#grad-error)" opacity="0.2"/>
          <rect x="60" y="50" width="80" height="100" rx="8" fill="none" stroke="url(#grad-error)" strokeWidth="3"/>
          <circle cx="100" cy="85" r="3" fill="#f56565"/>
          <circle cx="100" cy="100" r="3" fill="#f56565"/>
          <circle cx="100" cy="115" r="3" fill="#f56565"/>
          {/* Warning sign */}
          <circle cx="140" cy="40" r="20" fill="#feb2b2"/>
          <text x="140" y="50" textAnchor="middle" fontSize="24" fill="#c53030" fontWeight="bold">!</text>
          {/* Signal waves */}
          <path d="M 80 140 Q 90 145 80 150" stroke="#fc8181" strokeWidth="2" fill="none" opacity="0.5"/>
          <path d="M 120 140 Q 110 145 120 150" stroke="#fc8181" strokeWidth="2" fill="none" opacity="0.5"/>
        </svg>
      )
    },
    'not-implemented': {
      title: title || 'Feature Not Implemented',
      message: message || 'This feature is currently under development and will be available soon.',
      illustration: (
        <svg viewBox="0 0 200 200" className="error-illustration">
          <defs>
            <linearGradient id="grad-dev" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fbd38d', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f6ad55', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Construction cone */}
          <path d="M 100 40 L 70 150 L 130 150 Z" fill="url(#grad-dev)" opacity="0.8"/>
          <rect x="60" y="150" width="80" height="10" fill="#4a5568" rx="2"/>
          {/* Stripes */}
          <path d="M 100 60 L 85 100 L 115 100 Z" fill="white" opacity="0.3"/>
          <path d="M 95 100 L 80 140 L 120 140 Z" fill="white" opacity="0.3"/>
          {/* Tools */}
          <g transform="translate(140, 30)">
            <rect x="-3" y="0" width="6" height="30" fill="#718096" rx="2"/>
            <circle cx="0" cy="35" r="8" fill="#cbd5e0"/>
          </g>
        </svg>
      )
    },
    'not-found': {
      title: title || '404 - Not Found',
      message: message || 'The page you are looking for does not exist or has been moved.',
      illustration: (
        <svg viewBox="0 0 200 200" className="error-illustration">
          <defs>
            <linearGradient id="grad-404" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#90cdf4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#4299e1', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Magnifying glass */}
          <circle cx="80" cy="80" r="35" fill="none" stroke="url(#grad-404)" strokeWidth="6"/>
          <line x1="105" y1="105" x2="140" y2="140" stroke="url(#grad-404)" strokeWidth="6" strokeLinecap="round"/>
          {/* Question mark in glass */}
          <text x="80" y="95" textAnchor="middle" fontSize="32" fill="#4299e1" fontWeight="bold">?</text>
          {/* Document corner */}
          <path d="M 130 50 L 130 90 L 170 90 L 170 110 L 125 110 L 125 50 Z" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="2"/>
          <line x1="135" y1="65" x2="155" y2="65" stroke="#a0aec0" strokeWidth="2"/>
          <line x1="135" y1="75" x2="165" y2="75" stroke="#a0aec0" strokeWidth="2"/>
        </svg>
      )
    },
    'no-data': {
      title: title || 'No Data Available',
      message: message || 'There is no data to display at the moment. Try adjusting your filters or check back later.',
      illustration: (
        <svg viewBox="0 0 200 200" className="error-illustration">
          <defs>
            <linearGradient id="grad-empty" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#cbd5e0', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#a0aec0', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Empty box */}
          <rect x="50" y="60" width="100" height="90" rx="8" fill="none" stroke="url(#grad-empty)" strokeWidth="4" strokeDasharray="8,4"/>
          <line x1="50" y1="90" x2="150" y2="90" stroke="url(#grad-empty)" strokeWidth="2" opacity="0.5"/>
          <line x1="50" y1="120" x2="150" y2="120" stroke="url(#grad-empty)" strokeWidth="2" opacity="0.5"/>
          {/* Floating elements */}
          <circle cx="70" cy="40" r="4" fill="#cbd5e0" opacity="0.6"/>
          <circle cx="130" cy="35" r="6" fill="#cbd5e0" opacity="0.4"/>
          <circle cx="90" cy="170" r="5" fill="#cbd5e0" opacity="0.5"/>
        </svg>
      )
    },
    'unauthorized': {
      title: title || 'Access Denied',
      message: message || 'You do not have permission to access this resource. Please contact your administrator.',
      illustration: (
        <svg viewBox="0 0 200 200" className="error-illustration">
          <defs>
            <linearGradient id="grad-lock" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f56565', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#c53030', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Lock body */}
          <rect x="70" y="100" width="60" height="60" rx="8" fill="url(#grad-lock)" opacity="0.9"/>
          {/* Lock shackle */}
          <path d="M 85 100 L 85 75 Q 85 50 100 50 Q 115 50 115 75 L 115 100" 
                fill="none" stroke="url(#grad-lock)" strokeWidth="6" strokeLinecap="round"/>
          {/* Keyhole */}
          <circle cx="100" cy="120" r="8" fill="white" opacity="0.9"/>
          <rect x="97" y="125" width="6" height="15" fill="white" opacity="0.9" rx="3"/>
          {/* Shield background */}
          <path d="M 100 30 L 60 50 L 60 90 Q 60 130 100 160 Q 140 130 140 90 L 140 50 Z" 
                fill="#feb2b2" opacity="0.2"/>
        </svg>
      )
    },
    'server-error': {
      title: title || '500 - Server Error',
      message: message || 'Something went wrong on our end. Our team has been notified and is working on it.',
      illustration: (
        <svg viewBox="0 0 200 200" className="error-illustration">
          <defs>
            <linearGradient id="grad-500" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f6ad55', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ed8936', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Server rack */}
          <rect x="60" y="50" width="80" height="100" rx="8" fill="#2d3748"/>
          <rect x="65" y="60" width="70" height="20" rx="4" fill="url(#grad-500)" opacity="0.8"/>
          <rect x="65" y="85" width="70" height="20" rx="4" fill="#4a5568"/>
          <rect x="65" y="110" width="70" height="20" rx="4" fill="#4a5568"/>
          {/* Error lights */}
          <circle cx="75" cy="70" r="3" fill="#fc8181"/>
          <circle cx="85" cy="70" r="3" fill="#fc8181"/>
          <circle cx="125" cy="70" r="3" fill="#68d391"/>
          {/* Spark/error symbol */}
          <path d="M 150 40 L 145 50 L 150 50 L 145 60" stroke="#fbd38d" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
      )
    }
  };

  const config = errorConfigs[type];

  return (
    <div className="error-state-container">
      <div className="error-state-content">
        {config.illustration}
        <h2 className="error-state-title">{config.title}</h2>
        <p className="error-state-message">{config.message}</p>
        
        <div className="error-state-actions">
          {showRetry && onRetry && (
            <button onClick={onRetry} className="btn-error-retry">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Retry
            </button>
          )}
          
          {action && (
            <button onClick={action.onClick} className="btn-error-action">
              {action.label}
            </button>
          )}
        </div>

        {type === 'api-error' && (
          <details className="error-state-details">
            <summary>Technical Details</summary>
            <div className="error-state-tech-info">
              <p><strong>Possible causes:</strong></p>
              <ul>
                <li>Backend server is not running</li>
                <li>Network connection issues</li>
                <li>CORS configuration problems</li>
                <li>API endpoint mismatch</li>
              </ul>
              <p className="text-muted">Check browser console for more details</p>
            </div>
          </details>
        )}

        {type === 'not-implemented' && (
          <div className="error-state-roadmap">
            <p className="text-muted">
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', display: 'inline', marginRight: '4px' }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              This feature is on our roadmap and will be implemented in the next sprint.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Loading State Component
 */
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-state-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default ErrorState;
