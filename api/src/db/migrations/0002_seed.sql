-- Datos de prueba para desarrollo local
-- Aplicar con: wrangler d1 execute mr-hops-db --local --file=src/db/migrations/0002_seed.sql

-- ─── Productos: Latas ─────────────────────────────────────────────────────────
INSERT INTO products (id, name, description, category, price, stock, active) VALUES
  ('lata-001', 'Mr. Hops IPA', 'IPA clásica con notas cítricas y amargor equilibrado. 5.5% ABV.', 'lata', 1500, 80, 1),
  ('lata-002', 'Mr. Hops Stout', 'Stout oscura con notas de café y chocolate amargo. 6.2% ABV.', 'lata', 1600, 60, 1),
  ('lata-003', 'Mr. Hops Blonde', 'Rubia suave y refrescante, ideal para el verano. 4.8% ABV.', 'lata', 1400, 100, 1),
  ('lata-004', 'Mr. Hops Red Ale', 'Ale roja con maltosidad y lúpulo floral. 5.0% ABV.', 'lata', 1550, 70, 1);

-- ─── Productos: PET 1L ────────────────────────────────────────────────────────
INSERT INTO products (id, name, description, category, price, stock, active) VALUES
  ('pet-001', 'IPA 1L PET', 'Nuestra IPA en formato PET de 1 litro. Perfecta para compartir.', 'pet', 3800, 40, 1),
  ('pet-002', 'Stout 1L PET', 'Stout oscura en PET de 1 litro.', 'pet', 4000, 30, 1),
  ('pet-003', 'Blonde 1L PET', 'Rubia refrescante en PET de 1 litro.', 'pet', 3600, 50, 1);

-- ─── Productos: Packs ─────────────────────────────────────────────────────────
INSERT INTO products (id, name, description, category, price, stock, active) VALUES
  ('pack-001', 'Pack Variado x6', '6 latas surtidas: 2 IPA + 2 Stout + 2 Blonde. Ideal para probar.', 'pack', 8500, 25, 1),
  ('pack-002', 'Pack IPA x12', '12 latas de nuestra IPA. Para los que ya saben lo que quieren.', 'pack', 16000, 15, 1),
  ('pack-003', 'Pack Fiesta x24', '24 latas variadas para eventos y reuniones. Incluye descuento.', 'pack', 30000, 8, 1);

-- ─── Productos: Barriles ──────────────────────────────────────────────────────
INSERT INTO products (id, name, description, category, price, stock, active) VALUES
  ('barril-001', 'Barril Mr. Hops IPA', 'Barril de nuestra IPA para eventos. Disponible en 10, 20 y 30 litros.', 'barril', 0, 3, 1),
  ('barril-002', 'Barril Mr. Hops Stout', 'Barril de Stout oscura para eventos.', 'barril', 0, 2, 1),
  ('barril-003', 'Barril Mr. Hops Blonde', 'Barril de rubia para eventos.', 'barril', 0, 3, 1);

-- ─── Variantes de barril ──────────────────────────────────────────────────────
INSERT INTO barrel_variants (id, product_id, liters, price_per_day, deposit, stock) VALUES
  -- IPA
  ('bv-001', 'barril-001', 10, 4500, 5000, 2),
  ('bv-002', 'barril-001', 20, 7500, 8000, 2),
  ('bv-003', 'barril-001', 30, 10000, 10000, 1),
  -- Stout
  ('bv-004', 'barril-002', 10, 4800, 5000, 1),
  ('bv-005', 'barril-002', 20, 8000, 8000, 1),
  -- Blonde
  ('bv-006', 'barril-003', 10, 4200, 5000, 2),
  ('bv-007', 'barril-003', 20, 7000, 8000, 1),
  ('bv-008', 'barril-003', 30, 9500, 10000, 1);

-- ─── Accesorios ───────────────────────────────────────────────────────────────
INSERT INTO products (id, name, description, category, price, stock, active) VALUES
  ('acc-001', 'Chopera', 'Chopera de mostrador lista para usar con el barril.', 'accesorio', 3000, 5, 1),
  ('acc-002', 'Canilla de barril', 'Canilla plástica para barriles de 20 y 30L.', 'accesorio', 1500, 8, 1),
  ('acc-003', 'Vasos descartables x50', 'Pack de 50 vasos descartables de 500ml.', 'accesorio', 2500, 20, 1),
  ('acc-004', 'Vasos de vidrio x6', '6 vasos de vidrio tipo pinta (500ml).', 'accesorio', 4000, 10, 1);

-- ─── Pedido de prueba ─────────────────────────────────────────────────────────
INSERT INTO orders (id, order_number, guest_name, guest_email, guest_phone,
  delivery_type, delivery_address, notes, status, subtotal, total) VALUES
  ('order-test-001', 'MH-0001', 'Juan García', 'juan@example.com', '1155551234',
   'delivery', 'Av. Corrientes 1234, CABA', 'Timbre 3B', 'pending_confirmation', 8500, 8500);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
  ('oi-001', 'order-test-001', 'pack-001', 1, 8500, 8500);

INSERT INTO order_status_history (id, order_id, status) VALUES
  ('osh-001', 'order-test-001', 'pending_confirmation');

-- ─── Pedido confirmado de prueba ──────────────────────────────────────────────
INSERT INTO orders (id, order_number, guest_name, guest_email, guest_phone,
  delivery_type, status, subtotal, total) VALUES
  ('order-test-002', 'MH-0002', 'María López', 'maria@example.com', '1166662345',
   'pickup', 'confirmed', 4700, 4700);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
  ('oi-002', 'order-test-002', 'lata-001', 2, 1500, 3000),
  ('oi-003', 'order-test-002', 'pet-003', 1, 3600, 3600);

-- Corrijo subtotal/total
UPDATE orders SET subtotal = 6600, total = 6600 WHERE id = 'order-test-002';

INSERT INTO order_status_history (id, order_id, status) VALUES
  ('osh-002', 'order-test-002', 'pending_confirmation'),
  ('osh-003', 'order-test-002', 'confirmed');

-- ─── Reserva de prueba ────────────────────────────────────────────────────────
INSERT INTO barrel_reservations (id, reservation_number, guest_name, guest_email, guest_phone,
  barrel_variant_id, start_date, end_date, delivery_type, status, total, deposit_amount) VALUES
  ('res-test-001', 'MH-R-0001', 'Carlos Fernández', 'carlos@example.com', '1177773456',
   'bv-002', '2026-05-23', '2026-05-26', 'delivery', 'confirmed', 30500, 8000);

INSERT INTO reservation_status_history (id, reservation_id, status) VALUES
  ('rsh-001', 'res-test-001', 'pending_confirmation'),
  ('rsh-002', 'res-test-001', 'confirmed');
