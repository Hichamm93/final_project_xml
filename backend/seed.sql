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


INSERT INTO cities (name)
VALUES
('Paris'),
('Marseille'),
('Lyon'),
('Toulouse'),
('Lille');



INSERT INTO users (email, password, role, display_name)
VALUES
('proprio.film@loulacinema.com', '123', 'Propriétaire Films', 'Propriétaire Films'),
('proprio.cinema.paris@loulacinema.com', '123', 'Cinéma Paris', 'Proprio Cinéma Paris'),
('proprio.cinema.marseille@loulacinema.com', '123', 'Cinéma Marseille', 'Proprio Cinéma Marseille'),
('proprio.cinema.lyon@loulacinema.com', '123', 'Cinéma Lyon', 'Proprio Cinéma Lyon'),
('proprio.cinema.toulouse@loulacinema.com', '123', 'Cinéma Toulouse', 'Proprio Cinéma Toulouse'),
('proprio.cinema.lille@loulacinema.com', '123', 'Cinéma Lille', 'Proprio Cinéma Lille'),
('client@loulacinema.com', '123', 'Compte Client', 'Client Test');


INSERT INTO cinemas (owner_user_id, name, city_id, address)
VALUES
(2, 'LouLa Cinéma Paris', 1, '12 avenue des Champs-Élysées, 75008 Paris'),
(3, 'LouLa Cinéma Marseille', 2, '5 quai du Port, 13002 Marseille'),
(4, 'LouLa Cinéma Lyon', 3, '20 rue de la République, 69002 Lyon'),
(5, 'LouLa Cinéma Toulouse', 4, '8 place du Capitole, 31000 Toulouse'),
(6, 'LouLa Cinéma Lille', 5, '15 rue Nationale, 59000 Lille');


INSERT INTO films (owner_user_id, title, synopsis, poster_url, backdrop_url, duration_min, release_year, genres, language, rating, featured)
VALUES
(1, 'Parasite', 'Une famille pauvre infiltre progressivement le quotidien d’une famille riche, déclenchant une spirale sociale et violente.', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg', 132, 2019, 'Drama, Thriller', 'Korean', 'R', TRUE),

(1, 'Mad Max: Fury Road', 'Dans un désert post-apocalyptique, une fuite effrénée devient une guerre totale pour la survie.', 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2015/05/mad-max-fury-road-banniere-hardy-theron-1536x864.jpg', 120, 2015, 'Action, Sci-Fi', 'English', 'R', TRUE),

(1, 'Everything Everywhere All at Once', 'Une femme ordinaire découvre qu’elle doit sauver le multivers en explorant toutes ses vies possibles.', 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', 'https://m.media-amazon.com/images/S/pv-target-images/f436f7401415fde2f64fb02733c536a30d3155611891f98518e1cd820bf57a85._SX1080_FMjpg_.jpg', 139, 2022, 'Sci-Fi, Drama, Comedy', 'English', 'R', TRUE),

(1, 'Oppenheimer', 'Le destin du père de la bombe atomique et les conséquences morales de son invention.', 'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg', 'https://www.thebanner.org/sites/default/files/styles/article_detail_header/public/2023-08/MM-1207%20Oppenheimer.jpg?itok=0U-jOPJC', 180, 2023, 'Drama, History', 'English', 'R', TRUE),

(1, 'Dune: Part Two', 'Paul Atreides s’allie aux Fremen pour venger sa famille et changer le destin de l’univers.', 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', 'https://www.abc.net.au/triplej/the-latest/dune-part-two-review-2024/103517246', 166, 2024, 'Sci-Fi, Adventure', 'English', 'PG-13', TRUE),

(1, 'Dune', 'Sur la planète Arrakis, une famille noble lutte pour le contrôle de l’épice.', 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2021/09/dune-partie-1-2021-banniere-scaled.jpg', 155, 2021, 'Sci-Fi, Adventure', 'English', 'PG-13', TRUE),

(1, 'La La Land', 'Deux artistes tentent de concilier amour et ambitions à Los Angeles.', 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', 'https://www.anis-flavigny.com/wp-content/uploads/2018/01/maxresdefault-1030x579.jpg', 128, 2016, 'Drama, Romance, Music', 'English', 'PG-13', FALSE),

(1, 'Blade Runner 2049', 'Un blade runner découvre un secret capable de bouleverser l’humanité.', 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2016/12/blade-runner-2049-ryan-gosling-desert.jpg', 164, 2017, 'Sci-Fi, Thriller', 'English', 'R', TRUE),

(1, 'Whiplash', 'Un jeune batteur subit l’enseignement brutal d’un professeur obsessionnel.', 'https://i.ebayimg.com/images/g/P4QAAOSwjSVlStTT/s-l400.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2014/12/whiplash-film-banniere.jpg', 107, 2014, 'Drama, Music', 'English', 'R', TRUE),

(1, 'Interstellar', 'Des astronautes voyagent au-delà de notre galaxie pour sauver l’humanité.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://ledrenche.fr/wp-content/uploads/interstellar-the-movie-475.jpg', 169, 2014, 'Sci-Fi, Drama', 'English', 'PG-13', TRUE);
INSERT INTO films (owner_user_id, title, synopsis, poster_url, backdrop_url, duration_min, release_year, genres, language, rating, featured)
VALUES
(1, 'The Lighthouse', 'Deux gardiens de phare sombrent dans la folie sur une île isolée.', 'https://image.tmdb.org/t/p/w500/3nk9UoepYmv1G9oP18q6JJCeYwN.jpg', 'https://nofilmschool.com/media-library/lh-ss-03805-bw-rc4-1.jpg?id=34064834&width=1245&height=700&coordinates=0%2C0%2C0%2C1', 109, 2019, 'Drama, Horror', 'English', 'R', FALSE),

(1, 'The Revenant', 'Un trappeur laissé pour mort lutte pour survivre dans une nature hostile.', 'https://fr.web.img3.acsta.net/pictures/15/11/10/09/30/165611.jpg', 'https://i0.wp.com/activehistory.ca/wp-content/uploads/2016/01/revenant-gallery-15-gallery-image.jpg?ssl=1', 156, 2015, 'Drama, Adventure', 'English', 'R', TRUE),

(1, 'Get Out', 'Un week-end chez les beaux-parents révèle un cauchemar racial inattendu.', 'https://imusic.b-cdn.net/images/item/original/197/5053083115197.jpg?get-out-2017-get-out-dvd&class=scaled&v=1500809854', 'https://images5.alphacoders.com/112/1123072.jpg', 104, 2017, 'Horror, Thriller', 'English', 'R', TRUE),

(1, 'Once Upon a Time in Hollywood', 'À Hollywood en 1969, un acteur déclinant et sa doublure tentent de survivre au changement.', 'https://image.tmdb.org/t/p/w500/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg', 'https://wallpapercat.com/w/full/1/9/d/1832664-3840x2160-desktop-4k-once-upon-a-time-in-hollywood-wallpaper-photo.jpg', 161, 2019, 'Drama, Comedy', 'English', 'R', FALSE),

(1, 'Joker', 'L’histoire de la descente aux enfers d’un homme marginalisé à Gotham.', 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', 'https://bullesdeculture.com/bdc-content/uploads/2019/10/joker-critique-film-affiche-2019-660x330.jpg', 122, 2019, 'Drama, Crime', 'English', 'R', TRUE),

(1, 'Marriage Story', 'Un couple traverse un divorce douloureux et profondément humain.', 'https://image.tmdb.org/t/p/w500/2JRyCKaRKyJAVpsIHeLvPw5nHmw.jpg', 'https://www.avforums.com/styles/avf/editorial/block//253d7fdeb77ba733074b164b59daf975_3x3.jpg', 137, 2019, 'Drama', 'English', 'R', FALSE),

(1, 'Arrival', 'Une linguiste tente de communiquer avec des extraterrestres arrivés sur Terre.', 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg', 'https://nofilmschool.com/media-library/arrival-globalwar-spot.jpg?id=34079923&width=1245&height=700&coordinates=94%2C0%2C94%2C0', 116, 2016, 'Sci-Fi, Drama', 'English', 'PG-13', TRUE),

(1, '1917', 'Deux soldats doivent traverser le front pour empêcher un massacre imminent.', 'https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg', 'https://i0.wp.com/diacritik.com/wp-content/uploads/2020/01/1917_5.jpg?resize=940%2C553&quality=89&ssl=1', 119, 2019, 'War, Drama', 'English', 'R', TRUE),

(1, 'The Irishman', 'Un tueur à gages raconte sa vie au service de la mafia américaine.', 'https://image.tmdb.org/t/p/w500/mbm8k3GFhXS0ROd9AD1gqYbIFbM.jpg', 'https://occ-0-8407-2218.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABWnQXKNkNeh4LihY5Zmt2_YshUt5Z-ZMb5R6NZuIUhfm9AZhT0YiV3dL38VB_FoKWjtAgfz2OUHTV274_U43sqFOg3W-EH0sv7oG.jpg?r=44e', 209, 2019, 'Crime, Drama', 'English', 'R', FALSE),

(1, 'Tenet', 'Un agent lutte contre une menace mondiale liée à l’inversion du temps.', 'https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg', 'https://wallpapers.com/images/featured/tenet-tu1b44axi1ewo7ya.jpg', 150, 2020, 'Action, Sci-Fi', 'English', 'PG-13', FALSE),

(1, 'The Big Short', 'Des financiers anticipent la crise des subprimes et tentent d’en tirer profit.', 'https://image.tmdb.org/t/p/w500/isuQWbJPbjybBEWdcCaBUPmU0XO.jpg', 'https://spoilertown.com/wp-content/uploads/2024/07/the-big-short-2015.webp', 130, 2015, 'Drama, Comedy', 'English', 'R', FALSE),

(1, 'Moonlight', 'Trois étapes de la vie d’un homme noir en quête d’identité.', 'https://m.media-amazon.com/images/I/91Tu1WACkuL.jpg', 'https://media.marianne.net/assets/asormT0OMg5PTUky6.jpg?w=770&h=462&r=fill', 111, 2016, 'Drama', 'English', 'R', TRUE),

(1, 'Logan', 'Un Wolverine vieillissant protège une enfant aux pouvoirs similaires.', 'https://image.tmdb.org/t/p/w500/fnbjcRDYn6YviCcePDnGdyAkYsB.jpg', 'https://mondocine.net/wp-content/uploads/2017/02/Logan6.jpeg', 137, 2017, 'Action, Drama', 'English', 'R', TRUE),

(1, 'Ford v Ferrari', 'Deux constructeurs s’affrontent lors des 24 Heures du Mans.', 'https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg', 'https://www.hollywoodreporter.com/wp-content/uploads/2019/11/df-07431_cc_rgb-h_2019.jpg?w=1296&h=730&crop=1', 152, 2019, 'Drama, Sport', 'English', 'PG-13', FALSE),

(1, 'Sicario', 'Une agente du FBI est plongée dans la guerre contre les cartels mexicains.', 'https://fr.web.img4.acsta.net/pictures/15/07/29/17/08/261485.jpg', 'https://proxymedia.woopic.com/api/v1/images/331%2FSICARIOXXXXW0109256_BAN1_2424_NEWTV_HD.jpg', 121, 2015, 'Crime, Thriller', 'English', 'R', TRUE),

(1, 'Ex Machina', 'Un programmeur teste une intelligence artificielle humanoïde.', 'https://image.tmdb.org/t/p/w500/dmJW8IAKHKxFNiUnoDR7JfsK7Rp.jpg', 'https://images3.alphacoders.com/615/615490.jpg', 108, 2015, 'Sci-Fi, Thriller', 'English', 'R', TRUE),

(1, 'Hereditary', 'Une famille est hantée par un héritage surnaturel terrifiant.', 'https://i.ebayimg.com/images/g/JRkAAOSwai9kQJIc/s-l1200.jpg', 'https://media.cnn.com/api/v1/images/stellar/prod/180611215631-hereditary-poster-16x9-story-top-crop.jpg?q=w_2000,c_fill', 127, 2018, 'Horror, Drama', 'English', 'R', FALSE),

(1, 'Midsommar', 'Un voyage en Suède vire à un rituel païen cauchemardesque.', 'https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg', 'https://www.darksidereviews.com/wp-content/uploads/2019/10/Midsommar40-copie.jpg', 148, 2019, 'Horror, Drama', 'English', 'R', FALSE),

(1, 'Roma', 'Le portrait intime d’une famille mexicaine dans les années 1970.', 'https://m.media-amazon.com/images/I/71mNuzWiJzL.jpg', 'https://static01.nyt.com/images/2018/11/21/arts/21roma-1/21roma-1-videoSixteenByNineJumbo1600.jpg', 135, 2018, 'Drama', 'Spanish', 'R', FALSE),

(1, 'The Handmaiden', 'Une arnaque amoureuse se transforme en jeu de manipulation.', 'https://m.media-amazon.com/images/I/71jugXKpRLL._AC_UF1000,1000_QL80_.jpg', 'https://i0.wp.com/histfict.fr/wp-content/uploads/2017/01/thehandmaiden.jpg?fit=1920%2C1080&ssl=1', 145, 2016, 'Drama, Thriller', 'Korean', 'R', TRUE);
INSERT INTO films (owner_user_id, title, synopsis, poster_url, backdrop_url, duration_min, release_year, genres, language, rating, featured)
VALUES
(1, 'The Northman', 'Un prince viking cherche à venger le meurtre de son père.', 'https://image.tmdb.org/t/p/w500/zhLKlUaF1SEpO58ppHIAyENkwgw.jpg', 'https://helios-i.mashable.com/imagery/articles/04HKpNYjMGEXytU5B4jKYmZ/hero-image.fill.size_1248x702.v1650454970.jpg', 137, 2022, 'Action, Drama', 'English', 'R', FALSE),

(1, 'The Favourite', 'Trois femmes manipulent pouvoir et désir à la cour d’Angleterre.', 'https://i.ebayimg.com/images/g/BnAAAOSwO7dcRz1J/s-l1200.jpg', 'https://images.immediate.co.uk/production/volatile/sites/7/2018/11/PX78KM-2e63638.jpg?quality=90&resize=980,654', 120, 2018, 'Drama, Comedy', 'English', 'R', TRUE),

(1, 'The Florida Project', 'L’enfance précaire près de Disney World vue à hauteur d’enfant.', 'https://m.media-amazon.com/images/I/81onmhJCFpL.jpg', 'https://www.cuindependent.com/new/wp-content/uploads/2020/11/TheFloridaProject-quadposter.jpg', 111, 2017, 'Drama', 'English', 'R', FALSE),

(1, 'Call Me by Your Name', 'Un été italien marque l’éveil amoureux d’un adolescent.', 'https://i.ebayimg.com/00/s/MTYwMFgxMDY2/z/AaoAAOSwmIlkvmAW/$_57.JPG?set_id=8800005007', 'https://www.kodak.com/content/blog-news/_3600x1947_crop_center-center_50_line/call-me-by-your-name-1.jpg', 132, 2017, 'Drama, Romance', 'English', 'R', FALSE),

(1, 'Lady Bird', 'Une adolescente cherche sa place entre famille et avenir.', 'https://image.tmdb.org/t/p/w500/gl66K7zRdtNYGrxyS2YDUP5ASZd.jpg', 'https://images5.alphacoders.com/112/1121149.jpg', 94, 2017, 'Drama, Comedy', 'English', 'R', FALSE),

(1, 'The Banshees of Inisherin', 'Une amitié se brise brutalement sur une île irlandaise.', 'https://image.tmdb.org/t/p/w500/4yFG6cSPaCaPhyJ1vtGOtMD1lgh.jpg', 'https://film-grab.com/wp-content/uploads/2023/03/Banshees-of-Inisherin-61.jpg', 114, 2022, 'Drama', 'English', 'R', TRUE),

(1, 'The Father', 'Un homme perd progressivement ses repères face à la démence.', 'https://medias.boutique.lab.arte.tv/prod/51148_vod_thumb_224332.jpg', 'https://static01.nyt.com/images/2021/04/18/arts/father-anatomy1/father-anatomy1-videoSixteenByNineJumbo1600-v2.jpg', 97, 2020, 'Drama', 'English', 'PG-13', TRUE),

(1, 'Jojo Rabbit', 'Un enfant nazi imaginaire affronte la réalité de la guerre.', 'https://image.tmdb.org/t/p/w500/7GsM4mtM0worCtIVeiQt28HieeN.jpg', 'https://media.newyorker.com/photos/5dadf203f4a0610009e46283/master/pass/Brody-JojoRabbit.jpg', 108, 2019, 'Comedy, Drama', 'English', 'PG-13', FALSE),

(1, 'Green Book', 'Une tournée musicale révèle l’Amérique raciale des années 60.', 'https://image.tmdb.org/t/p/w500/7BsvSuDQuoqhWmU2fL7W2GOcZHU.jpg', 'https://images.lindependant.fr/api/v1/images/view/5c44b0928fe56f2085526a46/large/image.jpg', 130, 2018, 'Drama', 'English', 'PG-13', FALSE),

(1, 'Spider-Man: Into the Spider-Verse', 'Plusieurs Spider-Man s’unissent à travers le multivers.', 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', 'https://marvelll.fr/wp-content/uploads/2023/04/Spider-Man-Across-The-Spider-Verse-banniere-850x478.webp', 117, 2018, 'Animation, Action', 'English', 'PG', TRUE),

(1, 'Your Name', 'Deux adolescents échangent mystérieusement leurs corps.', 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg', 'https://static.wixstatic.com/media/b4ef85_c89544ccd5cc4d21859ff86819682e65~mv2.jpeg/v1/fill/w_568,h_320,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/b4ef85_c89544ccd5cc4d21859ff86819682e65~mv2.jpeg', 106, 2016, 'Animation, Romance', 'Japanese', 'PG', TRUE),

(1, 'Anatomy of a Fall', 'Une écrivaine est jugée pour le meurtre présumé de son mari.', 'https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV83VUwFtHkB.jpg', 'https://images.mubicdn.net/images/artworks/677086/cache-677086-1712569988/images-original.png', 151, 2023, 'Drama, Crime', 'French', 'R', TRUE),

(1, 'Portrait of a Lady on Fire', 'Une peintre tombe amoureuse de son modèle.', 'https://image.tmdb.org/t/p/w500/3NTEMlG5mQdIAlKDl3AJG0rX29Z.jpg', 'https://media.newyorker.com/photos/5e5819880422e200089b6e22/master/pass/Syme-PortraitofaLadyonFire.jpg', 121, 2019, 'Drama, Romance', 'French', 'R', TRUE),

(1, 'Aftersun', 'Une enfant revisite ses souvenirs d’enfance avec son père.', 'https://image.tmdb.org/t/p/w500/evKz85EKouVbIr51zy5fOtpNRPg.jpg', 'https://images.mubicdn.net/images/film/340287/cache-774789-1745499810/image-w1280.jpg', 101, 2022, 'Drama', 'English', 'PG-13', FALSE),

(1, 'The Zone of Interest', 'La banalité du mal vue depuis la maison d’un commandant nazi.', 'https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg', 'https://media.newyorker.com/photos/657b310f456cc0528112e74d/master/pass/TheZoneOfInterest_textless_ProRes422HQ_24p_1920x1080_178_Rec709_51-20_20230929.00_46_51_20.Still001.jpg', 105, 2023, 'Drama, History', 'German', 'R', TRUE),

(1, 'Barbie', 'Une poupée découvre la complexité du monde réel.', 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', 'https://ideat.fr/wp-content/thumbnails/uploads/sites/3/2023/07/rev-1-barbie-tp-0002_high_res_jpeg-scaled-tt-width-2000-height-1282-fill-0-crop-0-bgcolor-eeeeee.jpg', 114, 2023, 'Comedy, Fantasy', 'English', 'PG-13', TRUE),

(1, 'Poor Things', 'Une femme ressuscitée découvre le monde avec naïveté.', 'https://m.media-amazon.com/images/I/81oLnfNHiFL._AC_UF1000,1000_QL80_.jpg', 'https://media.cntraveler.com/photos/6578b1743cb941303ff0235f/16:9/w_2560%2Cc_limit/010_040_PoorThings_OV_V30464704_FP_DPO_ProHQ_UHD-SDR_24_ENG-166_ENG-5120_A.jpg', 141, 2023, 'Drama, Fantasy', 'English', 'R', TRUE),

(1, 'Killers of the Flower Moon', 'Des meurtres frappent une communauté amérindienne riche en pétrole.', 'https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg', 'https://blog.frame.io/wp-content/uploads/2025/04/trc-killers-flower-moon-featured-2.jpg', 206, 2023, 'Crime, Drama', 'English', 'R', TRUE),

(1, 'The Holdovers', 'Un professeur grincheux garde des élèves pendant les vacances.', 'https://m.media-amazon.com/images/I/613jKjuR3gL._AC_UF1000,1000_QL80_.jpg', 'https://blog.frame.io/wp-content/uploads/2051/12/B0687-featured-image-1.jpg', 133, 2023, 'Drama, Comedy', 'English', 'R', FALSE);
INSERT INTO films (owner_user_id, title, synopsis, poster_url, backdrop_url, duration_min, release_year, genres, language, rating, featured)
VALUES
(1, 'Boyhood', 'Un garçon grandit sous nos yeux sur plus de dix ans.', 'https://addict-culture.com/wp-content/uploads/2014/09/boyhood-movie-poster.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCD-cZMMTOD1c_lUO8vIIptFvXYpB5YvufOQ&s', 165, 2014, 'Drama', 'English', 'R', FALSE),

(1, 'Nightcrawler', 'Un homme sans scrupules exploite la violence pour réussir dans les médias.', 'https://ih1.redbubble.net/image.983160933.0776/flat,750x,075,f-pad,750x1000,f8f8f8.u2.jpg', 'https://cloudfront-eu-central-1.images.arcpublishing.com/arenaholdings/UA2WZAZRQRLM3E4WMHTGROKM2A.jpg', 117, 2014, 'Crime, Thriller', 'English', 'R', TRUE),

(1, 'Gone Girl', 'La disparition d’une femme révèle les mensonges d’un couple parfait.', 'https://image.tmdb.org/t/p/w500/qymaJhucquUwjpb8oiqynMeXnID.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2014/10/gone-girl-rosamund-pike-ben-affleck-banniere.jpg', 149, 2014, 'Thriller, Drama', 'English', 'R', TRUE),

(1, 'Edge of Tomorrow', 'Un soldat revit sans cesse la même bataille contre des extraterrestres.', 'https://image.tmdb.org/t/p/w500/uUHvlkLavotfGsNtosDy8ShsIYF.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2014/06/Edge-of-Tomorrow-Banniere-sans-texte-850x478.jpg', 113, 2014, 'Action, Sci-Fi', 'English', 'PG-13', FALSE),

(1, 'John Wick', 'Un ancien tueur à gages replonge dans la violence après une perte personnelle.', 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg', 'https://sm.ign.com/ign_fr/screenshot/default/john-wick-2-posterjpg-fe1944-1280w_xz4s.jpg', 101, 2014, 'Action, Thriller', 'English', 'R', TRUE),

(1, 'The Witch', 'Une famille puritaine est confrontée à une présence maléfique.', 'https://play-lh.googleusercontent.com/DpGXagjNG1zUvm4eMOlpgWtpaL3V1WCPES5FxRyGEB9EBoI-FaBqSnJaDNsjDUmjDhQDLg=w240-h480-rw', 'https://www.daily-movies.ch/wp-content/uploads/2016/12/the-witch-UNE.jpg', 92, 2015, 'Horror, Drama', 'English', 'R', FALSE),

(1, 'Captain Fantastic', 'Un père élève ses enfants hors du système avant un retour brutal à la réalité.', 'https://m.media-amazon.com/images/I/61buPkY75AL._AC_UF1000,1000_QL80_.jpg', 'https://media.newyorker.com/photos/590979041c7a8e33fb38fcc8/16:9/w_1280,c_limit/Brody-Captain-Fantastic.jpg', 118, 2016, 'Drama, Comedy', 'English', 'R', FALSE),

(1, 'The Nice Guys', 'Deux détectives improbables enquêtent sur une affaire loufoque.', 'https://fr.web.img4.acsta.net/pictures/16/05/10/14/01/529694.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2016/05/The-Nice-Guys-Banniere-850x478.jpg', 116, 2016, 'Comedy, Crime', 'English', 'R', FALSE),

(1, 'The Trial of the Chicago 7', 'Des militants sont jugés après des manifestations violentes.', 'https://image.tmdb.org/t/p/w500/ahf5cVdooMAlDRiJOZQNuLqa1Is.jpg', 'https://www.rollingstone.com/wp-content/uploads/2020/10/C7-00236rc.jpg', 130, 2020, 'Drama, History', 'English', 'R', FALSE),

(1, 'The Green Knight', 'Un chevalier affronte une épreuve mystique et morale.', 'https://fr.web.img6.acsta.net/pictures/21/06/16/10/11/5985880.jpg', 'https://usercontent.one/wp/www.screentune.com/wp-content/uploads/2021/08/Critique-The-Green_Knight-_2021_ScreenTune-1024x576.png?media=1649161309', 130, 2021, 'Fantasy, Drama', 'English', 'R', FALSE),

(1, 'Burning', 'Un triangle étrange se forme autour d’une disparition inexpliquée.', 'https://fr.web.img6.acsta.net/pictures/18/07/09/11/04/1943153.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJwV-ON5ThaBSrbBkMcNCC4Yr2bX-r4sD_Cw&s', 148, 2018, 'Drama, Mystery', 'Korean', 'R', TRUE),

(1, 'Minari', 'Une famille coréenne tente de s’installer dans l’Amérique rurale.', 'https://m.media-amazon.com/images/I/81EsYZbe-cL._AC_UF894,1000_QL80_.jpg', 'https://img.lemde.fr/2021/04/25/0/0/2600/1644/664/0/75/0/c9e4e77_347070328-670433.jpg', 115, 2020, 'Drama', 'English', 'PG-13', FALSE),

(1, 'Nomadland', 'Une femme parcourt l’Ouest américain en vivant en marge du système.', 'https://image.tmdb.org/t/p/w500/66GUmWpTHgAjyp4aBSXy63PZTiC.jpg', 'https://www.radiofrance.fr/s3/cruiser-production/2021/06/36d49a3d-396e-48a8-bafb-ea748c22ec80/1200x680_nomadland-chloe-zhao.jpg', 108, 2020, 'Drama', 'English', 'PG-13', TRUE),

(1, 'The Lobster', 'Dans un monde absurde, les célibataires doivent trouver l’amour ou être transformés.', 'https://i.ebayimg.com/images/g/O40AAOSw~JZh3lPV/s-l1200.jpg', 'https://www.screenslate.com/sites/default/files/images/161231-TheLobster-Post.jpg', 119, 2015, 'Drama, Sci-Fi', 'English', 'R', FALSE),

(1, 'Room', 'Une mère et son fils tentent de reconstruire leur vie après une captivité.', 'https://image.tmdb.org/t/p/w500/pCURNjeomWbMSdiP64gj8NVVHTQ.jpg', 'https://www.screentune.com/wp-content/uploads/2019/11/812805.jpg', 118, 2015, 'Drama', 'English', 'R', TRUE),

(1, 'Birdman', 'Un acteur déchu tente de retrouver sa gloire à Broadway.', 'https://jevaisciner.fr/wp/wp-content/uploads/2015/03/Birdman-Poster.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2015/02/birdman-banniere.jpg', 119, 2014, 'Drama, Comedy', 'English', 'R', TRUE),

(1, 'Gravity', 'Une astronaute lutte pour survivre après un accident spatial.', 'https://image.tmdb.org/t/p/w500/kZ2nZw8D681aphje8NJi8EfbL1U.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2013/10/gravity-film-banniere.jpg', 91, 2013, 'Sci-Fi, Thriller', 'English', 'PG-13', FALSE),

(1, 'Manchester by the Sea', 'Un homme doit affronter son passé après un drame familial.', 'https://m.media-amazon.com/images/I/61FRxBV1hbL._AC_UF1000,1000_QL80_.jpg', 'https://film-grab.com/wp-content/uploads/2019/10/Manchester-By-The-Sea-057.jpg', 137, 2016, 'Drama', 'English', 'R', TRUE),

(1, 'Top Gun: Maverick', 'Un pilote légendaire revient former une nouvelle génération.', 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', 'https://3238leblogdemarvelll-1278.kxcdn.com/wp-content/uploads/2022/07/top-gun-maverick-tom-cruise-banniere-scaled.webp', 131, 2022, 'Action, Drama', 'English', 'PG-13', TRUE),

(1, 'John Wick: Chapter 4', 'John Wick affronte la Table Haute dans une guerre totale.', 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8YW8iTUEyTvblTe_XFbNSlM_VtaXFB4NcJw&s', 169, 2023, 'Action, Thriller', 'English', 'R', TRUE);

INSERT INTO screenings (cinema_id, film_id, starts_at, room, price_cents, total_seats)
VALUES
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Parasite'), '2026-01-24 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Mad Max: Fury Road'), '2026-01-24 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Everything Everywhere All at Once'), '2026-01-24 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Oppenheimer'), '2026-01-24 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Dune: Part Two'), '2026-01-25 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Dune'), '2026-01-25 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='La La Land'), '2026-01-25 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Blade Runner 2049'), '2026-01-25 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Whiplash'), '2026-01-26 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Interstellar'), '2026-01-26 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='The Lighthouse'), '2026-01-26 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='The Revenant'), '2026-01-26 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Get Out'), '2026-01-27 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Once Upon a Time in Hollywood'), '2026-01-27 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Joker'), '2026-01-27 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Marriage Story'), '2026-01-27 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Arrival'), '2026-01-28 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='1917'), '2026-01-28 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='The Irishman'), '2026-01-28 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Paris'), (SELECT id FROM films WHERE title='Tenet'), '2026-01-28 20:30:00', 'Salle 2', 1500, 100);

INSERT INTO screenings (cinema_id, film_id, starts_at, room, price_cents, total_seats)
VALUES
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='The Big Short'), '2026-01-24 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Moonlight'), '2026-01-24 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Logan'), '2026-01-24 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Ford v Ferrari'), '2026-01-24 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Sicario'), '2026-01-25 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Ex Machina'), '2026-01-25 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Hereditary'), '2026-01-25 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Midsommar'), '2026-01-25 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Roma'), '2026-01-26 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='The Handmaiden'), '2026-01-26 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='The Northman'), '2026-01-26 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='The Favourite'), '2026-01-26 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='The Florida Project'), '2026-01-27 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Call Me by Your Name'), '2026-01-27 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Lady Bird'), '2026-01-27 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Jojo Rabbit'), '2026-01-27 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Green Book'), '2026-01-28 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='The Father'), '2026-01-28 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='The Banshees of Inisherin'), '2026-01-28 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Marseille'), (SELECT id FROM films WHERE title='Aftersun'), '2026-01-28 20:30:00', 'Salle 2', 1500, 100);

INSERT INTO screenings (cinema_id, film_id, starts_at, room, price_cents, total_seats)
VALUES
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Spider-Man: Into the Spider-Verse'), '2026-01-24 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Your Name'), '2026-01-24 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Anatomy of a Fall'), '2026-01-24 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Portrait of a Lady on Fire'), '2026-01-24 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='The Zone of Interest'), '2026-01-25 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Barbie'), '2026-01-25 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Poor Things'), '2026-01-25 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Killers of the Flower Moon'), '2026-01-25 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='The Holdovers'), '2026-01-26 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Nightcrawler'), '2026-01-26 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Gone Girl'), '2026-01-26 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='John Wick'), '2026-01-26 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Top Gun: Maverick'), '2026-01-27 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Nomadland'), '2026-01-27 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Room'), '2026-01-27 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Birdman'), '2026-01-27 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Manchester by the Sea'), '2026-01-28 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='The Lobster'), '2026-01-28 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='John Wick: Chapter 4'), '2026-01-28 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lyon'), (SELECT id FROM films WHERE title='Edge of Tomorrow'), '2026-01-28 20:30:00', 'Salle 2', 1500, 100);

INSERT INTO screenings (cinema_id, film_id, starts_at, room, price_cents, total_seats)
VALUES
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='The Nice Guys'), '2026-01-24 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='The Trial of the Chicago 7'), '2026-01-24 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='The Green Knight'), '2026-01-24 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Burning'), '2026-01-24 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Minari'), '2026-01-25 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Gravity'), '2026-01-25 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='The Witch'), '2026-01-25 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Captain Fantastic'), '2026-01-25 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='The Northman'), '2026-01-26 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='The Favourite'), '2026-01-26 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Sicario'), '2026-01-26 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Ex Machina'), '2026-01-26 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Get Out'), '2026-01-27 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Joker'), '2026-01-27 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='1917'), '2026-01-27 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='The Revenant'), '2026-01-27 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Dune'), '2026-01-28 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Blade Runner 2049'), '2026-01-28 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Oppenheimer'), '2026-01-28 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Toulouse'), (SELECT id FROM films WHERE title='Interstellar'), '2026-01-28 20:30:00', 'Salle 2', 1500, 100);

INSERT INTO screenings (cinema_id, film_id, starts_at, room, price_cents, total_seats)
VALUES
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='La La Land'), '2026-01-24 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Whiplash'), '2026-01-24 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Arrival'), '2026-01-24 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Parasite'), '2026-01-24 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Everything Everywhere All at Once'), '2026-01-25 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Mad Max: Fury Road'), '2026-01-25 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Dune: Part Two'), '2026-01-25 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Tenet'), '2026-01-25 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='The Lighthouse'), '2026-01-26 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='The Irishman'), '2026-01-26 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Once Upon a Time in Hollywood'), '2026-01-26 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Marriage Story'), '2026-01-26 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Sicario'), '2026-01-27 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Ex Machina'), '2026-01-27 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='The Father'), '2026-01-27 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='The Banshees of Inisherin'), '2026-01-27 20:30:00', 'Salle 2', 1500, 100),

((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Anatomy of a Fall'), '2026-01-28 14:00:00', 'Salle 1', 1200, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Portrait of a Lady on Fire'), '2026-01-28 14:00:00', 'Salle 2', 1200, 100),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Killers of the Flower Moon'), '2026-01-28 20:30:00', 'Salle 1', 1500, 150),
((SELECT id FROM cinemas WHERE name='LouLa Cinéma Lille'), (SELECT id FROM films WHERE title='Oppenheimer'), '2026-01-28 20:30:00', 'Salle 2', 1500, 100);
