CREATE TABLE IF NOT EXISTS downloads (
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (name, version)
);
