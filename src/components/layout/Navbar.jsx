import React, { useState, useEffect } from 'react';
import { Menu, X } from "lucide-react";
import styles from './Navbar.module.scss';


const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      const sections = ['hero', 'about', 'courses', 'registration', 'consultation'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Giới thiệu', href: '#about' },
    { name: 'Khóa học', href: '#courses' },
    { name: 'Đăng ký học', href: '#registration' },
    { name: 'Tư vấn', href: '#consultation' },
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId.replace('#', ''));
    setMobileOpen(false); // đóng menu mobile khi chọn
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbar}>
        <a href="#hero" className={styles.logo} onClick={() => handleNavClick('hero')}>
          IELTS Center
        </a>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${activeSection === item.href.replace('#', '') ? styles.active : ''}`}
              onClick={() => handleNavClick(item.href)}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className={styles.actionButtons}>
          <a href="/login">
            <button className={styles.loginButton}>Đăng nhập</button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Content */}
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            <nav className={styles.mobileNav}>
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={styles.mobileNavItem}
                  onClick={() => handleNavClick(item.href)}
                >
                  {item.name}
                </a>
              ))}
              <a href="/login" className={styles.mobileNavItem}>
                Đăng nhập
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
