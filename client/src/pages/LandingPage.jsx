import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Zap, Droplet, Hammer, Sparkles, Wrench, Paintbrush, Trees, HeartHandshake, 
  CheckCircle2, ArrowRight, ShieldCheck, Clock, Users, Star, Award, 
  MapPin, PhoneCall, ChevronRight, HelpCircle 
} from 'lucide-react';

const CATEGORY_ICON_MAP = {
  cat_electrical: Zap,
  cat_plumbing: Droplet,
  cat_carpentry: Hammer,
  cat_cleaning: Sparkles,
  cat_appliance: Wrench,
  cat_painting: Paintbrush,
  cat_gardening: Trees,
  cat_domestic: HeartHandshake
};

export default function LandingPage({ setActivePage }) {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 24,
    totalWorkers: 12,
    completedBookings: 86,
    avgSatisfaction: '4.8 / 5'
  });

  useEffect(() => {
    // Load active categories from API
    api.get('/categories')
      .then(res => {
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* 1. Hero Section */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f0fdfa 50%, #ffffff 100%)',
        padding: '72px 0 80px',
        borderBottom: '1px solid var(--slate-200)',
        overflow: 'hidden'
      }}>
        {/* Decorative blur circles */}
        <div style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(20, 184, 166, 0.12)',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.12)',
          filter: 'blur(50px)'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
            {/* Project Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(13, 148, 136, 0.1)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              color: 'var(--teal-800)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: 20
            }}>
              <Award size={16} color="var(--teal-600)" />
              <span>CSI Internship Platform: Bridging Rural & Semi-Urban Service Access</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.3rem, 5vw, 3.8rem)',
              fontWeight: 800,
              color: 'var(--slate-900)',
              letterSpacing: '-0.03em',
              marginBottom: 20,
              lineHeight: 1.15
            }}>
              Reliable Local Services, <br />
              <span style={{
                background: 'linear-gradient(135deg, var(--teal-600) 0%, var(--primary-600) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Right at Your Doorstep.
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--slate-600)',
              lineHeight: 1.6,
              maxWidth: 680,
              margin: '0 auto 36px'
            }}>
              GramSeva connects rural and semi-urban households with verified, skilled neighborhood professionals. No middlemen, transparent matching, and tracked service fulfillment.
            </p>

            {/* Main CTAs */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap'
            }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setActivePage('customer-register')}
                style={{ minWidth: 200 }}
              >
                <span>Book a Service</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn btn-secondary btn-lg"
                onClick={() => setActivePage('worker-register')}
                style={{ minWidth: 200 }}
              >
                <span>Join as a Worker</span>
                <ShieldCheck size={18} color="var(--teal-600)" />
              </button>
            </div>

            {/* Quick trust metrics */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 28,
              marginTop: 48,
              flexWrap: 'wrap',
              fontSize: '0.875rem',
              color: 'var(--slate-500)',
              fontWeight: 600
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--primary-600)" />
                <span>Verified Skilled Workers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--primary-600)" />
                <span>Transparent Matching Score</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--primary-600)" />
                <span>Customer Verified Completion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Statement & GramSeva Solution Section */}
      <section style={{ padding: '72px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
            alignItems: 'center'
          }}>
            <div style={{
              padding: 36,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--slate-50)',
              border: '1px solid var(--slate-200)'
            }}>
              <div style={{
                color: 'var(--rose-600)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8
              }}>
                The Community Challenge
              </div>
              <h3 style={{ fontSize: '1.65rem', color: 'var(--slate-900)', marginBottom: 14 }}>
                Unorganized Local Services in Rural & Semi-Urban Clusters
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 16 }}>
                In tier-2/tier-3 towns and rural villages, finding skilled technicians (electricians, plumbers, carpenters) relies strictly on word-of-mouth. Customers face unpredictable pricing, delayed responses, and zero accountability.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: 'var(--rose-500)', fontWeight: 'bold' }}>✕</span>
                  <span>Unverified technicians and lack of background checks</span>
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: 'var(--rose-500)', fontWeight: 'bold' }}>✕</span>
                  <span>Skilled village artisans struggle with steady employment</span>
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: 'var(--rose-500)', fontWeight: 'bold' }}>✕</span>
                  <span>No recourse or dispute mechanism for substandard work</span>
                </li>
              </ul>
            </div>

            <div style={{
              padding: 36,
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--teal-50) 0%, var(--primary-50) 100%)',
              border: '1px solid var(--teal-200)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                color: 'var(--teal-700)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8
              }}>
                The GramSeva Solution
              </div>
              <h3 style={{ fontSize: '1.65rem', color: 'var(--teal-950)', marginBottom: 14 }}>
                A Transparent, Digitally Managed Community Platform
              </h3>
              <p style={{ color: 'var(--slate-700)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 16 }}>
                GramSeva introduces structured digital accountability. We empower local service providers with a digital identity, while providing residents with verified technicians, rule-based matching, and safe confirmation.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem', color: 'var(--slate-800)' }}>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="var(--teal-600)" />
                  <span>Admin approval for every registered worker before assignment</span>
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="var(--teal-600)" />
                  <span>Algorithmic proximity and schedule-conflict checking</span>
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="var(--teal-600)" />
                  <span>Transparent timeline tracking with customer feedback loop</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Service Categories Section */}
      <section id="services" style={{ padding: '72px 0', backgroundColor: 'var(--slate-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 12 }}>Available Service Categories</h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
              Select a specialized category to find certified local workers ready to help with your domestic needs.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 24
          }}>
            {categories.map((cat) => {
              const IconComponent = CATEGORY_ICON_MAP[cat.id] || Wrench;
              return (
                <div
                  key={cat.id}
                  className="card card-interactive"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActivePage('customer-register')}
                >
                  <div>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, var(--teal-50) 0%, var(--teal-100) 100%)',
                      color: 'var(--teal-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                      border: '1px solid var(--teal-200)'
                    }}>
                      <IconComponent size={26} strokeWidth={2.2} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--slate-900)' }}>
                      {cat.name}
                    </h3>
                    <p style={{ color: 'var(--slate-600)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 16 }}>
                      {cat.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid var(--slate-100)'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>
                      Est. from ₹{cat.basePriceEstimate}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--teal-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Book <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works Step-by-Step Workflow */}
      <section id="workflow" style={{ padding: '72px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <span style={{
              color: 'var(--teal-600)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Seamless End-to-End Execution
            </span>
            <h2 style={{ fontSize: '2.2rem', marginTop: 6, marginBottom: 12 }}>How GramSeva Works</h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
              Four structured phases from initial problem reporting to verified completion and community rating.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            position: 'relative'
          }}>
            {[
              {
                step: '01',
                title: 'Request a Service',
                desc: 'Customer selects a category, describes the issue, chooses preferred date/time slot, and provides locality and address.'
              },
              {
                step: '02',
                title: 'Rule-Based Matching',
                desc: 'Backend algorithm evaluates approved workers on skill, real-time availability, schedule conflict, and pincode proximity score.'
              },
              {
                step: '03',
                title: 'Worker Assignment & Work',
                desc: 'Admin assigns candidate. Worker accepts task, arrives at the doorstep, starts task, and marks completion with notes.'
              },
              {
                step: '04',
                title: 'Inspection & Feedback',
                desc: 'Customer reviews service, confirms completion, releases payment/credit, and rates punctuality and craftsmanship.'
              }
            ].map((st, i) => (
              <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute',
                  top: 14,
                  right: 18,
                  fontSize: '2.6rem',
                  fontWeight: 900,
                  fontFamily: 'Outfit',
                  color: 'var(--slate-100)',
                  lineHeight: 1
                }}>
                  {st.step}
                </div>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--teal-600)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginBottom: 16
                }}>
                  {st.step}
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: 10, color: 'var(--slate-900)' }}>
                  {st.title}
                </h3>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Benefits for Customers & Workers */}
      <section style={{ padding: '72px 0', backgroundColor: 'var(--teal-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 12 }}>Empowering the Entire Community</h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
              Built to foster mutual trust, financial growth for local artisans, and hassle-free services for families.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32
          }}>
            {/* For Customers */}
            <div className="card" style={{ borderLeft: '6px solid var(--teal-600)' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--teal-900)', marginBottom: 16 }}>
                For Rural & Town Residents
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.925rem' }}>
                <li style={{ display: 'flex', gap: 12 }}>
                  <CheckCircle2 size={20} color="var(--teal-600)" style={{ flexShrink: 0 }} />
                  <span><strong>Verified Identities:</strong> Every worker is vetted and approved by GramSeva administration before taking tasks.</span>
                </li>
                <li style={{ display: 'flex', gap: 12 }}>
                  <CheckCircle2 size={20} color="var(--teal-600)" style={{ flexShrink: 0 }} />
                  <span><strong>Fair Price Estimations:</strong> Clear initial base estimates prevent unfair inflation.</span>
                </li>
                <li style={{ display: 'flex', gap: 12 }}>
                  <CheckCircle2 size={20} color="var(--teal-600)" style={{ flexShrink: 0 }} />
                  <span><strong>Safety & Grievance Redressal:</strong> Dedicated dispute raising and administrative oversight on unresolved problems.</span>
                </li>
              </ul>
            </div>

            {/* For Workers */}
            <div className="card" style={{ borderLeft: '6px solid var(--primary-600)' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-900)', marginBottom: 16 }}>
                For Local Workers & Artisans
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.925rem' }}>
                <li style={{ display: 'flex', gap: 12 }}>
                  <CheckCircle2 size={20} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                  <span><strong>Steady Local Demand:</strong> Regular service orders within your own pincode and neighboring localities.</span>
                </li>
                <li style={{ display: 'flex', gap: 12 }}>
                  <CheckCircle2 size={20} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                  <span><strong>Work on Your Terms:</strong> Single-click availability toggle to indicate when you are free or busy.</span>
                </li>
                <li style={{ display: 'flex', gap: 12 }}>
                  <CheckCircle2 size={20} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                  <span><strong>Reputation Building:</strong> Earn verified star ratings and customer praise to secure higher-paying assignments.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section (Identified Sample/Demo Data) */}
      <section style={{ padding: '72px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--amber-100)',
              color: 'var(--amber-800)',
              padding: '4px 12px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: 8
            }}>
              DEMONSTRATION FEEDBACK
            </span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 10 }}>What Community Members Say</h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Real reviews submitted through GramSeva's verified booking workflow.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {[
              {
                name: 'Ramesh Kumar',
                role: 'Resident, Shanti Nagar',
                stars: 5,
                text: 'Suresh arrived right on time and fixed our main distribution board that had short-circuited. Very courteous, took safety precautions, and charged exactly the estimated cost.',
                service: 'Electrical Services'
              },
              {
                name: 'Priya Sharma',
                role: 'Resident, Gandhi Chowk',
                stars: 5,
                text: 'Master carpenter Anil repaired our wooden balcony door latch that was jammed for weeks. Smooth communication and zero hassle through the GramSeva portal.',
                service: 'Carpentry Services'
              },
              {
                name: 'Suresh Patil',
                role: 'Verified Electrician (6 yrs exp)',
                stars: 5,
                text: 'As an electrician in Shanti Nagar, GramSeva provides consistent assignments without paying commissions to middlemen. The admin assignment system is fair and prompt.',
                service: 'Worker Testimony'
              }
            ].map((t, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[...Array(t.stars)].map((_, s) => (
                      <Star key={s} size={16} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ color: 'var(--slate-700)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 16 }}>
                    "{t.text}"
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-100)', paddingTop: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{t.role}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'var(--teal-50)', color: 'var(--teal-800)', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                    {t.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Academic & CSI Internship Context Banner */}
      <section id="about" style={{
        padding: '56px 0',
        background: 'linear-gradient(135deg, var(--slate-900) 0%, #1e293b 100%)',
        color: '#ffffff'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24
          }}>
            <div style={{ maxWidth: 650 }}>
              <div style={{
                color: 'var(--teal-400)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8
              }}>
                College Community Service Internship (CSI)
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: 10, color: 'white' }}>
                Project Presentation & Demonstration Architecture
              </h3>
              <p style={{ color: 'var(--slate-300)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Developed as a working community solution for project evaluation. Features a Node/Express persistence engine using atomic JSON data management, genuine transparent candidate ranking, role-based authorization, and email OTP verification.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <button
                className="btn btn-primary"
                onClick={() => setActivePage('admin-login')}
                style={{ background: 'var(--teal-500)' }}
              >
                <span>Judge / Admin Portal</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
