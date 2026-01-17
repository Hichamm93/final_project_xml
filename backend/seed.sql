-- Tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client','proprio_film','proprio_cinema')),
  display_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS cinemas (
  id SERIAL PRIMARY KEY,
  owner_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id),
  address TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS films (
  id SERIAL PRIMARY KEY,
  owner_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  poster_url TEXT,
  backdrop_url TEXT,
  duration_min INT NOT NULL,
  release_year INT NOT NULL,
  genres TEXT NOT NULL,
  language TEXT NOT NULL,
  rating TEXT DEFAULT 'PG-13',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS screenings (
  id SERIAL PRIMARY KEY,
  cinema_id INT NOT NULL REFERENCES cinemas(id) ON DELETE CASCADE,
  film_id INT NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  starts_at TIMESTAMP NOT NULL,
  room TEXT NOT NULL,
  price_cents INT NOT NULL,
  total_seats INT NOT NULL,
  booked_seats INT NOT NULL DEFAULT 0,
  UNIQUE (cinema_id, room, starts_at)
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  screening_id INT NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
  seats INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed base
INSERT INTO cities(name) VALUES ('Paris') ON CONFLICT DO NOTHING;
INSERT INTO cities(name) VALUES ('Lyon') ON CONFLICT DO NOTHING;
INSERT INTO cities(name) VALUES ('Marseille') ON CONFLICT DO NOTHING;

-- 3 users (1 par role) - mdp en clair
INSERT INTO users(email,password,role,display_name)
VALUES
('client@demo.com','client','client','Client Demo')
ON CONFLICT DO NOTHING;

INSERT INTO users(email,password,role,display_name)
VALUES
('film@demo.com','film','proprio_film','Proprio Film Demo')
ON CONFLICT DO NOTHING;

INSERT INTO users(email,password,role,display_name)
VALUES
('cinema@demo.com','cinema','proprio_cinema','Proprio Cinema Demo')
ON CONFLICT DO NOTHING;

-- 1 cinema pour le proprio cinema
INSERT INTO cinemas(owner_user_id,name,city_id,address)
SELECT u.id, 'LouLa Cinema - Central', c.id, '1 Rue du Popcorn'
FROM users u, cities c
WHERE u.email='cinema@demo.com' AND c.name='Paris'
ON CONFLICT DO NOTHING;

-- Films de demo (par proprio film)
INSERT INTO films(owner_user_id,title,synopsis,poster_url,backdrop_url,duration_min,release_year,genres,language,rating,featured)
SELECT u.id,
  'Midnight Popcorn',
  'Un thriller stylé dans une ville qui ne dort jamais.',
  'https://images.unsplash.com/photo-1524985069026-dd778a71 show?auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=60',
  118, 2024, 'Thriller,Action', 'FR', 'PG-13', TRUE
FROM users u WHERE u.email='film@demo.com'
ON CONFLICT DO NOTHING;

INSERT INTO films(owner_user_id,title,synopsis,poster_url,backdrop_url,duration_min,release_year,genres,language,rating,featured)
SELECT u.id,
  'Neon City',
  'Un voyage néon, entre romance et science-fiction.',
  'https://images.unsplash.com/photo-1524985069026-dd778a71?auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=1600&q=60',
  132, 2023, 'Sci-Fi,Romance', 'EN', 'PG-13', FALSE
FROM users u WHERE u.email='film@demo.com'
ON CONFLICT DO NOTHING;

-- Programmations
INSERT INTO screenings(cinema_id,film_id,starts_at,room,price_cents,total_seats)
SELECT ci.id, f.id, NOW() + INTERVAL '2 days', 'Salle 1', 1200, 80
FROM cinemas ci, films f
WHERE ci.name='LouLa Cinema - Central' AND f.title='Midnight Popcorn'
ON CONFLICT DO NOTHING;

INSERT INTO screenings(cinema_id,film_id,starts_at,room,price_cents,total_seats)
SELECT ci.id, f.id, NOW() + INTERVAL '5 days', 'Salle 2', 1100, 70
FROM cinemas ci, films f
WHERE ci.name='LouLa Cinema - Central' AND f.title='Neon City'
ON CONFLICT DO NOTHING;
