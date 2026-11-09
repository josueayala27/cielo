-- Support tickets. Dates are ISO-8601 UTC strings, which sort chronologically as text.
CREATE TABLE tickets (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL CHECK (length(title) BETWEEN 5 AND 100),
  description    TEXT NOT NULL CHECK (length(description) BETWEEN 10 AND 1000),
  customer_name  TEXT NOT NULL CHECK (length(customer_name) BETWEEN 2 AND 100),
  customer_email TEXT NOT NULL,
  priority       TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

-- Listing filters and the default sort.
CREATE INDEX idx_tickets_created_at ON tickets (created_at DESC, id DESC);
CREATE INDEX idx_tickets_status ON tickets (status, created_at DESC);
CREATE INDEX idx_tickets_priority ON tickets (priority, created_at DESC);
