const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file === 'page.tsx' || file === 'route.ts' || file === 'layout.tsx') {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);
const report = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(srcDir, file).replace(/\\/g, '/');
  
  let bugs = [];
  let brokenButtons = [];
  let security = [];
  let missing = [];
  
  // Syntax checks
  if (file.endsWith('.tsx') && !content.includes('export default') && !content.includes('export function')) {
    bugs.push('Missing export default');
  }

  // Broken buttons / mocks
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const ln = index + 1;
    if (line.includes('alert(') && !line.includes('//')) {
      brokenButtons.push(`Line ${ln}: Uses alert() instead of toast/modal`);
    }
    if (line.includes('setTimeout(') && line.includes('showToast') && !line.includes('//')) {
      brokenButtons.push(`Line ${ln}: Fake loading with setTimeout`);
    }
    if (line.includes('onClick={() => {}}') || line.includes('onClick={() => console.log')) {
      brokenButtons.push(`Line ${ln}: Empty onClick handler`);
    }
    if (line.includes('localStorage.getItem(') && !line.includes('//')) {
      security.push(`Line ${ln}: Unsafe use of localStorage for tokens/state`);
    }
    if (line.toLowerCase().includes('// todo') || line.toLowerCase().includes('//todo')) {
      missing.push(`Line ${ln}: ${line.trim()}`);
    }
    if (line.includes('mock') && !line.includes('//')) {
      bugs.push(`Line ${ln}: Contains word 'mock'`);
    }
  });

  // Auth checks for api routes
  if (relativePath.startsWith('app/api/') && !relativePath.includes('auth/')) {
    if (!content.includes('supabase.auth.getSession()') && !content.includes('verify_jwt')) {
      security.push(`Potential missing auth check in API route`);
    }
  }

  if (bugs.length > 0 || brokenButtons.length > 0 || security.length > 0 || missing.length > 0) {
    report.push({
      file: relativePath,
      bugs,
      brokenButtons,
      security,
      missing
    });
  }
});

fs.writeFileSync('deep_audit_report.json', JSON.stringify(report, null, 2));
console.log(`Audited ${allFiles.length} files. Found issues in ${report.length} files. Report saved to deep_audit_report.json`);
