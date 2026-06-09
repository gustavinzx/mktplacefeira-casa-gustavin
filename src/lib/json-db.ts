const memoryDB: Record<string, any[]> = {
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
};

export function readDB() {
  return memoryDB;
}

export function writeDB(data: any) {
  Object.assign(memoryDB, data);
}

export function getTable(tableName: string) {
  return memoryDB[tableName] || [];
}

export function saveTable(tableName: string, data: any[]) {
  memoryDB[tableName] = data;
}
