import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import RideManagement from './pages/RideManagement';
import PaymentManagement from './pages/PaymentManagement';
import SafetyManagement from './pages/SafetyManagement';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/rides" element={<RideManagement />} />
            <Route path="/payments" element={<PaymentManagement />} />
            <Route path="/safety" element={<SafetyManagement />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
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
