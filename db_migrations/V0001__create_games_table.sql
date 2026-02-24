CREATE TABLE IF NOT EXISTS t_p62363095_mr_games_portal.games (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    rating NUMERIC(3,1) DEFAULT 0,
    downloads VARCHAR(50) DEFAULT '0',
    year INTEGER DEFAULT 2025,
    cover_url TEXT,
    tag VARCHAR(50) DEFAULT '',
    is_new BOOLEAN DEFAULT true,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);
