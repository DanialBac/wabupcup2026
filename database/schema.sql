-- ==========================================================
-- DATABASE SCHEMA: WABUP CUP 2026 (FOOTBALL & FUTSAL CHAMPIONSHIP)
-- Compatible with: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, TiDB, PlanetScale, Aiven, Railway
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `wabupcup_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `wabupcup_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Table: tournament_config (Pengaturan Turnamen & Tampilan)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `tournament_config`;
CREATE TABLE `tournament_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(64) NOT NULL UNIQUE,
  `config_value` LONGTEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Table: categories (Kategori Usia, Biaya & Hadiah Turnamen)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(32) PRIMARY KEY, -- e.g. 'SD', 'SMP', 'SMA', 'UMUM', 'INSTANSI', 'DESA'
  `name` VARCHAR(150) NOT NULL,
  `badge_title` VARCHAR(100) NULL,
  `age_restriction` VARCHAR(100) NOT NULL,
  `max_teams` INT NOT NULL DEFAULT 16,
  `registered_teams_count` INT NOT NULL DEFAULT 0,
  `registration_fee` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_prize` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `description` TEXT NULL,
  `prizes_json` JSON NULL, -- Array of { rank: 'Juara 1', prizeMoney: 15000000, trophy: '...' }
  `rules_json` JSON NULL,  -- Array of rules strings
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Table: registrations (Pendaftaran Tim & Official)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `reg_code` VARCHAR(32) NOT NULL UNIQUE, -- e.g. 'WBC-SMA-001'
  `category_id` VARCHAR(32) NOT NULL,
  `team_name` VARCHAR(150) NOT NULL,
  `team_logo` LONGTEXT NULL, -- Base64 or Image URL
  `institution_name` VARCHAR(200) NOT NULL,
  `coach_name` VARCHAR(150) NOT NULL,
  `coach_phone` VARCHAR(50) NOT NULL,
  `coach_email` VARCHAR(150) NULL,
  `player_count` INT NOT NULL DEFAULT 18,
  `official_count` INT NOT NULL DEFAULT 3,
  `registration_date` VARCHAR(50) NOT NULL,
  `status` ENUM('PENDING_PAYMENT', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `payment_status` ENUM('UNPAID', 'VERIFYING', 'PAID') NOT NULL DEFAULT 'UNPAID',
  `payment_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `rejection_reason` TEXT NULL,
  `admin_notes` TEXT NULL,
  `documents_json` JSON NULL, -- Uploaded documents metadata & URLs
  `last_updated` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment` (`payment_status`),
  INDEX `idx_phone` (`coach_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Table: players (Daftar Pemain Tiap Tim Terdaftar)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `id` VARCHAR(64) PRIMARY KEY,
  `registration_id` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `jersey_number` INT NULL,
  `position` VARCHAR(50) NULL, -- 'Kiper', 'Bek', 'Gelandang', 'Penyerang', 'Anchor', 'Flank', 'Pivot'
  `birth_date` DATE NULL,
  `nisn_ktp` VARCHAR(50) NULL,
  `photo_url` LONGTEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Table: matches (Jadwal Pertandingan, Bagan & Live Score)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `matches`;
CREATE TABLE `matches` (
  `id` VARCHAR(64) PRIMARY KEY,
  `match_number` INT NOT NULL,
  `category_id` VARCHAR(32) NOT NULL,
  `round_name` VARCHAR(100) NOT NULL, -- 'Babak 16 Besar', 'Perempat Final', 'Semifinal', 'Final'
  `round_index` INT NOT NULL DEFAULT 1,
  `group_name` VARCHAR(50) NULL,
  -- Team A
  `team_a_name` VARCHAR(150) NOT NULL,
  `team_a_institution` VARCHAR(200) NULL,
  `team_a_logo` LONGTEXT NULL,
  `team_a_score` INT NULL,
  `team_a_penalties` INT NULL,
  -- Team B
  `team_b_name` VARCHAR(150) NOT NULL,
  `team_b_institution` VARCHAR(200) NULL,
  `team_b_logo` LONGTEXT NULL,
  `team_b_score` INT NULL,
  `team_b_penalties` INT NULL,
  -- Schedule & Pitch
  `match_date` VARCHAR(20) NOT NULL, -- 'YYYY-MM-DD'
  `match_time` VARCHAR(20) NOT NULL, -- 'HH:mm'
  `pitch` VARCHAR(100) NOT NULL, -- 'Stadion Utama A', 'GOR Lapangan 1'
  `status` ENUM('UPCOMING', 'LIVE', 'FINISHED') NOT NULL DEFAULT 'UPCOMING',
  `live_minute` VARCHAR(20) NULL, -- "34'", "HT", "FT"
  `events_json` JSON NULL, -- Array of { id, minute, team, type, playerName }
  `winner_id` VARCHAR(10) NULL, -- 'A', 'B', 'DRAW'
  `next_match_id` VARCHAR(64) NULL,
  `next_match_slot` VARCHAR(10) NULL, -- 'A' or 'B'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_match_cat` (`category_id`),
  INDEX `idx_match_status` (`status`),
  INDEX `idx_match_date` (`match_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. Table: sponsors (Sponsor & Mitra Turnamen)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `sponsors`;
CREATE TABLE `sponsors` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `tier` ENUM('PLATINUM', 'GOLD', 'SILVER', 'OFFICIAL_PARTNER') NOT NULL DEFAULT 'GOLD',
  `logo_text` VARCHAR(100) NOT NULL,
  `logo_url` LONGTEXT NULL,
  `website_url` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. Table: admin_users (Akun Panitia & Otorisasi)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(64) NOT NULL DEFAULT 'PANITIA_INTI',
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(50) NULL,
  `avatar_color` VARCHAR(30) NOT NULL DEFAULT 'bg-red-600',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. Table: downloadable_docs (Berkas Regulasi, Juknis & Formulir)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `downloadable_docs`;
CREATE TABLE `downloadable_docs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) NULL,
  `file_url` LONGTEXT NOT NULL,
  `file_type` ENUM('PDF', 'DOCX', 'XLSX', 'ZIP', 'IMAGE', 'OTHER') NOT NULL DEFAULT 'PDF',
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
  `updated_at` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 9. Table: committee_contacts (Kontak Panitia & WhatsApp CS)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `committee_contacts`;
CREATE TABLE `committee_contacts` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `role` VARCHAR(100) NOT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 10. Table: committee_bank_accounts (Rekening Pembayaran Biaya Tim)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `committee_bank_accounts`;
CREATE TABLE `committee_bank_accounts` (
  `id` VARCHAR(64) PRIMARY KEY,
  `bank_name` VARCHAR(100) NOT NULL,
  `account_number` VARCHAR(100) NOT NULL,
  `account_holder` VARCHAR(150) NOT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
  `branch_name` VARCHAR(100) NULL,
  `instructions` TEXT NULL,
  `qris_image_url` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 11. Table: app_media_storage (Penyimpanan Media & Berkas Terpusat TiDB Cloud)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `app_media_storage`;
CREATE TABLE `app_media_storage` (
  `id` VARCHAR(64) PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `content_type` VARCHAR(100) NOT NULL,
  `file_size` BIGINT NOT NULL DEFAULT 0,
  `category` VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- 'REG_DOC', 'TEAM_LOGO', 'SPONSOR_LOGO', 'CMS_WALLPAPER'
  `ref_id` VARCHAR(100) NULL, -- ID entitas induk (pendaftaran / sponsor)
  `sub_key` VARCHAR(100) NULL, -- nama field (teamLogo, suratKeterangan, dll)
  `file_data` LONGTEXT NOT NULL, -- Base64 data URI
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_media_category` (`category`),
  INDEX `idx_media_ref` (`ref_id`),
  INDEX `idx_media_subkey` (`sub_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
