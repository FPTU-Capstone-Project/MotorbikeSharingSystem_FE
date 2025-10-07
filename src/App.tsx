import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import PerformanceOptimizer from './components/PerformanceOptimizer';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all pages for optimal performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const VerificationManagement = lazy(() => import('./pages/VerificationManagement'));
const RideManagement = lazy(() => import('./pages/RideManagement'));
const PaymentManagement = lazy(() => import('./pages/PaymentManagement'));
const SafetyManagement = lazy(() => import('./pages/SafetyManagement'));
const Analytics = lazy(() => import('./pages/Analytics'));
const RiderVehicleVerification = lazy(() => import('./pages/RiderVehicleVerification'));
const DriverVehicleVerification = lazy(() => import('./pages/DriverVehicleVerification'));
const VehicleVerificationManagement = lazy(() => import('./pages/VehicleVerificationManagement'));

function App() {
  return (
    <>
      <PerformanceOptimizer />
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Root redirects to login to avoid blank page */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <UserManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/verification"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <VerificationManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rides"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <RideManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PaymentManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/safety"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SafetyManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Analytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rider-vehicle-verification"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <RiderVehicleVerification />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/driver-vehicle-verification"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DriverVehicleVerification />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicle-verification"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <VehicleVerificationManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
