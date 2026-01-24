import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import PerformanceOptimizer from './components/PerformanceOptimizer';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalTokenMonitor from './components/GlobalTokenMonitor';
import GlobalSosNotification from './components/GlobalSosNotification';

// Lazy load all pages for optimal performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const VerificationManagement = lazy(() => import('./pages/VerificationManagement'));
const RideManagement = lazy(() => import('./pages/RideManagement'));
const PaymentManagement = lazy(() => import('./pages/PaymentManagement'));
const PayoutManagement = lazy(() => import('./pages/PayoutManagement'));
const SafetyManagement = lazy(() => import('./pages/SafetyManagement'));
// const Analytics = lazy(() => import('./pages/Analytics'));
const RiderVehicleVerification = lazy(() => import('./pages/RiderVehicleVerification'));
const DriverVehicleVerification = lazy(() => import('./pages/DriverVehicleVerification'));
const VehicleManagement = lazy(() => import('./pages/VehicleManagement'));
const TokenExpiryTest = lazy(() => import('./pages/TokenExpiryTest'));
const ReportManagement = lazy(() => import('./pages/ReportManagement'));
const RouteManagement = lazy(() => import('./pages/RouteManagement'));
const PricingManagement = lazy(() => import('./pages/PricingManagement'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));

function App() {
  return (
    <>
      <PerformanceOptimizer />
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <GlobalTokenMonitor />
            <GlobalSosNotification />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public route */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
                    path="/routes"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <RouteManagement />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pricing"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <PricingManagement />
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
                    path="/payouts"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <PayoutManagement />
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
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ReportManagement />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  {/* <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Analytics />
                        </Layout>
                      </ProtectedRoute>
                    }
                  /> */}
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <NotificationCenter />
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
                          <VehicleManagement />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Test route for token expiry functionality */}
                  <Route
                    path="/token-test"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <TokenExpiryTest />
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
        </ThemeProvider>
      </Router>
    </>
  );
}

export default App;
