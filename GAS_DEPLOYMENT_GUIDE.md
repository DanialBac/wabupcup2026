# PANDUAN DEPLOYMENT GOOGLE APPS SCRIPT (WABUP CUP 2026)

Arsitektur 3-File ini menghubungkan aplikasi Wabup Cup 2026 langsung dengan Google Spreadsheet dan Google Drive Anda.

---

### STRUKTUR FILE
1. `Code.gs` -> Controller / Web Server & API Endpoint
2. `Database.gs` -> Database Model, Inisialisasi Sheet, & Operasi CRUD
3. `Index.html` -> Frontend UI Bundle lengkap dengan semua update visual terbaru (Live Score otomatis, CRUD Kategori, Visibilitas Section, dan Sponsor).

---

### LANGKAH-LANGKAH DEPLOYMENT:

#### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [https://sheets.new](https://sheets.new) di browser Anda.
2. Beri nama file Spreadsheet, misalnya: `Database Turnamen Wabup Cup 2026`.

#### Langkah 2: Buka Google Apps Script Editor
1. Di menu atas Spreadsheet, klik **Extensions (Ekstensi)** -> **Apps Script**.
2. Anda akan diarahkan ke editor Google Apps Script.

#### Langkah 3: Masukkan 3 File
1. **File 1 (`Code.gs`)**:
   - Ganti seluruh isi `Code.gs` bawaan dengan isi file `Code.gs` yang disediakan di project ini.
2. **File 2 (`Database.gs`)**:
   - Klik ikon **+ (Tambah File)** di samping Files -> Pilih **Script**.
   - Beri nama `Database`.
   - Salin dan tempel seluruh isi file `Database.gs` dari project ini.
3. **File 3 (`Index.html`)**:
   - Klik ikon **+ (Tambah File)** di samping Files -> Pilih **HTML**.
   - Beri nama `Index`.
   - Salin dan tempel seluruh isi file `Index.html` dari project ini.

#### Langkah 4: Jalankan Inisialisasi Database (Opsional / Sekali Saja)
1. Di editor Apps Script, pilih fungsi `initializeTournamentDatabase` pada dropdown fungsi di bagian atas.
2. Klik tombol **Run (Jalankan)**.
3. Izinkan otorisasi akses Google Spreadsheet & Google Drive saat diminta (*Review Permissions* -> Pilih Akun Google -> *Advanced* -> *Go to Project (unsafe)* -> *Allow*).
4. Google Apps Script akan otomatis membuat seluruh tab sheet (`Registrations`, `Matches`, `Categories`, `Sponsors`, `Config`, dll.) dengan header rapi.

#### Langkah 5: Deploy Sebagai Web App
1. Klik tombol biru **Deploy (Terapkan)** di pojok kanan atas -> Pilih **New deployment (Penerapan baru)**.
2. Klik ikon gerigi (Settings) -> Pilih jenis **Web app**.
3. Atur konfigurasi:
   - **Description**: `WabupCup 2026 v1.0`
   - **Execute as (Jalankan sebagai)**: `Me (email@gmail.com)`
   - **Who has access (Siapa yang memiliki akses)**: `Anyone (Siapa saja)`
4. Klik **Deploy**.
5. Salin **Web App URL** yang dihasilkan. URL ini adalah link website turnamen Anda yang sudah online dan dapat diakses oleh publik dan panitia.
