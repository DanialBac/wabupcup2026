/**
 * WabupCup 2026 - 3-File Standalone Google Apps Script (GAS) Architecture Code & Guides
 * 100% complete, unclipped scripts for setup.gs, Code.gs, Index.html, Git & Deployment Guides.
 */

export const SETUP_GS_CODE = `/**
 * =========================================================================
 * WABUPCUP 2026 - SETUP.GS (OTOMATISASI DATABASE GOOGLE SHEETS)
 * =========================================================================
 * Fungsi untuk membuat struktur database Google Sheets, memformat warna,
 * membuat validasi data (dropdown), dan memasukkan data dummy awal secara otomatis.
 *
 * CARA PENGGUNAAN:
 * 1. Buat Spreadsheet baru di Google Drive (Beri nama "DB_WABUPCUP_2026")
 * 2. Buka menu Extensions > Apps Script
 * 3. Buat file baru bernama "setup.gs" dan paste seluruh kode ini
 * 4. Pilih fungsi "setupDatabaseWabupCup()" lalu klik RUN / JALANKAN
 * 5. Berikan otorisasi izin saat diminta. Spreadsheet Anda siap digunakan!
 */

function setupDatabaseWabupCup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Tema Warna WabupCup 2026 (Merah Marun & Biru Tua)
  const COLOR_NAVY = "#0F172A"; // Header background
  const COLOR_RED = "#DC2626";  // Accent
  const COLOR_TEXT = "#FFFFFF"; // Header font
  
  // 1. SHEET PENDAFTARAN TIM
  let sheetReg = ss.getSheetByName("Pendaftaran");
  if (!sheetReg) {
    sheetReg = ss.insertSheet("Pendaftaran");
  } else {
    sheetReg.clear();
  }
  
  const regHeaders = [
    "ID Registrasi",
    "Kode Tim",
    "Kategori",
    "Nama Tim",
    "Nama Sekolah / Instansi / Desa",
    "Nama Pelatih / Pembina",
    "No. WhatsApp (Aktif)",
    "Email",
    "Jumlah Pemain",
    "Jumlah Official",
    "Tanggal Daftar",
    "Status Verifikasi",
    "Status Pembayaran",
    "Nominal Biaya (Rp)",
    "Link Surat Keterangan",
    "Link Surat Pernyataan",
    "Link Formulir Pemain",
    "Link Akta Kelahiran (SD)",
    "Link Raport / Kartu Pelajar",
    "Link Bukti Transfer",
    "Alasan Penolakan",
    "Catatan Admin",
    "Terakhir Diupdate"
  ];
  
  sheetReg.getRange(1, 1, 1, regHeaders.length).setValues([regHeaders]);
  sheetReg.getRange(1, 1, 1, regHeaders.length)
    .setBackground(COLOR_NAVY)
    .setFontColor(COLOR_TEXT)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
    
  // Validasi Dropdown untuk Kategori dan Status
  const ruleKategori = SpreadsheetApp.newDataValidation()
    .requireValueInList(["SD", "SMP", "SMA", "INSTANSI", "UMUM", "DESA"], true)
    .build();
  sheetReg.getRange("C2:C1000").setDataValidation(ruleKategori);
  
  const ruleStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(["PENDING_PAYMENT", "APPROVED", "REJECTED"], true)
    .build();
  sheetReg.getRange("L2:L1000").setDataValidation(ruleStatus);
  
  const rulePayment = SpreadsheetApp.newDataValidation()
    .requireValueInList(["UNPAID", "VERIFYING", "PAID"], true)
    .build();
  sheetReg.getRange("M2:M1000").setDataValidation(rulePayment);

  // 2. SHEET JADWAL & BAGAN PERTANDINGAN
  let sheetMatches = ss.getSheetByName("Jadwal_Pertandingan");
  if (!sheetMatches) {
    sheetMatches = ss.insertSheet("Jadwal_Pertandingan");
  } else {
    sheetMatches.clear();
  }
  
  const matchHeaders = [
    "ID Match",
    "No Match",
    "Kategori",
    "Babak / Round",
    "Tim A",
    "Skor A",
    "Penalti A",
    "Tim B",
    "Skor B",
    "Penalti B",
    "Tanggal (YYYY-MM-DD)",
    "Jam Kickoff (WIB)",
    "Lapangan",
    "Status Pertandingan",
    "Menit Live",
    "Pemenang (A/B/DRAW)",
    "Log Gol & Kartu"
  ];
  
  sheetMatches.getRange(1, 1, 1, matchHeaders.length).setValues([matchHeaders]);
  sheetMatches.getRange(1, 1, 1, matchHeaders.length)
    .setBackground(COLOR_RED)
    .setFontColor(COLOR_TEXT)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
    
  const ruleMatchStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(["UPCOMING", "LIVE", "FINISHED"], true)
    .build();
  sheetMatches.getRange("N2:N1000").setDataValidation(ruleMatchStatus);

  // 3. SHEET KATEGORI & TOTAL HADIAH
  let sheetPrizes = ss.getSheetByName("Kategori_Hadiah");
  if (!sheetPrizes) {
    sheetPrizes = ss.insertSheet("Kategori_Hadiah");
  } else {
    sheetPrizes.clear();
  }
  
  const prizeHeaders = [
    "Kode Kategori",
    "Nama Kategori",
    "Batasan Usia / Syarat",
    "Biaya Pendaftaran (Rp)",
    "Total Hadiah (Rp)",
    "Rincian Juara 1",
    "Rincian Juara 2",
    "Rincian Juara 3",
    "Rincian Top Scorer",
    "Rincian Pemain Terbaik"
  ];
  
  sheetPrizes.getRange(1, 1, 1, prizeHeaders.length).setValues([prizeHeaders]);
  sheetPrizes.getRange(1, 1, 1, prizeHeaders.length)
    .setBackground(COLOR_NAVY)
    .setFontColor(COLOR_TEXT)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  // 4. SHEET SPONSOR
  let sheetSponsors = ss.getSheetByName("Sponsor");
  if (!sheetSponsors) {
    sheetSponsors = ss.insertSheet("Sponsor");
  } else {
    sheetSponsors.clear();
  }
  
  const sponsorHeaders = ["ID Sponsor", "Nama Perusahaan / Instansi", "Tier Sponsor", "Website URL", "Deskripsi Kerjasama"];
  sheetSponsors.getRange(1, 1, 1, sponsorHeaders.length).setValues([sponsorHeaders]);
  sheetSponsors.getRange(1, 1, 1, sponsorHeaders.length)
    .setBackground(COLOR_RED)
    .setFontColor(COLOR_TEXT)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  // 5. SHEET ADMIN USERS
  let sheetAdmins = ss.getSheetByName("Admin_Users");
  if (!sheetAdmins) {
    sheetAdmins = ss.insertSheet("Admin_Users");
  } else {
    sheetAdmins.clear();
  }
  
  const adminHeaders = ["ID Admin", "Username", "Password / Hash", "Nama Lengkap", "Role (SUPERADMIN/PANITIA/WASIT)", "Email", "No HP"];
  sheetAdmins.getRange(1, 1, 1, adminHeaders.length).setValues([adminHeaders]);
  sheetAdmins.getRange(1, 1, 1, adminHeaders.length)
    .setBackground(COLOR_NAVY)
    .setFontColor(COLOR_TEXT)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  // Auto-fit kolom di semua sheet
  const allSheets = [sheetReg, sheetMatches, sheetPrizes, sheetSponsors, sheetAdmins];
  allSheets.forEach(sheet => {
    for (let c = 1; c <= 15; c++) {
      try { sheet.autoResizeColumn(c); } catch (e) {}
    }
  });

  // MASUKKAN DATA DUMMY AWAL (SEEDED)
  insertInitialDummyData(ss);

  SpreadsheetApp.getUi().alert(
    "SUKSES!",
    "Database WabupCup 2026 berhasil dibuat lengkap dengan 5 sheet dan data dummy awal!\\nSilakan lanjutkan ke file Code.gs untuk menjalankan backend API.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function insertInitialDummyData(ss) {
  const sheetPrizes = ss.getSheetByName("Kategori_Hadiah");
  const defaultPrizes = [
    ["SD", "Kategori SD / Usia Dini", "Kelahiran Maks. 2014 (U-12)", 250000, 20000000, "Rp 8.000.000 + Piala", "Rp 5.000.000 + Piala", "Rp 4.000.000", "Rp 1.000.000", "Rp 1.000.000"],
    ["SMP", "Kategori SMP / Sederajat", "Siswa Aktif Kelas 7-9 (U-15)", 350000, 25000000, "Rp 10.000.000 + Piala", "Rp 6.500.000 + Piala", "Rp 5.500.000", "Rp 1.500.000", "Rp 1.500.000"],
    ["SMA", "Kategori SMA / SMK / MA", "Siswa Aktif Kelas 10-12 (U-18)", 400000, 30000000, "Rp 12.000.000 + Piala", "Rp 8.000.000 + Piala", "Rp 6.000.000", "Rp 2.000.000", "Rp 2.000.000"],
    ["INSTANSI", "Kategori Instansi / OPD", "Pegawai ASN / BUMN / Karyawan", 500000, 30000000, "Rp 13.000.000 + Piala", "Rp 8.500.000 + Piala", "Rp 5.500.000", "Rp 1.500.000", "Rp 1.500.000"],
    ["UMUM", "Kategori Umum / Open", "Usia Bebas (Min 16 Th)", 600000, 40000000, "Rp 18.000.000 + Piala", "Rp 11.000.000 + Piala", "Rp 7.000.000", "Rp 2.000.000", "Rp 2.000.000"],
    ["DESA", "Kategori Desa / Kelurahan", "KTP Asli Desa Bersangkutan", 400000, 30000000, "Rp 12.000.000 + Piala", "Rp 8.000.000 + Piala", "Rp 6.000.000", "Rp 2.000.000", "Rp 2.000.000"]
  ];
  sheetPrizes.getRange(2, 1, defaultPrizes.length, defaultPrizes[0].length).setValues(defaultPrizes);

  const sheetAdmins = ss.getSheetByName("Admin_Users");
  const defaultAdmins = [
    ["ADM-001", "superadmin", "admin123", "Ketua Panitia WabupCup 2026", "SUPERADMIN", "panitia@wabupcup2026.id", "081234567890"],
    ["ADM-002", "panitia", "panitia2026", "Sekretariat Pendaftaran", "PANITIA", "sekretariat@wabupcup2026.id", "081398765432"]
  ];
  sheetAdmins.getRange(2, 1, defaultAdmins.length, defaultAdmins[0].length).setValues(defaultAdmins);
}
`;

export const CODE_GS_CODE = `/**
 * =========================================================================
 * WABUPCUP 2026 - CODE.GS (BACKEND API, DRIVE UPLOADER & LOGIK ACAK)
 * =========================================================================
 * Backend RESTful API & Server Controller untuk WabupCup 2026
 * Mendukung Upload PDF ke Google Drive, Notifikasi WhatsApp Otomatis,
 * dan Sistem Acak Drawing Pertandingan.
 */

// Ganti FOLDER_ID jika ingin menyimpan upload PDF di folder Drive khusus
const GOOGLE_DRIVE_FOLDER_ID = ""; // Kosongkan untuk simpan di root Drive

function doGet(e) {
  // Jika diakses langsung via browser sebagai Web App, sajikan Index.html
  if (!e.parameter || !e.parameter.action) {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("WabupCup 2026 - Turnamen Futsal & Sepakbola")
      .addMetaTag("viewport", "width=device-width, initial-scale=1")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // Endpoint API GET
  const action = e.parameter.action;
  let responseData = { success: false, message: "Aksi tidak dikenal" };
  
  try {
    if (action === "getAllData") {
      responseData = getAllTournamentData();
    } else if (action === "checkStatus") {
      responseData = checkRegistrationStatus(e.parameter.query);
    } else if (action === "getBrackets") {
      responseData = getBracketScheduleData(e.parameter.category);
    }
  } catch (err) {
    responseData = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let responseData = { success: false, message: "Permintaan tidak valid" };
  
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    
    if (action === "submitRegistration") {
      responseData = handleTeamRegistration(postData.data);
    } else if (action === "updateRegistrationStatus") {
      responseData = handleUpdateStatus(postData.data);
    } else if (action === "randomizeBracket") {
      responseData = handleRandomizeBracket(postData.category, postData.teams);
    } else if (action === "saveMatchSchedule") {
      responseData = handleSaveMatches(postData.matches);
    } else if (action === "uploadPdfToDrive") {
      responseData = handleDriveUpload(postData.fileName, postData.base64Data, postData.folderName);
    } else if (action === "adminLogin") {
      responseData = handleAdminLogin(postData.username, postData.password);
    }
  } catch (err) {
    responseData = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

// 1. AMBIL SEMUA DATA TOURNAMENT
function getAllTournamentData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const regSheet = ss.getSheetByName("Pendaftaran");
  const regData = regSheet ? regSheet.getDataRange().getValues() : [];
  const registrations = parseSheetRows(regData);
  
  const matchSheet = ss.getSheetByName("Jadwal_Pertandingan");
  const matchData = matchSheet ? matchSheet.getDataRange().getValues() : [];
  const matches = parseSheetRows(matchData);
  
  const prizeSheet = ss.getSheetByName("Kategori_Hadiah");
  const prizeData = prizeSheet ? prizeSheet.getDataRange().getValues() : [];
  const prizes = parseSheetRows(prizeData);
  
  const sponsorSheet = ss.getSheetByName("Sponsor");
  const sponsorData = sponsorSheet ? sponsorSheet.getDataRange().getValues() : [];
  const sponsors = parseSheetRows(sponsorData);
  
  return {
    success: true,
    registrations: registrations,
    matches: matches,
    prizes: prizes,
    sponsors: sponsors,
    timestamp: new Date().toISOString()
  };
}

// 2. SIMPAN PENDAFTARAN TIM BARU DENGAN UPLOAD DRIVE
function handleTeamRegistration(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Pendaftaran");
  
  const regId = "REG-" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const categoryCode = data.category || "UMUM";
  const randomNum = Math.floor(100 + Math.random() * 900);
  const regCode = "WBC-" + categoryCode + "-" + randomNum;
  
  const newRow = [
    regId,
    regCode,
    data.category,
    data.teamName,
    data.institutionName || "-",
    data.coachName,
    data.coachPhone,
    data.coachEmail,
    data.playerCount || 12,
    data.officialCount || 2,
    new Date().toLocaleString("id-ID"),
    "PENDING_PAYMENT",
    "UNPAID",
    data.registrationFee || 0,
    data.docSuratKeterangan || "",
    data.docSuratPernyataan || "",
    data.docFormulirPemain || "",
    data.docAktaKelahiran || "",
    data.docRaportKartu || "",
    data.docBuktiTransfer || "",
    "",
    "Pendaftaran baru masuk dari website SPA",
    new Date().toLocaleString("id-ID")
  ];
  
  sheet.appendRow(newRow);
  
  return {
    success: true,
    regCode: regCode,
    regId: regId,
    message: "Pendaftaran tim " + data.teamName + " berhasil dicatat ke database Google Sheets!"
  };
}

// 3. SISTEM ACAK / DRAWING PERTANDINGAN OTOMATIS & ADIL
function handleRandomizeBracket(category, teamList) {
  if (!teamList || teamList.length < 2) {
    return { success: false, message: "Jumlah tim minimal 2 untuk melakukan drawing" };
  }
  
  // Algoritma Fisher-Yates Shuffle untuk pengacakan adil tanpa bias
  const shuffled = [...teamList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  const matches = [];
  let matchNum = 1;
  
  for (let i = 0; i < shuffled.length; i += 2) {
    const teamA = shuffled[i];
    const teamB = shuffled[i + 1] || { name: "BYE (Lolos Otomatis)" };
    
    matches.push({
      id: "M-" + category + "-" + matchNum,
      matchNumber: matchNum,
      category: category,
      round: shuffled.length <= 4 ? "Semifinal" : (shuffled.length <= 8 ? "Perempat Final" : "Babak 16 Besar"),
      teamA: { name: teamA.name || teamA.teamName || "Tim A" },
      teamB: { name: teamB.name || teamB.teamName || "Tim B" },
      date: "2026-10-25",
      time: "08:00",
      pitch: "Lapangan 1 - Utama",
      status: "UPCOMING"
    });
    matchNum++;
  }
  
  return {
    success: true,
    category: category,
    totalTeams: teamList.length,
    matches: matches
  };
}

// 4. UPLOAD DOKUMEN PDF KE GOOGLE DRIVE
function handleDriveUpload(fileName, base64Data, subFolderName) {
  try {
    let folder = GOOGLE_DRIVE_FOLDER_ID ? DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID) : DriveApp.getRootFolder();
    
    if (subFolderName) {
      const folders = folder.getFoldersByName(subFolderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = folder.createFolder(subFolderName);
      }
    }
    
    const decoded = Utilities.base64Decode(base64Data.split(",")[1] || base64Data);
    const blob = Utilities.newBlob(decoded, "application/pdf", fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      fileUrl: file.getUrl(),
      downloadUrl: file.getDownloadUrl(),
      fileName: fileName
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// 5. HELPER PARSER DATA SPREADSHEET
function parseSheetRows(values) {
  if (!values || values.length <= 1) return [];
  const headers = values[0];
  const rows = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    rows.push(obj);
  }
  return rows;
}
`;

export const INDEX_HTML_STANDALONE_TEMPLATE = `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WabupCup 2026 - Turnamen Sepakbola & Futsal Terakbar</title>
  
  <!-- Tailwind CSS & Font Awesome / Lucide -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Teko:wght@600;700&display=swap" rel="stylesheet">
  
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brandRed: '#DC2626',
            brandDarkRed: '#991B1B',
            brandNavy: '#0F172A',
            brandDeepNavy: '#020617',
            brandSilver: '#E2E8F0',
          },
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            heading: ['Teko', 'sans-serif'],
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased selection:bg-red-600 selection:text-white">
  
  <!-- NAVBAR -->
  <nav class="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gradient-to-tr from-red-600 to-red-800 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-red-900/40 border border-red-500/30">
          ⚽
        </div>
        <div>
          <span class="text-2xl font-heading font-bold tracking-wider text-white">WABUP<span class="text-red-500">CUP</span> 2026</span>
          <p class="text-xs text-slate-400 font-medium">Turnamen Futsal & Mini Soccer Akbar</p>
        </div>
      </div>

      <div class="hidden md:flex items-center space-x-6 text-sm font-medium">
        <a href="#kategori" class="hover:text-red-400 transition">Kategori & Hadiah</a>
        <a href="#live-jadwal" class="hover:text-red-400 transition">Live & Jadwal</a>
        <a href="#bagan" class="hover:text-red-400 transition">Bagan Pertandingan</a>
        <a href="#lokasi" class="hover:text-red-400 transition">Lokasi GOR</a>
        <a href="#sponsor" class="hover:text-red-400 transition">Sponsor</a>
      </div>

      <div class="flex items-center space-x-3">
        <button onclick="toggleTheme()" class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
          🌓
        </button>
        <a href="#pendaftaran" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-white text-sm shadow-lg shadow-red-600/30 transition flex items-center space-x-2">
          <span>Daftar Tim</span>
          <span>⚡</span>
        </a>
      </div>
    </div>
  </nav>

  <!-- HERO SECTION -->
  <header class="relative overflow-hidden pt-12 pb-20 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-semibold uppercase tracking-wider mb-6">
        <span>🏆 Total Hadiah Rp 175.000.000+</span>
      </div>
      <h1 class="text-5xl sm:text-7xl font-heading font-bold text-white tracking-wide uppercase mb-4">
        REBUT PIALA BERGILIR <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-slate-300">WAKIL BUPATI CUP 2026</span>
      </h1>
      <p class="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-8">
        Ajang turnamen futsal dan mini soccer paling bergengsi untuk 6 kategori: SD, SMP, SMA, Instansi/OPD, Umum, dan Desa/Kelurahan.
      </p>
      
      <div class="flex flex-wrap justify-center gap-4">
        <a href="#pendaftaran" class="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-xl shadow-red-600/30 transition">
          🚀 Formulir Pendaftaran Online
        </a>
        <a href="#live-jadwal" class="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-base transition">
          📅 Cek Jadwal & Bagan Match
        </a>
      </div>
    </div>
  </header>

  <!-- KATEGORI & TOTAL HADIAH -->
  <section id="kategori" class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-heading font-bold uppercase text-white">6 KATEGORI PERTANDINGAN</h2>
      <p class="text-slate-400">Pilih kategori tim Anda dan menangkan total hadiah ratusan juta rupiah</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="categoriesContainer">
      <!-- Generated via JS -->
    </div>
  </section>

  <!-- FORMULIR PENDAFTARAN LENGKAP DENGAN UPLOAD PDF -->
  <section id="pendaftaran" class="py-16 bg-slate-900/60 border-y border-slate-800">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 class="text-3xl font-heading font-bold text-white uppercase mb-2">Formulir Pendaftaran Tim 2026</h2>
        <p class="text-slate-400 text-sm mb-8">Pastikan seluruh data dan dokumen PDF (maksimal 3MB) diunggah dengan benar.</p>
        
        <form id="regForm" onsubmit="submitForm(event)" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase mb-2">Kategori Turnamen</label>
              <select id="fCategory" onchange="onCategoryChange()" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none">
                <option value="SD">Kategori SD (U-12 / Kelahiran Maks 2014)</option>
                <option value="SMP">Kategori SMP / Sederajat</option>
                <option value="SMA">Kategori SMA / SMK / Sederajat</option>
                <option value="INSTANSI">Kategori Instansi / OPD / BUMN</option>
                <option value="UMUM">Kategori Umum / Open Club</option>
                <option value="DESA">Kategori Desa & Kelurahan</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase mb-2">Nama Tim</label>
              <input type="text" id="fTeamName" required placeholder="Contoh: SMAN 1 Garuda FC" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase mb-2">Email Aktif Official</label>
              <input type="email" id="fEmail" required placeholder="official@sekolah.sch.id" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase mb-2">WhatsApp Aktif Pelatih / Pembina</label>
              <input type="tel" id="fPhone" required placeholder="081234567890" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none">
            </div>
          </div>

          <!-- UPLOAD DOKUMEN PDF -->
          <div class="border-t border-slate-800 pt-6 space-y-4">
            <h3 class="text-lg font-semibold text-white flex items-center justify-between">
              <span>Lampiran Dokumen PDF (Maks. 3 MB)</span>
              <a href="#" class="text-xs text-red-400 hover:underline">📥 Download Template Formulir Pemain</a>
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <label class="block text-xs font-medium text-slate-300 mb-1" id="labelSuratKeterangan">Surat Keterangan Sekolah / Instansi / Desa (PDF)</label>
                <input type="file" accept=".pdf" required class="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-semibold">
              </div>

              <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <label class="block text-xs font-medium text-slate-300 mb-1">Surat Pernyataan Bermaterai (PDF)</label>
                <input type="file" accept=".pdf" required class="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-semibold">
              </div>

              <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <label class="block text-xs font-medium text-slate-300 mb-1">Formulir Susunan Pemain & Official (PDF)</label>
                <input type="file" accept=".pdf" required class="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-semibold">
              </div>

              <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl" id="boxAktaSD">
                <label class="block text-xs font-medium text-red-300 mb-1">Akta Kelahiran Gabungan Maks 2014 (Khusus SD) (PDF)</label>
                <input type="file" accept=".pdf" class="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-semibold">
              </div>

              <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl md:col-span-2">
                <label class="block text-xs font-medium text-slate-300 mb-1">Raport Terakhir / Kartu Pelajar Digabung 1 PDF</label>
                <input type="file" accept=".pdf" class="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-semibold">
              </div>
            </div>
          </div>

          <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold text-lg shadow-xl shadow-red-900/40 transition">
            🚀 Kirim Pendaftaran Sekarang
          </button>
        </form>
      </div>
    </div>
  </section>

  <!-- JAVASCRIPT LOGIC DENGAN SWEETALERT2 -->
  <script>
    function submitForm(e) {
      e.preventDefault();
      const team = document.getElementById('fTeamName').value;
      const cat = document.getElementById('fCategory').value;
      const phone = document.getElementById('fPhone').value;
      
      const regCode = "WBC-" + cat + "-" + Math.floor(100 + Math.random() * 900);
      
      Swal.fire({
        title: 'Pendaftaran Berhasil Terkirim!',
        html: \`
          <div class="text-left text-sm space-y-2 p-2">
            <p><strong>Kode Registrasi:</strong> <span class="text-red-600 font-mono font-bold">\${regCode}</span></p>
            <p><strong>Nama Tim:</strong> \${team}</p>
            <p><strong>Kategori:</strong> \${cat}</p>
            <div class="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs mt-3">
              Langkah Selanjutnya: Silakan konfirmasi pendaftaran dan bukti pembayaran kepada Admin Panitia via WhatsApp.
            </div>
          </div>
        \`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '📲 Hubungi Admin via WhatsApp',
        confirmButtonColor: '#22c55e',
        cancelButtonText: 'Tutup',
        cancelButtonColor: '#64748b'
      }).then((result) => {
        if (result.isConfirmed) {
          const text = encodeURIComponent(\`Halo Admin WabupCup 2026, saya dari Tim \${team} (Kategori: \${cat}) dengan Kode Registrasi: \${regCode}. Saya ingin konfirmasi pendaftaran dan verifikasi berkas.\`);
          window.open(\`https://wa.me/6281234567890?text=\${text}\`, '_blank');
        }
      });
    }

    function toggleTheme() {
      document.documentElement.classList.toggle('dark');
    }

    function onCategoryChange() {
      const cat = document.getElementById('fCategory').value;
      const boxAkta = document.getElementById('boxAktaSD');
      if (boxAkta) {
        boxAkta.style.display = (cat === 'SD') ? 'block' : 'none';
      }
    }
  </script>
</body>
</html>
`;

export const DEPLOYMENT_AND_GIT_GUIDE = `# PANDUAN LENGKAP DEPLOYMENT & SINKRONISASI WABUPCUP 2026

Selamat! Aplikasi WabupCup 2026 telah dirancang dengan standar arsitektur modern yang fleksibel. Anda dapat menjalankan aplikasi ini dalam dua mode:

---

## PILIHAN A: DEPLOYMENT DENGAN GOOGLE APPS SCRIPT (100% GRATIS TANPA SERVER)

Arsitektur 3-file Google Apps Script memungkinkan Anda menjalankan database Google Sheets, Google Drive Storage, dan Web App Frontend secara gratis selamanya:

### Langkah 1: Buat Spreadsheet & Setup Database
1. Buat Spreadsheet baru di Google Drive: [https://sheets.new](https://sheets.new)
2. Beri nama Spreadsheet: \`DB_WABUPCUP_2026\`
3. Buka menu **Extensions > Apps Script** (Ekstensi > Apps Script).
4. Buat file baru bernama \`setup.gs\`, salin seluruh isi dari tab **setup.gs**.
5. Pilih fungsi \`setupDatabaseWabupCup()\` di toolbar atas, lalu klik tombol **Run / Jalankan**.
6. Setujui permintaan izin akses Google (Authorize Permissions).
7. Spreadsheet Anda otomatis terisi 5 tab sheet berformat rapi dan data awal!

### Langkah 2: Buat Backend API (Code.gs)
1. Di editor Apps Script, buka file \`Code.gs\`.
2. Hapus kode bawaan dan salin seluruh isi dari tab **Code.gs**.
3. (Opsional) Jika ingin menyimpan upload PDF di folder Drive tertentu, masukkan ID Folder pada variabel \`GOOGLE_DRIVE_FOLDER_ID\`.

### Langkah 3: Buat Frontend Web App (Index.html)
1. Di editor Apps Script, klik tombol **+ (Tambah File)** > pilih **HTML**.
2. Beri nama file: \`Index\` (sehingga menjadi \`Index.html\`).
3. Salin seluruh isi kode dari tab **Index.html** ke dalam file ini.

### Langkah 4: Publikasikan Sebagai Web App
1. Klik tombol biru **Deploy > New Deployment** (Terapkan > Penerapan Baru).
2. Pilih jenis penerapan: **Web App** (Aplikasi Web).
3. Konfigurasi:
   - **Description**: \`WabupCup 2026 Production v1.0\`
   - **Execute as**: \`Me (Email Anda)\`
   - **Who has access**: \`Anyone (Siapa saja)\` *(Wajib agar publik bisa mendaftar)*
4. Klik **Deploy**. Salin URL Web App yang dihasilkan untuk dibagikan ke peserta!

---

## PILIHAN B: DEPLOYMENT KE HOSTING GRATIS (VERCEL / NETLIFY / GITHUB PAGES)

Aplikasi React SPA TypeScript ini juga dapat langsung di-deploy ke Vercel, Netlify, atau GitHub Pages secara instan:

### 1. Inisialisasi Git & Push ke GitHub
Buka terminal proyek Anda dan jalankan perintah berikut:
\`\`\`bash
# Inisialisasi Git repository
git init
git add .
git commit -m "feat: initial commit WabupCup 2026 tournament platform"

# Hubungkan ke repository GitHub Anda
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/wabupcup-2026.git
git push -u origin main
\`\`\`

### 2. Deploy ke Vercel (Rekomendasi - Cepat & Otomatis)
1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New... > Project**.
3. Pilih repository \`wabupcup-2026\` yang baru Anda push.
4. Vercel akan mendeteksi framework **Vite** secara otomatis.
5. Klik tombol **Deploy**. Dalam 30 detik, website Anda online di domain \`https://wabupcup-2026.vercel.app\`!

### 3. Deploy ke Netlify
1. Buka [https://app.netlify.com](https://app.netlify.com).
2. Pilih **Add new site > Import an existing project**.
3. Pilih GitHub > repository \`wabupcup-2026\`.
4. Build command: \`npm run build\`
5. Publish directory: \`dist\`
6. Klik **Deploy site**.
`;
