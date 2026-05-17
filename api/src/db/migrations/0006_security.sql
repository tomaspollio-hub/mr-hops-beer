-- Rate limiting de intentos de login por IP
CREATE TABLE IF NOT EXISTS login_attempts (
  id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ip        TEXT NOT NULL,
  email     TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts (ip, created_at);

-- Tokens para reset de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_prt_user ON password_reset_tokens (user_id);
