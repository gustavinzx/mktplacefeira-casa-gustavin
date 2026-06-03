import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'mock_db.json');

// Inicializa o banco de dados JSON se não existir
function initDB() {
  if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      planos: [
        {
          id: '1',
          name: 'Essencial (Grátis)',
          targetProfile: 'feirante',
          price: 0,
          recurrence: 'mensal',
          gracePeriodDays: 0,
          features: ['Até 10 produtos', 'Taxa de 15%', 'Suporte via ticket'],
          isActive: true,
        },
        {
          id: '2',
          name: 'Premium',
          targetProfile: 'feirante',
          price: 89.90,
          recurrence: 'mensal',
          gracePeriodDays: 14,
          features: ['Produtos Ilimitados', 'Taxa de 10%', 'Suporte via WhatsApp'],
          isActive: true,
        }
      ],
      leads: [
        { id: '1', name: 'João Batista', phone: '(11) 98765-4321', status: 'novo', stallName: 'Barraca das Frutas' }
      ],
      frete: [
        { id: '1', city: 'São Paulo', state: 'SP', basePrice: 15.00, pricePerKm: 2.50, isActive: true }
      ],
      fornecedores: [
        { id: '1', name: 'Logística Verde', type: 'Entrega Expressa', phone: '(11) 99999-1111', rating: 4.8 }
      ],
      logs: [
        { id: '1', action: 'CREATE_USER', user: 'Admin', timestamp: new Date().toISOString() }
      ]
    }, null, 2));
  }
}

export function readDB() {
  initDB();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export function writeDB(data: any) {
  initDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getTable(tableName: string) {
  const db = readDB();
  return db[tableName] || [];
}

export function saveTable(tableName: string, data: any[]) {
  const db = readDB();
  db[tableName] = data;
  writeDB(db);
}
