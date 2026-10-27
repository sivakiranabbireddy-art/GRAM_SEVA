import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Briefcase, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function WorkerLogin({ setActivePage }) {
  const { login } = useAuth();
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
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password, 'WORKER');
      addToast(data.message || 'Logged in to Worker Dashboard!', 'success');
      setActivePage('worker-dashboard');
    } catch (err) {
      setError(err.message || 'Worker login failed.');
      addToast(err.message || 'Worker login failed.', 'error');
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
      backgroundColor: 'var(--slate-50)'
    }}>
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: 'var(--teal-100)',
            color: 'var(--teal-800)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Briefcase size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--slate-900)' }}>Worker Service Portal</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: 4 }}>
            Sign in to receive service tasks, accept jobs, and track earnings
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
            <label className="form-label">Worker Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="worker@gramseva.in"
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
                  color: 'var(--teal-600)',
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
              backgroundColor: '#0d9488',
              backgroundImage: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
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
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.35)'
            }}
            disabled={loading}
          >
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.975rem', display: 'inline-block' }}>
              {loading ? 'Authenticating...' : 'Sign In as Worker'}
            </span>
            <ArrowRight size={18} color="#ffffff" style={{ flexShrink: 0 }} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--slate-500)' }}>
          Want to offer your skills on GramSeva?{' '}
          <button
            onClick={() => setActivePage('worker-register')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--teal-600)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Register as a Worker
          </button>
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
