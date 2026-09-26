// server/serverless.ts
import express from "express";
import cors from "cors";

// server/routes.ts
import { Router as Router4 } from "express";

// server/db.ts
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// server/defaultSystemData.ts
var DEFAULT_SECTIONS_VISIBILITY = {
  hero: true,
  liveScore: true,
  categories: true,
  bracket: true,
  venue: true,
  sponsors: true
};
var DEFAULT_TOURNAMENT_CONFIG = {
  name: "WabupCup",
  edition: "2026",
  tagline: "Turnamen Futsal Perebutan Piala Wakil Bupati",
  registrationDeadline: "2026-10-15",
  tournamentStartDate: "2026-10-24",
  tournamentEndDate: "2026-11-08",
  venueName: "Gedung Utama GOR Tawang Alun Banyuwangi",
  venueAddress: "Jl. Wijaya Kusuma, Lingkungan Cuking Rw., Mojopanggung, Kec. Giri, Kabupaten Banyuwangi, Jawa Timur 68425, Kabupaten Banyuwangi",
  venueCity: "Kabupaten Banyuwangi",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.921835941096!2d114.34936872662414!3d-8.210615691821596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd14545d37030e3%3A0x3f601cc59d28c3c8!2sGedung%20Utama%20GOR%20Tawang%20Alun%20Banyuwangi!5e0!3m2!1sid!2sid!4v1788166952611!5m2!1sid!2sid",
  totalPrizePool: 58e6,
  adminContactPhone: "6285233909898",
  adminContactEmail: "infinityorganizer01.22@gmail.com",
  bankAccounts: [],
  downloadableDocs: [],
  committeeContacts: [],
  committeeEmails: [],
  committeeChairmanName: "AHMAT IQBAL FIRDAUS",
  committeeChairmanTitle: "Ketua Panitia Pelaksana Wabup Cup 2026",
  sectionsVisibility: { ...DEFAULT_SECTIONS_VISIBILITY },
  sectionsBackgrounds: {
    hero: {
      mode: "DEFAULT",
      bgColor: "#020617",
      desktopImage: "",
      mobileImage: "",
      overlayColor: "#000000",
      overlayOpacity: 60,
      overlayBlur: false,
      textColorMode: "LIGHT"
    },
    liveScore: {
      mode: "DEFAULT",
      bgColor: "#0f172a",
      desktopImage: "",
      mobileImage: "",
      overlayColor: "#000000",
      overlayOpacity: 60,
      overlayBlur: false,
      textColorMode: "AUTO"
    },
    categories: {
      mode: "DEFAULT",
      bgColor: "#0b0f19",
      desktopImage: "",
      mobileImage: "",
      overlayColor: "#000000",
      overlayOpacity: 60,
      overlayBlur: false,
      textColorMode: "AUTO"
    },
    bracket: {
      mode: "DEFAULT",
      bgColor: "#0f172a",
      desktopImage: "",
      mobileImage: "",
      overlayColor: "#000000",
      overlayOpacity: 60,
      overlayBlur: false,
      textColorMode: "AUTO"
    },
    venue: {
      mode: "DEFAULT",
      bgColor: "#020617",
      desktopImage: "",
      mobileImage: "",
      overlayColor: "#000000",
      overlayOpacity: 60,
      overlayBlur: false,
      textColorMode: "AUTO"
    },
    sponsors: {
      mode: "DEFAULT",
      bgColor: "#020617",
      desktopImage: "",
      mobileImage: "",
      overlayColor: "#000000",
      overlayOpacity: 60,
      overlayBlur: false,
      textColorMode: "AUTO"
    },
    footer: {
      mode: "DEFAULT",
      bgColor: "#020617",
      desktopImage: "",
      mobileImage: "",
      overlayColor: "#000000",
      overlayOpacity: 70,
      overlayBlur: false,
      textColorMode: "AUTO"
    }
  }
};
var DEFAULT_CATEGORIES = [];
var DEFAULT_ADMIN_USERS = [
  {
    id: "adm-01",
    username: "superadmin",
    fullName: "Ketua Panitia WabupCup 2026",
    role: "SUPERADMIN",
    email: "ketua.panitia@wabupcup2026.id",
    phone: "081234567890",
    createdAt: "2026-08-01",
    avatarColor: "bg-red-600"
  },
  {
    id: "adm-02",
    username: "panitia",
    fullName: "Sekretariat Panitia Inti",
    role: "PANITIA_INTI",
    email: "sekretariat.inti@wabupcup2026.id",
    phone: "081398765432",
    createdAt: "2026-08-05",
    avatarColor: "bg-indigo-600"
  },
  {
    id: "adm-03",
    username: "panitia_umum",
    fullName: "Staf Panitia Umum",
    role: "PANITIA_UMUM",
    email: "panitia.umum@wabupcup2026.id",
    phone: "085288990011",
    createdAt: "2026-08-08",
    avatarColor: "bg-emerald-600"
  },
  {
    id: "adm-04",
    username: "wasit_utama",
    fullName: "Koordinator Wasit & Pertandingan",
    role: "WASIT",
    email: "wasit@wabupcup2026.id",
    phone: "085211223344",
    createdAt: "2026-08-10",
    avatarColor: "bg-amber-600"
  },
  {
    id: "adm-05",
    username: "operator",
    fullName: "Operator Lapangan & Live Score",
    role: "OPERATOR",
    email: "operator@wabupcup2026.id",
    phone: "085277889900",
    createdAt: "2026-08-12",
    avatarColor: "bg-cyan-600"
  }
];

// src/utils/registrationCode.ts
function generateUniqueRegCode(category, existingList = []) {
  const normCat = (category || "UMUM").trim().toUpperCase();
  const prefix = `WBC-${normCat}-`;
  const existingCodes = /* @__PURE__ */ new Set();
  let maxSeq = 0;
  if (Array.isArray(existingList)) {
    for (const item of existingList) {
      if (!item) continue;
      const code = typeof item.regCode === "string" ? item.regCode.trim().toUpperCase() : "";
      if (!code) continue;
      existingCodes.add(code);
      if (code.startsWith(prefix)) {
        const numPart = code.slice(prefix.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > maxSeq) {
          maxSeq = parsed;
        }
      }
    }
  }
  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(3, "0")}`;
  while (existingCodes.has(candidate)) {
    nextSeq++;
    candidate = `${prefix}${String(nextSeq).padStart(3, "0")}`;
  }
  return candidate;
}

// server/db.ts
var MemoryStore = class {
  constructor() {
    this.config = { ...DEFAULT_TOURNAMENT_CONFIG };
    this.categories = [...DEFAULT_CATEGORIES];
    this.registrations = [];
    this.matches = [];
    this.sponsors = [];
    this.adminUsers = [...DEFAULT_ADMIN_USERS];
    this.media = /* @__PURE__ */ new Map();
  }
};
var memStore = new MemoryStore();
var LOCAL_STORE_FILE = path.join(process.cwd(), "server", "local-storage.json");
function loadLocalStore() {
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORE_FILE, "utf-8");
      if (raw && raw.trim() !== "") {
        const data = JSON.parse(raw);
        if (data.config) memStore.config = data.config;
        if (Array.isArray(data.categories)) memStore.categories = data.categories;
        if (Array.isArray(data.registrations)) memStore.registrations = data.registrations;
        if (Array.isArray(data.matches)) memStore.matches = data.matches;
        if (Array.isArray(data.sponsors)) memStore.sponsors = data.sponsors;
        if (Array.isArray(data.adminUsers)) memStore.adminUsers = data.adminUsers;
        console.log("[Local Store] Loaded local database cache successfully.");
      }
    }
  } catch (err) {
    console.warn("[Local Store] Warning reading local-storage.json:", err);
  }
}
function persistLocalStore() {
  try {
    const payload = {
      config: memStore.config,
      categories: memStore.categories,
      registrations: memStore.registrations,
      matches: memStore.matches,
      sponsors: memStore.sponsors,
      adminUsers: memStore.adminUsers
    };
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local Store] Warning saving local-storage.json:", err);
  }
}
loadLocalStore();
var pool = null;
var isMySqlConnected = false;
var mySqlError = null;
var DB_CONFIG_FILE = path.join(process.cwd(), "server", "db-config.json");
function loadSavedDbConfig() {
  try {
    if (fs.existsSync(DB_CONFIG_FILE)) {
      const content = fs.readFileSync(DB_CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("[DB Config] Could not read saved config file:", err);
  }
  return null;
}
function saveDbConfigFile(config) {
  try {
    fs.writeFileSync(DB_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    console.log("[DB Config] Successfully saved database configuration to", DB_CONFIG_FILE);
  } catch (err) {
    console.warn("[DB Config] Could not write config to file:", err);
  }
}
function getMySqlStatus() {
  const host = process.env.MYSQL_HOST || (process.env.DATABASE_URL ? "Via DATABASE_URL" : "Not configured (In-Memory fallback)");
  const dbName = process.env.MYSQL_DATABASE || "wabupcup_db";
  return {
    connected: isMySqlConnected,
    host,
    database: dbName,
    error: mySqlError,
    mode: isMySqlConnected ? "MYSQL_REAL" : "MEMORY_FALLBACK",
    stats: {
      categoriesCount: memStore.categories.length,
      registrationsCount: memStore.registrations.length,
      matchesCount: memStore.matches.length,
      sponsorsCount: memStore.sponsors.length,
      adminsCount: memStore.adminUsers.length
    }
  };
}
function resolveSslConfig(urlOrHost, explicitSsl) {
  if (process.env.MYSQL_SSL === "false" || process.env.MYSQL_SSL === "0") {
    return void 0;
  }
  const isCloudHost = urlOrHost && (urlOrHost.includes("tidbcloud.com") || urlOrHost.includes("psdb.cloud") || urlOrHost.includes("aivencloud.com") || urlOrHost.includes("railway.app") || urlOrHost.includes("amazonaws.com") || urlOrHost.includes("supabase.co") || urlOrHost.includes("cockroachlabs.cloud"));
  const needsSsl = explicitSsl || Boolean(isCloudHost) || process.env.MYSQL_SSL === "true" || process.env.MYSQL_SSL === "1" || Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes("ssl"));
  if (needsSsl) {
    const rejectUnauthorized = process.env.MYSQL_SSL_REJECT_UNAUTHORIZED === "true";
    return {
      minVersion: "TLSv1.2",
      rejectUnauthorized
    };
  }
  return void 0;
}
var dbInitPromise = null;
async function ensureDbConnected() {
  if (isMySqlConnected && pool) {
    return true;
  }
  const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : void 0;
  const host = process.env.MYSQL_HOST ? process.env.MYSQL_HOST.trim() : void 0;
  if (!dbUrl && !host) {
    return false;
  }
  if (!dbInitPromise) {
    dbInitPromise = initDatabaseConnection().finally(() => {
      dbInitPromise = null;
    });
  }
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(isMySqlConnected), 3500);
  });
  try {
    return await Promise.race([dbInitPromise, timeoutPromise]);
  } catch {
    return isMySqlConnected;
  }
}
async function initDatabaseConnection(customConfig) {
  const effectiveConfig = customConfig || loadSavedDbConfig();
  if (effectiveConfig) {
    if (effectiveConfig.databaseUrl !== void 0 && effectiveConfig.databaseUrl.trim()) {
      process.env.DATABASE_URL = effectiveConfig.databaseUrl.trim();
    }
    if (effectiveConfig.host !== void 0 && effectiveConfig.host.trim()) {
      process.env.MYSQL_HOST = effectiveConfig.host.trim();
    }
    if (effectiveConfig.port !== void 0) {
      process.env.MYSQL_PORT = String(effectiveConfig.port);
    }
    if (effectiveConfig.user !== void 0 && effectiveConfig.user.trim()) {
      process.env.MYSQL_USER = effectiveConfig.user.trim();
    }
    if (effectiveConfig.password !== void 0) {
      process.env.MYSQL_PASSWORD = effectiveConfig.password;
    }
    if (effectiveConfig.database !== void 0 && effectiveConfig.database.trim()) {
      process.env.MYSQL_DATABASE = effectiveConfig.database.trim();
    }
    if (effectiveConfig.ssl !== void 0) {
      process.env.MYSQL_SSL = effectiveConfig.ssl ? "true" : "false";
    }
  }
  const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : void 0;
  const host = process.env.MYSQL_HOST ? process.env.MYSQL_HOST.trim() : void 0;
  const user = process.env.MYSQL_USER ? process.env.MYSQL_USER.trim() : void 0;
  const password = process.env.MYSQL_PASSWORD !== void 0 ? process.env.MYSQL_PASSWORD : void 0;
  const database = (process.env.MYSQL_DATABASE || "wabupcup_db").trim();
  const isTidb = Boolean(dbUrl && dbUrl.includes("tidbcloud.com") || host && host.includes("tidbcloud.com"));
  const defaultPort = isTidb ? 4e3 : 3306;
  const port = parseInt(process.env.MYSQL_PORT || String(defaultPort), 10);
  const useSsl = process.env.MYSQL_SSL === "true" || process.env.MYSQL_SSL === "1" || isTidb;
  if (!dbUrl && !host) {
    console.log("[Database] No MySQL host or DATABASE_URL provided. Operating with in-memory persistence layer.");
    isMySqlConnected = false;
    mySqlError = "Belum dikonfigurasi. Silakan atur kredensial database di tab Database.";
    return false;
  }
  try {
    let poolOptions;
    if (dbUrl) {
      const ssl = resolveSslConfig(dbUrl, useSsl || isTidb);
      try {
        const parsedUrl = new URL(dbUrl);
        const urlDbName = parsedUrl.pathname.replace(/^\/+/, "") || database;
        const urlPort = parsedUrl.port ? parseInt(parsedUrl.port, 10) : isTidb ? 4e3 : 3306;
        poolOptions = {
          host: parsedUrl.hostname,
          port: urlPort,
          user: decodeURIComponent(parsedUrl.username),
          password: decodeURIComponent(parsedUrl.password),
          database: urlDbName,
          waitForConnections: true,
          connectionLimit: 4,
          maxIdle: 2,
          idleTimeout: 3e4,
          enableKeepAlive: true,
          keepAliveInitialDelay: 1e4,
          connectTimeout: 5e3,
          queueLimit: 0,
          ssl: ssl || (isTidb ? { minVersion: "TLSv1.2", rejectUnauthorized: false } : void 0)
        };
      } catch {
        poolOptions = {
          uri: dbUrl,
          waitForConnections: true,
          connectionLimit: 4,
          maxIdle: 2,
          idleTimeout: 3e4,
          enableKeepAlive: true,
          keepAliveInitialDelay: 1e4,
          connectTimeout: 5e3,
          queueLimit: 0,
          ssl
        };
      }
    } else {
      const ssl = resolveSslConfig(host, useSsl || isTidb);
      poolOptions = {
        host,
        user,
        password,
        database,
        port: port || (isTidb ? 4e3 : 3306),
        waitForConnections: true,
        connectionLimit: 4,
        maxIdle: 2,
        idleTimeout: 3e4,
        enableKeepAlive: true,
        keepAliveInitialDelay: 1e4,
        connectTimeout: 5e3,
        queueLimit: 0,
        ssl: ssl || (isTidb ? { minVersion: "TLSv1.2", rejectUnauthorized: false } : void 0)
      };
    }
    try {
      if (pool) {
        try {
          await pool.end();
        } catch {
        }
      }
      pool = mysql.createPool(poolOptions);
      pool.on?.("error", (poolErr) => {
        console.warn("[MySQL Pool Non-fatal Event]", poolErr?.message || poolErr);
      });
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
    } catch (connErr) {
      const isBadDb = connErr?.code === "ER_BAD_DB_ERROR" || connErr?.errno === 1049 || connErr?.message && connErr.message.toLowerCase().includes("unknown database");
      if (isBadDb) {
        console.log(`[MySQL] Database "${database}" does not exist yet. Attempting to create automatically...`);
        try {
          const tempOptions = { ...poolOptions, database: isTidb ? "test" : void 0, connectTimeout: 3e3 };
          const tempConn = await mysql.createConnection(tempOptions);
          tempConn.on?.("error", (err) => console.warn("[MySQL Temp Connection Event]", err?.message));
          await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4;`);
          await tempConn.end();
          pool = mysql.createPool(poolOptions);
          pool.on?.("error", (poolErr) => {
            console.warn("[MySQL Pool Non-fatal Event]", poolErr?.message || poolErr);
          });
          const connection = await pool.getConnection();
          await connection.ping();
          connection.release();
          console.log(`[MySQL] Database "${database}" created and connected successfully.`);
        } catch (createErr) {
          console.warn("[MySQL] Auto-create database fallback warning:", createErr?.message);
          if (isTidb) {
            const fallbackOptions = { ...poolOptions, database: "test" };
            pool = mysql.createPool(fallbackOptions);
            pool.on?.("error", (poolErr) => {
              console.warn("[MySQL Pool Non-fatal Event]", poolErr?.message || poolErr);
            });
            const connection = await pool.getConnection();
            await connection.ping();
            connection.release();
          } else {
            throw connErr;
          }
        }
      } else {
        throw connErr;
      }
    }
    isMySqlConnected = true;
    mySqlError = null;
    console.log(`[MySQL] Successfully connected to MySQL database: ${database} at ${host || "DATABASE_URL"}`);
    if (customConfig) {
      saveDbConfigFile(customConfig);
    }
    await autoMigrateTables();
    return true;
  } catch (err) {
    isMySqlConnected = false;
    if (err?.code === "ER_ACCESS_DENIED_ERROR" || err?.errno === 1045) {
      mySqlError = `Akses Ditolak (ER_ACCESS_DENIED): Password atau Username database tidak cocok. Silakan periksa atau buat ulang password di dashboard database online Anda (misal TiDB Cloud Console).`;
    } else if (err?.code === "ENOTFOUND") {
      mySqlError = `Host Tidak Ditemukan (ENOTFOUND): Hostname '${host || "DATABASE_URL"}' tidak dapat dihubungi. Periksa URL koneksi database.`;
    } else if (err?.code === "ETIMEDOUT") {
      mySqlError = `Koneksi Timeout (ETIMEDOUT): Server database tidak merespons. Pastikan IP Allowlist diatur ke 0.0.0.0/0.`;
    } else {
      mySqlError = err?.message || "Gagal terhubung ke MySQL";
    }
    console.warn(`[MySQL Warning] Could not connect to MySQL: ${mySqlError}. Using fallback storage.`);
    return false;
  }
}
async function autoMigrateTables() {
  if (!pool || !isMySqlConnected) return;
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'categories'");
    if (rows.length === 0) {
      console.log("[MySQL] Tables not found. Initializing schema automatically...");
      await runFullSchemaInit();
    } else {
      try {
        await pool.query("ALTER TABLE admin_users MODIFY COLUMN role VARCHAR(64) NOT NULL DEFAULT 'PANITIA_INTI'");
      } catch (colErr) {
      }
    }
  } catch (err) {
    console.error("[MySQL] Error checking tables:", err);
  }
}
async function runFullSchemaInit() {
  if (!pool || !isMySqlConnected) {
    return { success: true, message: "In-memory data reloaded successfully" };
  }
  const queries = [
    `CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(32) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      badge_title VARCHAR(100) NULL,
      age_restriction VARCHAR(100) NOT NULL,
      max_teams INT NOT NULL DEFAULT 16,
      registered_teams_count INT NOT NULL DEFAULT 0,
      registration_fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      total_prize DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      description TEXT NULL,
      prizes_json JSON NULL,
      rules_json JSON NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS registrations (
      id VARCHAR(64) PRIMARY KEY,
      reg_code VARCHAR(32) NOT NULL UNIQUE,
      category_id VARCHAR(32) NOT NULL,
      team_name VARCHAR(150) NOT NULL,
      team_logo LONGTEXT NULL,
      institution_name VARCHAR(200) NOT NULL,
      coach_name VARCHAR(150) NOT NULL,
      coach_phone VARCHAR(50) NOT NULL,
      coach_email VARCHAR(150) NULL,
      player_count INT NOT NULL DEFAULT 18,
      official_count INT NOT NULL DEFAULT 3,
      registration_date VARCHAR(50) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING_PAYMENT',
      payment_status VARCHAR(32) NOT NULL DEFAULT 'UNPAID',
      payment_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      rejection_reason TEXT NULL,
      admin_notes TEXT NULL,
      documents_json JSON NULL,
      last_updated VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS matches (
      id VARCHAR(64) PRIMARY KEY,
      match_number INT NOT NULL,
      category_id VARCHAR(32) NOT NULL,
      round_name VARCHAR(100) NOT NULL,
      round_index INT NOT NULL DEFAULT 1,
      group_name VARCHAR(50) NULL,
      team_a_name VARCHAR(150) NOT NULL,
      team_a_institution VARCHAR(200) NULL,
      team_a_logo LONGTEXT NULL,
      team_a_score INT NULL,
      team_a_penalties INT NULL,
      team_b_name VARCHAR(150) NOT NULL,
      team_b_institution VARCHAR(200) NULL,
      team_b_logo LONGTEXT NULL,
      team_b_score INT NULL,
      team_b_penalties INT NULL,
      match_date VARCHAR(20) NOT NULL,
      match_time VARCHAR(20) NOT NULL,
      pitch VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
      live_minute VARCHAR(20) NULL,
      events_json JSON NULL,
      winner_id VARCHAR(10) NULL,
      next_match_id VARCHAR(64) NULL,
      next_match_slot VARCHAR(10) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS sponsors (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      tier VARCHAR(50) NOT NULL DEFAULT 'GOLD',
      logo_text VARCHAR(100) NOT NULL,
      logo_url LONGTEXT NULL,
      website_url VARCHAR(255) NULL,
      description TEXT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(64) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      role VARCHAR(64) NOT NULL DEFAULT 'PANITIA_INTI',
      email VARCHAR(150) NULL,
      phone VARCHAR(50) NULL,
      avatar_color VARCHAR(30) NOT NULL DEFAULT 'bg-red-600',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS tournament_config (
      config_key VARCHAR(64) PRIMARY KEY,
      config_value LONGTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS app_media_storage (
      id VARCHAR(64) PRIMARY KEY,
      category VARCHAR(32) NOT NULL,
      ref_id VARCHAR(64) NULL,
      sub_key VARCHAR(64) NULL,
      filename VARCHAR(255) NOT NULL,
      content_type VARCHAR(100) NOT NULL,
      file_size INT NOT NULL,
      file_data LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_ref_id (ref_id),
      INDEX idx_sub_key (sub_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];
  for (const q of queries) {
    await pool.query(q);
  }
  const [catRows] = await pool.query("SELECT COUNT(*) as count FROM categories");
  if (catRows[0].count === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await pool.query(
        `INSERT INTO categories (id, name, badge_title, age_restriction, max_teams, registered_teams_count, registration_fee, total_prize, description, prizes_json, rules_json) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cat.id,
          cat.name,
          cat.badgeTitle || "",
          cat.ageRestriction,
          cat.maxTeams,
          cat.registeredTeamsCount,
          cat.registrationFee,
          cat.totalPrize,
          cat.description || "",
          JSON.stringify(cat.prizes),
          JSON.stringify(cat.rules)
        ]
      );
    }
  }
  const [admRows] = await pool.query("SELECT COUNT(*) as count FROM admin_users");
  if (admRows[0].count === 0) {
    for (const adm of DEFAULT_ADMIN_USERS) {
      await pool.query(
        `INSERT INTO admin_users (id, username, password_hash, full_name, role, email, phone, avatar_color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          adm.id,
          adm.username,
          adm.password || "admin123",
          adm.fullName,
          adm.role,
          adm.email || "",
          adm.phone || "",
          adm.avatarColor || "bg-red-600"
        ]
      );
    }
  }
  const [cfgRows] = await pool.query("SELECT COUNT(*) as count FROM tournament_config");
  if (cfgRows[0].count === 0) {
    await pool.query(
      `INSERT INTO tournament_config (config_key, config_value) VALUES (?, ?)`,
      ["main_config", JSON.stringify(DEFAULT_TOURNAMENT_CONFIG)]
    );
  }
  return { success: true, message: "MySQL Database Tables Initialized and Seeded Successfully" };
}
var Database = {
  // Config
  async getConfig() {
    await ensureDbConnected();
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.query("SELECT config_value FROM tournament_config WHERE config_key = ?", ["main_config"]);
        if (rows.length > 0) {
          const parsed = JSON.parse(rows[0].config_value);
          return {
            ...DEFAULT_TOURNAMENT_CONFIG,
            ...parsed,
            sectionsVisibility: {
              ...DEFAULT_SECTIONS_VISIBILITY,
              ...parsed.sectionsVisibility || {}
            }
          };
        }
      } catch (err) {
        console.error("Error fetching config from MySQL:", err);
      }
    }
    return {
      ...memStore.config,
      sectionsVisibility: {
        ...DEFAULT_SECTIONS_VISIBILITY,
        ...memStore.config.sectionsVisibility || {}
      }
    };
  },
  async updateConfig(newConfig) {
    await ensureDbConnected();
    const current = await this.getConfig();
    const updated = {
      ...current,
      ...newConfig,
      bankAccounts: newConfig.bankAccounts !== void 0 ? newConfig.bankAccounts : current.bankAccounts || [],
      bankAccount: newConfig.bankAccount !== void 0 ? newConfig.bankAccount : current.bankAccount,
      committeeContacts: newConfig.committeeContacts !== void 0 ? newConfig.committeeContacts : current.committeeContacts || [],
      committeeEmails: newConfig.committeeEmails !== void 0 ? newConfig.committeeEmails : current.committeeEmails || [],
      downloadableDocs: newConfig.downloadableDocs !== void 0 ? newConfig.downloadableDocs : current.downloadableDocs || [],
      sectionsBackgrounds: {
        ...current.sectionsBackgrounds || {},
        ...newConfig.sectionsBackgrounds || {}
      },
      sectionsVisibility: {
        ...DEFAULT_SECTIONS_VISIBILITY,
        ...current.sectionsVisibility || {},
        ...newConfig.sectionsVisibility || {}
      }
    };
    const offloadMedia = async (dataUri, category, filename, refId, subKey) => {
      if (!dataUri || !dataUri.startsWith("data:") || dataUri.length < 200) {
        return dataUri;
      }
      try {
        const id = `med-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
        const mimeMatch = dataUri.match(/^data:([^;]+);base64,/);
        const contentType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
        const base64Content = dataUri.replace(/^data:[^;]+;base64,/, "");
        const fileSize = Math.round(base64Content.length * 3 / 4);
        await Database.saveMedia({
          id,
          category,
          refId,
          subKey,
          filename,
          contentType,
          fileSize,
          fileData: dataUri
        });
        return `/api/media/view/${id}`;
      } catch (err) {
        console.error("Failed to offload Base64 to app_media_storage:", err);
        return dataUri;
      }
    };
    if (updated.downloadableDocs && updated.downloadableDocs.length > 0) {
      for (let i = 0; i < updated.downloadableDocs.length; i++) {
        const doc = updated.downloadableDocs[i];
        if (doc.fileUrl && doc.fileUrl.startsWith("data:")) {
          const offloadedUrl = await offloadMedia(
            doc.fileUrl,
            "CMS_DOC",
            doc.fileName || `${(doc.title || "dokumen").replace(/\s+/g, "_")}.${(doc.fileType || "pdf").toLowerCase()}`,
            "config_doc",
            doc.id || `doc_${i}`
          );
          if (offloadedUrl) doc.fileUrl = offloadedUrl;
        }
      }
    }
    if (updated.formulirTemplateUrl && updated.formulirTemplateUrl.startsWith("data:")) {
      const offloaded = await offloadMedia(
        updated.formulirTemplateUrl,
        "CMS_DOC",
        "Formulir_Pendaftaran.pdf",
        "config_template",
        "formulir"
      );
      if (offloaded) updated.formulirTemplateUrl = offloaded;
    }
    if (updated.suratPernyataanTemplateUrl && updated.suratPernyataanTemplateUrl.startsWith("data:")) {
      const offloaded = await offloadMedia(
        updated.suratPernyataanTemplateUrl,
        "CMS_DOC",
        "Surat_Pernyataan.pdf",
        "config_template",
        "surat_pernyataan"
      );
      if (offloaded) updated.suratPernyataanTemplateUrl = offloaded;
    }
    if (updated.regulasiPdfUrl && updated.regulasiPdfUrl.startsWith("data:")) {
      const offloaded = await offloadMedia(
        updated.regulasiPdfUrl,
        "CMS_DOC",
        "Buku_Regulasi.pdf",
        "config_template",
        "regulasi"
      );
      if (offloaded) updated.regulasiPdfUrl = offloaded;
    }
    const legacyBankAccount = updated.bankAccount;
    if (legacyBankAccount?.qrisImageUrl && typeof legacyBankAccount.qrisImageUrl === "string" && legacyBankAccount.qrisImageUrl.startsWith("data:")) {
      const offloaded = await offloadMedia(
        legacyBankAccount.qrisImageUrl,
        "CMS_WALLPAPER",
        "QRIS_Bank.jpg",
        "config_bank",
        "qris"
      );
      if (offloaded) legacyBankAccount.qrisImageUrl = offloaded;
    }
    if (updated.bankAccounts && updated.bankAccounts.length > 0) {
      for (const b of updated.bankAccounts) {
        if (b.qrisImageUrl && b.qrisImageUrl.startsWith("data:")) {
          const offloaded = await offloadMedia(
            b.qrisImageUrl,
            "CMS_WALLPAPER",
            `QRIS_${b.id}.jpg`,
            "config_bank",
            b.id
          );
          if (offloaded) b.qrisImageUrl = offloaded;
        }
      }
    }
    if (updated.sectionsBackgrounds) {
      for (const [secKey, secBg] of Object.entries(updated.sectionsBackgrounds)) {
        if (secBg?.desktopImage && secBg.desktopImage.startsWith("data:")) {
          const offloaded = await offloadMedia(
            secBg.desktopImage,
            "CMS_WALLPAPER",
            `bg_${secKey}_desktop.jpg`,
            "config_bg",
            `${secKey}_desktop`
          );
          if (offloaded) secBg.desktopImage = offloaded;
        }
        if (secBg?.mobileImage && secBg.mobileImage.startsWith("data:")) {
          const offloaded = await offloadMedia(
            secBg.mobileImage,
            "CMS_WALLPAPER",
            `bg_${secKey}_mobile.jpg`,
            "config_bg",
            `${secKey}_mobile`
          );
          if (offloaded) secBg.mobileImage = offloaded;
        }
      }
    }
    memStore.config = updated;
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        await pool.query(
          `INSERT INTO tournament_config (config_key, config_value) VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE config_value = ?`,
          ["main_config", JSON.stringify(updated), JSON.stringify(updated)]
        );
      } catch (err) {
        console.error("Error saving config to MySQL:", err);
      }
    }
    return updated;
  },
  // Categories
  async getCategories() {
    await ensureDbConnected();
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.query("SELECT * FROM categories ORDER BY sort_order ASC, id ASC");
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          badgeTitle: r.badge_title,
          ageRestriction: r.age_restriction,
          maxTeams: r.max_teams,
          registeredTeamsCount: r.registered_teams_count,
          registrationFee: Number(r.registration_fee),
          totalPrize: Number(r.total_prize),
          description: r.description,
          prizes: typeof r.prizes_json === "string" ? JSON.parse(r.prizes_json) : r.prizes_json || [],
          rules: typeof r.rules_json === "string" ? JSON.parse(r.rules_json) : r.rules_json || []
        }));
      } catch (err) {
        console.error("Error getting categories from MySQL:", err);
      }
    }
    return memStore.categories;
  },
  async saveCategory(cat) {
    await ensureDbConnected();
    const idx = memStore.categories.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      memStore.categories[idx] = cat;
    } else {
      memStore.categories.push(cat);
    }
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        await pool.query(
          `INSERT INTO categories (id, name, badge_title, age_restriction, max_teams, registered_teams_count, registration_fee, total_prize, description, prizes_json, rules_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=?, badge_title=?, age_restriction=?, max_teams=?, registered_teams_count=?, registration_fee=?, total_prize=?, description=?, prizes_json=?, rules_json=?`,
          [
            cat.id,
            cat.name,
            cat.badgeTitle || "",
            cat.ageRestriction,
            cat.maxTeams,
            cat.registeredTeamsCount,
            cat.registrationFee,
            cat.totalPrize,
            cat.description || "",
            JSON.stringify(cat.prizes),
            JSON.stringify(cat.rules),
            cat.name,
            cat.badgeTitle || "",
            cat.ageRestriction,
            cat.maxTeams,
            cat.registeredTeamsCount,
            cat.registrationFee,
            cat.totalPrize,
            cat.description || "",
            JSON.stringify(cat.prizes),
            JSON.stringify(cat.rules)
          ]
        );
      } catch (err) {
        console.error("Error saving category to MySQL:", err);
      }
    }
    return cat;
  },
  async deleteCategory(categoryId) {
    await ensureDbConnected();
    memStore.categories = memStore.categories.filter((c) => c.id !== categoryId);
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        await pool.query("DELETE FROM categories WHERE id = ?", [categoryId]);
      } catch (err) {
        console.error("Error deleting category from MySQL:", err);
      }
    }
    return true;
  },
  async reorderCategories(categories) {
    await ensureDbConnected();
    memStore.categories = [...categories];
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        for (let i = 0; i < categories.length; i++) {
          const cat = categories[i];
          await pool.query(
            `INSERT INTO categories (id, name, badge_title, age_restriction, max_teams, registered_teams_count, registration_fee, total_prize, description, prizes_json, rules_json, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE sort_order = ?, name = ?, max_teams = ?, registration_fee = ?, total_prize = ?`,
            [
              cat.id,
              cat.name,
              cat.badgeTitle || "",
              cat.ageRestriction,
              cat.maxTeams,
              cat.registeredTeamsCount,
              cat.registrationFee,
              cat.totalPrize,
              cat.description || "",
              JSON.stringify(cat.prizes),
              JSON.stringify(cat.rules),
              i,
              i,
              cat.name,
              cat.maxTeams,
              cat.registrationFee,
              cat.totalPrize
            ]
          );
        }
      } catch (err) {
        console.error("Error reordering categories in MySQL:", err);
      }
    }
    return categories;
  },
  // Registrations
  async getRegistrations() {
    await ensureDbConnected();
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.query("SELECT * FROM registrations ORDER BY created_at DESC");
        if (Array.isArray(rows)) {
          return rows.map((r) => ({
            id: r.id,
            regCode: r.reg_code,
            category: r.category_id,
            teamName: r.team_name,
            teamLogo: r.team_logo || void 0,
            institutionName: r.institution_name,
            coachName: r.coach_name,
            coachPhone: r.coach_phone,
            coachEmail: r.coach_email || "",
            playerCount: r.player_count,
            officialCount: r.official_count,
            registrationDate: r.registration_date,
            status: r.status,
            paymentStatus: r.payment_status,
            paymentAmount: Number(r.payment_amount),
            rejectionReason: r.rejection_reason || void 0,
            adminNotes: r.admin_notes || void 0,
            documents: typeof r.documents_json === "string" ? JSON.parse(r.documents_json) : r.documents_json || {},
            lastUpdated: r.last_updated || r.registration_date
          }));
        }
      } catch (err) {
        console.error("Error fetching registrations from MySQL:", err);
      }
    }
    return memStore.registrations;
  },
  async saveRegistration(item) {
    await ensureDbConnected();
    const codeConflictMem = memStore.registrations.find(
      (r) => r.id !== item.id && r.regCode && item.regCode && r.regCode.trim().toUpperCase() === item.regCode.trim().toUpperCase()
    );
    if (codeConflictMem) {
      item.regCode = generateUniqueRegCode(item.category, memStore.registrations);
    }
    const idx = memStore.registrations.findIndex((r) => r.id === item.id);
    if (idx >= 0) {
      memStore.registrations[idx] = item;
    } else {
      memStore.registrations.unshift(item);
    }
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        const [existingById] = await pool.query("SELECT id, reg_code FROM registrations WHERE id = ?", [item.id]);
        if (Array.isArray(existingById) && existingById.length > 0) {
          await pool.execute(
            `UPDATE registrations SET
              reg_code=?, category_id=?, team_name=?, team_logo=?, institution_name=?,
              coach_name=?, coach_phone=?, coach_email=?, player_count=?, official_count=?,
              status=?, payment_status=?, payment_amount=?, rejection_reason=?, admin_notes=?,
              documents_json=?, last_updated=?
             WHERE id = ?`,
            [
              item.regCode,
              item.category,
              item.teamName,
              item.teamLogo || null,
              item.institutionName,
              item.coachName,
              item.coachPhone,
              item.coachEmail || "",
              item.playerCount,
              item.officialCount,
              item.status,
              item.paymentStatus,
              item.paymentAmount,
              item.rejectionReason || null,
              item.adminNotes || null,
              JSON.stringify(item.documents || {}),
              item.lastUpdated,
              item.id
            ]
          );
        } else {
          const [existingByCode] = await pool.query("SELECT id, reg_code FROM registrations WHERE reg_code = ?", [item.regCode]);
          if (Array.isArray(existingByCode) && existingByCode.length > 0) {
            const [allCatRows] = await pool.query("SELECT reg_code FROM registrations WHERE category_id = ?", [item.category]);
            const existingCatCodes = Array.isArray(allCatRows) ? allCatRows.map((r) => ({ regCode: r.reg_code })) : [];
            item.regCode = generateUniqueRegCode(item.category, [...memStore.registrations, ...existingCatCodes]);
            const mIdx = memStore.registrations.findIndex((r) => r.id === item.id);
            if (mIdx >= 0) memStore.registrations[mIdx].regCode = item.regCode;
            persistLocalStore();
          }
          try {
            await pool.execute(
              `INSERT INTO registrations (
                id, reg_code, category_id, team_name, team_logo, institution_name,
                coach_name, coach_phone, coach_email, player_count, official_count,
                registration_date, status, payment_status, payment_amount,
                rejection_reason, admin_notes, documents_json, last_updated
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.regCode,
                item.category,
                item.teamName,
                item.teamLogo || null,
                item.institutionName,
                item.coachName,
                item.coachPhone,
                item.coachEmail || "",
                item.playerCount,
                item.officialCount,
                item.registrationDate,
                item.status,
                item.paymentStatus,
                item.paymentAmount,
                item.rejectionReason || null,
                item.adminNotes || null,
                JSON.stringify(item.documents || {}),
                item.lastUpdated
              ]
            );
          } catch (insertErr) {
            if (insertErr?.code === "ER_DUP_ENTRY" || insertErr?.errno === 1062) {
              console.warn("[Database] Duplicate entry caught on insert, regenerating unique reg_code...");
              const [allRows] = await pool.query("SELECT reg_code FROM registrations WHERE category_id = ?", [item.category]);
              const existingCodes = Array.isArray(allRows) ? allRows.map((r) => ({ regCode: r.reg_code })) : [];
              item.regCode = generateUniqueRegCode(item.category, existingCodes);
              const mIdx = memStore.registrations.findIndex((r) => r.id === item.id);
              if (mIdx >= 0) memStore.registrations[mIdx].regCode = item.regCode;
              persistLocalStore();
              await pool.execute(
                `INSERT INTO registrations (
                  id, reg_code, category_id, team_name, team_logo, institution_name,
                  coach_name, coach_phone, coach_email, player_count, official_count,
                  registration_date, status, payment_status, payment_amount,
                  rejection_reason, admin_notes, documents_json, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  item.id,
                  item.regCode,
                  item.category,
                  item.teamName,
                  item.teamLogo || null,
                  item.institutionName,
                  item.coachName,
                  item.coachPhone,
                  item.coachEmail || "",
                  item.playerCount,
                  item.officialCount,
                  item.registrationDate,
                  item.status,
                  item.paymentStatus,
                  item.paymentAmount,
                  item.rejectionReason || null,
                  item.adminNotes || null,
                  JSON.stringify(item.documents || {}),
                  item.lastUpdated
                ]
              );
            } else {
              throw insertErr;
            }
          }
        }
      } catch (err) {
        console.error("[Database] Error saving registration to MySQL:", err);
      }
    }
    return item;
  },
  async deleteRegistration(id) {
    await ensureDbConnected();
    let localReg = memStore.registrations.find((r) => r.id === id || r.regCode === id);
    let mySqlRow = null;
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.query("SELECT * FROM registrations WHERE id = ? OR reg_code = ? LIMIT 1", [id, id]);
        if (Array.isArray(rows) && rows.length > 0) {
          mySqlRow = rows[0];
          if (!localReg) {
            localReg = {
              id: mySqlRow.id,
              regCode: mySqlRow.reg_code,
              category: mySqlRow.category_id,
              teamName: mySqlRow.team_name,
              teamLogo: mySqlRow.team_logo,
              institutionName: mySqlRow.institution_name,
              coachName: mySqlRow.coach_name,
              coachPhone: mySqlRow.coach_phone,
              coachEmail: mySqlRow.coach_email,
              playerCount: Number(mySqlRow.player_count),
              officialCount: Number(mySqlRow.official_count),
              registrationDate: mySqlRow.registration_date,
              status: mySqlRow.status,
              paymentStatus: mySqlRow.payment_status,
              paymentAmount: Number(mySqlRow.payment_amount),
              rejectionReason: mySqlRow.rejection_reason,
              adminNotes: mySqlRow.admin_notes,
              documents: typeof mySqlRow.documents_json === "string" ? JSON.parse(mySqlRow.documents_json) : mySqlRow.documents_json || {},
              lastUpdated: mySqlRow.last_updated
            };
          }
        }
      } catch (err) {
        console.warn("[deleteRegistration] Error fetching registration for cascading media cleanup:", err);
      }
    }
    const regId = localReg?.id || (mySqlRow?.id ? String(mySqlRow.id) : id);
    const regCode = localReg?.regCode || (mySqlRow?.reg_code ? String(mySqlRow.reg_code) : void 0);
    const mediaIdsToDelete = /* @__PURE__ */ new Set();
    const scanForMedia = (data) => {
      if (!data) return;
      const str = typeof data === "string" ? data : JSON.stringify(data);
      const viewMatches = str.match(/\/api\/media\/view\/([a-zA-Z0-9_-]+)/g);
      if (viewMatches) {
        for (const m of viewMatches) {
          const mId = m.replace("/api/media/view/", "").split(/[?#]/)[0];
          if (mId) mediaIdsToDelete.add(mId);
        }
      }
      const directMatches = str.match(/\bmed-\d+-[a-zA-Z0-9_-]+\b/g);
      if (directMatches) {
        for (const m of directMatches) {
          mediaIdsToDelete.add(m);
        }
      }
    };
    if (localReg) {
      scanForMedia(localReg.teamLogo);
      scanForMedia(localReg.documents);
    }
    if (mySqlRow) {
      scanForMedia(mySqlRow.team_logo);
      scanForMedia(mySqlRow.documents_json);
    }
    for (const [mId, mItem] of memStore.media.entries()) {
      if (mItem.refId === regId || mItem.refId === id || regCode && mItem.refId === regCode) {
        mediaIdsToDelete.add(mId);
      }
    }
    if (pool && isMySqlConnected) {
      try {
        const refParams = [regId, id];
        if (regCode) refParams.push(regCode);
        const refPlaceholders = refParams.map(() => "?").join(",");
        const [dbMediaRows] = await pool.query(
          `SELECT id FROM app_media_storage WHERE ref_id IN (${refPlaceholders})`,
          refParams
        );
        if (Array.isArray(dbMediaRows)) {
          for (const row of dbMediaRows) {
            if (row.id) mediaIdsToDelete.add(row.id);
          }
        }
        await pool.query(
          `DELETE FROM app_media_storage WHERE ref_id IN (${refPlaceholders})`,
          refParams
        );
        if (mediaIdsToDelete.size > 0) {
          const idList = Array.from(mediaIdsToDelete);
          const idPlaceholders = idList.map(() => "?").join(",");
          await pool.query(
            `DELETE FROM app_media_storage WHERE id IN (${idPlaceholders})`,
            idList
          );
        }
        await pool.execute(
          "DELETE FROM registrations WHERE id = ? OR id = ? OR reg_code = ?",
          [regId, id, regCode || id]
        );
        console.log(`[Storage Cleanup] Successfully deleted registration ${regId} (${regCode || "no-code"}) and ${mediaIdsToDelete.size} associated files (${Array.from(mediaIdsToDelete).join(", ")}) from TiDB app_media_storage`);
      } catch (err) {
        console.error("[Storage Cleanup] Error deleting registration and associated media from MySQL:", err);
      }
    }
    for (const mId of mediaIdsToDelete) {
      memStore.media.delete(mId);
    }
    for (const [mId, mItem] of memStore.media.entries()) {
      if (mItem.refId === regId || mItem.refId === id || regCode && mItem.refId === regCode) {
        memStore.media.delete(mId);
      }
    }
    memStore.registrations = memStore.registrations.filter(
      (r) => r.id !== regId && r.id !== id && (!regCode || r.regCode !== regCode)
    );
    persistLocalStore();
    return true;
  },
  // Matches
  async getMatches() {
    await ensureDbConnected();
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.query("SELECT * FROM matches ORDER BY match_date ASC, match_time ASC, match_number ASC");
        if (Array.isArray(rows)) {
          return rows.map((r) => ({
            id: r.id,
            matchNumber: r.match_number,
            category: r.category_id,
            round: r.round_name,
            roundIndex: r.round_index,
            group: r.group_name || void 0,
            teamA: {
              name: r.team_a_name,
              institution: r.team_a_institution || void 0,
              logo: r.team_a_logo || void 0,
              score: r.team_a_score !== null ? Number(r.team_a_score) : void 0,
              penalties: r.team_a_penalties !== null ? Number(r.team_a_penalties) : void 0
            },
            teamB: {
              name: r.team_b_name,
              institution: r.team_b_institution || void 0,
              logo: r.team_b_logo || void 0,
              score: r.team_b_score !== null ? Number(r.team_b_score) : void 0,
              penalties: r.team_b_penalties !== null ? Number(r.team_b_penalties) : void 0
            },
            date: r.match_date,
            time: r.match_time,
            pitch: r.pitch,
            status: r.status,
            liveMinute: r.live_minute || void 0,
            events: typeof r.events_json === "string" ? JSON.parse(r.events_json) : r.events_json || [],
            winnerId: r.winner_id || void 0,
            nextMatchId: r.next_match_id || void 0,
            nextMatchSlot: r.next_match_slot || void 0
          }));
        }
      } catch (err) {
        console.error("Error fetching matches from MySQL:", err);
      }
    }
    return memStore.matches;
  },
  async saveMatch(match) {
    await ensureDbConnected();
    const idx = memStore.matches.findIndex((m) => m.id === match.id);
    if (idx >= 0) {
      memStore.matches[idx] = match;
    } else {
      memStore.matches.push(match);
    }
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        await pool.query(
          `INSERT INTO matches (id, match_number, category_id, round_name, round_index, group_name, team_a_name, team_a_institution, team_a_logo, team_a_score, team_a_penalties, team_b_name, team_b_institution, team_b_logo, team_b_score, team_b_penalties, match_date, match_time, pitch, status, live_minute, events_json, winner_id, next_match_id, next_match_slot)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE match_number=?, category_id=?, round_name=?, round_index=?, group_name=?, team_a_name=?, team_a_institution=?, team_a_logo=?, team_a_score=?, team_a_penalties=?, team_b_name=?, team_b_institution=?, team_b_logo=?, team_b_score=?, team_b_penalties=?, match_date=?, match_time=?, pitch=?, status=?, live_minute=?, events_json=?, winner_id=?, next_match_id=?, next_match_slot=?`,
          [
            match.id,
            match.matchNumber,
            match.category,
            match.round,
            match.roundIndex,
            match.group || null,
            match.teamA.name,
            match.teamA.institution || null,
            match.teamA.logo || null,
            match.teamA.score !== void 0 ? match.teamA.score : null,
            match.teamA.penalties !== void 0 ? match.teamA.penalties : null,
            match.teamB.name,
            match.teamB.institution || null,
            match.teamB.logo || null,
            match.teamB.score !== void 0 ? match.teamB.score : null,
            match.teamB.penalties !== void 0 ? match.teamB.penalties : null,
            match.date,
            match.time,
            match.pitch,
            match.status,
            match.liveMinute || null,
            JSON.stringify(match.events || []),
            match.winnerId || null,
            match.nextMatchId || null,
            match.nextMatchSlot || null,
            match.matchNumber,
            match.category,
            match.round,
            match.roundIndex,
            match.group || null,
            match.teamA.name,
            match.teamA.institution || null,
            match.teamA.logo || null,
            match.teamA.score !== void 0 ? match.teamA.score : null,
            match.teamA.penalties !== void 0 ? match.teamA.penalties : null,
            match.teamB.name,
            match.teamB.institution || null,
            match.teamB.logo || null,
            match.teamB.score !== void 0 ? match.teamB.score : null,
            match.teamB.penalties !== void 0 ? match.teamB.penalties : null,
            match.date,
            match.time,
            match.pitch,
            match.status,
            match.liveMinute || null,
            JSON.stringify(match.events || []),
            match.winnerId || null,
            match.nextMatchId || null,
            match.nextMatchSlot || null
          ]
        );
      } catch (err) {
        console.error("Error saving match to MySQL:", err);
      }
    }
    return match;
  },
  async deleteMatch(matchId) {
    await ensureDbConnected();
    memStore.matches = memStore.matches.filter((m) => m.id !== matchId);
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        await pool.query("DELETE FROM matches WHERE id = ?", [matchId]);
      } catch (err) {
        console.error("Error deleting match from MySQL:", err);
      }
    }
    return true;
  },
  async replaceCategoryMatches(category, newMatches) {
    await ensureDbConnected();
    memStore.matches = memStore.matches.filter((m) => m.category !== category).concat(newMatches);
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        await pool.query("DELETE FROM matches WHERE category_id = ?", [category]);
        for (const match of newMatches) {
          await pool.query(
            `INSERT INTO matches (id, match_number, category_id, round_name, round_index, group_name, team_a_name, team_a_institution, team_a_logo, team_a_score, team_a_penalties, team_b_name, team_b_institution, team_b_logo, team_b_score, team_b_penalties, match_date, match_time, pitch, status, live_minute, events_json, winner_id, next_match_id, next_match_slot)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              match.id,
              match.matchNumber,
              match.category,
              match.round,
              match.roundIndex,
              match.group || null,
              match.teamA.name,
              match.teamA.institution || null,
              match.teamA.logo || null,
              match.teamA.score !== void 0 ? match.teamA.score : null,
              match.teamA.penalties !== void 0 ? match.teamA.penalties : null,
              match.teamB.name,
              match.teamB.institution || null,
              match.teamB.logo || null,
              match.teamB.score !== void 0 ? match.teamB.score : null,
              match.teamB.penalties !== void 0 ? match.teamB.penalties : null,
              match.date,
              match.time,
              match.pitch,
              match.status,
              match.liveMinute || null,
              JSON.stringify(match.events || []),
              match.winnerId || null,
              match.nextMatchId || null,
              match.nextMatchSlot || null
            ]
          );
        }
      } catch (err) {
        console.error("Error replacing category matches in MySQL:", err);
      }
    }
    return newMatches;
  },
  async saveMatchesBatch(matchesToSave) {
    await ensureDbConnected();
    for (const match of matchesToSave) {
      const idx = memStore.matches.findIndex((m) => m.id === match.id);
      if (idx >= 0) {
        memStore.matches[idx] = match;
      } else {
        memStore.matches.push(match);
      }
      if (pool && isMySqlConnected) {
        try {
          await pool.query(
            `INSERT INTO matches (id, match_number, category_id, round_name, round_index, group_name, team_a_name, team_a_institution, team_a_logo, team_a_score, team_a_penalties, team_b_name, team_b_institution, team_b_logo, team_b_score, team_b_penalties, match_date, match_time, pitch, status, live_minute, events_json, winner_id, next_match_id, next_match_slot)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE match_number=?, category_id=?, round_name=?, round_index=?, group_name=?, team_a_name=?, team_a_institution=?, team_a_logo=?, team_a_score=?, team_a_penalties=?, team_b_name=?, team_b_institution=?, team_b_logo=?, team_b_score=?, team_b_penalties=?, match_date=?, match_time=?, pitch=?, status=?, live_minute=?, events_json=?, winner_id=?, next_match_id=?, next_match_slot=?`,
            [
              match.id,
              match.matchNumber,
              match.category,
              match.round,
              match.roundIndex,
              match.group || null,
              match.teamA.name,
              match.teamA.institution || null,
              match.teamA.logo || null,
              match.teamA.score !== void 0 ? match.teamA.score : null,
              match.teamA.penalties !== void 0 ? match.teamA.penalties : null,
              match.teamB.name,
              match.teamB.institution || null,
              match.teamB.logo || null,
              match.teamB.score !== void 0 ? match.teamB.score : null,
              match.teamB.penalties !== void 0 ? match.teamB.penalties : null,
              match.date,
              match.time,
              match.pitch,
              match.status,
              match.liveMinute || null,
              JSON.stringify(match.events || []),
              match.winnerId || null,
              match.nextMatchId || null,
              match.nextMatchSlot || null,
              match.matchNumber,
              match.category,
              match.round,
              match.roundIndex,
              match.group || null,
              match.teamA.name,
              match.teamA.institution || null,
              match.teamA.logo || null,
              match.teamA.score !== void 0 ? match.teamA.score : null,
              match.teamA.penalties !== void 0 ? match.teamA.penalties : null,
              match.teamB.name,
              match.teamB.institution || null,
              match.teamB.logo || null,
              match.teamB.score !== void 0 ? match.teamB.score : null,
              match.teamB.penalties !== void 0 ? match.teamB.penalties : null,
              match.date,
              match.time,
              match.pitch,
              match.status,
              match.liveMinute || null,
              JSON.stringify(match.events || []),
              match.winnerId || null,
              match.nextMatchId || null,
              match.nextMatchSlot || null
            ]
          );
        } catch (err) {
          console.error("Error saving batch match item in MySQL:", err);
        }
      }
    }
    return matchesToSave;
  },
  // Sponsors
  async getSponsors() {
    await ensureDbConnected();
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.query("SELECT * FROM sponsors WHERE is_active = TRUE ORDER BY sort_order ASC");
        if (Array.isArray(rows)) {
          return rows.map((r) => ({
            id: r.id,
            name: r.name,
            tier: r.tier,
            logoText: r.logo_text,
            logoUrl: r.logo_url || void 0,
            websiteUrl: r.website_url || void 0,
            description: r.description || void 0
          }));
        }
      } catch (err) {
        console.error("Error fetching sponsors from MySQL:", err);
      }
    }
    return memStore.sponsors;
  },
  async saveSponsor(sponsor) {
    await ensureDbConnected();
    const idx = memStore.sponsors.findIndex((s) => s.id === sponsor.id);
    if (idx >= 0) {
      memStore.sponsors[idx] = sponsor;
    } else {
      memStore.sponsors.push(sponsor);
    }
    persistLocalStore();
    if (pool && isMySqlConnected) {
      try {
        await pool.query(
          `INSERT INTO sponsors (id, name, tier, logo_text, logo_url, website_url, description)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=?, tier=?, logo_text=?, logo_url=?, website_url=?, description=?`,
          [
            sponsor.id,
            sponsor.name,
            sponsor.tier,
            sponsor.logoText,
            sponsor.logoUrl || null,
            sponsor.websiteUrl || null,
            sponsor.description || null,
            sponsor.name,
            sponsor.tier,
            sponsor.logoText,
            sponsor.logoUrl || null,
            sponsor.websiteUrl || null,
            sponsor.description || null
          ]
        );
      } catch (err) {
        console.error("Error saving sponsor to MySQL:", err);
      }
    }
    return sponsor;
  },
  async deleteSponsor(id) {
    await ensureDbConnected();
    memStore.sponsors = memStore.sponsors.filter((s) => s.id !== id);
    persistLocalStore();
    for (const [mId, mItem] of memStore.media.entries()) {
      if (mItem.refId === id) {
        memStore.media.delete(mId);
      }
    }
    if (pool && isMySqlConnected) {
      try {
        await pool.query("DELETE FROM sponsors WHERE id = ?", [id]);
        await pool.query("DELETE FROM app_media_storage WHERE ref_id = ? AND category = ?", [id, "SPONSOR_LOGO"]);
        console.log(`[Storage Cleanup] Deleted sponsor logo for ${id} from TiDB Cloud`);
      } catch (err) {
        console.error("Error deleting sponsor from MySQL:", err);
      }
    }
    return true;
  },
  // Admin Users
  async getAdmins() {
    await ensureDbConnected();
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.query("SELECT id, username, full_name, role, email, phone, avatar_color, created_at FROM admin_users ORDER BY created_at ASC");
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map((r) => ({
            id: r.id,
            username: r.username,
            fullName: r.full_name,
            role: r.role,
            email: r.email || "",
            phone: r.phone || "",
            avatarColor: r.avatar_color,
            createdAt: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "2026-08-01"
          }));
          memStore.adminUsers = list;
          return list;
        } else if (Array.isArray(rows) && rows.length === 0) {
          for (const adm of DEFAULT_ADMIN_USERS) {
            await pool.query(
              `INSERT INTO admin_users (id, username, password_hash, full_name, role, email, phone, avatar_color)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
              [
                adm.id,
                adm.username,
                adm.password || "admin123",
                adm.fullName,
                adm.role,
                adm.email || "",
                adm.phone || "",
                adm.avatarColor || "bg-red-600"
              ]
            );
          }
          memStore.adminUsers = [...DEFAULT_ADMIN_USERS];
          return memStore.adminUsers;
        }
      } catch (err) {
        console.error("Error fetching admins from MySQL:", err);
      }
    }
    return memStore.adminUsers;
  },
  async saveAdmin(admin, password) {
    await ensureDbConnected();
    if (pool && isMySqlConnected) {
      const passHash = password || admin.password || "admin123";
      const roleToSave = admin.role || "PANITIA_INTI";
      try {
        await pool.query(
          `INSERT INTO admin_users (id, username, password_hash, full_name, role, email, phone, avatar_color, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             username = VALUES(username),
             full_name = VALUES(full_name),
             role = VALUES(role),
             email = VALUES(email),
             phone = VALUES(phone),
             avatar_color = VALUES(avatar_color),
             password_hash = COALESCE(?, password_hash)`,
          [
            admin.id,
            admin.username,
            passHash,
            admin.fullName,
            roleToSave,
            admin.email || null,
            admin.phone || null,
            admin.avatarColor || "bg-red-600",
            admin.createdAt ? new Date(admin.createdAt) : /* @__PURE__ */ new Date(),
            password || null
          ]
        );
        const idx = memStore.adminUsers.findIndex((a) => a.id === admin.id);
        if (idx >= 0) {
          memStore.adminUsers[idx] = { ...memStore.adminUsers[idx], ...admin, role: roleToSave };
        } else {
          memStore.adminUsers.push({ ...admin, role: roleToSave });
        }
      } catch (err) {
        console.error("Error saving admin user to MySQL:", err);
        const errMsg = String(err?.message || "");
        if (err?.code === "WARN_DATA_TRUNCATED" || err?.errno === 1265 || errMsg.includes("role") || errMsg.includes("Data truncated")) {
          try {
            console.log("[MySQL Auto-Migration] Migrating column role in admin_users to VARCHAR(64)...");
            await pool.query("ALTER TABLE admin_users MODIFY COLUMN role VARCHAR(64) NOT NULL DEFAULT 'PANITIA_INTI'");
            await pool.query(
              `INSERT INTO admin_users (id, username, password_hash, full_name, role, email, phone, avatar_color, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE 
                 username = VALUES(username),
                 full_name = VALUES(full_name),
                 role = VALUES(role),
                 email = VALUES(email),
                 phone = VALUES(phone),
                 avatar_color = VALUES(avatar_color),
                 password_hash = COALESCE(?, password_hash)`,
              [
                admin.id,
                admin.username,
                passHash,
                admin.fullName,
                roleToSave,
                admin.email || null,
                admin.phone || null,
                admin.avatarColor || "bg-red-600",
                admin.createdAt ? new Date(admin.createdAt) : /* @__PURE__ */ new Date(),
                password || null
              ]
            );
            console.log("[MySQL Auto-Migration] Successfully saved admin user after column role auto-migration!");
            const idx = memStore.adminUsers.findIndex((a) => a.id === admin.id);
            if (idx >= 0) {
              memStore.adminUsers[idx] = { ...memStore.adminUsers[idx], ...admin, role: roleToSave };
            } else {
              memStore.adminUsers.push({ ...admin, role: roleToSave });
            }
            return { ...admin, role: roleToSave };
          } catch (retryErr) {
            console.error("[MySQL Auto-Migration] Retry after role migration failed:", retryErr);
          }
        }
        throw new Error(`Gagal menyimpan data admin ke database MySQL: ${err?.message || err}`);
      }
    } else {
      const idx = memStore.adminUsers.findIndex((a) => a.id === admin.id || a.username.toLowerCase() === admin.username.toLowerCase());
      if (idx >= 0) {
        memStore.adminUsers[idx] = { ...memStore.adminUsers[idx], ...admin };
      } else {
        memStore.adminUsers.push(admin);
      }
    }
    return admin;
  },
  async deleteAdmin(id) {
    await ensureDbConnected();
    const target = memStore.adminUsers.find((a) => a.id === id);
    if (target && target.username.toLowerCase() === "superadmin") {
      return false;
    }
    memStore.adminUsers = memStore.adminUsers.filter((a) => a.id !== id);
    if (pool && isMySqlConnected) {
      try {
        await pool.query("DELETE FROM admin_users WHERE id = ? AND username != 'superadmin'", [id]);
      } catch (err) {
        console.error("Error deleting admin from MySQL:", err);
        throw new Error(`Gagal menghapus admin dari MySQL: ${err?.message || err}`);
      }
    }
    return true;
  },
  async verifyAdminLogin(username, pass) {
    await ensureDbConnected();
    const cleanUser = (username || "").trim().toLowerCase();
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.query("SELECT * FROM admin_users WHERE LOWER(username) = ?", [cleanUser]);
        if (rows && rows.length > 0) {
          const row = rows[0];
          const passHash = row.password_hash;
          if (passHash === pass) {
            const userObj = {
              id: row.id,
              username: row.username,
              fullName: row.full_name,
              role: row.role,
              email: row.email || "",
              phone: row.phone || "",
              avatarColor: row.avatar_color || "bg-red-600",
              createdAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "2026-08-01"
            };
            return { success: true, user: userObj };
          } else {
            return { success: false, error: "Password tidak sesuai dengan database" };
          }
        } else {
          return { success: false, error: "Akun username tidak ditemukan dalam tabel users" };
        }
      } catch (err) {
        console.error("Error verifying admin login with MySQL:", err);
      }
    }
    const found = memStore.adminUsers.find((a) => a.username.toLowerCase() === cleanUser);
    if (found) {
      if (found.password === pass) {
        const { password, ...userWithoutPass } = found;
        return { success: true, user: userWithoutPass };
      }
      return { success: false, error: "Password tidak sesuai" };
    }
    return { success: false, error: "Akun username tidak ditemukan" };
  },
  // Generate complete SQL Export dump
  async exportFullSqlDump() {
    await ensureDbConnected();
    const categories = await this.getCategories();
    const registrations = await this.getRegistrations();
    const matches = await this.getMatches();
    const sponsors = await this.getSponsors();
    const admins = await this.getAdmins();
    const config = await this.getConfig();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    let sql = `-- ==========================================================
`;
    sql += `-- WABUP CUP 2026 COMPLETE DATABASE BACKUP & EXPORT
`;
    sql += `-- Generated at: ${timestamp}
`;
    sql += `-- Target: MySQL 5.7+ / 8.0+ / MariaDB / Cloud SQL / phpMyAdmin
`;
    sql += `-- ==========================================================

`;
    sql += `CREATE DATABASE IF NOT EXISTS \`wabupcup_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`;
    sql += `USE \`wabupcup_db\`;

`;
    sql += `-- 1. CONFIG
`;
    sql += `INSERT INTO \`tournament_config\` (\`config_key\`, \`config_value\`) VALUES ('main_config', '${JSON.stringify(config).replace(/'/g, "\\'")}') ON DUPLICATE KEY UPDATE \`config_value\`=VALUES(\`config_value\`);

`;
    sql += `-- 2. CATEGORIES
`;
    for (const c of categories) {
      sql += `INSERT INTO \`categories\` (\`id\`, \`name\`, \`badge_title\`, \`age_restriction\`, \`max_teams\`, \`registered_teams_count\`, \`registration_fee\`, \`total_prize\`, \`description\`, \`prizes_json\`, \`rules_json\`) VALUES ('${c.id}', '${c.name.replace(/'/g, "\\'")}', '${(c.badgeTitle || "").replace(/'/g, "\\'")}', '${c.ageRestriction}', ${c.maxTeams}, ${c.registeredTeamsCount}, ${c.registrationFee}, ${c.totalPrize}, '${(c.description || "").replace(/'/g, "\\'")}', '${JSON.stringify(c.prizes).replace(/'/g, "\\'")}', '${JSON.stringify(c.rules).replace(/'/g, "\\'")}') ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);
`;
    }
    sql += `
`;
    sql += `-- 3. REGISTRATIONS
`;
    for (const r of registrations) {
      sql += `INSERT INTO \`registrations\` (\`id\`, \`reg_code\`, \`category_id\`, \`team_name\`, \`institution_name\`, \`coach_name\`, \`coach_phone\`, \`coach_email\`, \`player_count\`, \`official_count\`, \`registration_date\`, \`status\`, \`payment_status\`, \`payment_amount\`, \`documents_json\`, \`last_updated\`) VALUES ('${r.id}', '${r.regCode}', '${r.category}', '${r.teamName.replace(/'/g, "\\'")}', '${r.institutionName.replace(/'/g, "\\'")}', '${r.coachName.replace(/'/g, "\\'")}', '${r.coachPhone}', '${r.coachEmail}', ${r.playerCount}, ${r.officialCount}, '${r.registrationDate}', '${r.status}', '${r.paymentStatus}', ${r.paymentAmount}, '${JSON.stringify(r.documents || {}).replace(/'/g, "\\'")}', '${r.lastUpdated}') ON DUPLICATE KEY UPDATE \`team_name\`=VALUES(\`team_name\`);
`;
    }
    sql += `
`;
    sql += `-- 4. MATCHES
`;
    for (const m of matches) {
      sql += `INSERT INTO \`matches\` (\`id\`, \`match_number\`, \`category_id\`, \`round_name\`, \`round_index\`, \`team_a_name\`, \`team_a_institution\`, \`team_a_score\`, \`team_b_name\`, \`team_b_institution\`, \`team_b_score\`, \`match_date\`, \`match_time\`, \`pitch\`, \`status\`, \`live_minute\`, \`events_json\`, \`winner_id\`) VALUES ('${m.id}', ${m.matchNumber}, '${m.category}', '${m.round.replace(/'/g, "\\'")}', ${m.roundIndex}, '${m.teamA.name.replace(/'/g, "\\'")}', '${(m.teamA.institution || "").replace(/'/g, "\\'")}', ${m.teamA.score !== void 0 ? m.teamA.score : "NULL"}, '${m.teamB.name.replace(/'/g, "\\'")}', '${(m.teamB.institution || "").replace(/'/g, "\\'")}', ${m.teamB.score !== void 0 ? m.teamB.score : "NULL"}, '${m.date}', '${m.time}', '${m.pitch.replace(/'/g, "\\'")}', '${m.status}', ${m.liveMinute ? `'${m.liveMinute}'` : "NULL"}, '${JSON.stringify(m.events || []).replace(/'/g, "\\'")}', ${m.winnerId ? `'${m.winnerId}'` : "NULL"}) ON DUPLICATE KEY UPDATE \`team_a_name\`=VALUES(\`team_a_name\`);
`;
    }
    sql += `
`;
    sql += `-- 5. SPONSORS
`;
    for (const s of sponsors) {
      sql += `INSERT INTO \`sponsors\` (\`id\`, \`name\`, \`tier\`, \`logo_text\`, \`website_url\`, \`description\`) VALUES ('${s.id}', '${s.name.replace(/'/g, "\\'")}', '${s.tier}', '${s.logoText}', '${s.websiteUrl || ""}', '${(s.description || "").replace(/'/g, "\\'")}') ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);
`;
    }
    sql += `
`;
    sql += `-- 6. ADMIN USERS
`;
    for (const a of admins) {
      sql += `INSERT INTO \`admin_users\` (\`id\`, \`username\`, \`password_hash\`, \`full_name\`, \`role\`, \`email\`, \`phone\`, \`avatar_color\`) VALUES ('${a.id}', '${a.username}', 'admin123', '${a.fullName.replace(/'/g, "\\'")}', '${a.role}', '${a.email}', '${a.phone}', '${a.avatarColor}') ON DUPLICATE KEY UPDATE \`full_name\`=VALUES(\`full_name\`);
`;
    }
    return sql;
  },
  // Centralized Media Storage (TiDB Cloud)
  async saveMedia(item) {
    await ensureDbConnected();
    memStore.media.set(item.id, item);
    if (pool && isMySqlConnected) {
      try {
        await pool.execute(
          `INSERT INTO app_media_storage (id, category, ref_id, sub_key, filename, content_type, file_size, file_data)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE category=?, ref_id=?, sub_key=?, filename=?, content_type=?, file_size=?, file_data=?`,
          [
            item.id,
            item.category,
            item.refId || null,
            item.subKey || null,
            item.filename,
            item.contentType,
            item.fileSize,
            item.fileData,
            item.category,
            item.refId || null,
            item.subKey || null,
            item.filename,
            item.contentType,
            item.fileSize,
            item.fileData
          ]
        );
      } catch (err) {
        console.error("Error saving media to TiDB app_media_storage:", err);
      }
    }
    return item;
  },
  async getMedia(id) {
    await ensureDbConnected();
    if (pool && isMySqlConnected) {
      try {
        const [rows] = await pool.execute("SELECT * FROM app_media_storage WHERE id = ? LIMIT 1", [id]);
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            category: r.category,
            refId: r.ref_id || void 0,
            subKey: r.sub_key || void 0,
            filename: r.filename,
            contentType: r.content_type,
            fileSize: Number(r.file_size),
            fileData: r.file_data,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : void 0,
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : void 0
          };
        }
      } catch (err) {
        console.error("Error fetching media from TiDB app_media_storage:", err);
      }
    }
    return memStore.media.get(id) || null;
  },
  async deleteMedia(id) {
    await ensureDbConnected();
    memStore.media.delete(id);
    if (pool && isMySqlConnected) {
      try {
        await pool.execute("DELETE FROM app_media_storage WHERE id = ?", [id]);
      } catch (err) {
        console.error("Error deleting media from TiDB app_media_storage:", err);
      }
    }
    return true;
  },
  async deleteMediaByRef(refId, category) {
    await ensureDbConnected();
    for (const [mId, mItem] of memStore.media.entries()) {
      if (mItem.refId === refId && (!category || mItem.category === category)) {
        memStore.media.delete(mId);
      }
    }
    if (pool && isMySqlConnected) {
      try {
        if (category) {
          await pool.execute("DELETE FROM app_media_storage WHERE ref_id = ? AND category = ?", [refId, category]);
        } else {
          await pool.execute("DELETE FROM app_media_storage WHERE ref_id = ?", [refId]);
        }
      } catch (err) {
        console.error("Error deleting media by ref from TiDB app_media_storage:", err);
      }
    }
    return true;
  },
  async updateMediaRef(id, refId, subKey) {
    await ensureDbConnected();
    const memItem = memStore.media.get(id);
    if (memItem) {
      memItem.refId = refId;
      if (subKey) memItem.subKey = subKey;
    }
    if (subKey) {
      for (const [mId, m] of memStore.media.entries()) {
        if (m.refId === refId && m.subKey === subKey && mId !== id) {
          memStore.media.delete(mId);
        }
      }
    }
    if (pool && isMySqlConnected) {
      try {
        if (subKey) {
          await pool.execute(
            "DELETE FROM app_media_storage WHERE ref_id = ? AND sub_key = ? AND id != ?",
            [refId, subKey, id]
          );
          await pool.execute("UPDATE app_media_storage SET ref_id = ?, sub_key = ? WHERE id = ?", [refId, subKey, id]);
        } else {
          await pool.execute("UPDATE app_media_storage SET ref_id = ? WHERE id = ?", [refId, id]);
        }
      } catch (err) {
        console.error("Error updating media ref in TiDB app_media_storage:", err);
      }
    }
    return true;
  }
};

// server/blob.ts
import { Router } from "express";
import { handleUpload } from "@vercel/blob/client";
var blobRouter = Router();
blobRouter.post("/blob/upload", async (req, res) => {
  const body = req.body;
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN || Object.entries(process.env).find(([k]) => k.includes("BLOB") && k.includes("TOKEN"))?.[1];
  if (!token) {
    return res.status(503).json({
      error: "BLOB_READ_WRITE_TOKEN belum aktif pada deployment saat ini. Harap lakukan Redeploy di dashboard Vercel."
    });
  }
  try {
    const jsonResponse = await handleUpload({
      token,
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
        const isAllowed = allowedExtensions.some((ext) => pathname.toLowerCase().endsWith(ext));
        if (!isAllowed) {
          throw new Error("Ekstensi berkas tidak diizinkan. Hanya menerima PDF dan Gambar (JPG/PNG/WEBP).");
        }
        return {
          allowedContentTypes: [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
          ],
          maximumSizeInBytes: 15 * 1024 * 1024,
          // Allow up to 15MB direct to Vercel Blob
          tokenPayload: JSON.stringify({ timestamp: Date.now() })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("[Vercel Blob Completed]", blob.url, tokenPayload);
      }
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("[Vercel Blob Upload Token Error]", error);
    return res.status(400).json({ error: error.message || "Gagal memproses token upload" });
  }
});

// server/r2.ts
import { Router as Router2 } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var r2Router = Router2();
var s3ClientInstance = null;
function getR2Client() {
  if (s3ClientInstance) return s3ClientInstance;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }
  s3ClientInstance = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
  return s3ClientInstance;
}
r2Router.post("/storage/presigned-url", async (req, res) => {
  try {
    const { filename, contentType, folder = "registrations" } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: "Filename and contentType are required" });
    }
    const s3 = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME || "wabupcup-storage";
    const publicDomain = (process.env.R2_PUBLIC_DOMAIN || "").replace(/\/+$/, "");
    if (!s3 || !publicDomain) {
      return res.status(503).json({
        error: "Cloudflare R2 belum dikonfigurasi di Environment Variables.",
        configured: false
      });
    }
    const timestamp = Date.now();
    const sanitizedName = String(filename).replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${timestamp}-${sanitizedName}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    const publicUrl = `${publicDomain}/${key}`;
    return res.status(200).json({
      uploadUrl,
      publicUrl,
      key
    });
  } catch (error) {
    console.error("[Cloudflare R2 Presign Error]", error);
    return res.status(500).json({ error: error.message || "Failed to generate upload URL" });
  }
});

// server/mediaRoutes.ts
import { Router as Router3 } from "express";
var mediaRouter = Router3();
function decodeBase64File(fileData) {
  const matches = fileData.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    return { buffer, mimeType };
  }
  return { buffer: Buffer.from(fileData, "base64") };
}
mediaRouter.post("/media/upload", async (req, res) => {
  try {
    const { filename, contentType, fileData, category = "REG_DOC", refId, subKey } = req.body;
    if (!filename || !fileData) {
      return res.status(400).json({ error: "Filename and fileData are required" });
    }
    const { buffer, mimeType } = decodeBase64File(fileData);
    const resolvedContentType = contentType || mimeType || "application/octet-stream";
    const fileSize = buffer.length;
    if (fileSize > 4 * 1024 * 1024) {
      return res.status(413).json({
        error: "Ukuran berkas melebihi batas 4MB. Untuk file PDF/dokumen di atas 4MB, silakan kompres terlebih dahulu atau gunakan tautan Google Drive."
      });
    }
    const id = `med-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
    const mediaItem = {
      id,
      category,
      refId: refId || void 0,
      subKey: subKey || void 0,
      filename,
      contentType: resolvedContentType,
      fileSize,
      fileData
    };
    if (refId && subKey) {
      try {
        const existingList = await Database.getMedia(id);
      } catch {
      }
    }
    await Database.saveMedia(mediaItem);
    const sizeInKb = (fileSize / 1024).toFixed(1);
    const sizeFormatted = fileSize > 1024 * 1024 ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` : `${sizeInKb} KB`;
    return res.status(201).json({
      id,
      url: `/api/media/view/${id}`,
      filename,
      contentType: resolvedContentType,
      fileSize,
      sizeFormatted
    });
  } catch (err) {
    console.error("[Media Upload Error]", err);
    return res.status(500).json({ error: err?.message || "Gagal mengunggah berkas ke TiDB Cloud" });
  }
});
mediaRouter.get("/media/view/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send("ID media diperlukan");
    }
    const media = await Database.getMedia(id);
    if (!media || !media.fileData) {
      return res.status(404).send("Berkas tidak ditemukan");
    }
    const { buffer } = decodeBase64File(media.fileData);
    res.setHeader("Content-Type", media.contentType || "application/octet-stream");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(media.filename)}"`);
    return res.end(buffer);
  } catch (err) {
    console.error("[Media View Error]", err);
    return res.status(500).send("Gagal memuat berkas dari database");
  }
});
mediaRouter.delete("/media/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID media diperlukan" });
    }
    await Database.deleteMedia(id);
    return res.json({ success: true, message: "Berkas berhasil dihapus dari TiDB Cloud" });
  } catch (err) {
    console.error("[Media Delete Error]", err);
    return res.status(500).json({ error: err?.message || "Gagal menghapus berkas dari TiDB Cloud" });
  }
});
mediaRouter.delete("/media/ref/:refId", async (req, res) => {
  try {
    const { refId } = req.params;
    if (!refId) {
      return res.status(400).json({ error: "Reference ID diperlukan" });
    }
    await Database.deleteMediaByRef(refId);
    return res.json({ success: true, message: `Seluruh berkas terkait ${refId} berhasil dihapus dari TiDB Cloud` });
  } catch (err) {
    console.error("[Media Delete By Ref Error]", err);
    return res.status(500).json({ error: err?.message || "Gagal menghapus berkas dari TiDB Cloud" });
  }
});
mediaRouter.get("/media/status", async (req, res) => {
  try {
    res.json({
      status: "ready",
      storageEngine: "TiDB_CLOUD_DATABASE_MEDIA_STORAGE",
      table: "app_media_storage",
      description: "Penyimpanan terpusat logo tim, berkas formulir PDF, gambar wallpaper CMS di TiDB Cloud"
    });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// server/routes.ts
var apiRouter = Router4();
apiRouter.use(mediaRouter);
apiRouter.use(r2Router);
apiRouter.use(blobRouter);
function extractMediaIds(data) {
  const ids = /* @__PURE__ */ new Set();
  if (!data) return [];
  const checkStr = (str) => {
    if (!str || typeof str !== "string") return;
    const viewMatches = str.match(/\/api\/media\/view\/([a-zA-Z0-9_-]+)/g);
    if (viewMatches) {
      for (const m of viewMatches) {
        const id = m.replace("/api/media/view/", "").split(/[?#]/)[0];
        if (id) ids.add(id);
      }
    }
    const directMatches = str.match(/\bmed-\d+-[a-zA-Z0-9_-]+\b/g);
    if (directMatches) {
      for (const m of directMatches) {
        ids.add(m);
      }
    }
  };
  const walk = (item) => {
    if (!item) return;
    if (typeof item === "string") {
      checkStr(item);
    } else if (Array.isArray(item)) {
      for (const x of item) walk(x);
    } else if (typeof item === "object") {
      for (const v of Object.values(item)) walk(v);
    }
  };
  walk(data);
  return Array.from(ids);
}
async function linkRegistrationMedia(regId, teamLogo, documents) {
  try {
    if (!regId) return;
    if (teamLogo) {
      const logoIds = extractMediaIds(teamLogo);
      for (const id of logoIds) {
        await Database.updateMediaRef(id, regId, "teamLogo");
      }
    }
    if (documents) {
      const docsObj = typeof documents === "string" ? (() => {
        try {
          return JSON.parse(documents);
        } catch {
          return {};
        }
      })() : documents;
      if (docsObj && typeof docsObj === "object") {
        for (const [key, val] of Object.entries(docsObj)) {
          const docIds = extractMediaIds(val);
          for (const id of docIds) {
            await Database.updateMediaRef(id, regId, key);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[linkRegistrationMedia warning]", err);
  }
}
async function linkSponsorMedia(sponsorId, logoUrl) {
  try {
    if (logoUrl && logoUrl.includes("/api/media/view/")) {
      const match = logoUrl.match(/\/api\/media\/view\/([^/?#]+)/);
      if (match && match[1]) {
        await Database.updateMediaRef(match[1], sponsorId, "sponsorLogo");
      }
    }
  } catch (err) {
    console.warn("[linkSponsorMedia warning]", err);
  }
}
apiRouter.get("/health", async (req, res) => {
  await ensureDbConnected();
  const status = getMySqlStatus();
  res.json({
    status: "online",
    system: "WabupCup 2026 Full-Stack Engine",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    database: status
  });
});
apiRouter.post("/database/init", async (req, res) => {
  try {
    const result = await runFullSchemaInit();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "Database init failed" });
  }
});
apiRouter.post("/database/reconnect", async (req, res) => {
  try {
    const connected = await initDatabaseConnection();
    const status = getMySqlStatus();
    res.json({
      success: connected,
      status,
      error: !connected ? status.error || "Tidak dapat terhubung ke MySQL server. Periksa konfigurasi .env" : void 0
    });
  } catch (err) {
    const status = getMySqlStatus();
    res.json({
      success: false,
      error: err?.message || "Gagal memeriksa koneksi database",
      status
    });
  }
});
apiRouter.post("/database/connect", async (req, res) => {
  try {
    const config = req.body || {};
    const connected = await initDatabaseConnection(config);
    const status = getMySqlStatus();
    if (connected) {
      res.json({
        success: true,
        message: "Koneksi database MySQL/TiDB Cloud berhasil terhubung dan tabel telah tersinkronisasi!",
        status
      });
    } else {
      res.json({
        success: false,
        error: status.error || "Gagal terhubung ke MySQL dengan konfigurasi yang diberikan. Periksa kredensial/koneksi.",
        status
      });
    }
  } catch (err) {
    res.json({
      success: false,
      error: err?.message || "Terjadi kesalahan saat menghubungkan database",
      status: getMySqlStatus()
    });
  }
});
apiRouter.get("/database/export-sql", async (req, res) => {
  try {
    const sqlDump = await Database.exportFullSqlDump();
    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", 'attachment; filename="wabupcup_2026_backup.sql"');
    res.send(sqlDump);
  } catch (err) {
    res.status(500).send(`-- Error generating SQL dump: ${err?.message}`);
  }
});
apiRouter.get("/config", async (req, res) => {
  const config = await Database.getConfig();
  res.json(config);
});
apiRouter.put("/config", async (req, res) => {
  try {
    const updated = await Database.updateConfig(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.get("/categories", async (req, res) => {
  const categories = await Database.getCategories();
  res.json(categories);
});
apiRouter.post("/categories", async (req, res) => {
  try {
    const saved = await Database.saveCategory(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.post("/categories/reorder", async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : req.body.categories;
    const saved = await Database.reorderCategories(list || []);
    res.json({ success: true, categories: saved });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.put("/categories/:id", async (req, res) => {
  try {
    const saved = await Database.saveCategory(req.body);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.delete("/categories/:id", async (req, res) => {
  try {
    await Database.deleteCategory(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.get("/registrations", async (req, res) => {
  const list = await Database.getRegistrations();
  res.json(list);
});
apiRouter.post("/registrations", async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.teamName || !data.category || !data.coachName || !data.coachPhone) {
      return res.status(400).json({
        error: "Data tidak lengkap. Field wajib: teamName, category, coachName, coachPhone."
      });
    }
    const now = /* @__PURE__ */ new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const existing = await Database.getRegistrations();
    const candidateCode = typeof data.regCode === "string" ? data.regCode.trim().toUpperCase() : "";
    const isCodeInUse = candidateCode !== "" && existing.some((r) => r.regCode && r.regCode.trim().toUpperCase() === candidateCode);
    const regCode = !candidateCode || isCodeInUse ? generateUniqueRegCode(data.category, existing) : candidateCode;
    const candidateId = typeof data.id === "string" ? data.id.trim() : "";
    const isIdInUse = candidateId !== "" && existing.some((r) => r.id === candidateId);
    const id = !candidateId || isIdInUse ? `reg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` : candidateId;
    const newReg = {
      ...data,
      id,
      regCode,
      registrationDate: data.registrationDate || formattedDate,
      status: data.status || "PENDING_PAYMENT",
      paymentStatus: data.paymentStatus || "UNPAID",
      lastUpdated: formattedDate
    };
    const saved = await Database.saveRegistration(newReg);
    await linkRegistrationMedia(newReg.id, newReg.teamLogo, newReg.documents);
    res.status(201).json(saved);
  } catch (err) {
    console.error("[API] Error in POST /api/registrations:", err);
    res.status(500).json({ error: err?.message || "Gagal menyimpan pendaftaran" });
  }
});
apiRouter.put("/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID pendaftaran diperlukan." });
    }
    const existingList = await Database.getRegistrations();
    const current = existingList.find((r) => r.id === id);
    if (!current) {
      return res.status(404).json({ error: "Data pendaftaran tidak ditemukan." });
    }
    const now = /* @__PURE__ */ new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const updatedItem = {
      ...current,
      ...req.body,
      id,
      // Preserve ID
      regCode: current.regCode,
      // Preserve original regCode
      lastUpdated: formattedDate
    };
    const oldMediaIds = /* @__PURE__ */ new Set([
      ...extractMediaIds(current.teamLogo),
      ...extractMediaIds(current.documents)
    ]);
    const newMediaIds = /* @__PURE__ */ new Set([
      ...extractMediaIds(updatedItem.teamLogo),
      ...extractMediaIds(updatedItem.documents)
    ]);
    for (const oldId of oldMediaIds) {
      if (!newMediaIds.has(oldId)) {
        await Database.deleteMedia(oldId);
        console.log(`[Storage Cleanup] Replaced/removed old media file ${oldId} deleted from TiDB Cloud for registration ${id}`);
      }
    }
    const saved = await Database.saveRegistration(updatedItem);
    await linkRegistrationMedia(id, updatedItem.teamLogo, updatedItem.documents);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Gagal memperbarui pendaftaran" });
  }
});
apiRouter.patch("/registrations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, notes } = req.body;
    const list = await Database.getRegistrations();
    const item = list.find((r) => r.id === id);
    if (!item) {
      return res.status(404).json({ error: "Registration not found" });
    }
    const updated = {
      ...item,
      status,
      rejectionReason: reason !== void 0 ? reason : item.rejectionReason,
      adminNotes: notes !== void 0 ? notes : item.adminNotes,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16)
    };
    await Database.saveRegistration(updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.patch("/registrations/:id/payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const list = await Database.getRegistrations();
    const item = list.find((r) => r.id === id);
    if (!item) {
      return res.status(404).json({ error: "Registration not found" });
    }
    const newStatus = paymentStatus === "PAID" && item.status === "PENDING_PAYMENT" ? "APPROVED" : item.status;
    const updated = {
      ...item,
      paymentStatus,
      status: newStatus,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16)
    };
    await Database.saveRegistration(updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.delete("/registrations/:id", async (req, res) => {
  try {
    await Database.deleteRegistration(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.get("/matches", async (req, res) => {
  const matches = await Database.getMatches();
  res.json(matches);
});
apiRouter.post("/matches", async (req, res) => {
  try {
    const id = req.body.id || `match-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    const saved = await Database.saveMatch({ ...req.body, id });
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.post("/matches/replace-category", async (req, res) => {
  try {
    const { category, matches } = req.body;
    if (!category || !Array.isArray(matches)) {
      return res.status(400).json({ error: "category and matches array are required" });
    }
    const saved = await Database.replaceCategoryMatches(category, matches);
    res.json({ success: true, count: saved.length, matches: saved });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.post("/matches/batch", async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : req.body.matches;
    const saved = await Database.saveMatchesBatch(list || []);
    res.json({ success: true, count: saved.length, matches: saved });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.put("/matches/:id", async (req, res) => {
  try {
    const saved = await Database.saveMatch(req.body);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.delete("/matches/:id", async (req, res) => {
  try {
    await Database.deleteMatch(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.get("/sponsors", async (req, res) => {
  const list = await Database.getSponsors();
  res.json(list);
});
apiRouter.post("/sponsors", async (req, res) => {
  try {
    const id = req.body.id || `sp-${Date.now()}`;
    const saved = await Database.saveSponsor({ ...req.body, id });
    await linkSponsorMedia(id, saved.logoUrl);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.put("/sponsors/:id", async (req, res) => {
  try {
    const saved = await Database.saveSponsor(req.body);
    await linkSponsorMedia(req.params.id, saved.logoUrl);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.delete("/sponsors/:id", async (req, res) => {
  try {
    await Database.deleteSponsor(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.get("/admins", async (req, res) => {
  try {
    const admins = await Database.getAdmins();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});
apiRouter.post("/admins", async (req, res) => {
  try {
    const { username, fullName, role, email, phone, avatarColor, password } = req.body;
    if (!username || !fullName) {
      return res.status(400).json({ error: "Username dan Nama Lengkap wajib diisi" });
    }
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_.]/g, "");
    const newAdmin = {
      id: `adm-${Date.now()}`,
      username: cleanUsername,
      fullName: fullName.trim(),
      role: role || "PANITIA_INTI",
      email: email ? email.trim() : "",
      phone: phone ? phone.trim() : "",
      avatarColor: avatarColor || "bg-red-600",
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      password: password || "admin123"
    };
    const saved = await Database.saveAdmin(newAdmin, password);
    const dbStatus = getMySqlStatus();
    res.status(201).json({
      success: true,
      ...saved,
      savedToDatabase: dbStatus.connected,
      databaseMode: dbStatus.mode,
      databaseHost: dbStatus.host
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Gagal menambahkan admin" });
  }
});
apiRouter.put("/admins/:id", async (req, res) => {
  try {
    const { username, fullName, role, email, phone, avatarColor, password } = req.body;
    const existingList = await Database.getAdmins();
    const target = existingList.find((a) => a.id === req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Admin dengan ID tersebut tidak ditemukan" });
    }
    const updatedAdmin = {
      ...target,
      username: username ? username.toLowerCase().trim() : target.username,
      fullName: fullName !== void 0 ? fullName.trim() : target.fullName,
      role: role || target.role,
      email: email !== void 0 ? email.trim() : target.email,
      phone: phone !== void 0 ? phone.trim() : target.phone,
      avatarColor: avatarColor || target.avatarColor,
      password: password || target.password
    };
    const saved = await Database.saveAdmin(updatedAdmin, password);
    const dbStatus = getMySqlStatus();
    res.json({
      success: true,
      ...saved,
      savedToDatabase: dbStatus.connected,
      databaseMode: dbStatus.mode,
      databaseHost: dbStatus.host
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Gagal memperbarui admin" });
  }
});
apiRouter.delete("/admins/:id", async (req, res) => {
  try {
    const success = await Database.deleteAdmin(req.params.id);
    if (!success) {
      return res.status(400).json({ error: "Akun Superadmin utama tidak dapat dihapus demi keamanan sistem." });
    }
    const dbStatus = getMySqlStatus();
    res.json({ success: true, id: req.params.id, savedToDatabase: dbStatus.connected });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Gagal menghapus admin" });
  }
});
apiRouter.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }
    const result = await Database.verifyAdminLogin(username, password);
    if (result.success && result.user) {
      return res.json({ success: true, user: result.user });
    }
    res.status(401).json({ success: false, message: result.error || "Username atau password salah" });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Gagal memproses login" });
  }
});

// server/serverless.ts
var app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));
app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large" || err?.status === 413) {
    return res.status(413).json({
      success: false,
      code: "PAYLOAD_TOO_LARGE",
      message: "Ukuran payload data melebihi batas 4MB Vercel. Gunakan unggah berkas langsung ke cloud storage."
    });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      code: "INVALID_JSON",
      message: "Format payload JSON tidak valid."
    });
  }
  next(err);
});
app.use((req, res, next) => {
  ensureDbConnected().catch((err) => {
    console.warn("[Vercel Serverless Auto-DB]", err?.message || err);
  });
  next();
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API Route Not Found: ${req.method} ${req.originalUrl || req.url}`
  });
});
app.use((err, req, res, next) => {
  console.error("[API Serverless Error]", err);
  res.status(500).json({
    success: false,
    error: err?.message || "Internal Server Error"
  });
});
if (typeof process !== "undefined") {
  process.on("unhandledRejection", (reason) => {
    console.warn("[Vercel Serverless Non-Fatal Rejection]", reason?.message || reason);
  });
  process.on("uncaughtException", (err) => {
    console.warn("[Vercel Serverless Non-Fatal Exception]", err?.message || err);
  });
}
var serverless_default = app;
export {
  serverless_default as default
};
