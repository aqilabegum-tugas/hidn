-- HIDN Seed Data
-- Demo user, kuis kepribadian (7 pertanyaan), 8 destinasi hidden gem Indonesia

-- =========================================
-- DEMO USER
-- =========================================
-- Password demo: "demo1234" (bcrypt hash, cost 10)
INSERT INTO users (id, email, full_name, password_hash, personality) VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo@hidn.id', 'Demo Traveler',
   '$2a$10$tV3TKM3F8ETW2OYn11r3deK0AFNa9p6zd7yeMfqy2d5BJN15KVUDu', 'explorer')
ON CONFLICT (email) DO NOTHING;

-- =========================================
-- DESTINATIONS
-- =========================================
INSERT INTO destinations (slug, name, region, province, category, hidden_score, sentiment_score, est_cost, duration, best_months, description, highlights, matches, image_url) VALUES
('pulau-kanawa', 'Pulau Kanawa', 'Labuan Bajo', 'Nusa Tenggara Timur', 'Pantai', 8, 92, 450000, '2-3 hari', 'Apr - Okt',
 'Pulau kecil di gugusan Komodo dengan air kristal jernih dan koral hidup dekat bibir pantai. Sunset di sini terasa seperti milik pribadi.',
 ARRAY['Snorkeling reef <5m', 'Sunset viewpoint bukit', 'Bungalow di tepi pantai', 'Tanpa sinyal — full disconnect'],
 ARRAY['relaxer','explorer']::personality_type[], '/images/dest/hero-beach.jpg'),

('desa-wae-rebo', 'Desa Wae Rebo', 'Manggarai', 'Nusa Tenggara Timur', 'Desa', 9, 95, 600000, '2 hari 1 malam', 'Apr - Sep',
 'Desa adat di ketinggian 1.100 mdpl dengan 7 rumah Mbaru Niang berbentuk kerucut. Ditempuh trekking 3-4 jam dari Denge.',
 ARRAY['Menginap di rumah adat', 'Upacara penyambutan', 'Kopi Manggarai langsung dari kebun', 'Trekking hutan tropis'],
 ARRAY['culture','explorer']::personality_type[], '/images/dest/dest-village.jpg'),

('air-terjun-tumpak-sewu', 'Air Terjun Tumpak Sewu', 'Lumajang', 'Jawa Timur', 'Air Terjun', 6, 90, 250000, '1 hari', 'Mei - Sep',
 'Tirai air raksasa berbentuk setengah lingkaran. Turun ke dasar lewat tali dan sungai — bukan untuk yang takut basah.',
 ARRAY['Trek ke dasar (challenging)', 'Panorama view dari atas', 'Gua Tetes nearby', 'Foto golden hour'],
 ARRAY['adventurer','explorer']::personality_type[], '/images/dest/dest-waterfall.jpg'),

('danau-kelimutu', 'Danau Tiga Warna Kelimutu', 'Ende', 'Nusa Tenggara Timur', 'Danau', 7, 94, 500000, '2 hari', 'Jun - Sep',
 'Tiga danau kawah dengan warna berbeda dan terus berubah. Sunrise dari puncak adalah pengalaman spiritual yang dipercaya warga lokal.',
 ARRAY['Sunrise tour 04:00', '3 danau warna berbeda', 'Kampung Moni di kaki gunung', 'Tenun ikat lokal'],
 ARRAY['explorer','culture']::personality_type[], '/images/dest/dest-crater.jpg'),

('sawah-jatiluwih', 'Sawah Terasering Jatiluwih', 'Tabanan', 'Bali', 'Budaya', 5, 88, 350000, '1-2 hari', 'Sepanjang tahun',
 'Warisan UNESCO. Sistem subak ratusan tahun dengan view sawah hijau berlapis dan kabut pagi yang sinematik.',
 ARRAY['Trekking sawah 1-3 jam', 'Warung lokal dengan view', 'Pure Luhur Petali', 'Kopi & teh organik'],
 ARRAY['relaxer','culture','foodie']::personality_type[], '/images/dest/dest-rice.jpg'),

('pulau-rote', 'Pulau Rote — Nemberala', 'Rote Ndao', 'Nusa Tenggara Timur', 'Pantai', 8, 91, 550000, '3-5 hari', 'Jun - Sep',
 'Pulau paling selatan Indonesia. Ombak kelas dunia, pantai sepi, dan budaya Sasando yang khas.',
 ARRAY['Surfing T-Land break', 'Pantai Bo''a', 'Musik Sasando', 'Sopi — minuman tradisional'],
 ARRAY['adventurer','relaxer']::personality_type[], '/images/dest/hero-beach.jpg'),

('ranu-kumbolo', 'Ranu Kumbolo', 'Lumajang', 'Jawa Timur', 'Gunung', 6, 93, 400000, '2-3 hari', 'Apr - Okt',
 'Danau di ketinggian 2.400 mdpl di jalur pendakian Semeru. Refleksi bukit dan langit yang sempurna saat sunrise.',
 ARRAY['Camping tepi danau', 'Sunrise di Tanjakan Cinta', 'Bukit Oro-oro Ombo', 'Sumber air langsung minum'],
 ARRAY['adventurer','explorer']::personality_type[], '/images/dest/dest-crater.jpg'),

('kampung-naga', 'Kampung Naga', 'Tasikmalaya', 'Jawa Barat', 'Desa', 7, 89, 300000, '1 hari', 'Sepanjang tahun',
 'Kampung adat Sunda yang menolak listrik & teknologi modern. Hidup dalam harmoni dengan tradisi dan alam.',
 ARRAY['Rumah panggung tradisional', 'Anyaman bambu', 'Nasi liwet otentik', 'Sungai Ciwulan'],
 ARRAY['culture','foodie']::personality_type[], '/images/dest/dest-village.jpg')
ON CONFLICT (slug) DO NOTHING;

-- =========================================
-- KUIS KEPRIBADIAN (7 pertanyaan)
-- =========================================
INSERT INTO quiz_questions (id, question, ordering) VALUES
(1, 'Liburan ideal kamu dimulai dengan…', 1),
(2, 'Foto liburan favoritmu pasti tentang…', 2),
(3, 'Untuk transportasi, kamu lebih pilih…', 3),
(4, 'Budget per hari yang nyaman buat kamu?', 4),
(5, 'Souvenir yang pasti kamu bawa pulang?', 5),
(6, 'Pilih satu kalimat yang paling kamu setuju:', 6),
(7, 'Kamu lebih suka menginap di…', 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_options (question_id, option_text, weights) VALUES
(1, 'Bangun dengan suara ombak, baca buku di hammock',          '{"relaxer":3,"foodie":1}'),
(1, 'Trekking subuh menuju view sunrise',                        '{"adventurer":3,"explorer":2}'),
(1, 'Ngopi di warung lokal sambil ngobrol sama warga',           '{"culture":3,"foodie":2}'),
(1, 'Cek peta — cari spot yang belum ada di Instagram',          '{"explorer":3}'),

(2, 'Lanskap luas, alam liar yang dramatis',                     '{"explorer":2,"adventurer":2}'),
(2, 'Detail makanan lokal & meja makan',                         '{"foodie":3}'),
(2, 'Senyum warga, ritual, kerajinan tangan',                    '{"culture":3}'),
(2, 'Diri sendiri yang relaks, view pantai sunset',              '{"relaxer":3}'),

(3, 'Sewa motor, jelajah jalan kecil',                           '{"explorer":3,"adventurer":1}'),
(3, 'Mobil nyaman dengan AC dan playlist',                       '{"relaxer":3}'),
(3, 'Angkot / ojek lokal — sambil ngobrol',                      '{"culture":3,"foodie":1}'),
(3, 'Trekking & jalan kaki',                                     '{"adventurer":3}'),

(4, '< Rp 300rb — backpacker mode',                              '{"adventurer":2,"explorer":2}'),
(4, 'Rp 300-500rb — mid range nyaman',                           '{"culture":1,"foodie":1,"relaxer":1,"explorer":1}'),
(4, 'Rp 500rb-1jt — comfort matters',                            '{"relaxer":3,"foodie":2}'),
(4, 'Fleksibel — yang penting pengalamannya',                    '{"culture":2,"explorer":1,"foodie":1}'),

(5, 'Kerajinan tangan / kain tenun',                             '{"culture":3}'),
(5, 'Bumbu & makanan khas',                                      '{"foodie":3}'),
(5, 'Foto & video — kenangan visual',                            '{"explorer":2,"relaxer":2}'),
(5, 'Bekas luka / cerita ekstrem 😅',                            '{"adventurer":3}'),

(6, 'Tujuan terbaik adalah yang belum punya nama di Google',     '{"explorer":3}'),
(6, 'Kenyamanan adalah hak, bukan pemborosan',                   '{"relaxer":3}'),
(6, 'Setiap tempat punya cerita, tugas kita mendengarkan',       '{"culture":3}'),
(6, 'Hidup terlalu singkat untuk tidak basah, capek, terbakar',  '{"adventurer":3}'),
(6, 'Belum benar-benar di sebuah tempat sampai mencicipi rasanya','{"foodie":3}'),

(7, 'Boutique resort dengan spa',                                '{"relaxer":3}'),
(7, 'Homestay warga lokal',                                      '{"culture":3,"foodie":1}'),
(7, 'Tenda / camping di alam',                                   '{"adventurer":3,"explorer":1}'),
(7, 'Bungalow tepi pantai terpencil',                            '{"explorer":2,"relaxer":2}')
ON CONFLICT DO NOTHING;

-- =========================================
-- DEMO ITINERARY
-- =========================================
INSERT INTO itineraries (id, user_id, title) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Trip Flores 4 Hari')
ON CONFLICT DO NOTHING;

INSERT INTO itinerary_items (itinerary_id, destination_id, day, start_time, activity, notes)
SELECT '22222222-2222-2222-2222-222222222222', id, 1, '08:00', 'Tiba di Labuan Bajo, sarapan ikan bakar', 'Menginap di Kanawa malam pertama'
FROM destinations WHERE slug = 'pulau-kanawa'
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222', id, 2, '04:30', 'Sunrise hike di Kelimutu', 'Bawa jaket — dingin sekali'
FROM destinations WHERE slug = 'danau-kelimutu'
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222', id, 3, '07:00', 'Trekking ke Wae Rebo', 'Bawa fisik prima, jalur 3-4 jam'
FROM destinations WHERE slug = 'desa-wae-rebo';
