const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src/app/admin'));
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('supabaseAdmin')) {
    // Replace all supabaseAdmin with supabase
    content = content.replace(/\bsupabaseAdmin\b/g, 'supabase');
    // Fix duplicate imports: import { supabase, supabase }
    content = content.replace(/import\s*\{\s*supabase\s*,\s*supabase\s*\}/g, 'import { supabase }');
    content = content.replace(/import\s*\{\s*supabase\s*,\s*supabase\s*,\s*getTableName\s*\}/g, 'import { supabase, getTableName }');
    
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
}

console.log(`Replaced in ${count} files.`);
