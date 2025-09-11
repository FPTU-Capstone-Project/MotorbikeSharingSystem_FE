import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all pages for optimal performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const RideManagement = lazy(() => import('./pages/RideManagement'));
const PaymentManagement = lazy(() => import('./pages/PaymentManagement'));
const SafetyManagement = lazy(() => import('./pages/SafetyManagement'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/rides" element={<RideManagement />} />
              <Route path="/payments" element={<PaymentManagement />} />
              <Route path="/safety" element={<SafetyManagement />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
