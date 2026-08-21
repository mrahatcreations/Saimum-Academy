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
    // If already exists and size > 0, skip re-download
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
      return resolve(true);
    }

    const file = fs.createWriteStream(destPath);
    const req = https.get(url, { timeout: 10000 }, (response) => {
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
    });

    req.on('error', () => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
  });
}

// Concurrency pool runner
async function runWithConcurrency<T>(items: T[], limit: number, fn: (item: T, index: number) => Promise<void>) {
  let index = 0;
  const workers = new Array(limit).fill(0).map(async () => {
    while (index < items.length) {
      const currentIndex = index++;
      await fn(items[currentIndex], currentIndex);
    }
  });
  await Promise.all(workers);
}

export async function downloadAllPhotosLocally() {
  console.log('🚀 Starting High-Speed Concurrent Photo Downloader (15 Parallel Workers)...\n');

  const sqlUsers = extractSqlUsers();
  console.log(`Found ${sqlUsers.length} total records to process for photo downloads.`);

  const downloadQueue: Array<{
    cleanPath: string;
    remoteUrl: string;
    filename: string;
    localDest: string;
    phone: string;
    fullNameEn: string;
  }> = [];

  sqlUsers.forEach(u => {
    const rawPhoto = (u.photo || u.student_photo || '').trim();
    if (rawPhoto && rawPhoto !== 'null') {
      const cleanPath = rawPhoto.startsWith('/') ? rawPhoto.slice(1) : rawPhoto;
      const remoteUrl = `https://academy.saimum.org/storage/${cleanPath}`;
      const filename = path.basename(cleanPath);
      const localDest = path.join(uploadsDir, filename);
      const phone = (u.mobile_offline || u.mobile_online || u.father_mobile || '').replace(/[^0-9]/g, '').slice(-10);
      const fullNameEn = (u.name || '').toUpperCase().trim();

      downloadQueue.push({
        cleanPath,
        remoteUrl,
        filename,
        localDest,
        phone,
        fullNameEn
      });
    }
  });

  console.log(`Queued ${downloadQueue.length} photos for download.\n`);

  let downloadedCount = 0;
  let failedDownloadCount = 0;
  let dbUpdatedCount = 0;

  await runWithConcurrency(downloadQueue, 15, async (item, idx) => {
    const ok = await downloadFile(item.remoteUrl, item.localDest);

    if (ok) {
      downloadedCount++;
      // Update DB with local photo URL
      const localPhotoUrl = `http://localhost:5000/uploads/form_uploads/${item.filename}`;
      
      const person = await prisma.person.findFirst({
        where: {
          OR: [
            item.phone && item.phone.length >= 10 ? { phone: { contains: item.phone } } : {},
            { fullNameEn: item.fullNameEn }
          ]
        }
      });

      if (person) {
        await prisma.person.update({
          where: { id: person.id },
          data: { photoUrl: localPhotoUrl }
        });
        dbUpdatedCount++;
      }
    } else {
      failedDownloadCount++;
    }

    if ((idx + 1) % 50 === 0 || idx === downloadQueue.length - 1) {
      console.log(`⚡ [${idx + 1}/${downloadQueue.length}] Downloaded: ${downloadedCount} | Updated DB: ${dbUpdatedCount} | Failed: ${failedDownloadCount}`);
    }
  });

  console.log('\n======================================================');
  console.log('🎉 ALL PHOTOS DOWNLOADED & STORED LOCALLY!');
  console.log(`📁 Local Storage Directory: backend/public/uploads/form_uploads/`);
  console.log(`✅ Successfully Downloaded Files: ${downloadedCount}`);
  console.log(`🔄 Database People Records Updated with Local URL: ${dbUpdatedCount}`);
  console.log('======================================================\n');
}

if (require.main === module) {
  downloadAllPhotosLocally()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
