import https from 'https';

const testPaths = [
  'form_uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  'storage/form_uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  'storage/app/public/form_uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  'public/form_uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  'storage/student_photo_1762346524_690b461c1b3bb.jpg',
  'uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  'uploads/form_uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  'images/form_uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  'assets/form_uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  'media/form_uploads/student_photo_1762346524_690b461c1b3bb.jpg',
  '1783584174_NrMcYD3Ufn.jpg',
  'form_uploads/1783584174_NrMcYD3Ufn.jpg',
  'storage/1783584174_NrMcYD3Ufn.jpg',
  'storage/form_uploads/1783584174_NrMcYD3Ufn.jpg'
];

async function checkUrl(urlPath: string): Promise<{ url: string; status: number; contentType?: string }> {
  return new Promise((resolve) => {
    const fullUrl = `https://academy.saimum.org/${urlPath}`;
    const req = https.request(fullUrl, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ url: fullUrl, status: res.statusCode || 0, contentType: res.headers['content-type'] });
    });
    req.on('error', (err) => {
      resolve({ url: fullUrl, status: 0 });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ url: fullUrl, status: 408 });
    });
    req.end();
  });
}

async function testAll() {
  console.log('Testing potential image endpoints on academy.saimum.org...\n');
  for (const p of testPaths) {
    const res = await checkUrl(p);
    console.log(`[${res.status}] ${res.url} (${res.contentType || ''})`);
  }
}

testAll();
