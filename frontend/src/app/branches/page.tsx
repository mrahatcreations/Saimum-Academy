import React from 'react';
import Link from 'next/link';
import styles from './branches.module.css';

export const metadata = {
  title: 'ক্যাম্পাস ও শাখাসমূহ | Campuses & Branches — Saimum Central Academy',
  description: 'সাইমুম কেন্দ্রীয় একাডেমি ঢাকা সেন্ট্রাল ক্যাম্পাস, মিরপুর ব্রাঞ্চ ও গ্লোবাল অনলাইন ব্রাঞ্চের তথ্য ও যোগাযোগ।'
};

export const revalidate = 0;

export default async function BranchesPage() {

  const campusDetails = [
    {
      name: 'ঢাকা কেন্দ্রীয় ক্যাম্পাস ও প্রধান কার্যালয়',
      code: 'DHK-CENTRAL',
      type: 'সেন্ট্রাল প্রধান ক্যাম্পাস (ফিজিক্যাল)',
      image: '/images/saimum_orchestra.jpg',
      address: 'মিজান টাওয়ার, মগবাজার, ঢাকা - ১২০৫, বাংলাদেশ',
      phone: '+৮৮০ ১৯৭০-৫৭৮২২০',
      email: 'saimumoffice@gmail.com',
      schedules: 'শুক্রবার ও শনিবার: সকাল ০৯:০০ - সন্ধ্যা ০৬:০০ (সাপ্তাহিক ক্লাস)',
      depts: ['কিরাত ও তাজবীদ', 'কন্ঠ সংগীত', 'শিশু সংগীত (সাইমুম কিডস)', 'নাট্য অভিনয়', 'আবৃত্তি ও উপস্থাপনা', 'চারুকলা ও ক্যালিগ্রাফি']
    },
    {
      name: 'মিরপুর আঞ্চলিক শাখা',
      code: 'MIR-BRANCH',
      type: 'আঞ্চলিক ফিজিক্যাল ক্যাম্পাস',
      image: '/images/saimum_chorus_main.jpg',
      address: 'প্লট #১২, সেকশন ১০, মিরপুর, ঢাকা - ১২১৬',
      phone: '+৮৮০ ১৯৭০-৫৭৮২২০',
      email: 'mirpur@saimumacademy.org',
      schedules: 'শুক্রবার ও মঙ্গলবার: বিকাল ০৩:০০ - সন্ধ্যা ০৭:০০',
      depts: ['কিরাত', 'কন্ঠ সংগীত', 'শিশু সংগীত', 'আবৃত্তি ও উপস্থাপনা']
    },
    {
      name: 'গ্লোবাল অনলাইন ক্যাম্পাস',
      code: 'ONLINE-GLOBAL',
      type: 'ইন্টারেক্টিভ লাইভ স্টুডিও (Zoom/Meet)',
      image: '/images/saimum_artist_vocal.jpg',
      address: 'সেন্ট্রাল একাডেমি অনলাইন স্টুডিও (দেশ ও বিদেশের শিক্ষার্থীদের জন্য)',
      phone: '+৮৮০ ১৯৭০-৫৭৮২২০ (WhatsApp)',
      email: 'saimumoffice@gmail.com',
      schedules: 'উইকেন্ড ও সান্ধ্যকালীন ব্যাচ (গ্লোবাল টাইমজোন অনুযায়ী)',
      depts: ['অনলাইন কিরাত', 'অনলাইন সংগীত তালিম', 'অনলাইন আবৃত্তি ও উচ্চারণ', 'অনলাইন কিডস সেশন']
    }
  ];

  return (
    <div className={styles.page}>

      {/* Page Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <span className={styles.preTitle}>Campuses & Regional Network</span>
          <h1 className={styles.pageTitle}>সেন্ট্রাল ও আঞ্চলিক শাখাসমূহ</h1>
          <p className={styles.pageDesc}>
            সরাসরি ফিজিক্যাল ক্লাসের পাশাপাশি দেশ-বিদেশের যেকোনো প্রান্ত থেকে অনলাইনে আধুনিক সাংস্কৃতিক প্রশিক্ষণে যুক্ত হওয়ার বিশ্বস্ত প্ল্যাটফর্ম।
          </p>
        </div>
      </section>

      {/* Campus Blocks */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          {campusDetails.map((campus, idx) => (
            <div key={idx}>
              <div className={styles.campusBlock}>
                <div className={styles.campusBlockInner}>
                  <div className={styles.campusImageWrap}>
                    <img src={campus.image} alt={campus.name} className={styles.campusImage} />
                  </div>

                  <div className={styles.campusInfo}>
                    <div className={styles.campusHeader}>
                      <div>
                        <h2 className={styles.campusName}>{campus.name}</h2>
                        <span className={styles.campusType}>{campus.type}</span>
                      </div>
                      <span className={styles.campusCode}>{campus.code}</span>
                    </div>

                    <div className={styles.campusDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>ঠিকানা</span>
                        <span className={styles.detailValue}>{campus.address}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>ফোন</span>
                        <span className={styles.detailValue}>{campus.phone}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>ইমেইল</span>
                        <span className={styles.detailValue}>{campus.email}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>সময়সূচি</span>
                        <span className={styles.detailValue}>{campus.schedules}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>বিভাগসমূহ</span>
                        <span className={styles.detailValue}>{campus.depts.join(' · ')}</span>
                      </div>
                    </div>

                    <Link href="/apply" className={styles.campusLink}>
                      {campus.name} এ আবেদন করুন →
                    </Link>
                  </div>
                </div>
              </div>
              {idx < campusDetails.length - 1 && <hr className={styles.campusRule} />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
