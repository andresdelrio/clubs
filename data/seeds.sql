INSERT INTO sedes (nombre, slug)
VALUES 
  ('Blanca Correa', 'blanca-correa'),
  ('San José', 'san-jose')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

