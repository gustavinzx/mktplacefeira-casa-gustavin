const fs = require('fs');
const file = 'src/app/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `redirectTo: \`\${window.location.origin}/login\`,`;
const replacementStr = `redirectTo: \`\${window.location.origin}/auth/callback\`,`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Successfully updated redirectTo for OAuth in login/page.tsx");
} else {
  console.log("Error: Target string not found in login/page.tsx");
}
