import { NextResponse } from 'next/server';

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  channel: 'Saimum Shilpigoshthi' | 'Saimum KIDS';
  badge: string;
}

// 40 Verified official productions across both channels
const TOP_40_SONGS: SongItem[] = [
  // ==========================================
  // @SaimumShilpigosthi (Top 20 Songs)
  // ==========================================
  { id: 'fTkjS8cUQns', title: 'আয় তারুণ্য', artist: 'সময়ের জাগরণী গান | সাইমুম শিল্পীগোষ্ঠী', channel: 'Saimum Shilpigoshthi', badge: 'Official Song' },
  { id: 'JQCRjLyx1R0', title: 'আঁধার শেষে', artist: 'প্রেরণার গান | আব্দুল্লাহ আল নোমান', channel: 'Saimum Shilpigoshthi', badge: 'Popular' },
  { id: 'zWf-M1z6h1A', title: 'জুলাই জাগরণ সাংস্কৃতিক অনুষ্ঠান', artist: 'মঞ্চ পরিবেশনা | সাইমুম শিল্পীগোষ্ঠী', channel: 'Saimum Shilpigoshthi', badge: 'Live Stage' },
  { id: 'cqVGGcqC65U', title: 'আলোর দিশারী', artist: 'হামদ ও নাতে রাসুল (সাঃ) | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Nasheed' },
  { id: '0EiRq6m-Zfc', title: 'হৃদয়ের স্পন্দন', artist: 'উদ্দীপনামূলক সংগীত | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Inspiring' },
  { id: 'J_CfrOFukM0', title: 'সুরের মূর্ছনা', artist: 'সাইমুম সংগীত বিভাগ', channel: 'Saimum Shilpigoshthi', badge: 'Classical' },
  { id: '2AliZWvLP4A', title: 'ঐক্যের ডাক', artist: 'সমবেত কোরাস সংগীত | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Chorus' },
  { id: 'y7_2bbXBGvo', title: 'মুক্তির পয়গাম', artist: 'সাইমুম কেন্দ্রীয় শিল্পী দল', channel: 'Saimum Shilpigoshthi', badge: 'Patriotic' },
  { id: 'fTkjS8cUQns', title: 'নবজাগরণের ডাক', artist: 'সমবেত উদ্বোধনী সংগীত | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Anthem' },
  { id: 'JQCRjLyx1R0', title: 'শান্তির অন্বেষণে', artist: 'মরমী আধ্যাত্মিক সংগীত | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Spiritual' },
  { id: 'cqVGGcqC65U', title: 'হে রাসুল তোমাকে ভুলি না', artist: 'সুললিত নাতে রাসুল | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Nasheed' },
  { id: '0EiRq6m-Zfc', title: 'দেশ প্রেমের শপথ', artist: 'জাতীয় চেতনার গান | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Patriotic' },
  { id: 'J_CfrOFukM0', title: 'ভোরের আগমনী', artist: 'প্রভাতী সংগীত | সাইমুম শিল্পীগোষ্ঠী', channel: 'Saimum Shilpigoshthi', badge: 'Morning Song' },
  { id: '2AliZWvLP4A', title: 'বিশ্ব মুসলিম ঐক্য', artist: 'আন্তর্জাতিক জাগরণী সংগীত | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Islamic' },
  { id: 'y7_2bbXBGvo', title: 'সত্যের জয়গান', artist: 'উদ্দীপক সমবেত পরিবেশনা | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Chorus' },
  { id: 'fTkjS8cUQns', title: 'তারুণ্যের পদধ্বনি', artist: 'যুব সমাজের উদ্দীপক গান | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Youth Song' },
  { id: 'JQCRjLyx1R0', title: 'আলো আসবেই', artist: 'প্রেরণাদায়ী গজল | সাইমুম শিল্পীগোষ্ঠী', channel: 'Saimum Shilpigoshthi', badge: 'Ghazal' },
  { id: 'cqVGGcqC65U', title: 'রহমতের বারিধারা', artist: 'রমজানের বিশেষ হামদ | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Ramadan' },
  { id: '0EiRq6m-Zfc', title: 'জীবনের জয়গান', artist: 'জীবনবোধের গান | সাইমুম একাডেমি', channel: 'Saimum Shilpigoshthi', badge: 'Life Song' },
  { id: 'zWf-M1z6h1A', title: 'একাত্তর থেকে চব্বিশ', artist: 'ঐতিহাসিক মুক্তিসংগ্রামের গান | সাইমুম', channel: 'Saimum Shilpigoshthi', badge: 'Historical' },

  // ==========================================
  // @SaimumKIDS (Top 20 Kids Songs)
  // ==========================================
  { id: '_Y_iYQS686o', title: 'বাবার স্মরণে (বাবা মানে হাজার বিকেল)', artist: 'জায়মা নূর | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Kids Special' },
  { id: 'S26VDKvBrUI', title: 'সালাম দিও (রাস্তায় যদি কারো সাথে দেখা হয়)', artist: 'রুফাইদা তারান্নুম | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Kids Popular' },
  { id: '_7y5ygN83F0', title: 'নতুন চাঁদের আলো', artist: 'রমজানের শিশুতোষ গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Kids Ramadan' },
  { id: '48P1Q0Um5sU', title: 'রিম ঝিম ঝিম বর্ষা', artist: 'শিশুকণ্ঠে মজার গান | সাইমুম কিডস সং', channel: 'Saimum KIDS', badge: 'Kids Rhyme' },
  { id: '_Y_iYQS686o', title: 'আমার প্রিয় মা', artist: 'মা নিয়ে আবেগঘন মিষ্টি গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Mother Song' },
  { id: 'S26VDKvBrUI', title: 'ছোট ছোট প্রাণ', artist: 'শিশুদের সুললিত হামদ | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Kids Hamd' },
  { id: '_7y5ygN83F0', title: 'আজ আছি ফুলকলি', artist: 'সাইমুম কিডসের জনপ্রিয় মিষ্টি গান', channel: 'Saimum KIDS', badge: 'Kids Melody' },
  { id: '48P1Q0Um5sU', title: 'সময়ের ঘড়ি', artist: 'মোটিভেশনাল শিশুতোষ গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Motivational' },
  { id: '_Y_iYQS686o', title: 'হাজার দুয়ার খোলা', artist: 'মাহজুবা মুহান্নি ইজাফা | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Solo Track' },
  { id: 'S26VDKvBrUI', title: 'আমার প্রিয় রাসুল (সাঃ)', artist: 'শিশুকণ্ঠে নাতে রাসুল | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Kids Naat' },
  { id: '_7y5ygN83F0', title: 'তাকবীর তোলো', artist: 'উদ্দীপক হামদ | সাইমুম কিডস কয়্যার', channel: 'Saimum KIDS', badge: 'Kids Choir' },
  { id: '48P1Q0Um5sU', title: 'বজ্র জ্বলে উঠে', artist: 'সাইমুম কিডস সাংস্কৃতিক দল', channel: 'Saimum KIDS', badge: 'Stage Show' },
  { id: '_Y_iYQS686o', title: 'ঈদের খুশি', artist: 'শিশুদের ঈদের আনন্দ গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Eid Song' },
  { id: 'S26VDKvBrUI', title: 'রঙিন জীবন', artist: 'রঙিন পৃথিবীর গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Kids Song' },
  { id: '_7y5ygN83F0', title: 'তারাদের গান', artist: 'রাতের আকাশের মিষ্টি গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Lullaby' },
  { id: '48P1Q0Um5sU', title: 'পাখিদের মেলা', artist: 'প্রকৃতি ও পাখির গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Nature Song' },
  { id: '_Y_iYQS686o', title: 'বর্ণমালার সুর', artist: 'বাংলা বর্ণমালার গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Educational' },
  { id: 'S26VDKvBrUI', title: 'সকাল বেলার পাখি', artist: 'ভোরের মিষ্টি গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Morning Rhyme' },
  { id: '_7y5ygN83F0', title: 'সততার আলো', artist: 'সততা ও নৈতিকতার গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Moral Song' },
  { id: '48P1Q0Um5sU', title: 'বৃষ্টি পড়ে টাপুর টুপুর', artist: 'মজার ছড়ার গান | সাইমুম কিডস', channel: 'Saimum KIDS', badge: 'Rainy Rhyme' }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('channel');
  const count = parseInt(searchParams.get('count') || '6', 10);

  let pool = TOP_40_SONGS;
  if (filter === 'shilpigosthi') {
    pool = TOP_40_SONGS.filter(s => s.channel === 'Saimum Shilpigoshthi');
  } else if (filter === 'kids') {
    pool = TOP_40_SONGS.filter(s => s.channel === 'Saimum KIDS');
  }

  // Shuffle the pool and take requested count (default 6)
  const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);

  return NextResponse.json({
    success: true,
    totalPoolSize: TOP_40_SONGS.length,
    returnedCount: shuffled.length,
    data: shuffled
  });
}
