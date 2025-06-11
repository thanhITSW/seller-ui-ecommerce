import React, { useState, useEffect } from 'react';
import { Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import '../styles/navBar.scss';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about-us', label: 'About Us' },
    { path: '/help', label: 'Help' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="brand-name">UseAI</span>
            <span className="brand-badge">Beta</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          <div className="navbar-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="desktop-auth navbar-auth">
          <Button className="login-btn">Login</Button>
          <Button type="primary" className="signup-btn">
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="mobile-menu-trigger">
          <Button
            className="menu-button"
            icon={<MenuOutlined />}
            onClick={() => setIsMobileMenuOpen(true)}
          />
        </div>

        {/* Mobile Menu Drawer */}
        <Drawer
          className="mobile-drawer"
          placement="right"
          onClose={() => setIsMobileMenuOpen(false)}
          open={isMobileMenuOpen}
          title={
            <div className="mobile-drawer-header">
              <Link to="/" className="navbar-logo">
                <div className="logo-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="logo-text">
                  <span className="brand-name">UseAI</span>
                  <span className="brand-badge">Beta</span>
                </div>
              </Link>
            </div>
          }
        >
          <div className="mobile-nav-content">
            <div className="mobile-nav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mobile-auth-buttons">
              <Button block className="mobile-login-btn">
                Login
              </Button>
              <Button block type="primary" className="mobile-signup-btn">
                Sign Up
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar; 