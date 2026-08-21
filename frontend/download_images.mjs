import fs from 'fs';
import path from 'path';
import https from 'https';

const images = {
  'saimum_stage_live.jpg': 'https://i.ytimg.com/vi/zWf-M1z6h1A/maxresdefault.jpg',
  'saimum_chorus_main.jpg': 'https://i.ytimg.com/vi/fTkjS8cUQns/maxresdefault.jpg',
  'saimum_artist_vocal.jpg': 'https://i.ytimg.com/vi/JQCRjLyx1R0/maxresdefault.jpg',
  'saimum_kids_zaima.jpg': 'https://i.ytimg.com/vi/_Y_iYQS686o/maxresdefault.jpg',
  'saimum_kids_group.jpg': 'https://i.ytimg.com/vi/S26VDKvBrUI/maxresdefault.jpg',
  'saimum_kids_rhyme.jpg': 'https://i.ytimg.com/vi/48P1Q0Um5sU/maxresdefault.jpg',
  'saimum_orchestra.jpg': 'https://i.ytimg.com/vi/0EiRq6m-Zfc/maxresdefault.jpg',
  'saimum_nasheed_special.jpg': 'https://i.ytimg.com/vi/cqVGGcqC65U/maxresdefault.jpg',
  'saimum_logo_wiki.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Saimum_Shilpigosthi_Logo.jpg/800px-Saimum_Shilpigosthi_Logo.jpg'
};

const outputDir = path.resolve('public/images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        // Fallback for YouTube maxres to hqdefault
        if (url.includes('maxresdefault.jpg')) {
          const fallbackUrl = url.replace('maxresdefault.jpg', 'hqdefault.jpg');
          return download(fallbackUrl, dest).then(resolve).catch(reject);
        }
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    });
    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const [filename, url] of Object.entries(images)) {
    const dest = path.join(outputDir, filename);
    try {
      await download(url, dest);
      console.log(`Successfully downloaded: ${filename}`);
    } catch (e) {
      console.error(`Error downloading ${filename}:`, e.message);
    }
  }
}

main();
