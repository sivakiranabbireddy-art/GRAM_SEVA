import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { 
  CheckSquare, Clock, Star, DollarSign, User, ShieldCheck, 
  AlertTriangle, Phone, MapPin, CheckCircle2, XCircle, PlayCircle, 
  ToggleLeft, ToggleRight, RefreshCw, ArrowRight, MessageSquare, Wrench 
} from 'lucide-react';

export default function WorkerDashboard({ navTarget, onClearNavTarget }) {
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (navTarget && navTarget.tab) {
      setActiveTab(navTarget.tab);
      if (onClearNavTarget) onClearNavTarget();
    }
  }, [navTarget, onClearNavTarget]);
  const [tasks, setTasks] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable !== false);
  const [loading, setLoading] = useState(true);

  // Rejection Modal State
  const [rejectTaskId, setRejectTaskId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Completion Modal State
  const [completeTaskId, setCompleteTaskId] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Selected Task Modal
  const [selectedTask, setSelectedTask] = useState(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    serviceArea: user?.serviceArea || '',
    pincode: user?.pincode || '',
    experienceYears: user?.experienceYears || 3,
    description: user?.description || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.get('/worker/tasks');
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWorkerFeedback = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get(`/feedback/worker/${user.id}`);
      if (data.success && data.feedback) {
        setFeedback(data.feedback);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
    fetchWorkerFeedback();
  }, [fetchTasks, fetchWorkerFeedback]);

  const handleToggleAvailability = async () => {
    try {
      const nextState = !isAvailable;
      const res = await api.put('/worker/availability', { isAvailable: nextState });
      setIsAvailable(res.isAvailable);
      addToast(res.message || 'Availability updated', 'info');
      await refreshProfile();
    } catch (err) {
      addToast(err.message || 'Failed to toggle availability.', 'error');
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const res = await api.put(`/worker/tasks/${taskId}/accept`, {});
      addToast('Assignment accepted successfully! Please arrive on time.', 'success');
      fetchTasks();
    } catch (err) {
      addToast(err.message || 'Failed to accept task.', 'error');
    }
  };

  const handleRejectTask = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      addToast('Please specify a rejection reason for admin reassignment.', 'error');
      return;
    }
    try {
      await api.put(`/worker/tasks/${rejectTaskId}/reject`, { reason: rejectionReason });
      addToast('Assignment rejected. Admin notified for reassignment.', 'info');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchTasks();
    } catch (err) {
      addToast(err.message || 'Failed to reject task.', 'error');
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      await api.put(`/worker/tasks/${taskId}/start`, {});
      addToast('Task marked as In Progress. Safe working!', 'info');
      fetchTasks();
    } catch (err) {
      addToast(err.message || 'Failed to start task.', 'error');
    }
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/worker/tasks/${completeTaskId}/complete`, {
        completionNote: completionNote || 'Work successfully completed.'
      });
      addToast('Task marked as completed! Awaiting customer confirmation.', 'success');
      setShowCompleteModal(false);
      setCompletionNote('');
      fetchTasks();
    } catch (err) {
      addToast(err.message || 'Failed to mark task completed.', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/worker/profile', profileForm);
      await refreshProfile();
      addToast('Worker profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Group tasks
  const newAssignments = tasks.filter(t => t.status === 'WORKER_ASSIGNED');
  const activeTasks = tasks.filter(t => ['ACCEPTED', 'IN_PROGRESS', 'AWAITING_CONFIRMATION'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  const totalEarnings = completedTasks.reduce((sum, t) => sum + (t.priceEstimate || 0), 0);
  const avgRating = user?.averageRating || 0;

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="dashboard-main">
        {/* Top Header Row with Availability Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)' }}>
              Worker Desk: {user?.name}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: 2 }}>
              Trades: {Array.isArray(user?.skills) ? user.skills.join(', ') : 'Specialist'} • Zone: {user?.serviceArea} ({user?.pincode})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Availability Toggle Button */}
            <button
              onClick={handleToggleAvailability}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                backgroundColor: isAvailable ? 'var(--primary-50)' : 'var(--slate-100)',
                color: isAvailable ? 'var(--primary-800)' : 'var(--slate-600)',
                borderColor: isAvailable ? 'var(--primary-300)' : 'var(--slate-300)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}
              title="Click to toggle availability"
            >
              {isAvailable ? (
                <>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary-500)' }} />
                  <span>Available for Orders</span>
                </>
              ) : (
                <>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--slate-400)' }} />
                  <span>Marked Offline / Busy</span>
                </>
              )}
            </button>

            <button className="btn btn-secondary btn-sm" onClick={fetchTasks} title="Refresh tasks">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Approval Status Banner */}
        {user?.status === 'PENDING_APPROVAL' && (
          <div style={{
            backgroundColor: 'var(--amber-50)',
            border: '1px solid var(--amber-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14
          }}>
            <AlertTriangle size={24} color="var(--amber-700)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ color: 'var(--amber-900)', fontSize: '1rem', marginBottom: 4 }}>
                Worker Profile Status: PENDING_APPROVAL
              </h4>
              <p style={{ color: 'var(--amber-800)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Your registration application has been received and is currently under review by the GramSeva Platform Administrator. Once approved, local service assignments in your trade categories will appear on this dashboard.
              </p>
            </div>
          </div>
        )}

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
              <div className="card" style={{ borderLeft: '4px solid var(--amber-500)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  New Assignments
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber-700)', marginTop: 4 }}>
                  {newAssignments.length}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--teal-600)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  In-Progress Tasks
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--teal-700)', marginTop: 4 }}>
                  {activeTasks.length}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Completed Services
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: 4 }}>
                  {completedTasks.length}
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--indigo-500)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Total Earnings (Est.)
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--indigo-700)', marginTop: 4 }}>
                  ₹{totalEarnings}
                </div>
              </div>
            </div>

            {/* New Assignments Alert Section if any */}
            {newAssignments.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--amber-500)', animation: 'pulse 1.5s infinite' }} />
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--amber-900)' }}>
                    Action Required: New Service Assignments ({newAssignments.length})
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {newAssignments.map(t => (
                    <div key={t.id} className="card" style={{ border: '2px solid var(--amber-300)', backgroundColor: '#fffbeb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 800, color: 'var(--amber-800)', fontSize: '1.1rem' }}>{t.id}</span>
                          <span style={{ margin: '0 8px' }}>•</span>
                          <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{t.categoryName}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--teal-700)', fontSize: '1.1rem' }}>
                          ₹{t.priceEstimate}
                        </span>
                      </div>

                      <p style={{ color: 'var(--slate-700)', fontSize: '0.9rem', marginBottom: 12 }}>
                        {t.description}
                      </p>

                      <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: 16 }}>
                        📍 <strong>Location:</strong> {t.customerAddress}, {t.locality} ({t.pincode}) | 🕒 <strong>Schedule:</strong> {t.preferredDate} ({t.preferredTimeSlot})
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setRejectTaskId(t.id);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle size={16} /> Decline Assignment
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAcceptTask(t.id)}
                        >
                          <CheckCircle2 size={16} /> Accept & Confirm Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Tasks Preview */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Active In-Progress Tasks</h3>
              {activeTasks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--slate-400)' }}>
                  <CheckSquare size={40} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p>No active tasks at the moment.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {activeTasks.map(t => (
                    <div key={t.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 800, color: 'var(--teal-800)' }}>{t.id}</span>
                          <StatusBadge status={t.status} />
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--teal-700)' }}>₹{t.priceEstimate}</span>
                      </div>

                      <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginBottom: 6 }}>
                        {t.categoryName}: {t.description}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: 14 }}>
                        Customer: <strong>{t.customerName}</strong> ({t.customerPhone}) • {t.customerAddress}, {t.locality}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTask(t)}>
                          View Timeline
                        </button>

                        <div style={{ display: 'flex', gap: 10 }}>
                          {t.status === 'ACCEPTED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleStartTask(t.id)}
                            >
                              <PlayCircle size={16} /> Start Service Work
                            </button>
                          )}

                          {t.status === 'IN_PROGRESS' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ background: 'var(--primary-600)' }}
                              onClick={() => {
                                setCompleteTaskId(t.id);
                                setShowCompleteModal(true);
                              }}
                            >
                              <CheckCircle2 size={16} /> Mark as Completed
                            </button>
                          )}

                          {t.status === 'AWAITING_CONFIRMATION' && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--amber-700)', fontWeight: 600 }}>
                              Waiting for customer confirmation
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: New Assignments */}
        {activeTab === 'new-assignments' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>New Service Assignments</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: 20 }}>
              Orders assigned to you by GramSeva Admin based on your trade skills and locality.
            </p>

            {newAssignments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--slate-400)' }}>
                <Clock size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>No pending assignments awaiting response.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {newAssignments.map(t => (
                  <div key={t.id} className="card" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--teal-800)' }}>{t.id}</span>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)', marginTop: 2 }}>
                          {t.categoryName}
                        </div>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--teal-700)' }}>
                        ₹{t.priceEstimate}
                      </div>
                    </div>

                    <p style={{ color: 'var(--slate-700)', fontSize: '0.9rem', marginBottom: 14 }}>
                      {t.description}
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
                        <span style={{ color: 'var(--slate-500)' }}>Customer:</span>
                        <div style={{ fontWeight: 600 }}>{t.customerName} ({t.customerPhone})</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-500)' }}>Address:</span>
                        <div style={{ fontWeight: 600 }}>{t.customerAddress}, {t.locality} ({t.pincode})</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-500)' }}>Scheduled Slot:</span>
                        <div style={{ fontWeight: 600 }}>{t.preferredDate} ({t.preferredTimeSlot})</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setRejectTaskId(t.id);
                          setShowRejectModal(true);
                        }}
                      >
                        <XCircle size={16} /> Decline Assignment
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAcceptTask(t.id)}
                      >
                        <CheckCircle2 size={16} /> Accept Assignment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: In-Progress Active Tasks */}
        {activeTab === 'active-tasks' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Ongoing & Active Tasks</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: 20 }}>
              Tasks currently being performed or awaiting customer verification.
            </p>

            {activeTasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--slate-400)' }}>
                <CheckSquare size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>No active tasks in progress.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeTasks.map(t => (
                  <div key={t.id} className="card" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--teal-800)' }}>{t.id}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal-700)' }}>
                        ₹{t.priceEstimate}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)', marginBottom: 6 }}>
                      {t.categoryName}: {t.description}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: 16 }}>
                      📍 <strong>Address:</strong> {t.customerAddress}, {t.locality} | 📞 <strong>Customer:</strong> {t.customerName} ({t.customerPhone})
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTask(t)}>
                        View Full Timeline
                      </button>

                      {t.status === 'ACCEPTED' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStartTask(t.id)}>
                          <PlayCircle size={16} /> Mark Started & In Progress
                        </button>
                      )}

                      {t.status === 'IN_PROGRESS' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ background: 'var(--primary-600)' }}
                          onClick={() => {
                            setCompleteTaskId(t.id);
                            setShowCompleteModal(true);
                          }}
                        >
                          <CheckCircle2 size={16} /> Mark as Completed
                        </button>
                      )}

                      {t.status === 'AWAITING_CONFIRMATION' && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--amber-700)', fontWeight: 600 }}>
                          Work submitted • Waiting for customer confirmation
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Completed Tasks History */}
        {activeTab === 'completed' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Completed Tasks & Work History</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: 20 }}>
              All successfully executed and customer-verified service orders.
            </p>

            {completedTasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--slate-400)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>No completed tasks yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Category</th>
                      <th>Customer</th>
                      <th>Locality</th>
                      <th>Date</th>
                      <th>Earnings</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTasks.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, color: 'var(--teal-700)' }}>{t.id}</td>
                        <td>{t.categoryName}</td>
                        <td>{t.customerName}</td>
                        <td>{t.locality}</td>
                        <td>{t.preferredDate}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary-700)' }}>₹{t.priceEstimate}</td>
                        <td><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Ratings & Earnings */}
        {activeTab === 'earnings' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Earnings & Customer Praise</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: 24 }}>
              Track your cumulative earnings and verified reviews from village households.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              marginBottom: 32
            }}>
              <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                  <Star size={32} fill="#f59e0b" color="#f59e0b" />
                  <span>{avgRating ? avgRating.toFixed(1) : '4.8'}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: 4 }}>
                  Average Rating ({feedback.length} Customer Reviews)
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                  ₹{totalEarnings}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: 4 }}>
                  Total Earnings from Verified Tasks
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--teal-700)' }}>
                  {completedTasks.length}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: 4 }}>
                  Successfully Delivered Bookings
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Reviews & Ratings Received</h3>
            {feedback.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                <Star size={40} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p>No customer reviews logged yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {feedback.map(f => (
                  <div key={f.id} className="card" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarRating rating={f.rating} size={16} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{f.rating}/5 Stars</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ color: 'var(--slate-700)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: 10 }}>
                      "{f.review || 'No written comments provided.'}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      <span>From: <strong>{f.customerName}</strong> ({f.categoryName})</span>
                      {f.tags && f.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {f.tags.map((t, idx) => (
                            <span key={idx} style={{ background: 'var(--slate-100)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {t}
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

        {/* Tab 6: Profile & Skills */}
        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Worker Profile & Service Details</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: 24 }}>
              Update your service area and trade experience.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Approved Trade Skills (Contact Admin to Alter Core Trades)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(Array.isArray(user?.skills) ? user.skills : []).map(s => (
                    <span key={s} style={{
                      backgroundColor: 'var(--teal-50)',
                      color: 'var(--teal-800)',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      border: '1px solid var(--teal-200)'
                    }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Service Area / Locality</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.serviceArea}
                    onChange={(e) => setProfileForm({ ...profileForm, serviceArea: e.target.value })}
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

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  className="form-input"
                  value={profileForm.experienceYears}
                  onChange={(e) => setProfileForm({ ...profileForm, experienceYears: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Bio</label>
                <textarea
                  className="form-textarea"
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: 12 }}
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Task Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Decline Assignment"
        maxWidth={460}
      >
        <form onSubmit={handleRejectTask}>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginBottom: 16 }}>
            Please state why you are unable to fulfill this task. The GramSeva administrator will reassign it to another candidate.
          </p>

          <div className="form-group">
            <label className="form-label">Reason for Rejection *</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Schedule clash with prior client, emergency travel, out of tools..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
            Confirm Decline & Notify Admin
          </button>
        </form>
      </Modal>

      {/* Mark Completed Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Mark Task as Completed"
        maxWidth={500}
      >
        <form onSubmit={handleCompleteTask}>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginBottom: 16 }}>
            The customer will be notified to inspect your completed work and confirm fulfillment.
          </p>

          <div className="form-group">
            <label className="form-label">Completion Notes / Materials Replaced</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Replaced faulty MCB switch, inspected wiring, tested working fan..."
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              rows={3}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <CheckCircle2 size={16} /> Submit Completion to Customer
          </button>
        </form>
      </Modal>

      {/* Selected Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Task Timeline: ${selectedTask.id}`}
          maxWidth={600}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedTask.categoryName}</span>
              <StatusBadge status={selectedTask.status} />
            </div>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>{selectedTask.description}</p>
          </div>

          <div className="timeline">
            {(selectedTask.timeline || []).map((step, idx) => (
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
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
