import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, Menu, X, ChevronDown, 
  User, LogOut, LayoutDashboard 
} from 'lucide-react';
import riLogo from '../../assets/ri-logo.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (name) => {
    setDropdownOpen(dropdownOpen === name ? null : name);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(null);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`navbar-container navbar-entrance ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        {/* Brand Logo with Transparent Background Official Emblem */}
        <Link to="/" className="brand-logo" onClick={closeMenus}>
          <div className="logo-image-wrapper">
            <img 
              src={riLogo} 
              alt="Responsible Individuals Logo" 
              className="navbar-ri-logo" 
            />
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
            <button className={`nav-link dropdown-btn ${['/volunteer', '/donate', '/partners', '/events'].includes(location.pathname) ? 'active' : ''}`}>
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
              <LayoutDashboard size={15} />
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

          <Link to="/donate" className="btn-nav-donate">
            <Heart size={15} fill="currentColor" />
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
              <Link to="/donate" className="btn-nav-donate mobile-btn-donate" onClick={closeMenus}>
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
          background: rgba(253, 251, 247, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border-subtle);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Subtle Entrance Animation on Load */
        .navbar-entrance {
          animation: navSlideDown 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes navSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar-container.scrolled {
          background: rgba(253, 251, 247, 0.98);
          box-shadow: 0 8px 24px rgba(8, 41, 31, 0.06);
          border-bottom-color: rgba(232, 226, 214, 0.9);
        }
        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 78px;
          transition: height 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .navbar-container.scrolled .nav-inner {
          height: 66px;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          text-decoration: none;
        }
        .logo-image-wrapper {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 8px rgba(16, 185, 129, 0.15));
        }
        .navbar-ri-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform var(--transition-fast);
        }
        .brand-logo:hover .navbar-ri-logo {
          transform: scale(1.06);
        }
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        .logo-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--charcoal-900);
          letter-spacing: 0.04em;
          line-height: 1.1;
        }
        .logo-subtitle {
          font-size: 0.7rem;
          font-weight: 700;
          color: #059669;
          letter-spacing: 0.12em;
        }
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 1.65rem;
        }
        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex;
          }
        }
        .nav-link {
          font-size: 0.925rem;
          font-weight: 600;
          color: var(--charcoal-700);
          padding: 0.5rem 0.25rem;
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .nav-link:hover, .nav-link.active {
          color: #059669;
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #10B981;
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
          width: 235px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          box-shadow: 0 16px 36px rgba(8, 41, 31, 0.12);
          padding: 0.5rem 0;
          z-index: 110;
          animation: fadeIn 0.2s ease-out;
        }
        .dropdown-item {
          display: block;
          padding: 0.65rem 1.35rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--charcoal-700);
          transition: background var(--transition-fast);
        }
        .dropdown-item:hover {
          background: var(--cream-100);
          color: #059669;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }
        .admin-pill-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.8rem;
          background: #EEF2FF;
          color: #4F46E5;
          border-radius: var(--radius-pill);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .user-greeting {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--charcoal-800);
        }
        .logout-icon-btn {
          background: none;
          border: none;
          color: var(--text-muted);
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
          color: var(--charcoal-800);
        }
        .login-link:hover {
          color: #059669;
        }
        .btn-nav-donate {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #10B981;
          color: #042F1A;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.55rem 1.35rem;
          border-radius: var(--radius-pill);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
          transition: all var(--transition-fast);
        }
        .btn-nav-donate:hover {
          background: #059669;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
        }
        .mobile-toggle-btn {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          color: var(--charcoal-900);
          cursor: pointer;
        }
        @media (min-width: 1024px) {
          .mobile-toggle-btn {
            display: none;
          }
        }
        .mobile-drawer {
          background: #FFFFFF;
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
          color: var(--charcoal-900);
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--cream-200);
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
        .mobile-btn-donate {
          display: flex;
          justify-content: center;
          padding: 0.85rem;
        }
      `}</style>
    </header>
  );
}
