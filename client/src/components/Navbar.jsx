import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Menu, X, Bell, User, LogOut, Shield, Briefcase, 
  ChevronDown, CheckCircle2, Home, Layers, Info, PhoneCall 
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onNavigate }) {
  const { user, role, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleNotificationClick = (n) => {
    if (!n.isRead) markRead(n.id);
    setNotifDropdownOpen(false);

    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();
    const link = n.link || '';

    let targetPage = 'landing';
    let targetTab = 'overview';
    let targetFilter = null;
    let targetSearch = '';

    if (link === '/admin' || role === 'ADMIN') {
      targetPage = 'admin-dashboard';
      if (title.includes('worker') || msg.includes('worker') || n.metadata?.workerId) {
        targetTab = 'workers';
        targetFilter = 'PENDING_APPROVAL';
        if (n.metadata?.workerId) {
          targetSearch = n.metadata.workerId;
        }
      } else if (title.includes('dispute') || title.includes('feedback') || title.includes('rating') || n.metadata?.feedbackId) {
        targetTab = 'feedback';
      } else if (title.includes('booking') || title.includes('assignment') || title.includes('request') || n.metadata?.bookingId) {
        targetTab = 'bookings';
        if (title.includes('rejected')) targetFilter = 'REJECTED_BY_WORKER';
        if (n.metadata?.bookingId) targetSearch = n.metadata.bookingId;
      } else {
        targetTab = 'overview';
      }
    } else if (link === '/worker' || role === 'WORKER') {
      targetPage = 'worker-dashboard';
      if (title.includes('assigned') || title.includes('new assignment') || title.includes('booking') || title.includes('request')) {
        targetTab = 'new-assignments';
      } else if (title.includes('approved') || title.includes('approval')) {
        targetTab = 'overview';
      } else {
        targetTab = 'active-tasks';
      }
    } else if (link === '/customer' || role === 'CUSTOMER') {
      targetPage = 'customer-dashboard';
      if (title.includes('accepted') || title.includes('started') || title.includes('booking') || title.includes('completed')) {
        targetTab = 'bookings';
      } else {
        targetTab = 'overview';
      }
    }

    if (onNavigate) {
      onNavigate(targetPage, targetTab, { filter: targetFilter, search: targetSearch, metadata: n.metadata });
    } else {
      setActivePage(targetPage);
    }
  };

  const getDashboardTarget = () => {
    if (role === 'CUSTOMER') return 'customer-dashboard';
    if (role === 'WORKER') return 'worker-dashboard';
    if (role === 'ADMIN') return 'admin-dashboard';
    return 'landing';
  };

  const navLinks = [
    { id: 'landing', label: 'Home', icon: Home, hash: '#' },
    { id: 'landing', label: 'Services', icon: Layers, hash: '#services' },
    { id: 'landing', label: 'How It Works', hash: '#workflow' },
    { id: 'landing', label: 'About Project', icon: Info, hash: '#about' },
    { id: 'landing', label: 'Contact', icon: PhoneCall, hash: '#contact' }
  ];

  const handleNavClick = (link) => {
    setActivePage('landing');
    setMobileMenuOpen(false);
    if (link.hash && link.hash.startsWith('#') && link.hash.length > 1) {
      try {
        const el = document.querySelector(link.hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (_) {}
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--slate-200)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
      height: 'var(--navbar-height)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%'
      }}>
        {/* Brand Logo */}
        <button
          onClick={() => setActivePage('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--teal-600) 0%, var(--primary-600) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontFamily: 'Outfit',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--teal-800)',
                letterSpacing: '-0.02em'
              }}>GramSeva</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)'
              }}>CSI PROJECT</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              Digital Platform for Local Services
            </div>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hide-mobile">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(link)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.925rem',
                fontWeight: 600,
                color: 'var(--slate-600)',
                transition: 'color 0.2s',
                padding: '6px 0'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--teal-600)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--slate-600)'}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Controls & Auth Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Notifications Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{
                    position: 'relative',
                    background: 'var(--slate-100)',
                    border: '1px solid var(--slate-200)',
                    borderRadius: '50%',
                    width: 38,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--slate-700)'
                  }}
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      background: 'var(--rose-500)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {notifDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    width: 330,
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--slate-200)',
                    zIndex: 100,
                    padding: '14px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--slate-100)' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          style={{ background: 'none', border: 'none', color: 'var(--teal-600)', fontSize: '0.775rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: n.isRead ? 'transparent' : 'var(--teal-50)',
                            borderLeft: n.isRead ? 'none' : '3px solid var(--teal-600)',
                            marginBottom: 6,
                            cursor: 'pointer',
                            fontSize: '0.825rem'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ color: 'var(--slate-600)', fontSize: '0.775rem', lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ color: 'var(--slate-400)', fontSize: '0.7rem', marginTop: 4 }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Dashboard Direct Button */}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActivePage(getDashboardTarget())}
              >
                {role === 'ADMIN' && <Shield size={16} />}
                {role === 'WORKER' && <Briefcase size={16} />}
                {role === 'CUSTOMER' && <User size={16} />}
                <span>Dashboard ({role})</span>
              </button>

              {/* Logout Button */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  logout();
                  setActivePage('landing');
                }}
                title="Logout"
              >
                <LogOut size={16} />
                <span className="hide-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActivePage('customer-login')}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActivePage('customer-register')}
              >
                Book Service
              </button>
              <button
                className="btn btn-accent btn-sm hide-mobile"
                onClick={() => setActivePage('worker-login')}
                style={{ background: 'var(--teal-700)' }}
              >
                Worker Portal
              </button>
              <button
                className="btn btn-secondary btn-sm hide-mobile"
                onClick={() => setActivePage('admin-login')}
                style={{ borderColor: 'var(--slate-300)', color: 'var(--slate-700)' }}
                title="Admin Control Room"
              >
                <Shield size={14} />
                <span>Admin</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              color: 'var(--slate-700)',
              display: 'none'
            }}
            className="show-mobile-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--slate-200)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(link)}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                padding: '8px 0'
              }}
            >
              {link.label}
            </button>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--slate-200)', margin: '8px 0' }} />
          {!user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setActivePage('customer-login'); setMobileMenuOpen(false); }}>
                Customer Login
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setActivePage('worker-login'); setMobileMenuOpen(false); }}>
                Worker Portal
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setActivePage('admin-login'); setMobileMenuOpen(false); }}>
                Admin Portal
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => { setActivePage(getDashboardTarget()); setMobileMenuOpen(false); }}>
              Open My Dashboard
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .hide-mobile { display: none !important; }
          .show-mobile-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
