import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function AdminLogin({ setActivePage }) {
  const { adminLogin } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide administrative email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(email, password);
      addToast(data.message || 'Authenticated as Platform Administrator!', 'success');
      setActivePage('admin-dashboard');
    } catch (err) {
      setError(err.message || 'Administrative authentication failed.');
      addToast(err.message || 'Admin authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--navbar-height))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      backgroundColor: 'var(--slate-900)'
    }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', padding: '36px 32px', border: '1px solid var(--slate-700)' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--indigo-50)',
            color: 'var(--indigo-600)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--slate-900)' }}>Admin Control Room</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: 4 }}>
            System Monitoring, Worker Verification & Algorithmic Matching
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--rose-50)',
            color: 'var(--rose-700)',
            border: '1px solid var(--rose-200)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="admin@gramseva.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
              <Mail size={16} color="var(--slate-400)" style={{ position: 'absolute', left: 12, top: 14 }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 4 }}>Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--indigo-600)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
              <Lock size={16} color="var(--slate-400)" style={{ position: 'absolute', left: 12, top: 14 }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: 12,
              padding: '12px 20px',
              backgroundColor: 'var(--indigo-600)',
              backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.975rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)'
            }}
            disabled={loading}
          >
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.975rem', display: 'inline-block' }}>
              {loading ? 'Verifying...' : 'Access Administration'}
            </span>
            <ArrowRight size={18} color="#ffffff" style={{ flexShrink: 0 }} />
          </button>
        </form>

        <div style={{
          marginTop: 24,
          padding: '10px',
          background: 'var(--slate-100)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--slate-500)',
          textAlign: 'center'
        }}>
          Protected Endpoint. Admin registration is prohibited publicly.
        </div>
      </div>

      {/* Forgot Password Modal with OTP Verification */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={email}
        onPasswordResetSuccess={(resetEmail) => {
          setEmail(resetEmail);
          setPassword('');
        }}
      />
    </div>
  );
}
