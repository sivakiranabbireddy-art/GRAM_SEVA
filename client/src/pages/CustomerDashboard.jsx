import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  PlusCircle, Calendar, Clock, CheckCircle2, AlertTriangle, 
  XCircle, User, Phone, MapPin, Tag, Wrench, FileText, 
  Sparkles, RefreshCw, Star, ArrowRight, MessageSquare 
} from 'lucide-react';

export default function CustomerDashboard({ navTarget, onClearNavTarget }) {
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (navTarget && navTarget.tab) {
      setActiveTab(navTarget.tab);
      if (onClearNavTarget) onClearNavTarget();
    }
  }, [navTarget, onClearNavTarget]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    categoryId: '',
    description: '',
    address: user?.address || '',
    locality: user?.locality || '',
    pincode: user?.pincode || '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTimeSlot: '10:00 AM - 01:00 PM',
    contactNumber: user?.phone || '',
    attachmentUrl: ''
  });

  // Selected Booking Details / Timeline Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Feedback Modal State
  const [feedbackModalBooking, setFeedbackModalBooking] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackReview, setFeedbackReview] = useState('');
  const [feedbackTags, setFeedbackTags] = useState(['Work Quality', 'Punctuality']);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Cancellation State
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Dispute State
  const [disputeBookingId, setDisputeBookingId] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    locality: user?.locality || '',
    pincode: user?.pincode || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await api.get('/customer/bookings');
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.get('/categories');
      if (data.success && data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !newBooking.categoryId) {
          setNewBooking(prev => ({ ...prev, categoryId: data.categories[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [newBooking.categoryId]);

  useEffect(() => {
    fetchBookings();
    fetchCategories();
  }, [fetchBookings, fetchCategories]);

  // Statistics
  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter(b => ['REQUESTED', 'REJECTED_BY_WORKER'].includes(b.status)).length;
  const activeServices = bookings.filter(b => ['WORKER_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'AWAITING_CONFIRMATION'].includes(b.status)).length;
  const completedServices = bookings.filter(b => b.status === 'COMPLETED').length;

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!newBooking.description || !newBooking.address || !newBooking.locality || !newBooking.pincode) {
      addToast('Please provide service details, address, and locality.', 'error');
      return;
    }

    setSubmittingBooking(true);
    try {
      const res = await api.post('/customer/bookings', newBooking);
      addToast(res.message || 'Service requested successfully!', 'success');
      setShowBookingModal(false);
      setNewBooking({
        categoryId: categories[0]?.id || '',
        description: '',
        address: user?.address || '',
        locality: user?.locality || '',
        pincode: user?.pincode || '',
        preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        preferredTimeSlot: '10:00 AM - 01:00 PM',
        contactNumber: user?.phone || '',
        attachmentUrl: ''
      });
      fetchBookings();
      setActiveTab('bookings');
    } catch (err) {
      addToast(err.message || 'Failed to submit booking.', 'error');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleConfirmCompletion = async (bookingId) => {
    try {
      const res = await api.put(`/customer/bookings/${bookingId}/confirm`, {});
      addToast('Service completion confirmed!', 'success');
      fetchBookings();
      // Prompt feedback modal
      const target = bookings.find(b => b.id === bookingId);
      if (target) {
        setFeedbackModalBooking(target);
      }
    } catch (err) {
      addToast(err.message || 'Failed to confirm completion.', 'error');
    }
  };

  const handleCancelBooking = async () => {
    try {
      await api.put(`/customer/bookings/${cancelBookingId}/cancel`, {
        reason: cancelReason || 'Cancelled by customer'
      });
      addToast('Booking has been cancelled.', 'info');
      setShowCancelDialog(false);
      setCancelReason('');
      fetchBookings();
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      addToast('Please describe the problem or dispute.', 'error');
      return;
    }
    try {
      await api.put(`/customer/bookings/${disputeBookingId}/dispute`, { disputeReason });
      addToast('Dispute reported to Admin. We will investigate promptly.', 'info');
      setShowDisputeModal(false);
      setDisputeReason('');
      fetchBookings();
    } catch (err) {
      addToast(err.message || 'Failed to submit dispute.', 'error');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.post('/feedback', {
        bookingId: feedbackModalBooking.id,
        rating: feedbackRating,
        review: feedbackReview,
        tags: feedbackTags
      });
      addToast('Thank you for rating your service experience!', 'success');
      setFeedbackModalBooking(null);
      setFeedbackReview('');
      fetchBookings();
    } catch (err) {
      addToast(err.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/customer/profile', profileForm);
      await refreshProfile();
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleFeedbackTag = (tag) => {
    if (feedbackTags.includes(tag)) {
      setFeedbackTags(feedbackTags.filter(t => t !== tag));
    } else {
      setFeedbackTags([...feedbackTags, tag]);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="dashboard-main">
        {/* Top Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)' }}>
              Namaste, {user?.name || 'Customer'}! 🌾
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: 2 }}>
              Customer Portal • {user?.locality || 'Local Area'} (Pincode: {user?.pincode || 'N/A'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={fetchBookings}
              title="Refresh bookings"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowBookingModal(true)}
            >
              <PlusCircle size={18} /> Request a Service
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20,
              marginBottom: 32
            }}>
              <div className="card" style={{ borderLeft: '4px solid var(--teal-600)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Total Requests
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: 4 }}>
                  {totalBookings}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--amber-500)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Awaiting Worker
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber-700)', marginTop: 4 }}>
                  {pendingRequests}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--indigo-500)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Active Work
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--indigo-700)', marginTop: 4 }}>
                  {activeServices}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Completed
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: 4 }}>
                  {completedServices}
                </div>
              </div>
            </div>

            {/* Quick Service Categories Grid */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.25rem' }}>Popular Service Categories</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Click to book instantly</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: 16
              }}>
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="card card-interactive"
                    style={{ padding: '16px', cursor: 'pointer' }}
                    onClick={() => {
                      setNewBooking(prev => ({ ...prev, categoryId: cat.id }));
                      setShowBookingModal(true);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'var(--teal-50)',
                        color: 'var(--teal-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Wrench size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                          {cat.name}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--slate-500)' }}>
                          Est. from ₹{cat.basePriceEstimate}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.25rem' }}>Recent Bookings</h3>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('bookings')}
                >
                  View All ({bookings.length})
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate-400)' }}>
                  <Wrench size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>No service bookings requested yet.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 14 }}
                    onClick={() => setShowBookingModal(true)}
                  >
                    Request Your First Service
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Category</th>
                        <th>Scheduled Date</th>
                        <th>Assigned Worker</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 700, color: 'var(--teal-700)' }}>{b.id}</td>
                          <td>{b.categoryName}</td>
                          <td>{b.preferredDate} ({b.preferredTimeSlot})</td>
                          <td>
                            {b.assignedWorkerName ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={14} color="var(--slate-500)" />
                                <span>{b.assignedWorkerName}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>Pending matching</span>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={b.status} />
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedBooking(b)}
                            >
                              Timeline & Info
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Book a Service */}
        {activeTab === 'book' && (
          <div className="card" style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Request a Local Service</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginBottom: 24 }}>
              Fill in your problem details. GramSeva's matching algorithm will identify qualified, available local workers in your area.
            </p>

            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label className="form-label">Service Category *</label>
                <select
                  className="form-select"
                  value={newBooking.categoryId}
                  onChange={(e) => setNewBooking({ ...newBooking, categoryId: e.target.value })}
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Estimated ~₹{c.basePriceEstimate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description of Problem / Work Required *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the issue in detail (e.g. Bathroom tap leaking heavily, water supply needs isolation, spare pipe washers required)..."
                  value={newBooking.description}
                  onChange={(e) => setNewBooking({ ...newBooking, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Preferred Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newBooking.preferredDate}
                    onChange={(e) => setNewBooking({ ...newBooking, preferredDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Time Slot *</label>
                  <select
                    className="form-select"
                    value={newBooking.preferredTimeSlot}
                    onChange={(e) => setNewBooking({ ...newBooking, preferredTimeSlot: e.target.value })}
                    required
                  >
                    <option value="09:00 AM - 12:00 PM">Morning (09:00 AM - 12:00 PM)</option>
                    <option value="12:00 PM - 03:00 PM">Afternoon (12:00 PM - 03:00 PM)</option>
                    <option value="03:00 PM - 06:00 PM">Evening (03:00 PM - 06:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Address (House No, Landmark) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. House No. 12, Near Hanuman Temple"
                  value={newBooking.address}
                  onChange={(e) => setNewBooking({ ...newBooking, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Locality / Village Area *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shanti Nagar"
                    value={newBooking.locality}
                    onChange={(e) => setNewBooking({ ...newBooking, locality: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 500001"
                    value={newBooking.pincode}
                    onChange={(e) => setNewBooking({ ...newBooking, pincode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={newBooking.contactNumber}
                    onChange={(e) => setNewBooking({ ...newBooking, contactNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Optional Photo / Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://... (Optional picture of problem)"
                    value={newBooking.attachmentUrl}
                    onChange={(e) => setNewBooking({ ...newBooking, attachmentUrl: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 12 }}
                disabled={submittingBooking}
              >
                {submittingBooking ? 'Submitting Request...' : 'Submit Service Request'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Active Bookings */}
        {(activeTab === 'bookings' || activeTab === 'history') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>
                  {activeTab === 'bookings' ? 'Your Active & Ongoing Bookings' : 'Complete Service History'}
                </h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                  Track live status updates, confirm finished tasks, or submit performance feedback.
                </p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={() => setShowBookingModal(true)}>
                <PlusCircle size={16} /> New Request
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--slate-400)' }}>
                <Calendar size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>No bookings found in this category.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {bookings
                  .filter(b => activeTab === 'bookings' ? b.status !== 'COMPLETED' && b.status !== 'CANCELLED' : true)
                  .map(booking => (
                    <div key={booking.id} className="card" style={{ padding: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--teal-800)' }}>
                              {booking.id}
                            </span>
                            <StatusBadge status={booking.status} />
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: 4 }}>
                            {booking.categoryName}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Price Estimate:</span>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal-700)' }}>
                            ₹{booking.priceEstimate}
                          </div>
                        </div>
                      </div>

                      <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.5 }}>
                        {booking.description}
                      </p>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 12,
                        padding: '12px 14px',
                        backgroundColor: 'var(--slate-50)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        marginBottom: 16
                      }}>
                        <div>
                          <span style={{ color: 'var(--slate-500)' }}>Schedule:</span>
                          <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                            {booking.preferredDate} ({booking.preferredTimeSlot})
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--slate-500)' }}>Address:</span>
                          <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                            {booking.customerAddress}, {booking.locality} ({booking.pincode})
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--slate-500)' }}>Assigned Worker:</span>
                          <div style={{ fontWeight: 600, color: booking.assignedWorkerName ? 'var(--slate-800)' : 'var(--amber-700)' }}>
                            {booking.assignedWorkerName ? `${booking.assignedWorkerName} (${booking.assignedWorkerPhone || 'N/A'})` : 'Matching pending...'}
                          </div>
                        </div>
                      </div>

                      {/* Status Specific Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          View Full Timeline & Details
                        </button>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {/* Cancel button if work hasn't started */}
                          {['REQUESTED', 'WORKER_ASSIGNED', 'ACCEPTED'].includes(booking.status) && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setCancelBookingId(booking.id);
                                setShowCancelDialog(true);
                              }}
                            >
                              Cancel Booking
                            </button>
                          )}

                          {/* Confirm Completion button when worker completed */}
                          {booking.status === 'AWAITING_CONFIRMATION' && (
                            <>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setDisputeBookingId(booking.id);
                                  setShowDisputeModal(true);
                                }}
                              >
                                Raise Dispute
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleConfirmCompletion(booking.id)}
                              >
                                <CheckCircle2 size={16} /> Confirm Completion
                              </button>
                            </>
                          )}

                          {/* Submit Feedback when completed */}
                          {booking.status === 'COMPLETED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ background: 'var(--teal-700)' }}
                              onClick={() => setFeedbackModalBooking(booking)}
                            >
                              <Star size={16} fill="white" /> Rate & Review Worker
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Customer Profile Settings</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: 24 }}>
              Keep your contact and locality details current for accurate local matching.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email (Immutable)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                    style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-500)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Default House Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Locality / Area</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.locality}
                    onChange={(e) => setProfileForm({ ...profileForm, locality: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.pincode}
                    onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: 12 }}
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Booking Form Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Request a Local Service"
        maxWidth={620}
      >
        <form onSubmit={handleCreateBooking}>
          <div className="form-group">
            <label className="form-label">Select Service Category *</label>
            <select
              className="form-select"
              value={newBooking.categoryId}
              onChange={(e) => setNewBooking({ ...newBooking, categoryId: e.target.value })}
              required
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (~₹{c.basePriceEstimate})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description of Problem *</label>
            <textarea
              className="form-textarea"
              placeholder="Provide a clear description of the problem or assistance required..."
              value={newBooking.description}
              onChange={(e) => setNewBooking({ ...newBooking, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Preferred Date *</label>
              <input
                type="date"
                className="form-input"
                value={newBooking.preferredDate}
                onChange={(e) => setNewBooking({ ...newBooking, preferredDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Time Slot *</label>
              <select
                className="form-select"
                value={newBooking.preferredTimeSlot}
                onChange={(e) => setNewBooking({ ...newBooking, preferredTimeSlot: e.target.value })}
                required
              >
                <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Address *</label>
            <input
              type="text"
              className="form-input"
              value={newBooking.address}
              onChange={(e) => setNewBooking({ ...newBooking, address: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Locality *</label>
              <input
                type="text"
                className="form-input"
                value={newBooking.locality}
                onChange={(e) => setNewBooking({ ...newBooking, locality: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input
                type="text"
                className="form-input"
                value={newBooking.pincode}
                onChange={(e) => setNewBooking({ ...newBooking, pincode: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 12 }}
            disabled={submittingBooking}
          >
            {submittingBooking ? 'Submitting...' : 'Confirm Service Booking'}
          </button>
        </form>
      </Modal>

      {/* Selected Booking Timeline & Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details: ${selectedBooking.id}`}
          maxWidth={640}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {selectedBooking.categoryName}
              </span>
              <StatusBadge status={selectedBooking.status} />
            </div>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
              {selectedBooking.description}
            </p>
          </div>

          {selectedBooking.assignedWorkerName && (
            <div style={{
              padding: '14px',
              backgroundColor: 'var(--teal-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--teal-200)',
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 700, color: 'var(--teal-900)', fontSize: '0.9rem', marginBottom: 4 }}>
                Assigned Local Worker
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.875rem', color: 'var(--teal-800)' }}>
                <div><strong>Name:</strong> {selectedBooking.assignedWorkerName}</div>
                <div><strong>Phone:</strong> {selectedBooking.assignedWorkerPhone || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Timeline Section */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '1rem', marginBottom: 16 }}>Service Workflow Timeline</h4>
            <div className="timeline">
              {(selectedBooking.timeline || []).map((step, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot completed" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-title">{step.status}</span>
                      <span className="timeline-time">
                        {new Date(step.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="timeline-desc">{step.note}</div>
                    {step.by && (
                      <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)', marginTop: 4 }}>
                        Action by: {step.by}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Feedback Modal */}
      {feedbackModalBooking && (
        <Modal
          isOpen={!!feedbackModalBooking}
          onClose={() => setFeedbackModalBooking(null)}
          title={`Rate Service: ${feedbackModalBooking.categoryName}`}
          maxWidth={500}
        >
          <form onSubmit={handleSubmitFeedback}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: 12 }}>
                How was your service experience with <strong>{feedbackModalBooking.assignedWorkerName || 'the assigned worker'}</strong>?
              </p>
              <StarRating
                rating={feedbackRating}
                interactive={true}
                onChange={setFeedbackRating}
                size={32}
              />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginTop: 6 }}>
                {feedbackRating} of 5 Stars
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Service Quality Highlights</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Punctuality', 'Work Quality', 'Professionalism', 'Cleanliness', 'Polite Behavior'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleFeedbackTag(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      backgroundColor: feedbackTags.includes(tag) ? 'var(--teal-600)' : '#ffffff',
                      color: feedbackTags.includes(tag) ? '#ffffff' : 'var(--slate-700)',
                      borderColor: feedbackTags.includes(tag) ? 'var(--teal-600)' : 'var(--slate-300)'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Written Review</label>
              <textarea
                className="form-textarea"
                placeholder="Share your feedback to help the worker and neighborhood community..."
                value={feedbackReview}
                onChange={(e) => setFeedbackReview(e.target.value)}
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              disabled={submittingFeedback}
            >
              {submittingFeedback ? 'Submitting Feedback...' : 'Submit Rating & Review'}
            </button>
          </form>
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Service Booking"
        message="Are you sure you want to cancel this booking? This action cannot be reversed once work has commenced."
        confirmText="Yes, Cancel Booking"
        isDanger={true}
      />

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Report an Issue / Dispute"
        maxWidth={500}
      >
        <form onSubmit={handleRaiseDispute}>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginBottom: 16 }}>
            If the service was incomplete, unsatisfactory, or damaged property, please state the problem. The GramSeva Administrator will investigate and contact both parties.
          </p>

          <div className="form-group">
            <label className="form-label">Dispute Details *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the issue clearly..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
            Submit Dispute to Admin
          </button>
        </form>
      </Modal>
    </div>
  );
}
