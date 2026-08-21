import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Brand Row */}
        <div className={styles.brandRow}>
          <Link href="/" className={styles.brandLink}>
            <Image
              src="/logo.png"
              alt="সাইমুম শিল্পীগোষ্ঠী"
              width={40}
              height={40}
              className={styles.logoImage}
            />
            <div className={styles.brandText}>
              <span className={styles.brandName}>সাইমুম শিল্পীগোষ্ঠী</span>
              <span className={styles.brandSub}>কেন্দ্রীয় সাংস্কৃতিক একাডেমি</span>
            </div>
          </Link>
        </div>

        <hr className={styles.rule} />

        {/* Columns */}
        <div className={styles.columns}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>বিভাগসমূহ</h4>
            <Link href="/departments" className={styles.colLink}>কিরাত ও তাজবীদ</Link>
            <Link href="/departments" className={styles.colLink}>কন্ঠ সংগীত</Link>
            <Link href="/departments" className={styles.colLink}>শিশু সংগীত (সাইমুম কিডস)</Link>
            <Link href="/departments" className={styles.colLink}>নাট্য অভিনয় ও থিয়েটার</Link>
            <Link href="/departments" className={styles.colLink}>আবৃত্তি ও উপস্থাপনা</Link>
            <Link href="/departments" className={styles.colLink}>চারুকলা ও ক্যালিগ্রাফি</Link>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>দ্রুত লিংক</h4>
            <Link href="/apply" className={styles.colLink}>ভর্তি আবেদন</Link>
            <Link href="/track" className={styles.colLink}>স্ট্যাটাস চেক</Link>
            <Link href="/branches" className={styles.colLink}>ক্যাম্পাস ও শাখা</Link>
            <Link href="/about" className={styles.colLink}>পরিচিতি ও ঐতিহ্য</Link>
            <a href="http://localhost:5173" target="_blank" rel="noreferrer" className={styles.colLinkAccent}>
              অ্যাডমিন প্যানেল ↗
            </a>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>কেন্দ্রীয় কার্যালয়</h4>
            <span className={styles.contactText}>মিজান টাওয়ার, মগবাজার</span>
            <span className={styles.contactText}>ঢাকা - ১২০৫, বাংলাদেশ</span>
            <span className={styles.contactText}>হোয়াটসঅ্যাপ: +৮৮০ ১৯৭০-৫৭৮২২০</span>
            <span className={styles.contactText}>ইমেইল: saimumoffice@gmail.com</span>
            <a href="https://saimum.org" target="_blank" rel="noopener noreferrer" className={styles.colLink}>
              ওয়েবসাইট: saimum.org ↗
            </a>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>অফিসিয়াল মিডিয়া</h4>
            <a href="https://www.youtube.com/@SaimumShilpigosthi" target="_blank" rel="noopener noreferrer" className={styles.colLink}>
              YouTube: @SaimumShilpigosthi ↗
            </a>
            <a href="https://www.youtube.com/@SaimumKIDS" target="_blank" rel="noopener noreferrer" className={styles.colLink}>
              YouTube: @SaimumKIDS ↗
            </a>
            <a href="https://www.facebook.com/SaimumShilpigosthiOfficial" target="_blank" rel="noopener noreferrer" className={styles.colLink}>
              Facebook: Saimum Official ↗
            </a>
          </div>
        </div>

        <hr className={styles.rule} />

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <span>© {new Date().getFullYear()} সাইমুম শিল্পীগোষ্ঠী ও কেন্দ্রীয় সাংস্কৃতিক একাডেমি</span>
          <span>সুস্থ সংস্কৃতির পথিকৃৎ — প্রতিষ্ঠা: ১ জানুয়ারি ১৯৭৮ (কবি মতিউর রহমান মল্লিক)</span>
        </div>
      </div>
    </footer>
  );
}
