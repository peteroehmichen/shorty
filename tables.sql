DROP TABLE IF EXISTS urls;
CREATE TABLE urls (
    id SERIAL primary key,
    created_count INTEGER NOT NULL,
    accessed_count INTEGER NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    original_url TEXT NOT NULL UNIQUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);