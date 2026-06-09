#!/usr/bin/env node
/**
 * fix-themecolor.js
 * ─────────────────────────────────────────────────────────────────────────
 * Corrige o aviso do Next.js 16:
 *   "Unsupported metadata themeColor — move it to viewport export instead"
 *
 * O que faz em cada arquivo:
 *   1. Remove `themeColor` do objeto `metadata`
 *   2. Adiciona (ou atualiza) um export `viewport` com o themeColor
 *
 * USO:
 *   node fix-themecolor.js [--dry-run]
 * ─────────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const SRC_DIR = path.join(process.cwd(), 'src');

let fixed = 0;
let skipped = 0;

// ─── helpers ────────────────────────────────────────────────────────────────

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function extractThemeColor(content) {
  // Extrai o valor de themeColor do objeto metadata
  // Suporta: themeColor: '#125d30'  ou  themeColor: "#125d30"
  const match = content.match(/themeColor\s*:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : '#125d30'; // fallback para a cor padrão do projeto
}

function removeThemeColorFromMetadata(content) {
  // Remove a linha inteira com themeColor dentro do metadata
  return content.replace(/^[ \t]*themeColor\s*:.*,?\r?\n/gm, '');
}

function hasViewportExport(content) {
  return /export\s+(const|function)\s+viewport/.test(content);
}

function addViewportExport(content, color) {
  const viewportExport = `\nexport const viewport = {\n  themeColor: '${color}',\n}\n`;

  // Insere após o bloco de metadata se existir, senão no final
  const metadataEnd = content.search(/export\s+(const\s+metadata|async\s+function\s+generateMetadata)/);
  if (metadataEnd !== -1) {
    // Encontra o fim do bloco metadata (fecha na primeira } no nível raiz após o início)
    let depth = 0;
    let i = metadataEnd;
    let foundOpen = false;
    while (i < content.length) {
      if (content[i] === '{') { depth++; foundOpen = true; }
      if (content[i] === '}') { depth--; }
      if (foundOpen && depth === 0) {
        // Insere depois do fechamento do metadata
        return content.slice(0, i + 1) + viewportExport + content.slice(i + 1);
      }
      i++;
    }
  }

  // Fallback: insere antes do export default
  const defaultExport = content.search(/^export\s+default\s+/m);
  if (defaultExport !== -1) {
    return content.slice(0, defaultExport) + viewportExport + '\n' + content.slice(defaultExport);
  }

  // Último recurso: adiciona no final
  return content + viewportExport;
}

function updateViewportExport(content, color) {
  // Se já tem viewport mas sem themeColor, adiciona
  if (!content.includes('themeColor') || !content.match(/export\s+(const|function)\s+viewport[\s\S]*?themeColor/)) {
    return content.replace(
      /(export\s+const\s+viewport\s*=\s*\{)/,
      `$1\n  themeColor: '${color}',`
    );
  }
  // Se já tem themeColor no viewport, atualiza o valor
  return content.replace(
    /(export\s+const\s+viewport[\s\S]*?themeColor\s*:\s*)['"][^'"]*['"]/,
    `$1'${color}'`
  );
}

// ─── processamento ───────────────────────────────────────────────────────────

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Só processa arquivos que têm themeColor no metadata
  if (!content.includes('themeColor')) {
    skipped++;
    return;
  }

  // Verifica se o themeColor está dentro de um export metadata (não de outro lugar)
  const hasMetadataWithTheme = /export\s+(const\s+metadata|async\s+function\s+generateMetadata)[\s\S]*?themeColor/.test(content);
  if (!hasMetadataWithTheme) {
    skipped++;
    return;
  }

  const color = extractThemeColor(content);
  let updated = removeThemeColorFromMetadata(content);

  if (hasViewportExport(updated)) {
    updated = updateViewportExport(updated, color);
  } else {
    updated = addViewportExport(updated, color);
  }

  if (updated === content) {
    skipped++;
    return;
  }

  const rel = filePath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');

  if (DRY_RUN) {
    console.log(`  [dry-run] ${rel}`);
  } else {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`  ✅  ${rel}`);
  }
  fixed++;
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log('🎨  fix-themecolor.js');
console.log('─'.repeat(60));
if (DRY_RUN) console.log('ℹ️   Modo: DRY-RUN\n');

if (!fs.existsSync(SRC_DIR)) {
  console.error('❌  Diretório src/ não encontrado. Rode na raiz do projeto.');
  process.exit(1);
}

const files = walk(SRC_DIR);
console.log(`📁  Escaneando ${files.length} arquivos em src/...\n`);

for (const file of files) {
  processFile(file);
}

console.log('\n' + '─'.repeat(60));
console.log(`✅  Corrigidos: ${fixed} arquivo(s)`);
console.log(`⏩  Sem alteração: ${skipped} arquivo(s)`);
console.log('\n📋  Próximo passo:');
console.log('   npm run build');
console.log('─'.repeat(60) + '\n');
