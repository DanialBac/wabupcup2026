-- ==========================================================
-- SEED DATA: WABUP CUP 2026
-- Ready for MySQL / MariaDB / phpMyAdmin / Cloud SQL / Railway
-- ==========================================================

USE `wabupcup_db`;

-- 1. Seed Categories
INSERT INTO `categories` (`id`, `name`, `badge_title`, `age_restriction`, `max_teams`, `registered_teams_count`, `registration_fee`, `total_prize`, `description`, `prizes_json`, `rules_json`, `sort_order`) VALUES
('SD', 'Kategori Usia Dini SD / MI Sederajat', 'U-12 Putra', 'Maksimal Kelahiran Tahun 2014 / Kelas 1-6 SD', 16, 8, 250000.00, 15000000.00, 'Turnamen Sepakbola Mini untuk pembinaan usia dini dan penjaringan bakat masa depan.', 
'[{"rank":"Juara 1","prizeMoney":6000000,"trophyText":"Piala Bergilir Wabup + Medali Emas + Piagam"},{"rank":"Juara 2","prizeMoney":4000000,"trophyText":"Piala Tetap + Medali Perak + Piagam"},{"rank":"Juara 3 Bersama","prizeMoney":2500000,"trophyText":"Piala Tetap + Medali Perunggu + Piagam"},{"rank":"Top Scorer","prizeMoney":1000000,"trophyText":"Sepatu Emas + Piagam"},{"rank":"Pemain Terbaik","prizeMoney":1500000,"trophyText":"Bola Emas + Piagam"}]',
'["Wajib menyertakan Akta Kelahiran asli / NISN resmi.","Format pertandingan 7 vs 7 dengan durasi 2 x 15 menit.","Kartu Pelajar atau Surat Keterangan Kepala Sekolah aktif.","Setiap tim berhak mendaftarkan 14 pemain dan 2 official."]', 1),

('SMP', 'Kategori Pelajar SMP / MTs Sederajat', 'U-15 Pelajar', 'Maksimal Kelahiran Tahun 2011 / Kelas 7-9 SMP', 16, 12, 350000.00, 22000000.00, 'Kompetisi sepakbola antar sekolah menengah pertama tingkat kabupaten.',
'[{"rank":"Juara 1","prizeMoney":9000000,"trophyText":"Piala Bergilir Wabup + Medali Emas + Piagam"},{"rank":"Juara 2","prizeMoney":6000000,"trophyText":"Piala Tetap + Medali Perak + Piagam"},{"rank":"Juara 3 Bersama","prizeMoney":4000000,"trophyText":"Piala Tetap + Medali Perunggu + Piagam"},{"rank":"Top Scorer","prizeMoney":1500000,"trophyText":"Sepatu Emas + Piagam"},{"rank":"Pemain Terbaik","prizeMoney":1500000,"trophyText":"Bola Emas + Piagam"}]',
'["Format pertandingan 11 vs 11 lapangan standar nasional.","Durasi pertandingan 2 x 30 menit.","Wajib melampirkan rapor semester terakhir & kartu pelajar aktif.","Maksimal 18 pemain dan 3 official terdaftar."]', 2),

('SMA', 'Kategori Pelajar SMA / SMK / MA', 'U-18 Bergengsi', 'Pelajar Aktif Tingkat SMA/SMK/MA Sederajat', 16, 16, 500000.00, 35000000.00, 'Kejuaraan utama pelajar tingkat atas dengan tensi tinggi dan bergengsi memperebutkan Piala Bergilir.',
'[{"rank":"Juara 1","prizeMoney":15000000,"trophyText":"Piala Bergilir Wabup + Medali Emas + Piagam"},{"rank":"Juara 2","prizeMoney":10000000,"trophyText":"Piala Tetap + Medali Perak + Piagam"},{"rank":"Juara 3 Bersama","prizeMoney":6000000,"trophyText":"Piala Tetap + Medali Perunggu + Piagam"},{"rank":"Top Scorer","prizeMoney":2000000,"trophyText":"Sepatu Emas + Piagam"},{"rank":"Pemain Terbaik","prizeMoney":2000000,"trophyText":"Bola Emas + Piagam"}]',
'["Format 11 vs 11 lapangan penuh dengan regulasi PSSI.","Durasi pertandingan 2 x 35 menit.","Pemain wajib berstatus siswa aktif di sekolah yang bersangkutan.","Wajib melampirkan Surat Tugas Resmi dari Kepala Sekolah."]', 3),

('INSTANSI', 'Kategori Antar Instansi / OPD / BUMD', 'ASN & Korporasi', 'Karyawan / Pegawai Aktif Lembaga & Perusahaan', 12, 6, 750000.00, 28000000.00, 'Ajang silaturahmi dan unjuk sportivitas antar aparatur sipil negara dan korporasi.',
'[{"rank":"Juara 1","prizeMoney":12000000,"trophyText":"Piala Tetap + Medali Emas + Piagam"},{"rank":"Juara 2","prizeMoney":8000000,"trophyText":"Piala Tetap + Medali Perak + Piagam"},{"rank":"Juara 3 Bersama","prizeMoney":5000000,"trophyText":"Piala Tetap + Medali Perunggu + Piagam"},{"rank":"Top Scorer","prizeMoney":1500000,"trophyText":"Sepatu Emas + Piagam"},{"rank":"Best Supporter","prizeMoney":1500000,"trophyText":"Piala Penghargaan"}]',
'["Pemain wajib melampirkan SK Pengangkatan / ID Card Pegawai / Slip Gaji.","Format turnamen 9 vs 9 atau Futsal Resmi.","Durasi 2 x 25 menit dengan sistem rolling substitution."]', 4),

('UMUM', 'Kategori Terbuka / Klub Umum & Desa', 'Open Championship', 'Usia Bebas (Maksimal 2 Pemain Liga Profesional)', 24, 14, 1000000.00, 50000000.00, 'Puncak kompetisi antar klub terbaik daerah dan perwakilan desa se-kabupaten.',
'[{"rank":"Juara 1","prizeMoney":22000000,"trophyText":"Piala Bergilir Wabup + Piala Tetap + Medali Emas"},{"rank":"Juara 2","prizeMoney":14000000,"trophyText":"Piala Tetap + Medali Perak + Piagam"},{"rank":"Juara 3 Bersama","prizeMoney":8000000,"trophyText":"Piala Tetap + Medali Perunggu + Piagam"},{"rank":"Top Scorer","prizeMoney":3000000,"trophyText":"Sepatu Emas + Piagam"},{"rank":"Pemain Terbaik","prizeMoney":3000000,"trophyText":"Bola Emas + Piagam"}]',
'["Sistem gugur murni (Knockout System) berjenjang.","Durasi pertandingan 2 x 40 menit standar PSSI.","Boleh mendaftarkan maksimal 2 pemain berlisensi nasional."]', 5)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `total_prize`=VALUES(`total_prize`);

-- 2. Seed Admin Users (Password demo: admin123, panitia2026, wasit123)
INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `full_name`, `role`, `email`, `phone`, `avatar_color`) VALUES
('adm-001', 'superadmin', 'admin123', 'Bambang Supriyanto, S.Pd', 'SUPERADMIN', 'sekretariat@wabupcup2026.com', '081234567890', 'bg-red-600'),
('adm-002', 'panitia', 'panitia2026', 'Ahmad Farhan, S.Or', 'PANITIA', 'pertandingan@wabupcup2026.com', '082198765432', 'bg-emerald-600'),
('adm-003', 'wasit', 'wasit123', 'Kapten Hendra Wijaya (Wasit C1)', 'WASIT', 'wasit@wabupcup2026.com', '085711223344', 'bg-amber-600')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- 3. Seed Sponsors
INSERT INTO `sponsors` (`id`, `name`, `tier`, `logo_text`, `logo_url`, `website_url`, `description`, `sort_order`, `is_active`) VALUES
('sp-1', 'Bank Pembangunan Daerah (BPD)', 'PLATINUM', 'BANK BPD', '', 'https://bpd.co.id', 'Mitra Finansial Resmi Penyelenggaraan Turnamen', 1, TRUE),
('sp-2', 'Specs Indonesia', 'GOLD', 'SPECS', '', 'https://specs.id', 'Official Apparel & Bola Resmi Pertandingan', 2, TRUE),
('sp-3', 'Hydro Coco & Pocari', 'GOLD', 'ISOTONIC', '', 'https://pocarisweat.id', 'Official Hydration & Energy Partner', 3, TRUE),
('sp-4', 'RSUD Kabupaten - Tim Medis', 'OFFICIAL_PARTNER', 'RSUD', '', 'https://rsud.go.id', 'Layanan Medis Darurat & Fisioterapi Lapangan', 4, TRUE),
('sp-5', 'Suara Daerah Media Network', 'SILVER', 'MEDIA', '', 'https://suaradaerah.com', 'Official Live Streaming & Media Coverage', 5, TRUE)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 4. Seed Registrations
INSERT INTO `registrations` (`id`, `reg_code`, `category_id`, `team_name`, `team_logo`, `institution_name`, `coach_name`, `coach_phone`, `coach_email`, `player_count`, `official_count`, `registration_date`, `status`, `payment_status`, `payment_amount`, `documents_json`, `last_updated`) VALUES
('reg-101', 'WBC-SMA-001', 'SMA', 'SMA Negeri 1 Wijaya Kusuma', '', 'SMAN 1 Wijaya Kusuma', 'Coach Suparman, S.Pd', '081234567890', 'sman1wijaya@sch.id', 18, 3, '2026-08-20 09:30', 'APPROVED', 'PAID', 500000.00, '{"suratKeterangan":{"name":"Surat_Tugas_Kepsek.pdf","size":"1.2 MB","uploadDate":"2026-08-20","type":"application/pdf"},"buktiPembayaran":{"name":"Bukti_Transfer_Bank.jpg","size":"850 KB","uploadDate":"2026-08-20","type":"image/jpeg"}}', '2026-08-20 10:15'),
('reg-102', 'WBC-SMA-002', 'SMA', 'SMK Taruna Nusantara Putera', '', 'SMK Taruna Nusantara', 'Coach Dedi Wahyudi', '082198765432', 'dedi.coach@taruna.sch.id', 18, 3, '2026-08-21 14:20', 'APPROVED', 'PAID', 500000.00, '{"suratKeterangan":{"name":"Surat_Rekomendasi_SMK.pdf","size":"980 KB","uploadDate":"2026-08-21","type":"application/pdf"}}', '2026-08-21 15:00'),
('reg-103', 'WBC-SMA-003', 'SMA', 'SMA Bintang Cendekia', '', 'SMA Bintang Cendekia', 'Coach Roni Setiawan', '085711223344', 'bintang.cendekia@gmail.com', 16, 2, '2026-08-22 11:00', 'PENDING_PAYMENT', 'VERIFYING', 500000.00, '{"buktiPembayaran":{"name":"Struk_ATM_BCA.png","size":"650 KB","uploadDate":"2026-08-22","type":"image/png"}}', '2026-08-22 11:30'),
('reg-104', 'WBC-UMUM-001', 'UMUM', 'Putra Gelora FC', '', 'Klub Gelora Mandiri', 'Manager H. Haryanto', '081399887766', 'putragelora@gmail.com', 20, 4, '2026-08-23 16:45', 'APPROVED', 'PAID', 1000000.00, '{"buktiPembayaran":{"name":"Bukti_Transfer_1JT.pdf","size":"1.1 MB","uploadDate":"2026-08-23","type":"application/pdf"}}', '2026-08-23 17:00')
ON DUPLICATE KEY UPDATE `team_name`=VALUES(`team_name`);

-- 5. Seed Matches
INSERT INTO `matches` (`id`, `match_number`, `category_id`, `round_name`, `round_index`, `team_a_name`, `team_a_institution`, `team_a_score`, `team_b_name`, `team_b_institution`, `team_b_score`, `match_date`, `match_time`, `pitch`, `status`, `live_minute`, `events_json`, `winner_id`) VALUES
('match-sma-01', 1, 'SMA', 'Babak 16 Besar (Grup A)', 2, 'SMAN 1 Wijaya Kusuma', 'SMAN 1 Wijaya Kusuma', 3, 'SMK Taruna Nusantara', 'SMK Taruna Nusantara', 1, '2026-10-25', '08:30', 'Stadion Utama Gelora Wijaya', 'FINISHED', 'FT', '[{"id":"ev-1","minute":"14\'","team":"A","type":"GOAL","playerName":"Rizky Pratama (10)"},{"id":"ev-2","minute":"38\'","team":"B","type":"GOAL","playerName":"Farhan Alamsyah (7)"},{"id":"ev-3","minute":"54\'","team":"A","type":"GOAL","playerName":"Rizky Pratama (10)"},{"id":"ev-4","minute":"68\'","team":"A","type":"GOAL","playerName":"Dimas Anggara (9)"}]', 'A'),
('match-sma-02', 2, 'SMA', 'Babak 16 Besar (Grup B)', 2, 'SMA Bintang Cendekia', 'SMA Bintang Cendekia', 2, 'SMA Negeri 2 Sakti', 'SMAN 2 Sakti', 2, '2026-10-25', '10:00', 'Stadion Utama Gelora Wijaya', 'LIVE', '67\'', '[{"id":"ev-5","minute":"22\'","team":"A","type":"GOAL","playerName":"Bagus Kahfi (11)"},{"id":"ev-6","minute":"44\'","team":"B","type":"GOAL","playerName":"Bayu Pradana (8)"},{"id":"ev-7","minute":"59\'","team":"A","type":"GOAL","playerName":"Aldi Satria (4)"},{"id":"ev-8","minute":"65\'","team":"B","type":"GOAL","playerName":"Bayu Pradana (8)"}]', 'DRAW'),
('match-sma-03', 3, 'SMA', 'Perempat Final', 3, 'SMA Negeri 3 Bahari', 'SMAN 3 Bahari', NULL, 'SMA Bina Satria', 'SMA Bina Satria', NULL, '2026-10-27', '15:30', 'Stadion Utama Gelora Wijaya', 'UPCOMING', NULL, NULL, NULL),
('match-sma-final', 7, 'SMA', 'GRAND FINAL WABUP CUP 2026', 5, 'Pemenang Semifinal 1', 'TBD', NULL, 'Pemenang Semifinal 2', 'TBD', NULL, '2026-10-31', '19:00', 'Stadion Utama Gelora Wijaya', 'UPCOMING', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE `team_a_name`=VALUES(`team_a_name`);

-- 6. Seed Committee Contacts & Bank Accounts
INSERT INTO `committee_contacts` (`id`, `name`, `phone`, `role`, `is_primary`) VALUES
('wa-1', 'Bambang Supriyanto (Ketua Panitia)', '081234567890', 'Sekretariat & Regulasi Turnamen', TRUE),
('wa-2', 'Ahmad Farhan (Koordinator Pertandingan)', '082198765432', 'Technical Delegate & Jadwal', FALSE),
('wa-3', 'Siti Rahmawati (Bendahara)', '085711223344', 'Konfirmasi Pembayaran & Kuitansi', FALSE)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `committee_bank_accounts` (`id`, `bank_name`, `account_number`, `account_holder`, `is_primary`, `branch_name`, `instructions`) VALUES
('bank-1', 'Bank Pembangunan Daerah (BPD)', '1029384756', 'PANITIA WABUP CUP 2026', TRUE, 'Kantor Cabang Utama', 'Mohon sertakan Kode Registrasi Tim pada berita transfer.'),
('bank-2', 'Bank Rakyat Indonesia (BRI)', '0021-01-089765-50-2', 'PANITIA WABUP CUP 2026', FALSE, 'Unit Kota', 'Kirim bukti transfer melalui WhatsApp panitia.')
ON DUPLICATE KEY UPDATE `bank_name`=VALUES(`bank_name`);

-- 7. Seed Downloadable Docs
INSERT INTO `downloadable_docs` (`id`, `title`, `category`, `description`, `file_name`, `file_size`, `file_url`, `file_type`, `is_primary`, `updated_at`) VALUES
('doc-1', 'Petunjuk Teknis & Regulasi Pertandingan WabupCup 2026', 'Regulasi & Juknis', 'Dokumen resmi peraturan umum, sistem pertandingan, dan sanksi turnamen.', 'JUKNIS_WABUP_CUP_2026.pdf', '3.4 MB', 'https://example.com/docs/juknis.pdf', 'PDF', TRUE, '2026-08-20'),
('doc-2', 'Formulir Pendaftaran Tim & Official Resmi', 'Formulir Pendaftaran', 'Format Word/PDF isian data tim, nama pelatih, dan daftar 18 pemain.', 'FORMULIR_PENDAFTARAN_TIM.docx', '850 KB', 'https://example.com/docs/formulir.docx', 'DOCX', TRUE, '2026-08-20'),
('doc-3', 'Surat Pernyataan Keaslian Data Pemain (Bermaterai)', 'Template Surat', 'Format template pernyataan kepala sekolah/manajer klub bermaterai 10.000.', 'SURAT_PERNYATAAN_BERMATERAI.pdf', '420 KB', 'https://example.com/docs/pernyataan.pdf', 'PDF', FALSE, '2026-08-20')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
