import React from 'react';
import Link from 'next/link';
import styles from './departments.module.css';

export const metadata = {
  title: 'সাংস্কৃতিক বিভাগসমূহ | Departments — Saimum Central Academy',
  description: 'সাইমুম কেন্দ্রীয় একাডেমির সংগীত, কিরাত, অভিনয়, আবৃত্তি, শিশুতোষ ও চারুকলা বিভাগের বিস্তারিত পাঠ্যক্রম ও প্রশিক্ষণ কাঠামো।'
};

export default function DepartmentsPage() {
  const departments = [
    {
      id: 'qirat-tajweed',
      titleBn: 'কিরাত ও তাজবীদ বিভাগ',
      titleEn: 'Department of Quranic Recitation & Tajweed',
      image: '/images/dept_qirat_1786970374642.jpg',
      overview: 'বিশুদ্ধ কুরআন তিলাওয়াত, মাখরাজ ও সিফাতসহ তাজবীদের নিয়মতান্ত্রিক শিক্ষা, সুললিত সুরে তিলাওয়াত এবং জাতীয় ও আন্তর্জাতিক প্রতিযোগিতার তালিম।',
      features: [
        'মাখরাজ, সিফাত ও ওয়াকফের বিশদ তাত্ত্বিক ও প্রায়োগিক অনুশীলন',
        'বিভিন্ন সুর ও লাহানে সুললিত কুরআন তিলাওয়াত প্রশিক্ষণ',
        'জাতীয় ও আন্তর্জাতিক হিফজুল কুরআন ও ক্বিরাত প্রতিযোগিতার প্রস্তুতি',
        'অডিও রেকর্ডিং ও স্টুডিও পরিবেশনা ম্যানারিজম'
      ]
    },
    {
      id: 'vocal-music',
      titleBn: 'কন্ঠ সংগীত বিভাগ',
      titleEn: 'Department of Vocal Performing Arts',
      image: '/images/saimum_nasheed_special.jpg',
      overview: 'রাগপ্রধান, ক্লাসিক্যাল, হামদ-নাত, ইসলামী ও উদ্দীপনামূলক দেশাত্মবোধক গানের শুদ্ধ স্বরলিপি, তাল-লয় ও বৈজ্ঞানিক ভয়েস কালচার তালিম।',
      features: [
        'স্বরসাধন, সা-রে-গা-মা ও সপ্তকের মৌলিক তালিম',
        'তাল-লয়, মাত্রা ও তবলার সাথে সমন্বয়',
        'রাগ সঙ্গীত ও ভয়েস কালচার প্রশিক্ষণ',
        'মাইক্রোফোন টেকনিক ও স্টুডিও রেকর্ডিং ম্যানারিজম'
      ]
    },
    {
      id: 'junior-music',
      titleBn: 'শিশু সংগীত বিভাগ (সাইমুম কিডস)',
      titleEn: 'Department of Children Cultural Arts',
      image: '/images/saimum_kids_zaima.jpg',
      overview: 'কচি-কাঁচাদের সুরেলা কণ্ঠের বিকাশ, সঠিক উচ্চারণ, আত্মবিশ্বাস এবং ছড়া ও মিষ্টি গানের নান্দনিক উপস্থাপনা।',
      features: [
        'সহজ সুর ও ছড়ার গানের মাধ্যমে সংগীতের হাতেখড়ি',
        'শিশুর মানসিক ও নৈতিক মূল্যবোধ বিকাশে শিল্পচর্চা',
        'মঞ্চ পরিবেশনা ও জড়তা দূরীকরণ সেশন',
        'জাতীয় শিশু-কিশোর সাংস্কৃতিক প্রতিযোগিতার প্রস্তুতি'
      ]
    },
    {
      id: 'acting-drama',
      titleBn: 'নাট্য অভিনয় ও থিয়েটার বিভাগ',
      titleEn: 'Department of Theater & Performing Arts',
      image: '/images/saimum_artist_vocal.jpg',
      overview: 'অভিব্যক্তি, বাচনভঙ্গি, সংলাপ প্রক্ষেপণ, সামাজিক ও মূল্যবোধসম্পন্ন মঞ্চনাটক ও পথনাটকের বাস্তবমুখী অভিনয় কলাকৌশল (সাইমুমের ৪০+ মঞ্চ প্রযোজনা ঐতিহ্য)।',
      features: [
        'বডি ল্যাঙ্গুয়েজ ও ক্যারেক্টার ট্রান্সফর্মেশন',
        'স্ক্রিপ্ট এনালাইসিস ও ইমপ্রোভাইজেশন',
        'মঞ্চ ও ক্যামেরার অভিনয়ের পার্থক্য ও কৌশল',
        'পাবলিক স্পিকিং ও কনফিডেন্স বিল্ডিং'
      ]
    },
    {
      id: 'recitation',
      titleBn: 'আবৃত্তি ও উপস্থাপনা বিভাগ',
      titleEn: 'Department of Elocution & Literature',
      image: '/images/saimum_chorus_main.jpg',
      overview: 'শুদ্ধ প্রমিত বাংলা উচ্চারণ, স্বরক্ষেপণ, ছন্দজ্ঞান, কাব্যভাবরস ও জাতীয় মানের উপস্থাপনা শিল্পের গভীর কলাকৌশল।',
      features: [
        'প্রমিত বাংলা উচ্চারণ ও ধ্বনিতত্ত্ব',
        'কবিতার ভাবরস ও ছন্দ সচেতনতা',
        'নিউজ প্রেজেন্টেশন ও পাবলিক এঙ্করিং কৌশল',
        'স্বর নিয়ন্ত্রণ ও শ্বাস-প্রশ্বাসের ব্যায়াম'
      ]
    },
    {
      id: 'fine-arts',
      titleBn: 'চারুকলা, সাহিত্য ও ক্যালিগ্রাফি বিভাগ',
      titleEn: 'Department of Visual Arts & Calligraphy',
      image: '/images/saimum_orchestra.jpg',
      overview: 'রেখা ও রঙের মননশীল শৈলী, ড্রয়িং, জলরং, ইসলামী ক্যালিগ্রাফি শিল্প এবং সাহিত্য সাময়িকী "বাতায়ন" সমৃদ্ধ সাহিত্য চর্চা।',
      features: [
        'বেসিক স্কেচিং, পারস্পেকটিভ ও শ্যাডো স্টাডি',
        'জলরং, অ্যাক্রিলিক ও পেস্টেল কালার টেকনিক',
        'আরবি ও বাংলা ইসলামিক ক্যালিগ্রাফি আর্ট',
        'বার্ষিক চিত্র প্রদর্শনী ও সাহিত্য কর্মশালা'
      ]
    }
  ];

  return (
    <div className={styles.page}>

      {/* Page Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <span className={styles.preTitle}>Academic Disciplines & Curriculum</span>
          <h1 className={styles.pageTitle}>আমাদের সাংস্কৃতিক বিভাগ ও কোর্সসমূহ</h1>
          <p className={styles.pageDesc}>
            প্রতিটি বিভাগে রয়েছে সুনির্দিষ্ট পাঠ্যসূচি, অভিজ্ঞ ওস্তাদদের তত্ত্বাবধানে ওয়ার্কশপভিত্তিক নিবিড় অনুশীলন ও মেধাভিত্তিক মূল্যায়ন ব্যবস্থা।
          </p>
        </div>
      </section>

      {/* Department Rows */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          {departments.map((dept, idx) => (
            <div key={dept.id}>
              <div className={styles.deptRow}>
                <div className={styles.deptImageWrap}>
                  <img src={dept.image} alt={dept.titleBn} className={styles.deptImage} />
                </div>
                <div className={styles.deptLeft}>
                  <h2 className={styles.deptTitle}>{dept.titleBn}</h2>
                  <span className={styles.deptSubtitle}>{dept.titleEn}</span>
                  <p className={styles.deptOverview}>{dept.overview}</p>
                  <Link href="/apply" className={styles.deptLink}>
                    এই বিভাগে ভর্তি আবেদন করুন →
                  </Link>
                </div>
                <div className={styles.deptRight}>
                  <span className={styles.featureLabel}>Course Highlights</span>
                  <ul className={styles.featureList}>
                    {dept.features.map((feat, i) => (
                      <li key={i} className={styles.featureItem}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {idx < departments.length - 1 && <hr className={styles.deptRule} />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
