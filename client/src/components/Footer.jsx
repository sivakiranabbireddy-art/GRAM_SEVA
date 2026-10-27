import React from 'react';
import { Shield, Heart, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer style={{
      backgroundColor: 'var(--slate-900)',
      color: 'var(--slate-300)',
      padding: '56px 0 28px',
      borderTop: '4px solid var(--teal-600)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 40,
          marginBottom: 48
        }}>
          {/* Column 1: Project Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--teal-500) 0%, var(--primary-500) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                🌾
              </div>
              <span style={{
                fontFamily: 'Outfit',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#ffffff'
              }}>GramSeva</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--slate-400)', marginBottom: 16 }}>
              A Digital Platform for Accessible Local Services, built as an end-to-end community technology system to bridge rural/semi-urban households with verified, skilled service workers.
            </p>
            <div style={{
              display: 'inline-block',
              background: 'rgba(13, 148, 136, 0.15)',
              border: '1px solid rgba(13, 148, 136, 0.4)',
              color: 'var(--teal-300)',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Community Service Internship (CSI) Project
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: 18 }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem' }}>
              <li>
                <button
                  onClick={() => setActivePage('landing')}
                  style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--slate-400)'}
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('customer-login')}
                  style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--slate-400)'}
                >
                  Customer Service Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('worker-login')}
                  style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--slate-400)'}
                >
                  Worker Registration & Tasks
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('admin-login')}
                  style={{ background: 'none', border: 'none', color: 'var(--teal-400)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Shield size={14} />
                  <span>Admin Control Center</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Local Services */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: 18 }}>Popular Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--slate-400)' }}>
              <li>⚡ Electrical Services & Switchboards</li>
              <li>🚰 Plumbing & Leakage Remediation</li>
              <li>🪚 Carpentry & Door Lock Repair</li>
              <li>✨ Festive & Deep House Cleaning</li>
              <li>🔧 Home Appliance Diagnostics</li>
              <li>🎨 Interior & Exterior Painting</li>
            </ul>
          </div>

          {/* Column 4: Contact & Project Info */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: 18 }}>Community Helpdesk</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.875rem', color: 'var(--slate-400)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={16} color="var(--teal-400)" />
                <span>Local Gram Panchayat & Ward Service Zone</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} color="var(--teal-400)" />
                <span>support@gramseva.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} color="var(--teal-400)" />
                <span>Toll-Free Helpline: 1800-GRAM-SEVA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--slate-800)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: '0.8rem',
          color: 'var(--slate-500)'
        }}>
          <div>
            © 2026 GramSeva Platform. Developed for Academic & CSI Internship Demonstration.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Zero External Cloud DB Required</span>
            <span>•</span>
            <span>JSON Safe File Persistence</span>
            <span>•</span>
            <span>Bcrypt + JWT Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
