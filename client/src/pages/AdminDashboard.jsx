import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Shield, Users, Briefcase, Calendar, CheckSquare, AlertTriangle, 
  Download, Search, Filter, CheckCircle2, XCircle, 
  Award, Star, Phone, MapPin, Eye, UserCheck, RefreshCw, ChevronRight 
} from 'lucide-react';

const COLORS = ['#0d9488', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#06b6d4'];

export default function AdminDashboard({ navTarget, onClearNavTarget }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [workerStatusFilter, setWorkerStatusFilter] = useState('ALL');
  const [workerSearch, setWorkerSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState('ALL');

  // Matching Candidates Modal State
  const [matchingModalBooking, setMatchingModalBooking] = useState(null);
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Booking Details Modal
  const [detailsBooking, setDetailsBooking] = useState(null);

  // Dispute Resolution Modal
  const [disputeBooking, setDisputeBooking] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Customer History Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get('/admin/stats');
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await api.get('/admin/bookings');
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchWorkers = useCallback(async () => {
    try {
      const data = await api.get('/admin/workers');
      if (data.success && data.workers) {
        setWorkers(data.workers);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await api.get('/admin/customers');
      if (data.success && data.customers) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    try {
      const data = await api.get('/feedback');
      if (data.success && data.feedback) {
        setFeedbackList(data.feedback);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchBookings(),
      fetchWorkers(),
      fetchCustomers(),
      fetchFeedback()
    ]);
    setLoading(false);
  }, [fetchStats, fetchBookings, fetchWorkers, fetchCustomers, fetchFeedback]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Responsive handler for notification deep-linking and quick navigation
  useEffect(() => {
    if (navTarget && navTarget.tab) {
      setActiveTab(navTarget.tab);
      if (navTarget.tab === 'workers') {
        if (navTarget.filter) {
          setWorkerStatusFilter(navTarget.filter);
        }
        if (navTarget.search) {
          const matched = workers.find(w => w.id === navTarget.search || w.userId === navTarget.search);
          if (matched) {
            setWorkerSearch(matched.name);
          } else {
            setWorkerSearch(navTarget.search);
          }
        }
        addToast('Navigated to Worker Applications & Approvals', 'info');
      } else if (navTarget.tab === 'bookings') {
        if (navTarget.filter) {
          setBookingStatusFilter(navTarget.filter);
        }
        if (navTarget.search) {
          setBookingSearch(navTarget.search);
        }
        addToast('Navigated to Service Bookings', 'info');
      } else if (navTarget.tab === 'feedback') {
        addToast('Navigated to Feedback & Disputes', 'info');
      }
      if (onClearNavTarget) onClearNavTarget();
    }
  }, [navTarget, workers, onClearNavTarget, addToast]);

  // Worker Approval Actions
  const handleApproveWorker = async (workerId) => {
    try {
      const res = await api.put(`/admin/workers/${workerId}/approve`, {});
      addToast(res.message || 'Worker application approved!', 'success');
      fetchWorkers();
      fetchStats();
    } catch (err) {
      addToast(err.message || 'Failed to approve worker.', 'error');
    }
  };

  const handleUpdateWorkerStatus = async (workerId, status) => {
    try {
      const res = await api.put(`/admin/workers/${workerId}/approval`, { status });
      addToast(res.message || `Worker status updated to ${status}`, 'info');
      fetchWorkers();
      fetchStats();
    } catch (err) {
      addToast(err.message || 'Failed to update worker status.', 'error');
    }
  };

  // Customer Toggle Action
  const handleToggleCustomerStatus = async (customerId) => {
    try {
      const res = await api.put(`/admin/customers/${customerId}/toggle-status`, {});
      addToast(res.message, 'info');
      fetchCustomers();
    } catch (err) {
      addToast(err.message || 'Failed to toggle customer status.', 'error');
    }
  };

  // Open Ranked Candidates Modal
  const handleOpenMatching = async (booking) => {
    setMatchingModalBooking(booking);
    setLoadingCandidates(true);
    try {
      const res = await api.get(`/admin/bookings/${booking.id}/candidates`);
      if (res.success && res.candidates) {
        setMatchingCandidates(res.candidates);
      }
    } catch (err) {
      addToast(err.message || 'Failed to calculate matching candidates.', 'error');
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Manual or Auto Assign
  const handleAssignWorker = async (bookingId, workerId = null, autoAssign = false) => {
    try {
      const res = await api.put(`/admin/bookings/${bookingId}/assign`, {
        workerId,
        autoAssign
      });
      addToast(res.message || 'Worker assigned successfully!', 'success');
      setMatchingModalBooking(null);
      fetchBookings();
      fetchStats();
    } catch (err) {
      addToast(err.message || 'Assignment failed.', 'error');
    }
  };

  // Resolve Dispute
  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      addToast('Please enter resolution remarks.', 'error');
      return;
    }
    try {
      await api.put(`/admin/bookings/${disputeBooking.id}/resolve-dispute`, {
        resolutionNote,
        finalStatus: 'COMPLETED'
      });
      addToast('Dispute marked as resolved.', 'success');
      setDisputeBooking(null);
      setResolutionNote('');
      fetchBookings();
      fetchStats();
    } catch (err) {
      addToast(err.message || 'Failed to resolve dispute.', 'error');
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const blob = await api.download('/admin/bookings/export-csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gramseva_bookings_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Bookings report downloaded as CSV!', 'success');
    } catch (err) {
      addToast('Failed to export CSV report.', 'error');
    }
  };

  // Filtered lists
  const filteredBookings = bookings.filter(b => {
    const matchStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
    const q = bookingSearch.toLowerCase();
    const matchSearch = !bookingSearch || (
      b.id.toLowerCase().includes(q) ||
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.assignedWorkerName && b.assignedWorkerName.toLowerCase().includes(q)) ||
      (b.categoryName && b.categoryName.toLowerCase().includes(q)) ||
      (b.locality && b.locality.toLowerCase().includes(q))
    );
    return matchStatus && matchSearch;
  });

  const filteredWorkers = workers.filter(w => {
    const matchStatus = workerStatusFilter === 'ALL' || w.status === workerStatusFilter;
    const q = workerSearch.toLowerCase();
    const matchSearch = !workerSearch || (
      w.name.toLowerCase().includes(q) ||
      w.email.toLowerCase().includes(q) ||
      (w.skills && w.skills.some(s => s.toLowerCase().includes(q))) ||
      (w.serviceArea && w.serviceArea.toLowerCase().includes(q))
    );
    return matchStatus && matchSearch;
  });

  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase();
    return !customerSearch || (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.locality && c.locality.toLowerCase().includes(q))
    );
  });

  const filteredFeedback = feedbackList.filter(f => {
    return feedbackRatingFilter === 'ALL' || f.rating === parseInt(feedbackRatingFilter, 10);
  });

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="dashboard-main">
        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)' }}>
                System Administration & Oversight
              </h1>
              <span style={{
                background: 'var(--indigo-100)',
                color: 'var(--indigo-800)',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 4
              }}>
                ADMIN CONSOLE
              </span>
            </div>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: 2 }}>
              GramSeva Local Services Platform • Evaluator & Judge Management Center
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={loadAllData} title="Reload live data">
              <RefreshCw size={14} /> Refresh Live Data
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCsv} title="Download CSV report">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Tab 1: Overview & Analytics */}
        {activeTab === 'overview' && (
          <div>
            {/* 8 Essential Summary Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 16,
              marginBottom: 32
            }}>
              <div 
                className="card card-interactive" 
                onClick={() => setActiveTab('customers')}
                style={{ borderLeft: '4px solid var(--teal-600)', cursor: 'pointer' }}
                title="View Customers Registry"
              >
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Total Customers
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: 4 }}>
                  {stats?.totalCustomers ?? customers.length}
                </div>
              </div>

              <div 
                className="card card-interactive" 
                onClick={() => { setActiveTab('workers'); setWorkerStatusFilter('APPROVED'); }}
                style={{ borderLeft: '4px solid var(--primary-600)', cursor: 'pointer' }}
                title="View Approved Workers Roster"
              >
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Approved Workers
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: 4 }}>
                  {stats?.approvedWorkers ?? workers.filter(w => w.status === 'APPROVED').length}
                </div>
              </div>

              <div 
                className="card card-interactive" 
                onClick={() => { setActiveTab('workers'); setWorkerStatusFilter('PENDING_APPROVAL'); }}
                style={{ 
                  borderLeft: '4px solid var(--amber-500)', 
                  backgroundColor: (stats?.workersPendingApproval || 0) > 0 ? '#fffbeb' : '#fff',
                  cursor: 'pointer' 
                }}
                title="Review Workers Pending Approval"
              >
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--amber-800)', textTransform: 'uppercase' }}>
                  Workers Pending Approval
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--amber-700)', marginTop: 4 }}>
                  {stats?.workersPendingApproval ?? workers.filter(w => w.status === 'PENDING_APPROVAL').length}
                </div>
              </div>

              <div 
                className="card card-interactive" 
                onClick={() => { setActiveTab('bookings'); setBookingStatusFilter('ALL'); }}
                style={{ borderLeft: '4px solid var(--indigo-500)', cursor: 'pointer' }}
                title="View All Bookings"
              >
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Total Service Requests
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: 4 }}>
                  {stats?.totalRequests ?? bookings.length}
                </div>
              </div>

              <div 
                className="card card-interactive" 
                onClick={() => { setActiveTab('bookings'); setBookingStatusFilter('REQUESTED'); }}
                style={{ borderLeft: '4px solid #f97316', cursor: 'pointer' }}
                title="Review Unassigned Requests"
              >
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
                  Pending Matching
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ea580c', marginTop: 4 }}>
                  {stats?.pendingRequests ?? bookings.filter(b => ['REQUESTED', 'REJECTED_BY_WORKER'].includes(b.status)).length}
                </div>
              </div>

              <div 
                className="card card-interactive" 
                onClick={() => { setActiveTab('bookings'); setBookingStatusFilter('IN_PROGRESS'); }}
                style={{ borderLeft: '4px solid #0284c7', cursor: 'pointer' }}
                title="View Active Bookings"
              >
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                  Active Bookings
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0284c7', marginTop: 4 }}>
                  {stats?.activeBookings ?? bookings.filter(b => ['WORKER_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'AWAITING_CONFIRMATION'].includes(b.status)).length}
                </div>
              </div>

              <div 
                className="card card-interactive" 
                onClick={() => { setActiveTab('bookings'); setBookingStatusFilter('COMPLETED'); }}
                style={{ borderLeft: '4px solid #16a34a', cursor: 'pointer' }}
                title="View Completed Bookings"
              >
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                  Completed Bookings
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                  {stats?.completedBookings ?? bookings.filter(b => b.status === 'COMPLETED').length}
                </div>
              </div>

              <div 
                className="card card-interactive" 
                onClick={() => setActiveTab('feedback')}
                style={{ borderLeft: '4px solid var(--rose-500)', cursor: 'pointer' }}
                title="View Feedback & Disputed Bookings"
              >
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--rose-700)', textTransform: 'uppercase' }}>
                  Disputed / Cancelled
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--rose-700)', marginTop: 4 }}>
                  {(stats?.cancelledBookings || 0) + (stats?.disputedBookings || 0)}
                </div>
              </div>
            </div>

            {/* Charts Section with Recharts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 24,
              marginBottom: 36
            }}>
              {/* Category Breakdown Chart */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Service Category Distribution</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={stats?.categoryDistribution || []} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--teal-600)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown Chart */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Booking Status Distribution</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stats?.statusDistribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label={({ name, percent }) => `${name.split('_')[0]}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {(stats?.statusDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Critical Attention: Pending Assignments */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: '1.25rem' }}>Requests Awaiting Worker Assignment</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('bookings')}>
                  View All Service Bookings
                </button>
              </div>

              {bookings.filter(b => ['REQUESTED', 'REJECTED_BY_WORKER'].includes(b.status)).length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                  <CheckCircle2 size={36} color="var(--primary-600)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 600, color: 'var(--slate-700)' }}>All requests are currently assigned!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Category</th>
                        <th>Customer</th>
                        <th>Locality & Pincode</th>
                        <th>Schedule</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.filter(b => ['REQUESTED', 'REJECTED_BY_WORKER'].includes(b.status)).map(b => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 800, color: 'var(--teal-800)' }}>{b.id}</td>
                          <td><strong>{b.categoryName}</strong></td>
                          <td>{b.customerName} ({b.customerPhone})</td>
                          <td>{b.locality} ({b.pincode})</td>
                          <td>{b.preferredDate} ({b.preferredTimeSlot})</td>
                          <td><StatusBadge status={b.status} /></td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenMatching(b)}
                            >
                              <Award size={14} /> Match Candidates
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

        {/* Tab 2: Manage Bookings */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Service Request Management</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                  Filter, assign workers, resolve disputes, and track lifecycle stages.
                </p>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
                <Download size={14} /> Download CSV
              </button>
            </div>

            {/* Filter controls */}
            <div style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: 20,
              backgroundColor: '#ffffff',
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search ID, customer, worker, locality..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  style={{ paddingLeft: 36, paddingRight: 10, paddingBottom: 8, paddingTop: 8 }}
                />
                <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>

              <div style={{ minWidth: 200 }}>
                <select
                  className="form-select"
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  style={{ paddingBottom: 8, paddingTop: 8 }}
                >
                  <option value="ALL">All Statuses ({bookings.length})</option>
                  <option value="REQUESTED">Requested (Unassigned)</option>
                  <option value="WORKER_ASSIGNED">Worker Assigned</option>
                  <option value="ACCEPTED">Accepted by Worker</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="AWAITING_CONFIRMATION">Awaiting Confirmation</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DISPUTED">Disputed</option>
                  <option value="REJECTED_BY_WORKER">Declined by Worker</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Category</th>
                    <th>Customer</th>
                    <th>Locality</th>
                    <th>Assigned Worker</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                        No bookings matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 800, color: 'var(--teal-800)' }}>{b.id}</td>
                        <td>{b.categoryName}</td>
                        <td>
                          <div>{b.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{b.customerPhone}</div>
                        </td>
                        <td>{b.locality} ({b.pincode})</td>
                        <td>
                          {b.assignedWorkerName ? (
                            <div>
                              <div>{b.assignedWorkerName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{b.assignedWorkerPhone || ''}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--amber-700)', fontStyle: 'italic', fontSize: '0.8rem' }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <div>{b.preferredDate}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{b.preferredTimeSlot}</div>
                        </td>
                        <td><StatusBadge status={b.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDetailsBooking(b)}
                              title="View Details"
                            >
                              <Eye size={13} />
                            </button>

                            {/* Matching button if unassigned or rejected */}
                            {['REQUESTED', 'REJECTED_BY_WORKER', 'WORKER_ASSIGNED'].includes(b.status) && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleOpenMatching(b)}
                                title="Run Worker Matching"
                              >
                                Match
                              </button>
                            )}

                            {/* Dispute resolution */}
                            {b.status === 'DISPUTED' && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setDisputeBooking(b)}
                                title="Resolve Customer Dispute"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Manage Workers */}
        {activeTab === 'workers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Worker Applications & Roster</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                  Review applications, approve pending workers, and monitor local tradespersons.
                </p>
              </div>
            </div>

            {/* Filter controls */}
            <div style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: 20,
              backgroundColor: '#ffffff',
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search worker name, email, skills, locality..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  style={{ paddingLeft: 36, paddingRight: 10, paddingBottom: 8, paddingTop: 8 }}
                />
                <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>

              <div style={{ minWidth: 180 }}>
                <select
                  className="form-select"
                  value={workerStatusFilter}
                  onChange={(e) => setWorkerStatusFilter(e.target.value)}
                  style={{ paddingBottom: 8, paddingTop: 8 }}
                >
                  <option value="ALL">All Statuses ({workers.length})</option>
                  <option value="PENDING_APPROVAL">Pending Approval ({workers.filter(w => w.status === 'PENDING_APPROVAL').length})</option>
                  <option value="APPROVED">Approved ({workers.filter(w => w.status === 'APPROVED').length})</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {/* Workers Table */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Contact</th>
                    <th>Skills / Trades</th>
                    <th>Experience</th>
                    <th>Locality & Pincode</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map(w => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                        {w.name}
                        {w.isAvailable ? (
                          <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 600 }}>• Online</span>
                        ) : (
                          <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--slate-400)' }}>• Offline</span>
                        )}
                      </td>
                      <td>
                        <div>{w.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{w.email}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(w.skills || []).map((s, idx) => (
                            <span key={idx} style={{ background: 'var(--teal-50)', color: 'var(--teal-800)', fontSize: '0.75rem', padding: '2px 6px', borderRadius: 4 }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{w.experienceYears} Years</td>
                      <td>{w.serviceArea} ({w.pincode})</td>
                      <td><StatusBadge status={w.status} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span style={{ fontWeight: 700 }}>{w.averageRating ? w.averageRating.toFixed(1) : 'New'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {w.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleApproveWorker(w.id)}
                                title="Approve Worker"
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUpdateWorkerStatus(w.id, 'REJECTED')}
                                title="Reject Application"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {w.status === 'APPROVED' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleUpdateWorkerStatus(w.id, 'SUSPENDED')}
                              title="Suspend Worker"
                              style={{ color: 'var(--rose-700)' }}
                            >
                              Suspend
                            </button>
                          )}

                          {w.status === 'SUSPENDED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateWorkerStatus(w.id, 'APPROVED')}
                              title="Reactivate Worker"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Manage Customers */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Registered Customers Directory</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                  Manage verified customer accounts, localities, and request histories.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 18, position: 'relative', maxWidth: 360 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by customer name, phone, email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
              <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address / Locality</th>
                    <th>Pincode</th>
                    <th>Total Requests</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.email}</td>
                      <td>{c.address}, {c.locality}</td>
                      <td>{c.pincode}</td>
                      <td>{c.totalBookings || 0}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: c.isActive !== false ? 'var(--primary-700)' : 'var(--rose-700)',
                          background: c.isActive !== false ? 'var(--primary-100)' : 'var(--rose-100)',
                          padding: '3px 8px',
                          borderRadius: 4
                        }}>
                          {c.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedCustomer(c)}
                            title="View Bookings History"
                          >
                            History
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleCustomerStatus(c.id)}
                            style={{ color: c.isActive !== false ? 'var(--rose-700)' : 'var(--primary-700)' }}
                          >
                            {c.isActive !== false ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Feedback & Disputes */}
        {activeTab === 'feedback' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Customer Feedback & Dispute Moderation</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                  Monitor ratings, resolve complaints, and enforce service quality standards.
                </p>
              </div>

              <div>
                <select
                  className="form-select"
                  value={feedbackRatingFilter}
                  onChange={(e) => setFeedbackRatingFilter(e.target.value)}
                  style={{ padding: '6px 12px' }}
                >
                  <option value="ALL">All Ratings ({feedbackList.length})</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars (Low)</option>
                  <option value="1">1 Star (Critical)</option>
                </select>
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--slate-400)' }}>
                <Star size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>No feedback matching filter criteria.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredFeedback.map(f => (
                  <div key={f.id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StarRating rating={f.rating} size={18} />
                          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{f.rating} / 5 Stars</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>• Booking {f.bookingId}</span>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: 4 }}>
                          Category: {f.categoryName}
                        </div>
                      </div>

                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ color: 'var(--slate-700)', fontSize: '0.925rem', fontStyle: 'italic', marginBottom: 14 }}>
                      "{f.review || 'No written text provided.'}"
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      fontSize: '0.85rem',
                      color: 'var(--slate-600)',
                      borderTop: '1px solid var(--slate-100)',
                      paddingTop: 12
                    }}>
                      <div>
                        Customer: <strong>{f.customerName}</strong> • Assigned Worker: <strong>{f.workerName}</strong>
                      </div>

                      {f.tags && f.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {f.tags.map((tag, idx) => (
                            <span key={idx} style={{ background: 'var(--slate-100)', padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: '0.75rem' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Ranked Candidate Matching Modal (Rule-Based Algorithm Demonstration) */}
      {matchingModalBooking && (
        <Modal
          isOpen={!!matchingModalBooking}
          onClose={() => setMatchingModalBooking(null)}
          title={`Algorithmic Worker Matching: ${matchingModalBooking.id}`}
          maxWidth={750}
        >
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
                {matchingModalBooking.categoryName} ({matchingModalBooking.locality}, Pincode: {matchingModalBooking.pincode})
              </span>
              <StatusBadge status={matchingModalBooking.status} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Scheduled for: <strong>{matchingModalBooking.preferredDate} ({matchingModalBooking.preferredTimeSlot})</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>
              Ranked Eligible Candidates ({matchingCandidates.length})
            </h4>

            {matchingCandidates.length > 0 && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAssignWorker(matchingModalBooking.id, matchingCandidates[0].workerId)}
              >
                ⚡ Auto-Assign Best Match (#{matchingCandidates[0].name})
              </button>
            )}
          </div>

          {loadingCandidates ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-500)' }}>
              Calculating transparent proximity, schedule, and experience rankings...
            </div>
          ) : matchingCandidates.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-500)' }}>
              <AlertTriangle size={36} color="var(--amber-600)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontWeight: 600 }}>No approved workers available matching this trade category & location.</p>
              <p style={{ fontSize: '0.85rem' }}>Request remains pending until qualified workers register or become available.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '420px', overflowY: 'auto' }}>
              {matchingCandidates.map((candidate, idx) => (
                <div
                  key={candidate.workerId}
                  className="card"
                  style={{
                    padding: '16px',
                    border: idx === 0 ? '2px solid var(--teal-500)' : '1px solid var(--slate-200)',
                    backgroundColor: idx === 0 ? '#f0fdfa' : '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? 'var(--teal-600)' : 'var(--slate-200)',
                          color: idx === 0 ? '#fff' : 'var(--slate-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                          {candidate.name}
                        </span>
                        {idx === 0 && (
                          <span style={{ background: 'var(--teal-600)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                            TOP MATCH
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: 2 }}>
                        {candidate.serviceArea} (Pincode: {candidate.pincode}) • {candidate.experienceYears} Years Exp
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--teal-700)' }}>
                        {candidate.score} / 100
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Matching Score</div>
                    </div>
                  </div>

                  {/* Transparent rule criteria explanation */}
                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: '0.775rem',
                    color: 'var(--slate-700)',
                    marginBottom: 12
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Score Breakdown:</div>
                    <ul style={{ paddingLeft: 16 }}>
                      {candidate.matchReasons.map((reason, rIdx) => (
                        <li key={rIdx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAssignWorker(matchingModalBooking.id, candidate.workerId)}
                    >
                      Assign this Worker
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Details Modal */}
      {detailsBooking && (
        <Modal
          isOpen={!!detailsBooking}
          onClose={() => setDetailsBooking(null)}
          title={`Booking Details: ${detailsBooking.id}`}
          maxWidth={640}
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{detailsBooking.categoryName}</span>
              <StatusBadge status={detailsBooking.status} />
            </div>
            <p style={{ color: 'var(--slate-700)', fontSize: '0.9rem' }}>{detailsBooking.description}</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            padding: '12px',
            background: 'var(--slate-50)',
            borderRadius: 8,
            fontSize: '0.85rem',
            marginBottom: 20
          }}>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Customer:</span>
              <div style={{ fontWeight: 600 }}>{detailsBooking.customerName} ({detailsBooking.customerPhone})</div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Address:</span>
              <div style={{ fontWeight: 600 }}>{detailsBooking.customerAddress}, {detailsBooking.locality}</div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Assigned Worker:</span>
              <div style={{ fontWeight: 600 }}>{detailsBooking.assignedWorkerName || 'None'}</div>
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', marginBottom: 12 }}>Audit Timeline</h4>
          <div className="timeline">
            {(detailsBooking.timeline || []).map((step, idx) => (
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
                      By: {step.by}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Customer Bookings History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Booking History for ${selectedCustomer.name}`}
          maxWidth={640}
        >
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
              Phone: {selectedCustomer.phone} • Email: {selectedCustomer.email} • Locality: {selectedCustomer.locality} ({selectedCustomer.pincode})
            </p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.filter(b => b.customerId === selectedCustomer.id).length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--slate-400)' }}>
                      No service requests made by this customer yet.
                    </td>
                  </tr>
                ) : (
                  bookings.filter(b => b.customerId === selectedCustomer.id).map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700 }}>{b.id}</td>
                      <td>{b.categoryName}</td>
                      <td>{b.preferredDate}</td>
                      <td>{b.assignedWorkerName || 'None'}</td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Dispute Resolution Modal */}
      {disputeBooking && (
        <Modal
          isOpen={!!disputeBooking}
          onClose={() => setDisputeBooking(null)}
          title={`Resolve Dispute: ${disputeBooking.id}`}
          maxWidth={500}
        >
          <form onSubmit={handleResolveDispute}>
            <div style={{ marginBottom: 14, padding: 12, background: 'var(--rose-50)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--rose-900)' }}>
              <strong>Customer Dispute Note:</strong> <br />
              {disputeBooking.disputeReason || 'No dispute details provided.'}
            </div>

            <div className="form-group">
              <label className="form-label">Administrator Resolution Remarks *</label>
              <textarea
                className="form-textarea"
                placeholder="State the agreed resolution (e.g. Worker returned to complete faucet washer replacement, customer satisfied)..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={4}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Confirm Dispute Resolution
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
