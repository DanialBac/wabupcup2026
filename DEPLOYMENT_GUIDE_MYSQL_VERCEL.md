# 🚀 PANDUAN LENGKAP DEPLOYMENT WABUP CUP 2026 (MYSQL & VERCEL / VPS HOSTING)

Aplikasi **Wabup Cup 2026** dirancang dengan arsitektur **Full-Stack Hybrid** yang sangat fleksibel:
- **Frontend**: React 19 + Tailwind CSS + Lucide Icons + Framer Motion.
- **Backend API**: Node.js + Express API + Vercel Serverless Function handler (`/api/*`).
- **Database Support**: **MySQL 5.7+ / 8.0+ / MariaDB** (atau Cloud MySQL seperti PlanetScale, Aiven, Railway, TiDB Cloud, Supabase/Neon, atau cPanel phpMyAdmin).
- **Fallback Engine**: Mode penyimpanan cerdas otomatis (*In-Memory / Local Persistence*) jika server MySQL belum dikonfigurasi, sehingga aplikasi tetap berjalan lancar 100% tanpa error saat *development* atau *testing*.

---

## 📁 Struktur Berkas Database & Deployment

| File / Folder | Fungsi & Deskripsi |
|---|---|
| `database/schema.sql` | Skrip DDL MySQL resmi: membuat database `wabupcup_db` dan 10 tabel lengkap. |
| `database/seed.sql` | Skrip data awal (*starter demo data*): kategori turnamen, jadwal, sponsor, akun admin panitia. |
| `vercel.json` | Konfigurasi otomatis untuk deployment 1-klik di platform Vercel. |
| `api/index.ts` | Serverless Function handler untuk routing API `/api/*` di Vercel. |
| `server.ts` | Server backend Node.js + Express untuk deployment langsung di VPS / cPanel / Docker. |
| `.env.example` | Template variabel lingkungan untuk koneksi database MySQL. |

---

## 🌐 Opsi 1: Deploy ke Vercel (Gratis & Cepat)

### Langkah 1: Siapkan Database MySQL di Cloud
Anda dapat menggunakan penyedia MySQL gratis atau murah berikut:
1. **TiDB Cloud Serverless** (Gratis 5GB / Serverless):
   - Buat cluster Serverless di [tidbcloud.com](https://tidbcloud.com).
   - Klik **Connect** > Pilih **General** / **Node.js**.
   - *Catatan Penting*: TiDB Cloud **mewajibkan enkripsi TLS / SSL**. Sistem backend WabupCup 2026 kini telah dilengkapi auto-detect TLS 1.2+ untuk TiDB Cloud.
   - Contoh `DATABASE_URL`: `mysql://<user>.<prefix>:<password>@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/wabupcup_db?ssl={"rejectUnauthorized":true}`
   - Atau jika menggunakan variabel terpisah:
     - `MYSQL_HOST` = `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
     - `MYSQL_PORT` = `4000`
     - `MYSQL_USER` = `xxxxxx.root`
     - `MYSQL_PASSWORD` = `PasswordTiDBAnda`
     - `MYSQL_DATABASE` = `wabupcup_db`
     - `MYSQL_SSL` = `true`
2. **Railway.app** (Free credit): Buat project baru > Add MySQL Database > Salin `DATABASE_URL`.
3. **Aiven.io** (Gratis tier murah): Buat instance MySQL > Dapatkan URI koneksi `mysql://...`
4. **cPanel Hosting Anda**: Buat database `wabupcup_db` dan user di cPanel > Izinkan *Remote MySQL* (`%`).

### Langkah 2: Import Skrip Database MySQL
Buka **phpMyAdmin** atau client MySQL Anda (DBeaver / MySQL Workbench / CLI), lalu:
1. Jalankan isi file **`database/schema.sql`** untuk membuat semua tabel.
2. Jalankan isi file **`database/seed.sql`** untuk mengisi data awal turnamen.

### Langkah 3: Deploy ke Vercel
1. Push kode proyek ini ke repositori **GitHub** / GitLab Anda.
2. Buka dashboard [Vercel](https://vercel.com) > Klik **Add New Project** > Pilih repositori Anda.
3. Pada bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL` = `mysql://user:password@host:port/wabupcup_db`
   *Atau jika menggunakan parameter terpisah:*
   - `MYSQL_HOST` = `host-mysql-anda.com`
   - `MYSQL_PORT` = `3306`
   - `MYSQL_USER` = `username_mysql`
   - `MYSQL_PASSWORD` = `password_mysql`
   - `MYSQL_DATABASE` = `wabupcup_db`
   - `MYSQL_SSL` = `true`
4. Klik **Deploy**. Selesai! Web turnamen Anda langsung aktif dengan domain Vercel (contoh: `wabupcup-2026.vercel.app`).

---

## 🖥️ Opsi 2: Deploy Langsung di Server VPS / Ubuntu / Debian

Jika Anda menggunakan VPS (seperti DigitalOcean, Linode, AWS EC2, IDCloudHost, Niagahoster VPS):

### 1. Install Node.js & MySQL Server
```bash
sudo apt update
sudo apt install -y nodejs npm mysql-server git
```

### 2. Konfigurasi MySQL
```bash
sudo mysql -u root
```
Di dalam MySQL prompt:
```sql
CREATE DATABASE wabupcup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wabup_user'@'localhost' IDENTIFIED BY 'PasswordKuat2026!';
GRANT ALL PRIVILEGES ON wabupcup_db.* TO 'wabup_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Import Schema & Seed
```bash
mysql -u wabup_user -p wabupcup_db < database/schema.sql
mysql -u wabup_user -p wabupcup_db < database/seed.sql
```

### 4. Clone Project & Build
```bash
git clone <URL_REPO_ANDA> wabupcup
cd wabupcup
npm install
```

Buat file `.env`:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=wabup_user
MYSQL_PASSWORD=PasswordKuat2026!
MYSQL_DATABASE=wabupcup_db
PORT=3000
NODE_ENV=production
```

Build aplikasi:
```bash
npm run build
```

### 5. Jalankan dengan Process Manager (PM2)
```bash
sudo npm install -g pm2
pm2 start dist/server.cjs --name "wabupcup-app"
pm2 save
pm2 startup
```

### 6. Setup Reverse Proxy Nginx (Domain & SSL HTTPS)
Konfigurasi Nginx:
```nginx
server {
    server_name turnamen.kabupaten.go.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
```
Aktifkan SSL gratis dengan Certbot:
```bash
sudo certbot --nginx -d turnamen.kabupaten.go.id
```

---

## 📦 Opsi 3: Deploy di cPanel (Setup Node.js App)

1. Buka **cPanel** > **MySQL Databases**:
   - Buat database `username_wabupcup` dan user MySQL.
   - Buka **phpMyAdmin** > Pilih database tersebut > Klik tab **Import** > Upload file `database/schema.sql` dan `database/seed.sql`.
2. Buka **Setup Node.js App** di cPanel:
   - Pilih Node.js versi 18.x atau 20.x.
   - Application root: `turnamen`
   - Application startup file: `dist/server.cjs`
   - Tambahkan Environment Variables (`MYSQL_HOST=localhost`, `MYSQL_USER=...`, dll).
3. Upload berkas proyek (atau zip folder `dist`, `database`, `server.ts`, `package.json`, `.env`).
4. Klik **Run NPM Install** dan **Restart Application**.

---

## 🔐 Akun Akses Default Admin Panel Panitia

Setelah import seed data atau saat pertama kali membuka web:
- **URL Admin**: Klik tombol **Admin CMS** di navbar/footer.
- **PIN Cepat**: `2026`
- **Username Akun Panitia**:
  - Superadmin: `superadmin` / Password: `admin123`
  - Panitia Pertandingan: `panitia` / Password: `panitia2026`
  - Wasit / Live Score: `wasit` / Password: `wasit123`

---

## ⚡ Fitur Manajemen Database di Dashboard Admin
Buka Admin Dashboard > Tab **"Database & MySQL"** untuk:
1. **Melihat Status Koneksi MySQL**: Mengetahui apakah aplikasi sedang terhubung langsung ke server MySQL atau mode fallback.
2. **Download SQL Backup**: Mengunduh *full dump SQL* data pendaftaran, tim, jadwal pertandingan, dan skor terkini dalam 1 klik.
3. **Inisialisasi / Re-seed Database**: Menjalankan skrip tabel otomatis ke MySQL.
