import React, { useState } from 'react';
import { Button, Space, Drawer } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import './navbar.scss';

interface NavItem {
  key: string;
  label: string;
  href: string;
}

const Navbar: React.FC = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const navItems: NavItem[] = [
    { key: 'home', label: 'Home', href: '#' },
    { key: 'about', label: 'About us', href: '#' },
    { key: 'help', label: 'Help', href: '#' }
  ];

  const showMobileMenu = () => {
    setMobileMenuVisible(true);
  };

  const hideMobileMenu = () => {
    setMobileMenuVisible(false);
  };

  const handleNavClick = (href: string) => {
    // Handle navigation
    console.log('Navigate to:', href);
    hideMobileMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#ff4d4f"/>
              <path d="M12 10L20 16L12 22V10Z" fill="white"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="brand-name">Community</span>
            <span className="brand-badge">Views</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="navbar-auth desktop-auth">
          <Space size="middle">
            <Button 
              className="login-btn"
              onClick={() => console.log('Login clicked')}
            >
              Login
            </Button>
            <Button 
              type="primary" 
              className="signup-btn"
              onClick={() => console.log('Sign Up clicked')}
            >
              Sign Up
            </Button>
          </Space>
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-trigger">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={showMobileMenu}
            className="menu-button"
          />
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <div className="mobile-drawer-header">
            <div className="navbar-logo">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#ff4d4f"/>
                  <path d="M12 10L20 16L12 22V10Z" fill="white"/>
                </svg>
              </div>
              <div className="logo-text">
                <span className="brand-name">Community</span>
                <span className="brand-badge">Views</span>
              </div>
            </div>
          </div>
        }
        placement="right"
        onClose={hideMobileMenu}
        open={mobileMenuVisible}
        className="mobile-drawer"
        width={280}
        closeIcon={<CloseOutlined />}
      >
        <div className="mobile-nav-content">
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="mobile-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
          
          <div className="mobile-auth-buttons">
            <Button 
              block 
              className="mobile-login-btn"
              onClick={() => {
                console.log('Login clicked');
                hideMobileMenu();
              }}
            >
              Login
            </Button>
            <Button 
              block 
              type="primary" 
              className="mobile-signup-btn"
              onClick={() => {
                console.log('Sign Up clicked');
                hideMobileMenu();
              }}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbar;