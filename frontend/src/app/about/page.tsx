import React from 'react';
import Link from 'next/link';
import styles from './about.module.css';

export const metadata = {
  title: 'পরিচিতি ও ঐতিহ্য | About Us — Saimum Central Academy',
  description: '১৯৭৮ সালে প্রতিষ্ঠিত সাইমুম শিল্পীগোষ্ঠী ও কেন্দ্রীয় সাংস্কৃতিক একাডেমির সাড়ে চার দশকের গৌরবময় ইতিহাস, প্রতিষ্ঠাতা কবি মতিউর রহমান মল্লিকের দর্শন ও সুস্থ সংস্কৃতির বিকাশ।'
};

export default function AboutPage() {
  const milestones = [
    {
      year: '১৯৭৮',
      title: 'প্রতিষ্ঠা ও ঐতিহাসিক সূচনা',
      desc: '১ জানুয়ারি ১৯৭৮ সালে প্রখ্যাত কবি, গীতিকার ও সুরকার মতিউর রহমান মল্লিকের নেতৃত্বে সুস্থ ও আদর্শবাদী সংস্কৃতির বিপ্লব সাধনে সাইমুম শিল্পীগোষ্ঠী প্রতিষ্ঠিত হয়।'
    },
    {
      year: '১৯৮০-৯০',
      title: 'সাংস্কৃতিক জাগরণ ও দেশব্যাপী বিস্তার',
      desc: 'দেশজুড়ে সুস্থ ধারার ইসলামী সঙ্গীত, মঞ্চনাটক ও আবৃত্তি চর্চার মাধ্যমে যুবসমাজের মাঝে নৈতিক মূল্যবোধ ও দেশপ্রেমের জাগরণ সৃষ্টি।'
    },
    {
      year: '২০০০',
      title: 'কেন্দ্রীয় সাংস্কৃতিক একাডেমি ও প্রশিক্ষণ',
      desc: 'নতুন প্রজন্মকে আন্তর্জাতিক মানে প্রস্তুত করতে কেন্দ্রীয় একাডেমি ও বিভাগভিত্তিক সুনির্দিষ্ট কারিকুলাম ও ওয়ার্কশপ কার্যক্রম চালু।'
    },
    {
      year: '২০০৮-১০',
      title: 'ঐতিহাসিক প্রকাশনা ও স্মারক',
      desc: 'সংগঠনের তিন দশকের অবদানের স্বীকৃতিস্বরূপ "৩০ বছর পূর্তি স্মারক" এবং প্রতিষ্ঠাতা স্মরণে "মল্লিক স্মারক" প্রকাশ।'
    },
    {
      year: '২০১৬+',
      title: 'শিশুতোষ আন্দোলন (সাইমুম কিডস)',
      desc: 'কচি-কাঁচাদের মেধা, প্রতিভা ও নৈতিক মনন বিকাশে সাইমুম কিডস চ্যানেল ও বিশেষায়িত প্রশিক্ষণ উইং প্রতিষ্ঠা।'
    },
    {
      year: '২০২৬',
      title: 'ডিজিটাল একাডেমি ও স্মার্ট ক্যাম্পাস',
      desc: 'সরাসরি ফিজিক্যাল সেন্ট্রাল ক্যাম্পাসের পাশাপাশি দেশ-বিদেশের শিক্ষার্থীদের জন্য স্মার্ট ডিজিটাল ক্যাম্পাস ও সমন্বিত পোর্টাল সম্প্রসারণ।'
    }
  ];

  const galleryImages = [
    {
      src: '/images/saimum_chorus_main.jpg',
      caption: 'সাইমুম শিল্পীগোষ্ঠী • জাতীয় মঞ্চ ও সমবেত পরিবেশনা'
    },
    {
      src: '/images/saimum_kids_group.jpg',
      caption: 'সাইমুম কিডস • শিশু-কিশোর সাংস্কৃতিক পরিবেশনা'
    },
    {
      src: '/images/saimum_artist_vocal.jpg',
      caption: 'কন্ঠসংগীত শিল্পী তালিম ও একক পরিবেশনা'
    },
    {
      src: '/images/saimum_orchestra.jpg',
      caption: 'ঐতিহ্যবাহী রাগ ও আধুনিক সুরের যন্ত্রসংগীত'
    },
    {
      src: '/images/saimum_kids_zaima.jpg',
      caption: 'শিশুতোষ সংগীত ও মননশীল পরিবেশনা'
    },
    {
      src: '/images/dept_qirat_1786970374642.jpg',
      caption: 'বিশুদ্ধ কিরাত ও কুরআন তিলাওয়াত প্রশিক্ষণ'
    }
  ];

  return (
    <div className={styles.page}>

      {/* Page Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <span className={styles.preTitle}>Legacy of Cultural Renaissance • Est. 1978</span>
          <h1 className={styles.pageTitle}>সাইমুম শিল্পীগোষ্ঠী ও কেন্দ্রীয় একাডেমি</h1>
          <p className={styles.pageDesc}>
            ১৯৭৮ সালের ১ জানুয়ারি থেকে আজ অবধি সুস্থ, অর্থবহ ও মানবিক মূল্যবোধসম্পন্ন সংস্কৃতি বিকাশে বাংলাদেশের শীর্ষতম ও অগ্রগামী সাংস্কৃতিক বিদ্যাপীঠ।
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.storyGrid}>
            <div className={styles.storyLeft}>
              <h2 className={styles.storyHeading}>আমাদের ঐতিহাসিক প্রেক্ষাপট ও দর্শন</h2>
              <p className={styles.storyText}>
                সাংস্কৃতিক দেউলিয়াপনা ও অপসংস্কৃতির প্রবল স্রোত রোধ করে জাতির আত্মমর্যাদাবোধ, শাশ্বত ঈমানী চেতনা, দেশপ্রেম ও নৈতিক জাগরণ সৃষ্টির মহান প্রত্যয়ে ১৯৭৮ সালের ১ জানুয়ারি প্রতিষ্ঠিত হয়েছিল <strong>সাইমুম শিল্পীগোষ্ঠী</strong>। এর প্রতিষ্ঠাতা ছিলেন বাংলা ইসলামী সাংস্কৃতিক জাগরণের মহান দিকপাল, কবি ও সুরকার <strong>মতিউর রহমান মল্লিক</strong>।
              </p>
              <p className={styles.storyText}>
                দীর্ঘ সাড়ে চার দশকের পথচলায় সাইমুম উপহার দিয়েছে ১০০টিরও বেশি কালজয়ী অডিও-ভিডিও অ্যালবাম, ৪০টির অধিক সফল মঞ্চনাটক এবং অসংখ্য জাতীয় মানের পরিবেশনা। সাহিত্যের সমৃদ্ধিতে নিয়মিত প্রকাশিত হয়েছে সাহিত্য সাময়িকী <em>বাতায়ন</em>, <em>৩০ বছর পূর্তি স্মারক</em> ও <em>মল্লিক স্মারক</em>।
              </p>
              <p className={styles.storyText}>
                <strong>কেন্দ্রীয় সাংস্কৃতিক একাডেমি</strong> হলো সাইমুমের সেই প্রাতিষ্ঠানিক ভিত্তি, যা আধুনিক ও সুশৃঙ্খল সিলেবাসে শিশু-কিশোর ও তরুণদের সংগীত, কিরাত, নাট্যকলা, উপস্থাপনা ও চারুশিল্পে দক্ষ করে গড়ে তোলে।
              </p>
            </div>

            <div className={styles.storyRight}>
              <div className={styles.storyImageCard}>
                <img
                  src="/images/saimum_chorus_main.jpg"
                  alt="সাইমুম মঞ্চ পরিবেশনা"
                  className={styles.storyImage}
                />
                <span className={styles.storyImageBadge}>সাইমুম কেন্দ্রীয় শিল্পী দল</span>
              </div>

              <div className={styles.goalCardList}>
                <div className={styles.goalRow}>
                  <h4 className={styles.goalTitle}>আমাদের মূল লক্ষ্য ও মিশন</h4>
                  <p className={styles.goalDesc}>জাতীয় ঐতিহ্য ও ধর্মীয় মূল্যবোধের সমন্বয়ে একটি সুস্থ ও মানবিক সাংস্কৃতিক আবহ তৈরি করা।</p>
                </div>
                <hr className={styles.goalRule} />
                <div className={styles.goalRow}>
                  <h4 className={styles.goalTitle}>গুণগত মান ও প্রশিক্ষণ</h4>
                  <p className={styles.goalDesc}>অভিজ্ঞ শিল্পী, ওস্তাদ ও নির্দেশক দ্বারা তাত্ত্বিক, প্রায়োগিক এবং স্টুডিও-মঞ্চমুখী নিবিড় তালিম প্রদান।</p>
                </div>
                <hr className={styles.goalRule} />
                <div className={styles.goalRow}>
                  <h4 className={styles.goalTitle}>কেন্দ্রীয় কার্যালয়</h4>
                  <p className={styles.goalDesc}>মিজান টাওয়ার, মগবাজার, ঢাকা - ১২০৫। যোগাযোগ: +৮৮০ ১৯৭০-৫৭৮২২০ | ইমেইল: saimumoffice@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Showcase Gallery */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>ঐতিহাসিক কার্যক্রম ও মঞ্চের চিত্রাবলী</h2>
          <div className={styles.galleryGrid}>
            {galleryImages.map((img, i) => (
              <div key={i} className={styles.galleryCard}>
                <div className={styles.galleryImageWrap}>
                  <img src={img.src} alt={img.caption} className={styles.galleryImage} />
                </div>
                <span className={styles.galleryCaption}>{img.caption}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>ঐতিহাসিক মাইলফলকসমূহ</h2>
          <div className={styles.milestoneList}>
            {milestones.map((m, i) => (
              <div key={i} className={styles.milestoneRow}>
                <span className={styles.milestoneYear}>{m.year}</span>
                <div className={styles.milestoneContent}>
                  <h3 className={styles.milestoneTitle}>{m.title}</h3>
                  <p className={styles.milestoneDesc}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.sectionAlt}>
        <div className={styles.ctaBanner}>
          <h3 className={styles.ctaHeading}>আপনিও কি এই সাংস্কৃতিক যাত্রার অংশ হতে চান?</h3>
          <p className={styles.ctaDesc}>নতুন শিক্ষাবর্ষের ভর্তি কার্যক্রমে অংশ নিয়ে আপনার সুপ্ত প্রতিভার নান্দনিক বিকাশ ঘটান।</p>
          <Link href="/apply" className={styles.btnPrimary}>অনলাইনে আবেদন করুন</Link>
        </div>
      </section>
    </div>
  );
}
