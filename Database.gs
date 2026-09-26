/**
 * ============================================================================
 * WABUP CUP 2026 - TOURNAMENT MANAGEMENT SYSTEM
 * GOOGLE APPS SCRIPT (GAS) DATABASE LAYER: Database.gs
 * ============================================================================
 * Mengelola seluruh tab spreadsheet (Registrations, Matches, Categories, Sponsors, Config)
 * Lengkap dengan auto-initialization, migrasi struktur, CRUD, dan sanitasi data.
 */

const SHEET_NAMES = {
  REGISTRATIONS: 'Registrations',
  MATCHES: 'Matches',
  CATEGORIES: 'Categories',
  SPONSORS: 'Sponsors',
  CONFIG: 'Config',
  BANK_ACCOUNTS: 'BankAccounts',
  COMMITTEE: 'CommitteeContacts',
  DOCUMENTS: 'DownloadableDocs'
};

/**
 * Mengambil Spreadsheet aktif atau inisialisasi jika belum ada
 */
function getDbSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Mendapatkan sheet berdasarkan nama, otomatis membuat sheet + headers jika belum ada
 */
function getOrCreateSheet(sheetName, defaultHeaders) {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (defaultHeaders && defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
      var headerRange = sheet.getRange(1, 1, 1, defaultHeaders.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#b91c1c"); // Red Wabup color
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Inisialisasi Database Lengkap (Dapat dijalankan sekali saat setup)
 */
function initializeTournamentDatabase() {
  getOrCreateSheet(SHEET_NAMES.REGISTRATIONS, [
    "ID", "TeamName", "Category", "OfficialName", "OfficialPhone", "OfficialEmail",
    "CoachName", "CoachPhone", "PlayersCount", "PaymentStatus", "PaymentMethod", "Amount",
    "ProofUrl", "OfficialLetterUrl", "TeamLogoUrl", "RegistrationStatus", "PlayersListJson", "Notes", "CreatedAt"
  ]);

  getOrCreateSheet(SHEET_NAMES.MATCHES, [
    "ID", "MatchNumber", "Category", "Round", "HomeTeam", "AwayTeam",
    "HomeScore", "AwayScore", "HomePenalties", "AwayPenalties", "Status",
    "ScheduledTime", "Minute", "Pitch", "LiveStreamUrl", "EventsJson"
  ]);

  getOrCreateSheet(SHEET_NAMES.CATEGORIES, [
    "ID", "Name", "AgeRestriction", "MaxTeams", "RegistrationFee", "TotalPrize", "PrizesJson", "RulesJson", "Description"
  ]);

  getOrCreateSheet(SHEET_NAMES.SPONSORS, [
    "ID", "Name", "Tier", "LogoUrl", "LogoText", "WebsiteUrl", "Description", "OrderIndex"
  ]);

  getOrCreateSheet(SHEET_NAMES.CONFIG, [
    "Key", "Value"
  ]);

  getOrCreateSheet(SHEET_NAMES.BANK_ACCOUNTS, [
    "ID", "BankName", "AccountNumber", "AccountHolder", "IsPrimary", "QrCodeUrl"
  ]);

  getOrCreateSheet(SHEET_NAMES.COMMITTEE, [
    "ID", "Name", "Role", "Phone", "IsPrimary"
  ]);

  getOrCreateSheet(SHEET_NAMES.DOCUMENTS, [
    "ID", "Title", "Category", "FileUrl", "FileSize", "Description"
  ]);

  // Seed default config jika kosong
  seedDefaultConfigIfNeeded();
}

/**
 * Seed Default Data Configuration
 */
function seedDefaultConfigIfNeeded() {
  var sheet = getOrCreateSheet(SHEET_NAMES.CONFIG, ["Key", "Value"]);
  if (sheet.getLastRow() <= 1) {
    var defaultConfigs = [
      ["tournamentName", "TURNAMEN SEPAKBOLA & FUTSAL WABUP CUP 2026"],
      ["tagline", "Pesta Olahraga Terbesar & Bergengsi - Junjung Tinggi Sportivitas & Fair Play"],
      ["eventDates", "10 - 24 OKTOBER 2026"],
      ["venueName", "STADION UTAMA & GOR GELORA SPORT CENTER"],
      ["venueAddress", "Jl. Pemuda No. 45, Kompleks Gelanggang Olahraga"],
      ["adminContactPhone", "081234567890"],
      ["adminContactEmail", "panitia@wabupcup2026.com"],
      ["totalPrizePool", "125000000"],
      ["sectionsVisibility", JSON.stringify({
        hero: true,
        liveScore: true,
        categories: true,
        bracket: true,
        venue: true,
        sponsors: true
      })],
      ["tournamentLogoUrl", ""],
      ["panitiaLogoUrl", ""]
    ];

    defaultConfigs.forEach(function(row) {
      sheet.appendRow(row);
    });
  }
}

// ==========================================
// 1. REGISTRASI TEAMS CRUD
// ==========================================
function getRegistrationsFromDb() {
  var sheet = getOrCreateSheet(SHEET_NAMES.REGISTRATIONS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = data.slice(1);
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    var players = [];
    try { players = JSON.parse(r[16] || '[]'); } catch(e) { players = []; }

    result.push({
      id: String(r[0]),
      teamName: String(r[1]),
      category: String(r[2]),
      officialName: String(r[3]),
      officialPhone: String(r[4]),
      officialEmail: String(r[5]),
      coachName: String(r[6]),
      coachPhone: String(r[7]),
      playersCount: Number(r[8]) || 0,
      paymentStatus: String(r[9]),
      paymentMethod: String(r[10]),
      amount: Number(r[11]) || 0,
      proofUrl: String(r[12]),
      officialLetterUrl: String(r[13]),
      teamLogoUrl: String(r[14]),
      registrationStatus: String(r[15]),
      playersList: players,
      notes: String(r[17] || ''),
      createdAt: String(r[18] || '')
    });
  }
  return result;
}

function insertRegistrationToDb(reg) {
  var sheet = getOrCreateSheet(SHEET_NAMES.REGISTRATIONS);
  sheet.appendRow([
    reg.id,
    reg.teamName,
    reg.category,
    reg.officialName,
    reg.officialPhone,
    reg.officialEmail,
    reg.coachName,
    reg.coachPhone,
    reg.playersCount,
    reg.paymentStatus,
    reg.paymentMethod,
    reg.amount,
    reg.proofUrl,
    reg.officialLetterUrl,
    reg.teamLogoUrl,
    reg.registrationStatus,
    reg.playersList,
    reg.notes,
    reg.createdAt
  ]);
}

function updateRegistrationInDb(payload) {
  var sheet = getOrCreateSheet(SHEET_NAMES.REGISTRATIONS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      var rowNum = i + 1;
      if (payload.registrationStatus) sheet.getRange(rowNum, 16).setValue(payload.registrationStatus);
      if (payload.paymentStatus) sheet.getRange(rowNum, 10).setValue(payload.paymentStatus);
      if (payload.notes !== undefined) sheet.getRange(rowNum, 18).setValue(payload.notes);
      return { success: true, message: 'Status tim berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Tim tidak ditemukan.' };
}

function deleteRegistrationInDb(id) {
  var sheet = getOrCreateSheet(SHEET_NAMES.REGISTRATIONS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Data pendaftaran dihapus.' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan.' };
}

function findRegistrationByPhoneOrName(query) {
  if (!query) return [];
  var all = getRegistrationsFromDb();
  var q = String(query).toLowerCase().trim();
  return all.filter(function(r) {
    return r.id.toLowerCase().includes(q) ||
           r.teamName.toLowerCase().includes(q) ||
           r.officialPhone.includes(q) ||
           r.officialName.toLowerCase().includes(q);
  });
}

// ==========================================
// 2. MATCHES & LIVE SCORE CRUD
// ==========================================
function getMatchesFromDb() {
  var sheet = getOrCreateSheet(SHEET_NAMES.MATCHES);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var rows = data.slice(1);
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    var events = [];
    try { events = JSON.parse(r[15] || '[]'); } catch(e) { events = []; }

    result.push({
      id: String(r[0]),
      matchNumber: Number(r[1]) || (i + 1),
      category: String(r[2]),
      round: String(r[3]),
      homeTeam: String(r[4]),
      awayTeam: String(r[5]),
      homeScore: Number(r[6]) || 0,
      awayScore: Number(r[7]) || 0,
      homePenalties: r[8] !== "" ? Number(r[8]) : null,
      awayPenalties: r[9] !== "" ? Number(r[9]) : null,
      status: String(r[10]),
      scheduledTime: String(r[11]),
      minute: String(r[12] || ''),
      pitch: String(r[13] || 'Lapangan A (Utama)'),
      liveStreamUrl: String(r[14] || ''),
      events: events
    });
  }
  return result;
}

function saveOrUpdateMatchInDb(m) {
  var sheet = getOrCreateSheet(SHEET_NAMES.MATCHES);
  var data = sheet.getDataRange().getValues();
  var matchId = m.id || ("M-" + Date.now());
  var eventsJson = JSON.stringify(m.events || []);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(matchId)) {
      var row = i + 1;
      sheet.getRange(row, 2, 1, 15).setValues([[
        m.matchNumber || (i),
        m.category,
        m.round,
        m.homeTeam,
        m.awayTeam,
        m.homeScore || 0,
        m.awayScore || 0,
        m.homePenalties !== null && m.homePenalties !== undefined ? m.homePenalties : "",
        m.awayPenalties !== null && m.awayPenalties !== undefined ? m.awayPenalties : "",
        m.status || 'UPCOMING',
        m.scheduledTime,
        m.minute || '',
        m.pitch || 'Lapangan A',
        m.liveStreamUrl || '',
        eventsJson
      ]]);
      return { success: true, matchId: matchId, message: 'Pertandingan berhasil diperbarui' };
    }
  }

  // Insert baru
  sheet.appendRow([
    matchId,
    m.matchNumber || sheet.getLastRow(),
    m.category,
    m.round,
    m.homeTeam,
    m.awayTeam,
    m.homeScore || 0,
    m.awayScore || 0,
    m.homePenalties !== null && m.homePenalties !== undefined ? m.homePenalties : "",
    m.awayPenalties !== null && m.awayPenalties !== undefined ? m.awayPenalties : "",
    m.status || 'UPCOMING',
    m.scheduledTime,
    m.minute || '',
    m.pitch || 'Lapangan A',
    m.liveStreamUrl || '',
    eventsJson
  ]);

  return { success: true, matchId: matchId, message: 'Pertandingan baru berhasil ditambahkan' };
}

function deleteMatchInDb(id) {
  var sheet = getOrCreateSheet(SHEET_NAMES.MATCHES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Pertandingan dihapus' };
    }
  }
  return { success: false, message: 'Pertandingan tidak ditemukan' };
}

// ==========================================
// 3. CATEGORIES & PRIZES CRUD
// ==========================================
function getCategoriesFromDb() {
  var sheet = getOrCreateSheet(SHEET_NAMES.CATEGORIES);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var rows = data.slice(1);
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    var prizes = [];
    var rules = [];
    try { prizes = JSON.parse(r[6] || '[]'); } catch(e) { prizes = []; }
    try { rules = JSON.parse(r[7] || '[]'); } catch(e) { rules = []; }

    result.push({
      id: String(r[0]),
      name: String(r[1]),
      ageRestriction: String(r[2]),
      maxTeams: Number(r[3]) || 16,
      registrationFee: Number(r[4]) || 0,
      totalPrize: Number(r[5]) || 0,
      prizes: prizes,
      rules: rules,
      description: String(r[8] || '')
    });
  }
  return result;
}

function saveCategoryInDb(cat) {
  var sheet = getOrCreateSheet(SHEET_NAMES.CATEGORIES);
  var data = sheet.getDataRange().getValues();
  var prizesJson = JSON.stringify(cat.prizes || []);
  var rulesJson = JSON.stringify(cat.rules || []);

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(cat.id)) {
      var row = i + 1;
      sheet.getRange(row, 2, 1, 8).setValues([[
        cat.name,
        cat.ageRestriction,
        cat.maxTeams,
        cat.registrationFee,
        cat.totalPrize,
        prizesJson,
        rulesJson,
        cat.description || ''
      ]]);
      return { success: true, message: 'Kategori berhasil diperbarui' };
    }
  }

  // Insert baru
  sheet.appendRow([
    cat.id,
    cat.name,
    cat.ageRestriction,
    cat.maxTeams,
    cat.registrationFee,
    cat.totalPrize,
    prizesJson,
    rulesJson,
    cat.description || ''
  ]);

  return { success: true, message: 'Kategori baru berhasil ditambahkan' };
}

function deleteCategoryInDb(id) {
  var sheet = getOrCreateSheet(SHEET_NAMES.CATEGORIES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Kategori dihapus' };
    }
  }
  return { success: false, message: 'Kategori tidak ditemukan' };
}

// ==========================================
// 4. SPONSORS CRUD
// ==========================================
function getSponsorsFromDb() {
  var sheet = getOrCreateSheet(SHEET_NAMES.SPONSORS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var rows = data.slice(1);
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    result.push({
      id: String(r[0]),
      name: String(r[1]),
      tier: String(r[2]),
      logoUrl: String(r[3] || ''),
      logoText: String(r[4] || ''),
      websiteUrl: String(r[5] || ''),
      description: String(r[6] || ''),
      orderIndex: Number(r[7]) || 0
    });
  }
  return result;
}

function saveSponsorInDb(s) {
  var sheet = getOrCreateSheet(SHEET_NAMES.SPONSORS);
  var data = sheet.getDataRange().getValues();
  var sponsorId = s.id || ("SPON-" + Date.now());

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(sponsorId)) {
      var row = i + 1;
      sheet.getRange(row, 2, 1, 7).setValues([[
        s.name,
        s.tier,
        s.logoUrl || '',
        s.logoText || '',
        s.websiteUrl || '',
        s.description || '',
        s.orderIndex || 0
      ]]);
      return { success: true, message: 'Sponsor diperbarui' };
    }
  }

  sheet.appendRow([
    sponsorId,
    s.name,
    s.tier,
    s.logoUrl || '',
    s.logoText || '',
    s.websiteUrl || '',
    s.description || '',
    s.orderIndex || sheet.getLastRow()
  ]);

  return { success: true, message: 'Sponsor baru ditambahkan' };
}

function deleteSponsorInDb(id) {
  var sheet = getOrCreateSheet(SHEET_NAMES.SPONSORS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Sponsor dihapus' };
    }
  }
  return { success: false, message: 'Sponsor tidak ditemukan' };
}

// ==========================================
// 5. CONFIG, BANK, COMMITTEE, DOCS
// ==========================================
function getConfigFromDb() {
  var sheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
  var data = sheet.getDataRange().getValues();
  var conf = {};

  for (var i = 1; i < data.length; i++) {
    var k = data[i][0];
    var v = data[i][1];
    if (k === 'sectionsVisibility') {
      try { conf[k] = JSON.parse(v); } catch(e) { conf[k] = {}; }
    } else {
      conf[k] = v;
    }
  }
  return conf;
}

function saveConfigInDb(newConf) {
  var sheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
  var data = sheet.getDataRange().getValues();
  var existingKeys = {};

  for (var i = 1; i < data.length; i++) {
    existingKeys[data[i][0]] = i + 1; // row number
  }

  for (var key in newConf) {
    var val = newConf[key];
    if (typeof val === 'object') {
      val = JSON.stringify(val);
    }

    if (existingKeys[key]) {
      sheet.getRange(existingKeys[key], 2).setValue(val);
    } else {
      sheet.appendRow([key, val]);
    }
  }

  return { success: true, message: 'Pengaturan turnamen berhasil disimpan' };
}

function getBankAccountsFromDb() {
  var sheet = getOrCreateSheet(SHEET_NAMES.BANK_ACCOUNTS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(function(r) {
    return {
      id: String(r[0]),
      bankName: String(r[1]),
      accountNumber: String(r[2]),
      accountHolder: String(r[3]),
      isPrimary: Boolean(r[4]),
      qrCodeUrl: String(r[5] || '')
    };
  });
}

function getCommitteeContactsFromDb() {
  var sheet = getOrCreateSheet(SHEET_NAMES.COMMITTEE);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(function(r) {
    return {
      id: String(r[0]),
      name: String(r[1]),
      role: String(r[2]),
      phone: String(r[3]),
      isPrimary: Boolean(r[4])
    };
  });
}

function getDownloadableDocsFromDb() {
  var sheet = getOrCreateSheet(SHEET_NAMES.DOCUMENTS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(function(r) {
    return {
      id: String(r[0]),
      title: String(r[1]),
      category: String(r[2]),
      fileUrl: String(r[3]),
      fileSize: String(r[4] || '1.2 MB'),
      description: String(r[5] || '')
    };
  });
}
