import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, Menu, X, Shield, ChevronDown, 
  ExternalLink, User, LogOut, LayoutDashboard 
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const toggleDropdown = (name) => {
    setDropdownOpen(dropdownOpen === name ? null : name);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(null);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-container">
      <div className="container nav-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMenus}>
          <div className="logo-icon-wrapper">
            <Shield className="logo-icon" size={24} />
          </div>
          <div className="logo-text">
            <span className="logo-title">RESPONSIBLE</span>
            <span className="logo-subtitle">INDIVIDUALS</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>

          {/* About Dropdown */}
          <div className="nav-dropdown-wrapper" onMouseEnter={() => toggleDropdown('about')} onMouseLeave={() => toggleDropdown(null)}>
            <button className={`nav-link dropdown-btn ${location.pathname.startsWith('/about') ? 'active' : ''}`}>
              About <ChevronDown size={14} />
            </button>
            {dropdownOpen === 'about' && (
              <div className="dropdown-menu">
                <Link to="/about" className="dropdown-item" onClick={closeMenus}>Our Story & Vision</Link>
                <Link to="/about#approach" className="dropdown-item" onClick={closeMenus}>8-Step Approach</Link>
                <Link to="/about#leadership" className="dropdown-item" onClick={closeMenus}>Leadership & Team</Link>
                <Link to="/partners" className="dropdown-item" onClick={closeMenus}>CSR & Partners</Link>
              </div>
            )}
          </div>

          <Link to="/projects" className={`nav-link ${isActive('/projects') ? 'active' : ''}`}>
            Our Work
          </Link>

          <Link to="/impact" className={`nav-link ${isActive('/impact') ? 'active' : ''}`}>
            Impact
          </Link>

          {/* Get Involved Dropdown */}
          <div className="nav-dropdown-wrapper" onMouseEnter={() => toggleDropdown('involved')} onMouseLeave={() => toggleDropdown(null)}>
            <button className={`nav-link dropdown-btn ${['/volunteer', '/donate', '/partners'].includes(location.pathname) ? 'active' : ''}`}>
              Get Involved <ChevronDown size={14} />
            </button>
            {dropdownOpen === 'involved' && (
              <div className="dropdown-menu">
                <Link to="/volunteer" className="dropdown-item" onClick={closeMenus}>Volunteer With Us</Link>
                <Link to="/donate" className="dropdown-item" onClick={closeMenus}>Make a Donation</Link>
                <Link to="/partners" className="dropdown-item" onClick={closeMenus}>Corporate / CSR Partnerships</Link>
                <Link to="/events" className="dropdown-item" onClick={closeMenus}>Events & Drives</Link>
              </div>
            )}
          </div>

          <Link to="/stories" className={`nav-link ${isActive('/stories') ? 'active' : ''}`}>
            Stories
          </Link>

          <Link to="/gallery" className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}>
            Gallery
          </Link>

          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
            Contact
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="nav-actions">
          {isAdmin && (
            <Link to="/admin-portal" className="admin-pill-link" title="Admin Portal">
              <LayoutDashboard size={16} />
              <span>Admin</span>
            </Link>
          )}

          {user ? (
            <div className="user-profile-menu">
              <span className="user-greeting">Hi, {user.first_name || 'User'}</span>
              <button onClick={logout} className="logout-icon-btn" title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">Sign In</Link>
          )}

          <Link to="/donate" className="btn btn-amber nav-donate-btn">
            <Heart size={16} fill="currentColor" />
            <span>Donate</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in">
          <div className="mobile-links">
            <Link to="/" className="mobile-nav-link" onClick={closeMenus}>Home</Link>
            <Link to="/about" className="mobile-nav-link" onClick={closeMenus}>About Us & Approach</Link>
            <Link to="/projects" className="mobile-nav-link" onClick={closeMenus}>Our Work & Projects</Link>
            <Link to="/impact" className="mobile-nav-link" onClick={closeMenus}>Impact Dashboard</Link>
            <Link to="/volunteer" className="mobile-nav-link" onClick={closeMenus}>Volunteer Opportunities</Link>
            <Link to="/events" className="mobile-nav-link" onClick={closeMenus}>Events & Drives</Link>
            <Link to="/stories" className="mobile-nav-link" onClick={closeMenus}>Stories of Change</Link>
            <Link to="/gallery" className="mobile-nav-link" onClick={closeMenus}>Photo Gallery</Link>
            <Link to="/partners" className="mobile-nav-link" onClick={closeMenus}>CSR & Partnerships</Link>
            <Link to="/careers" className="mobile-nav-link" onClick={closeMenus}>Careers</Link>
            <Link to="/contact" className="mobile-nav-link" onClick={closeMenus}>Contact Us</Link>
            
            <div className="mobile-auth-section">
              {isAdmin && (
                <Link to="/admin-portal" className="btn btn-secondary mobile-btn" onClick={closeMenus}>
                  <LayoutDashboard size={18} /> Admin Portal
                </Link>
              )}
              {user ? (
                <button onClick={() => { logout(); closeMenus(); }} className="btn btn-secondary mobile-btn">
                  <LogOut size={18} /> Sign Out ({user.email})
                </button>
              ) : (
                <Link to="/login" className="btn btn-secondary mobile-btn" onClick={closeMenus}>
                  <User size={18} /> Sign In
                </Link>
              )}
              <Link to="/donate" className="btn btn-amber mobile-btn" onClick={closeMenus}>
                <Heart size={18} fill="currentColor" /> Donate Now
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-subtle);
          transition: all var(--transition-fast);
        }
        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 76px;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .logo-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #0F4C3A 0%, #10B981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        .logo-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.15rem;
          color: var(--primary-900);
          letter-spacing: 0.04em;
          line-height: 1.1;
        }
        .logo-subtitle {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary-600);
          letter-spacing: 0.12em;
        }
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 1.5rem;
        }
        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex;
          }
        }
        .nav-link {
          font-size: 0.925rem;
          font-weight: 600;
          color: var(--slate-700);
          padding: 0.5rem 0.25rem;
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--primary-800);
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary-600);
          border-radius: var(--radius-pill);
        }
        .dropdown-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .nav-dropdown-wrapper {
          position: relative;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 230px;
          background: var(--white);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.5rem 0;
          z-index: 110;
          animation: fadeIn 0.2s ease-out;
        }
        .dropdown-item {
          display: block;
          padding: 0.6rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--slate-700);
          transition: background var(--transition-fast);
        }
        .dropdown-item:hover {
          background: var(--slate-50);
          color: var(--primary-800);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .admin-pill-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.8rem;
          background: #EEF2FF;
          color: #4F46E5;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .user-greeting {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--slate-700);
        }
        .logout-icon-btn {
          background: none;
          border: none;
          color: var(--slate-400);
          cursor: pointer;
          padding: 0.25rem;
          margin-left: 0.35rem;
        }
        .logout-icon-btn:hover {
          color: var(--accent-rose);
        }
        .login-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--slate-700);
        }
        .login-link:hover {
          color: var(--primary-800);
        }
        .nav-donate-btn {
          padding: 0.55rem 1.25rem;
          font-size: 0.9rem;
        }
        .mobile-toggle-btn {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          color: var(--slate-800);
          cursor: pointer;
        }
        @media (min-width: 1024px) {
          .mobile-toggle-btn {
            display: none;
          }
        }
        .mobile-drawer {
          background: var(--white);
          border-top: 1px solid var(--border-subtle);
          padding: 1.5rem;
          box-shadow: var(--shadow-xl);
          max-height: calc(100vh - 76px);
          overflow-y: auto;
        }
        .mobile-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mobile-nav-link {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--slate-800);
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--slate-100);
        }
        .mobile-auth-section {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mobile-btn {
          width: 100%;
        }
      `}</style>
    </header>
  );
}
