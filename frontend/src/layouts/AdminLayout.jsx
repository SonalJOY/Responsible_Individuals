import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FolderKanban, HeartHandshake, 
  CreditCard, MessageSquare, ArrowLeft, LogOut, ShieldCheck 
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin-portal', icon: LayoutDashboard },
    { name: 'Volunteer Applications', path: '/admin-portal/volunteers', icon: HeartHandshake },
    { name: 'Financial Donations', path: '/admin-portal/donations', icon: CreditCard },
    { name: 'Contact & Inquiries', path: '/admin-portal/enquiries', icon: MessageSquare },
  ];

  return (
    <div className="admin-layout-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo-icon">
            <ShieldCheck size={24} color="#10B981" />
          </div>
          <div>
            <h2 className="admin-brand-title">RI ADMIN</h2>
            <span className="admin-brand-sub">Platform Operations</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item return-link">
            <ArrowLeft size={16} />
            <span>View Public Site</span>
          </Link>
          <button onClick={handleLogout} className="admin-nav-item logout-link">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-title">
            <span>Admin Console</span>
          </div>
          <div className="admin-user-pill">
            <span className="user-role-tag">Super Admin</span>
            <span className="user-email-text">{user?.email || 'admin@responsibleindividuals.org'}</span>
          </div>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </div>

      <style>{`
        .admin-layout-root {
          display: flex;
          min-height: 100vh;
          background: #090D16;
          color: #F8FAFC;
        }
        .admin-sidebar {
          width: 260px;
          background: #0F172A;
          border-right: 1px solid #1E293B;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .admin-brand {
          padding: 1.5rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid #1E293B;
        }
        .admin-brand-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.1;
        }
        .admin-brand-sub {
          font-size: 0.7rem;
          color: #10B981;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .admin-nav {
          padding: 1.25rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: #94A3B8;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-fast);
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #FFFFFF;
        }
        .admin-nav-item.active {
          background: #10B981;
          color: #042F1A;
          font-weight: 700;
        }
        .admin-sidebar-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid #1E293B;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .return-link {
          color: #38BDF8;
        }
        .logout-link:hover {
          color: #F87171;
        }
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .admin-header {
          height: 64px;
          background: #0F172A;
          border-bottom: 1px solid #1E293B;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .admin-header-title {
          font-size: 1rem;
          font-weight: 700;
          color: #FFFFFF;
        }
        .admin-user-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #1E293B;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-pill);
        }
        .user-role-tag {
          background: #10B981;
          color: #042F1A;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .user-email-text {
          font-size: 0.825rem;
          color: #CBD5E1;
        }
        .admin-page-content {
          padding: 2rem;
          flex: 1;
        }
      `}</style>
    </div>
  );
}
