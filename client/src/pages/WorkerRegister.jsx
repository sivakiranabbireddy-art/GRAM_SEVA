import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { 
  Briefcase, Mail, Phone, Lock, MapPin, CheckCircle2, 
  ArrowRight, KeyRound, AlertCircle, Info, Sparkles 
} from 'lucide-react';

const AVAILABLE_SKILLS = [
  'Electrical Services',
  'Plumbing',
  'Carpentry',
  'House Cleaning',
  'Appliance Repair',
  'Painting',
  'Gardening',
  'Domestic Assistance'
];

export default function WorkerRegister({ setActivePage }) {
  const { registerWorker } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    experienceYears: '3',
    serviceArea: '',
    pincode: '',
    description: '',
    availabilityStatus: true
  });

  const [selectedSkills, setSelectedSkills] = useState(['Electrical Services']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
      } else {
        addToast('Please select at least one core skill.', 'error');
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.serviceArea || !formData.pincode) {
      setError('Please fill in all mandatory worker profile details.');
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

    if (selectedSkills.length === 0) {
      setError('Please select at least one service skill.');
      return;
    }

    setLoading(true);
    try {
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
      // Step 1: Verify OTP
      await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: otpCode.trim()
      });

      // Step 2: Register Worker
      const regRes = await registerWorker({
        ...formData,
        skills: selectedSkills,
        otp: otpCode.trim()
      });

      addToast(regRes.message || 'Registration submitted! Your profile is pending Admin approval.', 'success');
      setShowOtpModal(false);
      setActivePage('worker-dashboard');
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
      <div className="card" style={{ maxWidth: 640, width: '100%', padding: '36px 32px' }}>
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
          <h2 style={{ fontSize: '1.6rem', color: 'var(--slate-900)' }}>Join as a Service Worker</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: 4 }}>
            Register your trade skills to receive local orders. (Requires Admin Approval)
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Anil Rao"
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
              placeholder="worker@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <span className="form-hint">Email verification code will be sent to this address.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
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

          {/* Trade Skills Selection */}
          <div className="form-group">
            <label className="form-label">Select Service Skills / Trades *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      backgroundColor: isSelected ? 'var(--teal-600)' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--slate-700)',
                      borderColor: isSelected ? 'var(--teal-600)' : 'var(--slate-300)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {skill} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Years of Experience *</label>
              <select
                name="experienceYears"
                className="form-select"
                value={formData.experienceYears}
                onChange={handleChange}
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3-4 Years</option>
                <option value="5">5-7 Years</option>
                <option value="8">8+ Years (Expert Master)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Service Area *</label>
              <input
                type="text"
                name="serviceArea"
                className="form-input"
                placeholder="e.g. Shanti Nagar"
                value={formData.serviceArea}
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

          <div className="form-group">
            <label className="form-label">Professional Experience & Bio</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Briefly state your trade tools, background, and previous experience..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            backgroundColor: 'var(--teal-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20
          }}>
            <input
              type="checkbox"
              id="availabilityStatus"
              name="availabilityStatus"
              checked={formData.availabilityStatus}
              onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: 'var(--teal-600)', cursor: 'pointer' }}
            />
            <label htmlFor="availabilityStatus" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal-900)', cursor: 'pointer' }}>
              Mark profile as Available immediately upon Admin approval
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Sending Verification Code...' : 'Proceed to Email Verification'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--slate-500)' }}>
          Already registered as a worker?{' '}
          <button
            onClick={() => setActivePage('worker-login')}
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

      {/* OTP Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Worker Email Verification"
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

        {/* Development Mode Verification Banner */}
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
            {otpLoading ? 'Registering Worker...' : 'Verify Code & Submit Profile'}
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
