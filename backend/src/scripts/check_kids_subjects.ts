import { extractSqlUsers } from './importAllSqlData';
import { prisma } from '../prisma';

const sqlUsers = extractSqlUsers();

console.log('🔍 Analyzing Kids with multiple subjects (আবৃত্তি, কিরাত, গান, থিয়েটার)...\n');

interface KidsMultiSubject {
  name: string;
  nameBn?: string;
  phone: string;
  sri?: string;
  studentId?: string;
  department: string;
  subjects: string;
  chosen: string[];
}

const kidsWithAbriti: KidsMultiSubject[] = [];
const kidsWithQirat: KidsMultiSubject[] = [];
const kidsWithTheatre: KidsMultiSubject[] = [];
const kidsWithSong: KidsMultiSubject[] = [];

sqlUsers.forEach(u => {
  const dept = (u.student_department || u.department || '').toLowerCase();
  const subs = (u.student_subjects || u.interested_subjects || u.department_subject || '').toLowerCase();
  const allText = `${dept} ${subs}`;

  const isKid = dept.includes('kid') || subs.includes('kid') || allText.includes('শিশু');
  if (!isKid) return;

  const chosen: string[] = [];
  if (allText.includes('recit') || allText.includes('আবৃত্তি') || allText.includes('presentation') || allText.includes('উপস্থাপনা') || allText.includes('abritti')) {
    chosen.push('আবৃত্তি ও উপস্থাপনা');
  }
  if (allText.includes('qira') || allText.includes('কিরাত') || allText.includes('কুরআন') || allText.includes('ক্বিরাত')) {
    chosen.push('কিরাত');
  }
  if (allText.includes('theatre') || allText.includes('acting') || allText.includes('অভিনয়') || allText.includes('মঞ্চ')) {
    chosen.push('থিয়েটার');
  }
  if (allText.includes('song') || allText.includes('গান') || allText.includes('সংগীত') || allText.includes('vocal')) {
    chosen.push('গান');
  }

  const record: KidsMultiSubject = {
    name: u.name,
    nameBn: u.name_bn,
    phone: u.mobile_offline || u.mobile_online || u.father_mobile,
    sri: u.workshop_registration_no,
    studentId: u.student_id,
    department: u.student_department || 'KIDS',
    subjects: u.student_subjects || u.interested_subjects || 'N/A',
    chosen
  };

  if (chosen.includes('আবৃত্তি ও উপস্থাপনা')) kidsWithAbriti.push(record);
  if (chosen.includes('কিরাত')) kidsWithQirat.push(record);
  if (chosen.includes('থিয়েটার')) kidsWithTheatre.push(record);
  if (chosen.includes('গান')) kidsWithSong.push(record);
});

console.log(`📊 মোট শিশু শিক্ষার্থী যাদের মধ্যে বিষয় পছন্দ রয়েছে:`);
console.log(`- শিশু বিভাগ + আবৃত্তি ও উপস্থাপনা: ${kidsWithAbriti.length} জন`);
console.log(`- শিশু বিভাগ + কিরাত: ${kidsWithQirat.length} জন`);
console.log(`- শিশু বিভাগ + থিয়েটার: ${kidsWithTheatre.length} জন`);
console.log(`- শিশু বিভাগ + গান: ${kidsWithSong.length} জন`);

console.log('\n🎙️ [নমুনা] শিশু বিভাগ + আবৃত্তি ও উপস্থাপনা (প্রথম ১০ জন):');
kidsWithAbriti.slice(0, 10).forEach((k, idx) => {
  console.log(`   ${idx + 1}. [SRI: ${k.sri || 'N/A'} | ID: ${k.studentId || 'None'}] ${k.name} (${k.nameBn || ''}) | Mobile: ${k.phone} | Raw: "${k.department}" / "${k.subjects}"`);
});

console.log('\n📖 [নমুনা] শিশু বিভাগ + কিরাত (প্রথম ১০ জন):');
kidsWithQirat.slice(0, 10).forEach((k, idx) => {
  console.log(`   ${idx + 1}. [SRI: ${k.sri || 'N/A'} | ID: ${k.studentId || 'None'}] ${k.name} (${k.nameBn || ''}) | Mobile: ${k.phone} | Raw: "${k.department}" / "${k.subjects}"`);
});
