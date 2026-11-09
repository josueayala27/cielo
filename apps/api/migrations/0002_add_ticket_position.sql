-- Manual board order. Fractional ranking: a moved ticket gets the midpoint of its new
-- neighbours, so a reorder writes one row. Existing rows are ranked newest first by using
-- the negative creation time in milliseconds, which is also what new tickets receive.
ALTER TABLE tickets ADD COLUMN position REAL NOT NULL DEFAULT 0;

UPDATE tickets SET position = -((julianday(created_at) - 2440587.5) * 86400000.0);

CREATE INDEX idx_tickets_status_position ON tickets (status, position, id);
