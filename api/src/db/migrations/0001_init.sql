-- Mr. Hops Beer — Migración inicial
-- Aplicar con: wrangler d1 migrations apply mr-hops-db

-- ─── Usuarios ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Productos ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL CHECK(category IN ('lata','pet','pack','barril','accesorio')),
  price       REAL NOT NULL CHECK(price >= 0),
  image_url   TEXT,
  stock       INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  active      INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Variantes de barril ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS barrel_variants (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  liters        INTEGER NOT NULL CHECK(liters > 0),
  price_per_day REAL NOT NULL CHECK(price_per_day >= 0),
  deposit       REAL NOT NULL DEFAULT 0 CHECK(deposit >= 0),
  stock         INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0)
);

-- ─── Pedidos ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  order_number     TEXT UNIQUE NOT NULL,
  user_id          TEXT REFERENCES users(id),
  guest_name       TEXT,
  guest_email      TEXT,
  guest_phone      TEXT,
  delivery_type    TEXT NOT NULL CHECK(delivery_type IN ('delivery','pickup')),
  delivery_address TEXT,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'pending_confirmation'
    CHECK(status IN ('pending_confirmation','confirmed','in_preparation',
                     'ready','delivered','cancelled')),
  payment_status   TEXT NOT NULL DEFAULT 'unpaid'
    CHECK(payment_status IN ('unpaid','paid','refunded')),
  payment_id       TEXT,
  subtotal         REAL NOT NULL CHECK(subtotal >= 0),
  total            REAL NOT NULL CHECK(total >= 0),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Items del pedido ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK(quantity > 0),
  unit_price REAL NOT NULL CHECK(unit_price >= 0),
  subtotal   REAL NOT NULL CHECK(subtotal >= 0)
);

-- ─── Reservas de barriles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS barrel_reservations (
  id                 TEXT PRIMARY KEY,
  reservation_number TEXT UNIQUE NOT NULL,
  user_id            TEXT REFERENCES users(id),
  guest_name         TEXT,
  guest_email        TEXT,
  guest_phone        TEXT,
  barrel_variant_id  TEXT NOT NULL REFERENCES barrel_variants(id),
  start_date         TEXT NOT NULL,
  end_date           TEXT NOT NULL,
  delivery_type      TEXT NOT NULL CHECK(delivery_type IN ('delivery','pickup')),
  delivery_address   TEXT,
  notes              TEXT,
  status             TEXT NOT NULL DEFAULT 'pending_confirmation'
    CHECK(status IN ('pending_confirmation','confirmed',
                     'barrel_delivered','barrel_returned','cancelled')),
  payment_status     TEXT NOT NULL DEFAULT 'unpaid'
    CHECK(payment_status IN ('unpaid','paid','refunded')),
  payment_id         TEXT,
  total              REAL NOT NULL CHECK(total >= 0),
  deposit_amount     REAL NOT NULL DEFAULT 0 CHECK(deposit_amount >= 0),
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Accesorios de reserva ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservation_accessories (
  id             TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES barrel_reservations(id) ON DELETE CASCADE,
  product_id     TEXT NOT NULL REFERENCES products(id),
  quantity       INTEGER NOT NULL CHECK(quantity > 0),
  unit_price     REAL NOT NULL CHECK(unit_price >= 0)
);

-- ─── Historial de estados ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_status_history (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reservation_status_history (
  id             TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES barrel_reservations(id) ON DELETE CASCADE,
  status         TEXT NOT NULL,
  note           TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number     ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_res_dates         ON barrel_reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_res_status        ON barrel_reservations(status);
CREATE INDEX IF NOT EXISTS idx_res_number        ON barrel_reservations(reservation_number);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(active);
CREATE INDEX IF NOT EXISTS idx_barrel_product    ON barrel_variants(product_id);
