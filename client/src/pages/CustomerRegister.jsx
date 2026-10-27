import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { 
  User, Mail, Phone, Lock, MapPin, CheckCircle2, 
  ArrowRight, ShieldCheck, KeyRound, AlertCircle, Info 
} from 'lucide-react';

export default function CustomerRegister({ setActivePage }) {
  const { registerCustomer } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    locality: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.address || !formData.locality || !formData.pincode) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Request Email OTP
      const res = await api.post('/auth/request-otp', {
        email: formData.email,
        name: formData.name
      });

      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }

      addToast(res.message || 'Verification OTP dispatched!', 'info');
      setShowOtpModal(true);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code.');
      addToast(err.message || 'Failed to request OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      // Step 2: Verify OTP
      await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: otpCode.trim()
      });

      // Step 3: Register account
      const regRes = await registerCustomer({
        ...formData,
        otp: otpCode.trim()
      });

      addToast(regRes.message || 'Account created successfully! Welcome to GramSeva.', 'success');
      setShowOtpModal(false);
      setActivePage('customer-dashboard');
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Please check code.');
      addToast(err.message || 'Verification failed.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await api.post('/auth/request-otp', {
        email: formData.email,
        name: formData.name
      });
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      addToast('New verification code generated.', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to resend code.', 'error');
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
      <div className="card" style={{ maxWidth: 580, width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: 'var(--teal-50)',
            color: 'var(--teal-700)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <User size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--slate-900)' }}>Customer Registration</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: 4 }}>
            Create an account to request verified home & local services
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

        <form onSubmit={handleInitialSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <span className="form-hint">A 6-digit verification code will be sent to this email.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">House / Street Address *</label>
            <input
              type="text"
              name="address"
              className="form-input"
              placeholder="e.g. House 42, Near Panchayat Hall"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Locality / Area *</label>
              <input
                type="text"
                name="locality"
                className="form-input"
                placeholder="e.g. Shanti Nagar / Main Bazar"
                value={formData.locality}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input
                type="text"
                name="pincode"
                className="form-input"
                placeholder="e.g. 500001"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 12 }}
            disabled={loading}
          >
            {loading ? 'Sending Verification Code...' : 'Continue to Email Verification'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--slate-500)' }}>
          Already have an account?{' '}
          <button
            onClick={() => setActivePage('customer-login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--teal-600)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Sign In Here
          </button>
        </div>
      </div>

      {/* Email Verification OTP Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Email Verification Code"
        maxWidth={460}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--teal-50)',
            color: 'var(--teal-700)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10
          }}>
            <KeyRound size={24} />
          </div>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
            Enter the 6-digit code sent to <br />
            <strong>{formData.email}</strong>
          </p>
        </div>

        {/* Development Mode Verification Banner (Truthful, Honest Notification) */}
        {devOtpHint && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: '0.85rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
              <Info size={16} />
              <span>Development / Demo Verification Mode</span>
            </div>
            <div>
              SMTP credentials are unconfigured or in Dev Mode. Your 6-digit OTP code is:
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <span style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  letterSpacing: '4px',
                  background: 'white',
                  padding: '4px 14px',
                  borderRadius: 6,
                  border: '1px dashed #3b82f6',
                  color: '#1d4ed8'
                }}>
                  {devOtpHint}
                </span>
              </div>
            </div>
          </div>
        )}

        {otpError && (
          <div style={{
            backgroundColor: 'var(--rose-50)',
            color: 'var(--rose-700)',
            border: '1px solid var(--rose-200)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: 16
          }}>
            {otpError}
          </div>
        )}

        <form onSubmit={handleVerifyAndRegister}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'center' }}>Enter 6-Digit OTP</label>
            <input
              type="text"
              maxLength={6}
              className="form-input"
              style={{
                fontSize: '1.5rem',
                textAlign: 'center',
                letterSpacing: '8px',
                fontWeight: 700
              }}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 10 }}
            disabled={otpLoading}
          >
            {otpLoading ? 'Verifying...' : 'Verify Code & Create Account'}
            <CheckCircle2 size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, fontSize: '0.85rem', color: 'var(--slate-500)' }}>
          <span>Didn't receive the email?</span>
          <button
            type="button"
            onClick={handleResendOtp}
            style={{ background: 'none', border: 'none', color: 'var(--teal-600)', fontWeight: 600, cursor: 'pointer' }}
          >
            Resend Code
          </button>
        </div>
      </Modal>
    </div>
  );
}
