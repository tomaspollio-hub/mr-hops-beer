-- Agregar columna role a users
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'
  CHECK(role IN ('customer', 'admin'));

-- Insertar usuario admin
INSERT OR IGNORE INTO users (id, email, name, password_hash, role)
VALUES (
  'fc90397e-3fb4-447e-99d3-1c5b9c3ebc33',
  'tomaspollio@gmail.com',
  'Admin',
  '2dc6203d2d5ea8eefff1bbbe1d4d12f190a1af39a39a2c490b8f1af2f9b44d34',
  'admin'
);
