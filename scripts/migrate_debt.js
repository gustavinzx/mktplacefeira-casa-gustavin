/**
 * Script automatizado para migrar:
 * A) alert() → showToast()
 * B) localStorage.getItem('access_token') → supabase.auth.getSession()
 */
const fs = require('fs');
const path = require('path');

let alertsFixed = 0;
let localStorageFixed = 0;
let filesModified = new Set();

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let modified = false;

  const hasAlerts = /\balert\s*\(/.test(content) && 
    !content.split('\n').every(l => !(/\balert\s*\(/.test(l)) || l.trim().startsWith('//'));
  
  const hasLocalStorage = content.includes("localStorage.getItem('access_token')");

  // Skip if nothing to do
  const alertLines = content.split('\n').filter(l => 
    /\balert\s*\(/.test(l) && !l.trim().startsWith('//') && 
    !l.includes('AlertCircle') && !l.includes('AlertTriangle') && !l.includes('alertas')
  );
  
  const lsLines = content.split('\n').filter(l => 
    l.includes("localStorage.getItem('access_token')") && !l.trim().startsWith('//')
  );

  if (alertLines.length === 0 && lsLines.length === 0) return;

  // === MIGRATION A: alert() → showToast() ===
  if (alertLines.length > 0) {
    // Add useToast import if not present
    if (!content.includes('useToast')) {
      // Find the last import line
      const lines = content.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trimStart().startsWith('import ') || lines[i].trimStart().startsWith("import {")) {
          lastImportIdx = i;
        }
      }
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, "import { useToast } from '@/components/Toast';");
        content = lines.join('\n');
      }
    }

    // Add showToast declaration if not present
    if (!content.includes('showToast')) {
      // Find the first useState or useEffect or useRouter call after export/function/const.*=
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i].trim();
        if ((l.includes('useState(') || l.includes('useEffect(') || l.includes('useRouter(')) && 
            !l.startsWith('//') && !l.startsWith('import')) {
          lines.splice(i, 0, "  const { showToast } = useToast();");
          content = lines.join('\n');
          break;
        }
      }
    }

    // Replace alert() calls
    content = content.replace(/^([ \t]*)alert\((['"`])((?:Erro|Falha|erro|falha).*?)\2\)\s*;/gm, (match, indent, q, msg) => {
      alertsFixed++;
      return `${indent}showToast(${q}${msg}${q}, 'error');`;
    });
    content = content.replace(/^([ \t]*)alert\((.*?)\)\s*;/gm, (match, indent, args) => {
      // Determine type based on content
      const lower = args.toLowerCase();
      let type = "'info'";
      if (lower.includes('erro') || lower.includes('falha') || lower.includes('error')) type = "'error'";
      else if (lower.includes('sucesso') || lower.includes('salv') || lower.includes('criad') || lower.includes('atualiz') || lower.includes('conclu')) type = "'success'";
      alertsFixed++;
      return `${indent}showToast(${args}, ${type});`;
    });
    
    // Handle inline alert in arrow functions: onClick={() => alert(...)}
    content = content.replace(/alert\((['"`])(.*?)\1\)/g, (match, q, msg) => {
      const lower = msg.toLowerCase();
      let type = "'info'";
      if (lower.includes('erro') || lower.includes('falha') || lower.includes('error')) type = "'error'";
      else if (lower.includes('sucesso') || lower.includes('salv') || lower.includes('criad') || lower.includes('atualiz') || lower.includes('conclu')) type = "'success'";
      alertsFixed++;
      return `showToast(${q}${msg}${q}, ${type})`;
    });
    
    modified = true;
  }

  // === MIGRATION B: localStorage access_token → supabase session ===
  if (lsLines.length > 0) {
    // Make sure supabase is imported
    if (!content.includes("from '@/lib/supabase'") && !content.includes('from "@/lib/supabase"')) {
      const lines = content.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trimStart().startsWith('import ')) lastImportIdx = i;
      }
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, "import { supabase } from '@/lib/supabase';");
        content = lines.join('\n');
      }
    }

    // Replace patterns:
    // Pattern 1: const token = localStorage.getItem('access_token');
    content = content.replace(
      /const\s+token\s*=\s*localStorage\.getItem\('access_token'\)\s*;?/g,
      "const { data: { session } } = await supabase.auth.getSession();\n    const token = session?.access_token;"
    );
    
    // Pattern 2: localStorage.getItem('access_token') used inline (e.g. in headers)
    content = content.replace(
      /localStorage\.getItem\('access_token'\)/g,
      "(await supabase.auth.getSession()).data.session?.access_token"
    );
    
    localStorageFixed += lsLines.length;
    modified = true;
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified.add(filePath);
    console.log('✅', path.relative('src', filePath).replace(/\\/g, '/'));
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory() && !f.startsWith('.') && f !== 'node_modules') {
      walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      try { processFile(p); } catch (e) { console.log('❌ ERROR:', p, e.message); }
    }
  });
}

walk('src');
console.log(`\n=== DONE ===`);
console.log(`Files modified: ${filesModified.size}`);
console.log(`Alerts fixed: ${alertsFixed}`);
console.log(`localStorage fixed: ${localStorageFixed}`);
