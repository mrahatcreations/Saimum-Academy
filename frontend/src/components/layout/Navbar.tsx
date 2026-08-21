'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn } from 'lucide-react';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'হোম' },
  { href: '/about', label: 'আমাদের সম্পর্কে' },
  { href: '/departments', label: 'বিভাগসমূহ' },
  { href: '/branches', label: 'ক্যাম্পাস ও শাখা' },
  { href: '/track', label: 'স্ট্যাটাস চেক' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      {/* Top Bar — Dark, Brand Identity */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.brandLink}>
            <Image
              src="/logo.png"
              alt="সাইমুম শিল্পীগোষ্ঠী"
              width={36}
              height={36}
              className={styles.logoImage}
            />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>সাইমুম শিল্পীগোষ্ঠী</span>
              <span className={styles.brandSub}>কেন্দ্রীয় সাংস্কৃতিক একাডেমি</span>
            </div>
          </Link>

          <Link href="http://localhost:5173" target="_blank" className={styles.topLoginLink}>
            <LogIn size={14} />
            <span>অ্যাডমিন লগইন</span>
          </Link>
        </div>
      </div>

      {/* Navigation Bar — Clean, White */}
      <nav className={styles.navBar}>
        <div className={styles.navBarInner}>
          <div className={styles.navLinks}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link href="/apply" className={styles.ctaButton}>
            ভর্তি আবেদন
          </Link>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="মেনু খুলুন"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href ? styles.mobileLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/apply" className={styles.mobileCta}>
            ভর্তি আবেদন করুন
          </Link>
        </div>
      )}
    </header>
  );
}
