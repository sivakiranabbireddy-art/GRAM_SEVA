import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '', onPasswordResetSuccess }) {
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setDevOtp(null);
      setResendCooldown(0);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/auth/forgot-password/request-otp', { email });
      addToast(data.message || 'Verification code sent to your email.', 'success');
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setResendCooldown(60);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check email address.');
      addToast(err.message || 'Failed to send OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/auth/forgot-password/reset', {
        email,
        otp: cleanOtp,
        newPassword
      });

      addToast(data.message || 'Password reset successfully!', 'success');
      setStep(3);
      if (onPasswordResetSuccess) {
        onPasswordResetSuccess(email);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify OTP code.');
      addToast(err.message || 'Reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxWidth: 440,
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid var(--slate-200)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 16px',
          borderBottom: '1px solid var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--slate-900)', fontWeight: 700 }}>
                {step === 3 ? 'Password Updated' : 'Reset Password'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.785rem', color: 'var(--slate-500)' }}>
                {step === 1 && 'Step 1 of 2: Verify your registered email'}
                {step === 2 && 'Step 2 of 2: Enter code & choose new password'}
                {step === 3 && 'All set! You can now log in'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--slate-400)',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px' }}>
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp}>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: 0, marginBottom: 18, lineHeight: 1.5 }}>
                Enter your registered GramSeva email address. We will send you a 6-digit OTP code to safely reset your password.
              </p>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Registered Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                    autoFocus
                  />
                  <Mail size={16} color="var(--slate-400)" style={{ position: 'absolute', left: 12, top: 14 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={loading}
                >
                  <span>{loading ? 'Sending Code...' : 'Send Reset Code'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div style={{
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'var(--slate-600)' }}>
                  Code sent to: <strong style={{ color: 'var(--slate-800)' }}>{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--teal-600)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Change
                </button>
              </div>

              {/* Dev OTP Helper */}
              {devOtp && (
                <div style={{
                  backgroundColor: 'var(--teal-50)',
                  border: '1px dashed var(--teal-400)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ color: 'var(--teal-800)' }}>
                    <Sparkles size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    Demo OTP: <strong style={{ letterSpacing: 2, fontSize: '1rem', color: 'var(--teal-900)' }}>{devOtp}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Code */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ marginBottom: 4 }}>6-Digit Verification Code</label>
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendCooldown > 0 ? 'var(--slate-400)' : 'var(--teal-600)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    style={{ letterSpacing: 4, fontSize: '1.05rem', fontWeight: 600, textAlign: 'center' }}
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: 38, paddingRight: 38 }}
                    required
                    minLength={6}
                  />
                  <Lock size={16} color="var(--slate-400)" style={{ position: 'absolute', left: 12, top: 14 }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 14,
                      background: 'none',
                      border: 'none',
                      color: 'var(--slate-400)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                    minLength={6}
                  />
                  <Lock size={16} color="var(--slate-400)" style={{ position: 'absolute', left: 12, top: 14 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'var(--teal-50)',
                color: 'var(--teal-600)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.25rem', color: 'var(--slate-900)', margin: '0 0 8px', fontWeight: 700 }}>
                Password Reset Successfully!
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', margin: '0 0 24px', lineHeight: 1.5 }}>
                Your account password has been safely updated in MongoDB. You can now sign in with your new password.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
                style={{ width: '100%', padding: '12px' }}
              >
                Proceed to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
