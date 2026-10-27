import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import WorkerLogin from './pages/WorkerLogin';
import WorkerRegister from './pages/WorkerRegister';
import AdminLogin from './pages/AdminLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { user, role, loading } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [navTarget, setNavTarget] = useState(null);

  const handleNavigate = (page, tab = null, options = {}) => {
    setActivePage(page);
    if (tab) {
      setNavTarget({
        token: Date.now(),
        tab,
        filter: options.filter || null,
        search: options.search || '',
        metadata: options.metadata || {}
      });
    }
  };

  const handleClearNavTarget = () => {
    setNavTarget(null);
  };

  // If user logs in or role changes, redirect appropriately
  useEffect(() => {
    if (user && role) {
      if (activePage === 'customer-login' || activePage === 'customer-register') {
        if (role === 'CUSTOMER') setActivePage('customer-dashboard');
      } else if (activePage === 'worker-login' || activePage === 'worker-register') {
        if (role === 'WORKER') setActivePage('worker-dashboard');
      } else if (activePage === 'admin-login') {
        if (role === 'ADMIN') setActivePage('admin-dashboard');
      }
    }
  }, [user, role, activePage]);

  // Protected View Gatekeeper
  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--slate-500)',
          gap: 12
        }}>
          <div style={{
            width: 36,
            height: 36,
            border: '3px solid var(--slate-200)',
            borderTopColor: 'var(--teal-600)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading GramSeva...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    switch (activePage) {
      case 'landing':
        return <LandingPage setActivePage={setActivePage} />;

      case 'customer-login':
        return <CustomerLogin setActivePage={setActivePage} />;

      case 'customer-register':
        return <CustomerRegister setActivePage={setActivePage} />;

      case 'worker-login':
        return <WorkerLogin setActivePage={setActivePage} />;

      case 'worker-register':
        return <WorkerRegister setActivePage={setActivePage} />;

      case 'admin-login':
        return <AdminLogin setActivePage={setActivePage} />;

      case 'customer-dashboard':
        if (!user || role !== 'CUSTOMER') {
          return <CustomerLogin setActivePage={setActivePage} />;
        }
        return (
          <CustomerDashboard 
            setActivePage={setActivePage} 
            navTarget={navTarget} 
            onClearNavTarget={handleClearNavTarget} 
          />
        );

      case 'worker-dashboard':
        if (!user || role !== 'WORKER') {
          return <WorkerLogin setActivePage={setActivePage} />;
        }
        return (
          <WorkerDashboard 
            setActivePage={setActivePage} 
            navTarget={navTarget} 
            onClearNavTarget={handleClearNavTarget} 
          />
        );

      case 'admin-dashboard':
        if (!user || role !== 'ADMIN') {
          return <AdminLogin setActivePage={setActivePage} />;
        }
        return (
          <AdminDashboard 
            setActivePage={setActivePage} 
            navTarget={navTarget} 
            onClearNavTarget={handleClearNavTarget} 
          />
        );

      default:
        return <LandingPage setActivePage={setActivePage} />;
    }
  };

  const isDashboardView = ['customer-dashboard', 'worker-dashboard', 'admin-dashboard'].includes(activePage);

  return (
    <div className="app-wrapper">
      <Navbar activePage={activePage} setActivePage={setActivePage} onNavigate={handleNavigate} />
      <div className="main-content">
        {renderCurrentPage()}
      </div>
      {!isDashboardView && <Footer setActivePage={setActivePage} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
