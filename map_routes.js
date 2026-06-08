const fs = require('fs');
const path = require('path');

function walk(dir, isApi = false) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath, isApi || file === 'api'));
    } else {
      if ((file === 'page.tsx' && !isApi) || (file === 'route.ts' && isApi)) {
        results.push(filePath.replace(/\\/g, '/').split('src/app/')[1]);
      }
    }
  });
  
  return results;
}

const routes = walk(path.join(__dirname, 'src', 'app'));
console.log(JSON.stringify(routes, null, 2));
