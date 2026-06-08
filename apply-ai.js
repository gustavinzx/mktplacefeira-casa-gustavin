const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\gsds0\\.gemini\\antigravity\\brain\\5163aef8-07b5-4c0d-a25c-0377e23c9967';
const publicBgDir = 'C:\\Users\\gsds0\\Desktop\\mktplacefeira.casa\\public\\bg';

// Ensure public/bg exists
if (!fs.existsSync(publicBgDir)) {
  fs.mkdirSync(publicBgDir, { recursive: true });
}

// Copy images
const images = {
  login: 'login_bg_1780876764110.png',
  vendor: 'vendor_bg_1780876775533.png',
  chef: 'chef_bg_1780876787495.png',
  b2b: 'b2b_bg_1780876799434.png',
  admin: 'admin_bg_1780876810192.png'
};

for (const [key, filename] of Object.entries(images)) {
  const src = path.join(brainDir, filename);
  const dest = path.join(publicBgDir, key + '_bg.png');
  fs.copyFileSync(src, dest);
  console.log(`Copied ${filename} to ${dest}`);
}

const files = [
  { path: 'src/app/login/page.tsx', bg: '/bg/login_bg.png' },
  { path: 'src/app/signup/vendor/page.tsx', bg: '/bg/vendor_bg.png' },
  { path: 'src/app/signup/chef/page.tsx', bg: '/bg/chef_bg.png' },
  { path: 'src/app/signup/b2b/page.tsx', bg: '/bg/b2b_bg.png' },
  { path: 'src/app/admin/login/page.tsx', bg: '/bg/admin_bg.png' }
];

files.forEach(f => {
  let content = fs.readFileSync(f.path, 'utf8');

  // Replace image
  content = content.replace(/<img[^>]*src="https:\/\/images\.unsplash\.com[^>]*>/, 
    `<img\n          src="${f.bg}"\n          alt="Background"\n          className="w-full h-full object-cover"\n        />`);

  // Replace labels: text-white/50 to text-white font-extrabold
  content = content.replace(/text-white\/50/g, 'text-white font-extrabold');

  // Replace inputs: revert dark back to white
  content = content.replace(/bg-white\/10 rounded-\[18px\] px-6 py-4 border border-white\/20 focus:border-([a-zA-Z0-9#-]+) outline-none transition-all font-bold text-sm text-white placeholder:text-white\/40/g, 
    'bg-white rounded-[18px] px-6 py-4 border-2 border-transparent focus:border-$1 outline-none transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400');
  
  // Specific for admin inputs
  content = content.replace(/bg-white\/10 border border-white\/20 focus:border-emerald-500 rounded-\[18px\] outline-none text-sm font-bold text-white placeholder:text-white\/40/g,
    'bg-white border-2 border-transparent focus:border-emerald-500 rounded-[18px] outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400');

  // Add glow ("brilhinho") to the logos
  // We look for drop-shadow-lg and replace with style={{ textShadow: '0 0 20px currentColor' }}
  content = content.replace(/drop-shadow-lg/g, 'drop-shadow-lg" style={{ textShadow: "0 0 25px currentColor" }} data-glow="true');

  fs.writeFileSync(f.path, content);
  console.log(`Updated ${f.path}`);
});
