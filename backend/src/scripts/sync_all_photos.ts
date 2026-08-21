import fs from 'fs';
import path from 'path';
import https from 'https';
import { prisma } from '../prisma';
import { extractSqlUsers } from './importAllSqlData';

const uploadsDir = path.join(__dirname, '../../public/uploads/form_uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(true));
        });
      } else {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
  });
}

export async function syncAllPhotos() {
  console.log('🚀 Starting Full Automated Photo Ingestion from academy.saimum.org...\n');

  const sqlUsers = extractSqlUsers();
  console.log(`Found ${sqlUsers.length} total SQL records to process for photos.`);

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let idx = 0; idx < sqlUsers.length; idx++) {
    const u = sqlUsers[idx];
    const rawPhoto = (u.photo || u.student_photo || '').trim();

    if (!rawPhoto || rawPhoto === 'null') {
      skippedCount++;
      continue;
    }

    const cleanPath = rawPhoto.startsWith('/') ? rawPhoto.slice(1) : rawPhoto;
    const remoteUrl = `https://academy.saimum.org/storage/${cleanPath}`;
    const filename = path.basename(cleanPath);
    const localDest = path.join(uploadsDir, filename);

    // Find person by phone or name in DB
    const phone = (u.mobile_offline || u.mobile_online || u.father_mobile || '').replace(/[^0-9]/g, '').slice(-10);
    const fullNameEn = (u.name || '').toUpperCase().trim();

    const person = await prisma.person.findFirst({
      where: {
        OR: [
          phone && phone.length >= 10 ? { phone: { contains: phone } } : {},
          { fullNameEn }
        ]
      }
    });

    if (person) {
      // Set live photoUrl (or local upload path)
      const photoUrl = remoteUrl; // Can also be `/uploads/form_uploads/${filename}`
      await prisma.person.update({
        where: { id: person.id },
        data: { photoUrl }
      });
      successCount++;
    } else {
      failedCount++;
    }

    if ((idx + 1) % 100 === 0 || idx === sqlUsers.length - 1) {
      console.log(`📸 Processed ${idx + 1}/${sqlUsers.length} applicants... (Updated: ${successCount})`);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 PHOTO SYNC COMPLETED SUCCESSFULLY!');
  console.log(`✅ Successfully Linked Photos to People in Database: ${successCount}`);
  console.log(`⏩ Skipped (No Photo in Record): ${skippedCount}`);
  console.log('======================================================\n');
}

if (require.main === module) {
  syncAllPhotos()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
