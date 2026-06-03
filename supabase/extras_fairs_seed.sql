-- Feiras de demonstração (opcional)
INSERT INTO mktplace_feira_fairs (name, location, city, region, schedule) VALUES
('Feira da Vila Mariana', 'Rua Joaquim Távora, 1200', 'São Paulo', 'Zona Sul', '{"terca": "07:00-13:00", "sabado": "07:00-13:00"}'),
('Feira de Pinheiros', 'Praça Benedito Calixto', 'São Paulo', 'Oeste', '{"sabado": "07:00-14:00"}'),
('Feira Orgânica Ibirapuera', 'Rua Tutóia, 1125', 'São Paulo', 'Sul', '{"domingo": "06:00-13:00"}')
ON CONFLICT DO NOTHING;
