import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import {
  Database,
  Server,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Layers,
  FileCode,
  Globe,
  Terminal,
  Shield,
  Zap,
  Sparkles,
} from 'lucide-react';

export const DatabaseManagerTab: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [connectingLive, setConnectingLive] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedVercelEnv, setCopiedVercelEnv] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'SCHEMA_SQL' | 'SEED_SQL' | 'ENV_CONFIG'>('SCHEMA_SQL');

  // Interactive Connection Form State
  const [connectMode, setConnectMode] = useState<'URI' | 'PARAMS'>('URI');
  const [dbUrlInput, setDbUrlInput] = useState(
    'mysql://G3R4PBkMaCJzYe3.root:uSjk1i2XTJoAV6of@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/wabupcup_db?sslaccept=strict'
  );
  const [hostInput, setHostInput] = useState('gateway01.ap-southeast-1.prod.aws.tidbcloud.com');
  const [portInput, setPortInput] = useState(4000);
  const [userInput, setUserInput] = useState('G3R4PBkMaCJzYe3.root');
  const [passwordInput, setPasswordInput] = useState('uSjk1i2XTJoAV6of');
  const [databaseInput, setDatabaseInput] = useState('wabupcup_db');
  const [sslInput, setSslInput] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const health = await ApiService.getHealth();
      setDbStatus(health.database || null);
    } catch {
      setDbStatus({ connected: false, mode: 'FALLBACK_STORAGE' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInitDb = async () => {
    if (!confirm('Jalankan inisialisasi / auto-migrate tabel ke database MySQL/TiDB? Data tabel akan dipersiapkan.')) return;
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await ApiService.initDb();
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Tabel MySQL/TiDB berhasil diinisialisasi!' });
        await fetchStatus();
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Gagal inisialisasi database' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat inisialisasi' });
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await ApiService.reconnectDb();
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Koneksi ke server MySQL/TiDB Cloud berhasil terhubung!' });
      } else {
        const errorDetail = res.error || res.status?.error || 'Periksa variabel .env di Vercel (DATABASE_URL atau MYSQL_HOST/USER/PASSWORD)';
        setActionMessage({
          type: 'error',
          text: `Gagal terhubung ke MySQL: ${errorDetail}`,
        });
      }
      if (res.status) {
        setDbStatus(res.status);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat memeriksa koneksi' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectingLive(true);
    setActionMessage(null);

    const payload =
      connectMode === 'URI'
        ? { databaseUrl: dbUrlInput.trim() }
        : {
            host: hostInput.trim(),
            port: portInput,
            user: userInput.trim(),
            password: passwordInput,
            database: databaseInput.trim(),
            ssl: sslInput,
          };

    try {
      const res = await ApiService.connectDb(payload);
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: res.message || 'Koneksi ke TiDB Cloud berhasil terhubung dan tabel telah tersinkronisasi!',
        });
        if (res.status) {
          setDbStatus(res.status);
        }
      } else {
        setActionMessage({
          type: 'error',
          text: `Gagal koneksi ke TiDB/MySQL: ${res.error || 'Periksa kembali URI, User, Password, atau Port.'}`,
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat menghubungkan ke TiDB Cloud.',
      });
    } finally {
      setConnectingLive(false);
    }
  };

  const applyTidbPreset = () => {
    setConnectMode('URI');
    setDbUrlInput(
      'mysql://G3R4PBkMaCJzYe3.root:uSjk1i2XTJoAV6of@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/wabupcup_db?sslaccept=strict'
    );
    setHostInput('gateway01.ap-southeast-1.prod.aws.tidbcloud.com');
    setPortInput(4000);
    setUserInput('G3R4PBkMaCJzYe3.root');
    setPasswordInput('uSjk1i2XTJoAV6of');
    setDatabaseInput('wabupcup_db');
    setSslInput(true);
    setActionMessage({
      type: 'success',
      text: 'Preset TiDB Cloud Serverless resmi diaktifkan. Klik "Uji & Sambungkan Sekarang" untuk verifikasi langsung.',
    });
  };

  const applyLocalPreset = () => {
    setConnectMode('PARAMS');
    setHostInput('localhost');
    setPortInput(3306);
    setUserInput('root');
    setPasswordInput('');
    setDatabaseInput('wabupcup_db');
    setSslInput(false);
    setActionMessage({
      type: 'success',
      text: 'Preset Localhost / XAMPP diaktifkan (Port 3306 & SSL dimatikan).',
    });
  };

  const copyToClipboard = (text: string, type: 'env' | 'sql' | 'vercel') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else if (type === 'vercel') {
      setCopiedVercelEnv(true);
      setTimeout(() => setCopiedVercelEnv(false), 2000);
    } else {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const getVercelEnvString = () => {
    if (connectMode === 'URI') {
      return `DATABASE_URL=${dbUrlInput}`;
    }
    return `MYSQL_HOST=${hostInput}\nMYSQL_PORT=${portInput}\nMYSQL_USER=${userInput}\nMYSQL_PASSWORD=${passwordInput}\nMYSQL_DATABASE=${databaseInput}\nMYSQL_SSL=${sslInput ? 'true' : 'false'}`;
  };

  const SAMPLE_ENV = `# Konfigurasi Database MySQL WabupCup 2026
# OPSI A: TiDB Cloud Serverless / PlanetScale / Railway
# Format URI:
DATABASE_URL=mysql://<username>.<prefix>:<password>@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/wabupcup_db?ssl={"rejectUnauthorized":true}

# OPSI B: Parameter Terpisah (TiDB Cloud / cPanel / VPS / Localhost)
# TiDB Cloud Serverless wajib menggunakan port 4000 dan MYSQL_SSL=true
MYSQL_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
MYSQL_PORT=4000
MYSQL_USER=xxxxxx.root
MYSQL_PASSWORD=xxxxxx
MYSQL_DATABASE=wabupcup_db
MYSQL_SSL=true

PORT=3000
NODE_ENV=production`;

  const SAMPLE_SQL_SNIPPET = `-- Skrip Cepat DDL Database WabupCup 2026
CREATE DATABASE IF NOT EXISTS \`wabupcup_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`wabupcup_db\`;

-- Tabel Utama:
-- 1. categories (Kategori Usia, Kuota, Biaya & Hadiah)
-- 2. registrations (Data Pendaftaran Tim, Pelatih, Dokumen Persyaratan)
-- 3. players (Daftar Pemain Tiap Tim)
-- 4. matches (Jadwal Pertandingan, Live Score & Bagan Turnamen)
-- 5. sponsors (Sponsor & Official Partner)
-- 6. admin_users (Akun Panitia & Hak Akses)
-- 7. tournament_config (Konfigurasi Global & Tampilan)`;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Manajemen Database MySQL & Deployment Hub
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Platform ini mendukung penuh database <strong>MySQL 5.7+ / 8.0+ / MariaDB</strong>, REST API backend Node.js, dan konfigurasi siap pakai untuk hosting di <strong>Vercel</strong>, VPS Ubuntu/Debian, atau cPanel.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleReconnect}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Cek Koneksi</span>
            </button>
            <a
              href={ApiService.getExportSqlUrl()}
              download="wabupcup_2026_backup.sql"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white shadow-lg shadow-red-900/30 transition flex items-center space-x-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SQL Dump</span>
            </a>
          </div>
        </div>
      </div>

      {/* ACTION MESSAGE ALERT */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-3 border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-red-950/80 border-red-700 text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="font-medium leading-relaxed">{actionMessage.text}</span>
        </div>
      )}

      {/* DATABASE DIAGNOSTIC NOTICE (When in Fallback Mode) */}
      {!dbStatus?.connected && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-xs text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 text-sm block">Aplikasi Sedang Menggunakan Mode Hybrid Fallback</span>
              <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                {dbStatus?.error
                  ? `Catatan error koneksi: ${dbStatus.error}`
                  : 'Jika Anda baru saja menambahkan Environment Variables di Vercel: Vercel memerlukan "Redeploy" agar variabel baru terbaca.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-amber-300">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">1. Pastikan IP Access List TiDB: 0.0.0.0/0</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">2. Di Vercel: Klik Deployments &rarr; Redeploy</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-500/40 text-indigo-200">3. Atau klik tombol biru di bawah untuk tes langsung</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleReconnect}
            disabled={loading}
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-semibold transition text-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Cek Ulang</span>
          </button>
        </div>
      )}

      {/* METRICS & STATUS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Connection Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4.5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status Koneksi</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></div>
            <span className="text-base font-bold text-white">
              {dbStatus?.connected ? 'MySQL / TiDB Terhubung' : 'Mode Hybrid Fallback'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Host: {dbStatus?.host || 'localhost / In-Memory'}
          </p>
        </div>

        {/* Card 2: Database Name */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4.5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Database Target</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            {dbStatus?.database || 'wabupcup_db'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Engine: InnoDB • utf8mb4</p>
        </div>

        {/* Card 3: Storage Mode */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4.5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Storage Engine</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400">
            {dbStatus?.connected ? 'Real TiDB / MySQL Server' : 'Memory + LocalStorage'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {dbStatus?.connected ? 'Sinkronisasi cloud aktif' : 'Auto-fallback aktif (Zero Crash)'}
          </p>
        </div>

        {/* Card 4: Quick Action */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inisialisasi Tabel</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <button
            onClick={handleInitDb}
            disabled={loading}
            className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 mt-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Init / Migrate Tabel</span>
          </button>
        </div>
      </div>

      {/* EASY TIDB CLOUD & MYSQL CONNECT STUDIO */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Koneksi Cepat TiDB Cloud & MySQL (Easy Connect Studio)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant Link
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hubungkan aplikasi ke cluster TiDB Cloud Serverless atau MySQL Server Anda secara langsung tanpa perlu restart.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyTidbPreset}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preset TiDB Cloud</span>
            </button>
            <button
              type="button"
              onClick={applyLocalPreset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <span>Preset Localhost</span>
            </button>
          </div>
        </div>


        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setConnectMode('URI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              connectMode === 'URI'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            1. Opsi A: Connection URL (TiDB Cloud / DATABASE_URL)
          </button>
          <button
            type="button"
            onClick={() => setConnectMode('PARAMS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              connectMode === 'PARAMS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            2. Opsi B: Form Parameter (Host, Port, User, Password)
          </button>
        </div>


        <form onSubmit={handleConnectLive} className="space-y-4">
          {connectMode === 'URI' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>TiDB Cloud Connection String (DATABASE_URL):</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Port 4000 & SSL TLS 1.2+ otomatis diatur
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={dbUrlInput}
                  onChange={e => setDbUrlInput(e.target.value)}
                  placeholder="mysql://username.root:password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/wabupcup_db"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tip: Cukup salin connection string dari <strong>TiDB Cloud Console</strong> &gt; cluster Anda &gt; tombol <strong>Connect</strong> &gt; pilih driver <em>Node.js / MySQL</em>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Host / Endpoint</label>
                <input
                  type="text"
                  value={hostInput}
                  onChange={e => setHostInput(e.target.value)}
                  placeholder="gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Port (4000 untuk TiDB / 3306 untuk MySQL)</label>
                <input
                  type="number"
                  value={portInput}
                  onChange={e => setPortInput(parseInt(e.target.value, 10) || 4000)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Database Name</label>
                <input
                  type="text"
                  value={databaseInput}
                  onChange={e => setDatabaseInput(e.target.value)}
                  placeholder="wabupcup_db"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="xxxxxx.root"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password TiDB / MySQL"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={sslInput}
                    onChange={e => setSslInput(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                  <span>Gunakan SSL TLS 1.2+ (Wajib TiDB)</span>
                </label>
              </div>
            </div>
          )}


          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={connectingLive}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/30 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${connectingLive ? 'animate-spin' : ''}`} />
              <span>{connectingLive ? 'Sedang Menghubungkan...' : 'Uji & Sambungkan TiDB / MySQL Sekarang'}</span>
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(getVercelEnvString(), 'vercel')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer"
            >
              {copiedVercelEnv ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedVercelEnv ? 'Tersalin untuk Vercel!' : 'Salin Konfigurasi untuk Vercel .env'}</span>
            </button>
          </div>
        </form>


        <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-200/90 flex items-start space-x-3">
          <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-[11px]">
            <p className="font-bold text-indigo-300">
              Panduan Menghubungkan TiDB Cloud Serverless:
            </p>
            <p>
              1. Buka <strong>TiDB Cloud Console</strong> &gt; Security &gt; pastikan IP Access List mengizinkan <code>0.0.0.0/0</code> agar Vercel & Web Server dapat terhubung.
            </p>
            <p>
              2. TiDB Cloud selalu menggunakan port <strong>4000</strong> dan enkripsi <strong>TLS 1.2+</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-black border border-slate-700 flex items-center justify-center text-white font-bold text-base">
                  ▲
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    1. Deployment ke Vercel (Rekomendasi Cepat & Gratis)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Deploy fullstack React + Serverless Function API dengan MySQL Cloud.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                1-Click Ready
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-200">Langkah-langkah:</p>
              <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed">
                <li>
                  <strong>Siapkan Database MySQL Cloud:</strong> Buat database gratis di <em>Railway.app</em>, <em>Aiven.io</em>, <em>TiDB Cloud</em>, atau Remote MySQL cPanel Anda.
                </li>
                <li>
                  <strong>Import Schema:</strong> Buka phpMyAdmin / DBeaver, import file <code>database/schema.sql</code> dan <code>database/seed.sql</code>.
                </li>
                <li>
                  <strong>Import ke Vercel:</strong> Hubungkan repositori GitHub Anda ke dashboard <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-red-400 hover:underline inline-flex items-center">Vercel <ExternalLink className="w-3 h-3 ml-0.5" /></a>.
                </li>
                <li>
                  <strong>Atur Environment Variables di Vercel:</strong>
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-emerald-400 border border-slate-800 flex items-center justify-between">
                    <span>DATABASE_URL=mysql://user:pass@host:3306/wabupcup_db</span>
                    <button
                      onClick={() => copyToClipboard('DATABASE_URL=mysql://user:pass@host:3306/wabupcup_db', 'env')}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      {copiedEnv ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </li>
                <li>
                  <strong>Deploy:</strong> Klik tombol <em>Deploy</em> pada Vercel. Berkas <code>vercel.json</code> dan <code>api/index.ts</code> sudah dikonfigurasi secara otomatis.
                </li>
              </ol>
            </div>
          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-900/50 border border-indigo-700 flex items-center justify-center text-indigo-300">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Deployment ke Server VPS (Ubuntu / Debian / Nginx)
                </h3>
                <p className="text-xs text-slate-400">
                  Untuk hosting langsung di server sendiri dengan Node.js + PM2 + MySQL lokal.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs text-slate-300 font-mono">
              <p className="text-slate-400"># 1. Build aplikasi untuk produksi:</p>
              <div className="p-2 rounded bg-slate-900 text-amber-300 text-[11px]">
                npm run build
              </div>

              <p className="text-slate-400"># 2. Import database ke MySQL server lokal:</p>
              <div className="p-2 rounded bg-slate-900 text-blue-300 text-[11px]">
                mysql -u root -p wabupcup_db &lt; database/schema.sql<br />
                mysql -u root -p wabupcup_db &lt; database/seed.sql
              </div>

              <p className="text-slate-400"># 3. Jalankan server background dengan PM2:</p>
              <div className="p-2 rounded bg-slate-900 text-emerald-300 text-[11px]">
                pm2 start dist/server.cjs --name "wabupcup-2026"
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Skrip Database & Konfigurasi
                </h3>
              </div>
            </div>


            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 mb-4 text-xs font-semibold">
              <button
                onClick={() => setActiveSchemaTab('SCHEMA_SQL')}
                className={`flex-1 py-1.5 rounded-md transition ${
                  activeSchemaTab === 'SCHEMA_SQL'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                schema.sql
              </button>
              <button
                onClick={() => setActiveSchemaTab('SEED_SQL')}
                className={`flex-1 py-1.5 rounded-md transition ${
                  activeSchemaTab === 'SEED_SQL'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                seed.sql
              </button>
              <button
                onClick={() => setActiveSchemaTab('ENV_CONFIG')}
                className={`flex-1 py-1.5 rounded-md transition ${
                  activeSchemaTab === 'ENV_CONFIG'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                .env.example
              </button>
            </div>


            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-72 leading-relaxed whitespace-pre select-all">
              {activeSchemaTab === 'SCHEMA_SQL' && SAMPLE_SQL_SNIPPET}
              {activeSchemaTab === 'SEED_SQL' && `-- Data Demo Awal WabupCup 2026
                -- Berisi 5 Kategori (SD, SMP, SMA, INSTANSI, UMUM)
                -- Jadwal Pertandingan Resmi & Tim Terdaftar
                -- Akun Panitia (superadmin / panitia / wasit)
                -- Silakan import via phpMyAdmin atau CLI.`}
              {activeSchemaTab === 'ENV_CONFIG' && SAMPLE_ENV}
            </div>


            <div className="grid grid-cols-2 gap-2.5 mt-4 pt-2 border-t border-slate-800">
              <button
                onClick={() =>
                  copyToClipboard(
                    activeSchemaTab === 'ENV_CONFIG' ? SAMPLE_ENV : SAMPLE_SQL_SNIPPET,
                    'sql'
                  )
                }
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center justify-center space-x-1.5"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>

              <a
                href={ApiService.getExportSqlUrl()}
                download="wabupcup_2026_backup.sql"
                className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-900/30 transition flex items-center justify-center space-x-1.5 text-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
