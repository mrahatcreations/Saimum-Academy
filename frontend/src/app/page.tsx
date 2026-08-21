'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Play } from 'lucide-react';
import styles from './page.module.css';

interface SongItem {
  id: string;
  title: string;
  artist: string;
  channel: string;
  badge: string;
}

export default function HomePage() {
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch(`/api/songs?count=6&t=${Date.now()}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSongs(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch songs from API:', err);
      }
    };
    fetchSongs();
  }, []);

  const notices = [
    {
      date: '০১ এপ্রিল, ২০২৬',
      title: 'সাইমুম শিল্পীগোষ্ঠীর ভর্তি পরীক্ষার ফলাফল–২০২৬',
      desc: 'সাইমুম শিল্পীগোষ্ঠীর ২০২৬ সেশনে ভর্তির জন্য মোট ২০০টি আসনের বিপরীতে ১০০০+ শিক্ষার্থী অংশগ্রহণ করে। নির্বাচিত তালিকা প্রকাশ করা হলো।'
    },
    {
      date: '০৩ মার্চ, ২০২৬',
      title: 'সাইমুম শিল্পীগোষ্ঠী ভর্তি প্রস্তুতি: চূড়ান্ত পরীক্ষা - ২০২৬ নোটিশ',
      desc: 'সাইমুম শিল্পীগোষ্ঠীতে ভর্তিচ্ছুক শিক্ষার্থীদের জন্য ২ মাসব্যাপী প্রশিক্ষণ শেষে চূড়ান্ত বাছাই পরীক্ষার বিস্তারিত সময়সূচি।'
    },
    {
      date: '০৯ জানুয়ারি, ২০২৬',
      title: 'সাইমুম শিল্পীগোষ্ঠী: ভর্তি বিজ্ঞপ্তি ২০২৬',
      desc: 'সাইমুম শিল্পীগোষ্ঠীর ২০২৬ সালের ভর্তি কার্যক্রম শুরু হয়েছে। আগ্রহী শিক্ষার্থীগণ নির্ধারিত সময়সীমার মধ্যে আবেদন সম্পন্ন করুন।'
    }
  ];

  const subjects = [
    {
      id: 'qirat',
      title: 'কিরাত ও তাজবীদ',
      badge: 'কুরআন তিলাওয়াত',
      image: '/images/dept_qirat_1786970374642.jpg',
      desc: 'বিশুদ্ধ কুরআন তিলাওয়াত ও তাজবীদ শিক্ষা। সুললিত কণ্ঠে তিলাওয়াত অনুশীলন ও জাতীয় প্রতিযোগিতার প্রস্তুতি।'
    },
    {
      id: 'vocal',
      title: 'কন্ঠ সংগীত বিভাগ',
      badge: 'হামদ-নাত ও সুর',
      image: '/images/saimum_nasheed_special.jpg',
      desc: 'ইসলামী মূল্যবোধপূর্ণ সংগীত, হামদ-নাত, গজল ও দেশাত্মবোধক গান, রাগপ্রধান ও ক্লাসিক্যাল সুরের নিবিড় তালিম।'
    },
    {
      id: 'kids',
      title: 'শিশু সংগীত (সাইমুম কিডস)',
      badge: 'শিশুতোষ উইং',
      image: '/images/saimum_kids_zaima.jpg',
      desc: 'কচি-কাঁচাদের সুরেলা কন্ঠের বিকাশ, ছড়া ও মিষ্টি গানের নান্দনিক উপস্থাপনা এবং নৈতিক আত্মবিশ্বাস বৃদ্ধি।'
    },
    {
      id: 'drama',
      title: 'নাট্য অভিনয় ও থিয়েটার',
      badge: 'মঞ্চনাটক ও অভিনয়',
      image: '/images/saimum_artist_vocal.jpg',
      desc: 'সামাজিক-নৈতিক বার্তার মঞ্চনাটক, সংলাপ প্রক্ষেপণ, বাচনভঙ্গি ও মঞ্চ অভিনয়ের প্রায়োগিক কলাকৌশল।'
    },
    {
      id: 'recitation',
      title: 'আবৃত্তি ও উপস্থাপনা',
      badge: 'প্রমিত উচ্চারণ ও উপস্থাপনা',
      image: '/images/saimum_chorus_main.jpg',
      desc: 'প্রমিত বাংলা উচ্চারণ, কবিতার ভাবরস, স্বরক্ষেপণ ও পাবলিক প্রেজেন্টেশন আর্টের উচ্চতর প্রশিক্ষণ।'
    },
    {
      id: 'fine-arts',
      title: 'চারুকলা ও ক্যালিগ্রাফি',
      badge: 'ইসলামিক আর্ট ও সাহিত্য',
      image: '/images/saimum_orchestra.jpg',
      desc: 'ড্রয়িং, রঙতুলি, শৈল্পিক নকশা এবং আরবি ও বাংলা ইসলামিক ক্যালিগ্রাফি শিল্পের গভীর প্রায়োগিক প্রশিক্ষণ।'
    }
  ];

  return (
    <div className={styles.page}>

      {/* ── HERO: Institutional Statement ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.heroEstd}>প্রতিষ্ঠা ১ জানুয়ারি ১৯৭৮</span>
            <h1 className={styles.heroHeading}>
              সুস্থ সংস্কৃতির<br />
              পথিকৃৎ
            </h1>
            <p className={styles.heroOrg}>
              সাইমুম শিল্পীগোষ্ঠী — কেন্দ্রীয় সাংস্কৃতিক একাডেমি
            </p>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroImageCard}>
              <img
                src="/images/saimum_chorus_main.jpg"
                alt="সাইমুম শিল্পীগোষ্ঠী লাইভ পরিবেশনা"
                className={styles.heroImage}
              />
              <span className={styles.heroImageBadge}>সাইমুম শিল্পীগোষ্ঠী • অফিশিয়াল পারফর্মেন্স</span>
            </div>

            <div className={styles.heroSessionBox}>
              <span className={styles.heroSessionLabel}>ভর্তি সেশন ২০২৬</span>
              <p className={styles.heroSessionDesc}>
                ইসলামী ও জাতীয় মূল্যবোধের সুস্থ সংস্কৃতি বিকাশে দেশের শীর্ষতম সাংস্কৃতিক বিদ্যাপীঠে ভর্তি কার্যক্রম চলছে।
              </p>
              <div className={styles.heroActions}>
                <Link href="/apply" className={styles.btnPrimary}>
                  ভর্তি আবেদন করুন
                </Link>
                <Link href="/track" className={styles.btnOutline}>
                  স্ট্যাটাস দেখুন
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>৪৭+</span>
            <span className={styles.statLabel}>বছরের ঐতিহ্য</span>
          </div>
          <span className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>১০০+</span>
            <span className={styles.statLabel}>প্রকাশিত অ্যালবাম</span>
          </div>
          <span className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>৪০+</span>
            <span className={styles.statLabel}>মঞ্চনাটক প্রযোজনা</span>
          </div>
          <span className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>১০,০০০+</span>
            <span className={styles.statLabel}>প্রশিক্ষিত শিল্পী ও শিক্ষার্থী</span>
          </div>
        </div>
      </section>

      {/* ── NOTICES: Newspaper Style ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>সাম্প্রতিক নোটিশ</h2>

          <div className={styles.noticeList}>
            {notices.map((n, i) => (
              <div key={i} className={styles.noticeRow}>
                <span className={styles.noticeDate}>{n.date}</span>
                <div className={styles.noticeContent}>
                  <h3 className={styles.noticeTitle}>{n.title}</h3>
                  <p className={styles.noticeDesc}>{n.desc}</p>
                </div>
                <Link href="/apply" className={styles.noticeLink}>
                  বিস্তারিত →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS: Visual 3-Column Grid ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>বিষয় সমূহ</h2>
          <p className={styles.sectionSubtitle}>
            সাইমুম শিল্পীগোষ্ঠীর বিভিন্ন সাংস্কৃতিক শাখায় ভর্তি ও প্রশিক্ষণ চলছে
          </p>

          <div className={styles.subjectGrid}>
            {subjects.map((sub) => (
              <div key={sub.id} className={styles.subjectItem}>
                <div className={styles.subjectImageWrap}>
                  <img
                    src={sub.image}
                    alt={sub.title}
                    className={styles.subjectImage}
                  />
                  <span className={styles.subjectBadge}>{sub.badge}</span>
                </div>
                <div className={styles.subjectContent}>
                  <h3 className={styles.subjectTitle}>{sub.title}</h3>
                  <p className={styles.subjectDesc}>{sub.desc}</p>
                  <Link href="/departments" className={styles.subjectLink}>
                    কোর্স বিস্তারিত দেখুন →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SONGS: Clean Media Grid ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>সাইমুমের জনপ্রিয় গান ও পরিবেশনা</h2>
          <p className={styles.sectionSubtitle}>
            সাইমুম শিল্পীগোষ্ঠী ও সাইমুম কিডসের YouTube থেকে সংগৃহীত অফিসিয়াল পরিবেশনা
          </p>

          <div className={styles.mediaGrid}>
            {songs.map((song, index) => (
              <button
                key={`${song.id}-${index}`}
                type="button"
                className={styles.mediaCard}
                onClick={() => setSelectedVideo({ id: song.id, title: song.title })}
              >
                <div className={styles.mediaThumb}>
                  <img
                    src={`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`}
                    alt={song.title}
                    className={styles.mediaImage}
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${song.id}/0.jpg`;
                    }}
                  />
                  <div className={styles.mediaPlayIcon}>
                    <Play size={16} fill="#FFFFFF" color="#FFFFFF" />
                  </div>
                </div>
                <div className={styles.mediaBody}>
                  <span className={styles.mediaChannel}>{song.channel}</span>
                  <h4 className={styles.mediaTitle}>{song.title}</h4>
                  <span className={styles.mediaArtist}>{song.artist}</span>
                </div>
              </button>
            ))}
          </div>

          <div className={styles.channelLinks}>
            <a
              href="https://www.youtube.com/@SaimumShilpigosthi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelLink}
            >
              YouTube: @SaimumShilpigosthi ↗
            </a>
            <a
              href="https://www.youtube.com/@SaimumKIDS"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelLink}
            >
              YouTube: @SaimumKIDS ↗
            </a>
            <a
              href="https://www.youtube.com/@SaimumTheatre"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelLink}
            >
              YouTube: @SaimumTheatre ↗
            </a>
            <a
              href="https://www.youtube.com/@SaimumAbritti"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelLink}
            >
              YouTube: @SaimumAbritti ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── ABOUT: Dark Editorial Band with Real Visual ── */}
      <section className={styles.aboutBand}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutImageCol}>
            <img
              src="/images/saimum_orchestra.jpg"
              alt="সাইমুম সংগীত পরিবেশনা"
              className={styles.aboutImage}
            />
            <span className={styles.aboutImageCaption}>সাইমুম শিল্পীগোষ্ঠী • ঐতিহ্য ও সাধনা</span>
          </div>

          <div className={styles.aboutTextCol}>
            <h2 className={styles.aboutTitle}>আমাদের ঐতিহ্য ও অনুপ্রেরণা</h2>
            <p className={styles.aboutText}>
              ১৯৭৮ সালের ১ জানুয়ারি প্রখ্যাত কবি, সুরকার ও গীতিকার মতিউর রহমান মল্লিকের নেতৃত্বে যাত্রা শুরু করে সাইমুম শিল্পীগোষ্ঠী। বাংলাদেশের সুস্থ, মানবিক ও শাশ্বত ইসলামী সাংস্কৃতিক আন্দোলনের পথিকৃৎ হিসেবে গত সাড়ে চার দশক ধরে সাইমুম নৈতিক চেতনা, সুস্থ বিনোদন ও সাংস্কৃতিক জাগরণ সৃষ্টিতে নিবেদিত।
            </p>

            <div className={styles.pillarsRow}>
              <div className={styles.pillarItem}>
                <span className={styles.pillarTitle}>ঐতিহ্য ও ভিত্তি</span>
                <span className={styles.pillarDesc}>১ জানুয়ারি ১৯৭৮ থেকে সুস্থ সংস্কৃতি চর্চা</span>
              </div>
              <div className={styles.pillarItem}>
                <span className={styles.pillarTitle}>প্রকাশনা</span>
                <span className={styles.pillarDesc}>১০০+ অ্যালবাম ও সাহিত্য পত্রিকা &apos;বাতায়ন&apos;</span>
              </div>
              <div className={styles.pillarItem}>
                <span className={styles.pillarTitle}>মঞ্চ প্রযোজনা</span>
                <span className={styles.pillarDesc}>৪০+ সফল মঞ্চনাটক ও থিয়েটার</span>
              </div>
              <div className={styles.pillarItem}>
                <span className={styles.pillarTitle}>শিশুতোষ আন্দোলন</span>
                <span className={styles.pillarDesc}>সাইমুম কিডস বিশেষায়িত উইং</span>
              </div>
            </div>

            <Link href="/about" className={styles.aboutLink}>
              বিস্তারিত পরিচিতি ও ইতিহাস →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className={styles.section}>
        <div className={styles.ctaBanner}>
          <h2 className={styles.ctaHeading}>
            আপনিও কি এই সাংস্কৃতিক যাত্রার অংশ হতে চান?
          </h2>
          <p className={styles.ctaDesc}>
            নতুন শিক্ষাবর্ষের ভর্তি কার্যক্রমে অংশ নিয়ে আপনার সুপ্ত প্রতিভার নান্দনিক বিকাশ ঘটান।
          </p>
          <Link href="/apply" className={styles.btnPrimary}>
            অনলাইনে আবেদন করুন
          </Link>
        </div>
      </section>

      {/* ── VIDEO MODAL ── */}
      {selectedVideo && (
        <div
          className={styles.videoOverlay}
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className={styles.videoContainer}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.videoHeader}>
              <span className={styles.videoTitle}>{selectedVideo.title}</span>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className={styles.videoClose}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.videoEmbed}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.videoIframe}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
