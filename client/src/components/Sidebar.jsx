import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, PlusCircle, Calendar, History, User, 
  CheckSquare, Clock, Star, DollarSign, Users, Briefcase, 
  MessageSquare, ShieldAlert, RotateCcw, LogOut, Shield, ChevronRight 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, role, logout } = useAuth();

  const getMenuItems = () => {
    if (role === 'CUSTOMER') {
      return [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'book', label: 'Book a Service', icon: PlusCircle },
        { id: 'bookings', label: 'Active Bookings', icon: Calendar },
        { id: 'history', label: 'Booking History', icon: History },
        { id: 'profile', label: 'Profile Settings', icon: User }
      ];
    }
    if (role === 'WORKER') {
      return [
        { id: 'overview', label: 'Worker Overview', icon: LayoutDashboard },
        { id: 'new-assignments', label: 'New Assignments', icon: Clock },
        { id: 'active-tasks', label: 'In-Progress Tasks', icon: CheckSquare },
        { id: 'completed', label: 'Completed Tasks', icon: History },
        { id: 'earnings', label: 'Ratings & Earnings', icon: DollarSign },
        { id: 'profile', label: 'Skills & Profile', icon: User }
      ];
    }
    if (role === 'ADMIN') {
      return [
        { id: 'overview', label: 'Analytics & Overview', icon: LayoutDashboard },
        { id: 'bookings', label: 'Service Bookings', icon: Calendar },
        { id: 'workers', label: 'Worker Applications', icon: Briefcase },
        { id: 'customers', label: 'Customers Registry', icon: Users },
        { id: 'feedback', label: 'Feedback & Disputes', icon: MessageSquare }
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="dashboard-sidebar">
      {/* User Header Profile Card */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--slate-200)',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: role === 'ADMIN' ? 'var(--indigo-100)' : role === 'WORKER' ? 'var(--amber-100)' : 'var(--teal-100)',
            color: role === 'ADMIN' ? 'var(--indigo-700)' : role === 'WORKER' ? 'var(--amber-700)' : 'var(--teal-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {user ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--slate-900)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user ? user.name : 'User'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{
                fontSize: '0.675rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: role === 'ADMIN' ? 'var(--indigo-100)' : role === 'WORKER' ? 'var(--amber-100)' : 'var(--teal-100)',
                color: role === 'ADMIN' ? 'var(--indigo-800)' : role === 'WORKER' ? 'var(--amber-800)' : 'var(--teal-800)',
                textTransform: 'uppercase'
              }}>
                {role}
              </span>
              {role === 'WORKER' && user && (
                <span style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  color: user.status === 'APPROVED' ? 'var(--primary-700)' : 'var(--amber-700)'
                }}>
                  • {user.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--teal-50)' : 'transparent',
                color: isActive ? 'var(--teal-800)' : 'var(--slate-600)',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--slate-50)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon
                  size={18}
                  color={isActive ? 'var(--teal-600)' : 'var(--slate-400)'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} color="var(--teal-600)" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom logout area */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--slate-200)',
        backgroundColor: '#ffffff'
      }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '9px 12px',
            background: 'none',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--slate-600)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--rose-50)';
            e.currentTarget.style.color = 'var(--rose-700)';
            e.currentTarget.style.borderColor = 'var(--rose-200)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--slate-600)';
            e.currentTarget.style.borderColor = 'var(--slate-200)';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
