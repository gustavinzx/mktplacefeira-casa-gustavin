const fs = require('fs');
const path = 'c:/Users/gsds0/Desktop/mktplacefeira.casa/src/app/admin/logistica/rotas/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('import { useToast } from')) {
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { useToast } from '@/components/Toast';");
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { useToast } from '@/components/Toast';");
}

// Add hook inside AdminLogisticaRotasPage
if (!content.includes('const { showToast } = useToast();')) {
    content = content.replace(
        "export default function AdminLogisticaRotasPage() {",
        "export default function AdminLogisticaRotasPage() {\n  const { showToast } = useToast();"
    );
}

// Replace alerts
content = content.replace(/alert\('Configuração excluída com sucesso!'\);/g, "showToast('Configuração excluída com sucesso!', 'success');");
content = content.replace(/alert\('Erro ao excluir: ' \+ result\.error\);/g, "showToast('Erro ao excluir: ' + result.error, 'error');");
content = content.replace(/alert\('Erro ao salvar: ' \+ result\.error\);/g, "showToast('Erro ao salvar: ' + result.error, 'error');");
content = content.replace(/alert\('Configurações da cidade salvas com sucesso!'\);/g, "showToast('Configurações da cidade salvas com sucesso!', 'success');");
content = content.replace(/alert\('Erro inesperado ao conectar com o banco\.'\);/g, "showToast('Erro inesperado ao conectar com o banco.', 'error');");
content = content.replace(/alert\('Configurações do motor aplicadas com sucesso!'\);/g, "showToast('Configurações do motor aplicadas com sucesso!', 'success');");
content = content.replace(/alert\('Erro ao salvar configurações do motor: ' \+ result\.error\);/g, "showToast('Erro ao salvar configurações do motor: ' + result.error, 'error');");
content = content.replace(/alert\('Erro inesperado ao salvar configurações do motor\.'\);/g, "showToast('Erro inesperado ao salvar configurações do motor.', 'error');");
content = content.replace(/alert\('Chave API salva com sucesso! O sistema usará essa chave para os cálculos de rotas\.'\);/g, "showToast('Chave API salva com sucesso! O sistema usará essa chave para os cálculos de rotas.', 'success');");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed rotas page!');
