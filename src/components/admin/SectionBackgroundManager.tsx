import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { SectionKey, SectionBackgroundConfig, SectionsBackgrounds } from '../../types';
import { ApiService } from '../../services/api';
import { compressImage } from '../../utils/imageCompressor';
import { uploadToTiDbStorage, deleteMediaFromStorage } from '../../utils/blobUpload';
import {
  Image,
  Upload,
  Trash2,
  RotateCcw,
  Check,
  Smartphone,
  Monitor,
  Palette,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  Eye,
  Layers,
  HelpCircle,
  Save,
  Database
} from 'lucide-react';

interface SectionMeta {
  key: SectionKey;
  name: string;
  badge: string;
  description: string;
  defaultBg: string;
}

const SECTIONS_LIST: SectionMeta[] = [
  {
    key: 'hero',
    name: 'Hero Section (Beranda Utama)',
    badge: 'Headline & Banner',
    description: 'Bagian teratas landing page dengan judul turnamen, countdown timer, dan tombol daftar.',
    defaultBg: 'Slate-950 dengan radial glow merah & biru dan pola garis lapangan',
  },
  {
    key: 'liveScore',
    name: 'Live Score & Jadwal Match',
    badge: 'Ticker & Jadwal',
    description: 'Pusat informasi skor langsung pertandingan aktif dan jadwal laga mendatang.',
    defaultBg: 'Slate-50 (Light) / Slate-900 (Dark)',
  },
  {
    key: 'categories',
    name: 'Kategori Turnamen & Hadiah',
    badge: 'Hadiah & Syarat',
    description: 'Tabel kartu kategori (SD, SMP, SMA, Instansi, Umum, Desa) beserta rincian hadiah uang pembinaan.',
    defaultBg: 'White (Light) / Slate-950 (Dark)',
  },
  {
    key: 'bracket',
    name: 'Bagan Bracket & Daftar Tim',
    badge: 'Skema Knockout',
    description: 'Skema gugur 16 besar hingga final, jadwal harian, dan direktori tim terdaftar.',
    defaultBg: 'Slate-100 (Light) / Slate-900 (Dark)',
  },
  {
    key: 'venue',
    name: 'Lokasi Gelanggang & Fasilitas',
    badge: 'Maps & Fasilitas',
    description: 'Peta Google Maps interaktif lokasi GOR Tawang Alun dan daftar fasilitas gelanggang.',
    defaultBg: 'White (Light) / Slate-950 (Dark)',
  },
  {
    key: 'sponsors',
    name: 'Sponsor & Official Partner',
    badge: 'Kemitraan',
    description: 'Logo sponsor title, platinum, gold, silver, dan official partner turnamen.',
    defaultBg: 'Slate-50 (Light) / Slate-950 (Dark)',
  },
  {
    key: 'footer',
    name: 'Footer & Kontak Resmi',
    badge: 'Footer Bawah',
    description: 'Navigasi bawah, hotline WhatsApp sekretariat, rekening pembayaran, dan copyright.',
    defaultBg: 'Slate-950 (Dark solid)',
  },
];

const PRESET_OVERLAY_COLORS = [
  { label: 'Hitam Pekat', hex: '#000000' },
  { label: 'Navy Gelap', hex: '#0f172a' },
  { label: 'Slate Gelap', hex: '#020617' },
  { label: 'Merah Marun', hex: '#450a0a' },
  { label: 'Biru Tua', hex: '#172554' },
  { label: 'Hijau Tua', hex: '#064e3b' },
  { label: 'Putih Lembut', hex: '#ffffff' },
];

const PRESET_BG_COLORS = [
  { label: 'Slate-950', hex: '#020617' },
  { label: 'Slate-900', hex: '#0f172a' },
  { label: 'Slate-800', hex: '#1e293b' },
  { label: 'Merah Gelap', hex: '#450a0a' },
  { label: 'Biru Gelap', hex: '#1e1b4b' },
  { label: 'Emerald Gelap', hex: '#064e3b' },
  { label: 'Abu Terang', hex: '#f8fafc' },
  { label: 'Putih Bersih', hex: '#ffffff' },
];

// High quality royalty-free sports/futsal wallpaper presets
const SAMPLE_IMAGE_PRESETS = [
  {
    title: 'Futsal Arena Dramatic Night',
    desktop: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1080&auto=format&fit=crop',
  },
  {
    title: 'Indoor Sports Stadium Lights',
    desktop: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1920&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1080&auto=format&fit=crop',
  },
  {
    title: 'Soccer Ball on Pitch',
    desktop: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1080&auto=format&fit=crop',
  },
  {
    title: 'Modern Sports Hall Vinyl Court',
    desktop: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1920&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1080&auto=format&fit=crop',
  },
];

export const SectionBackgroundManager: React.FC = () => {
  const { config, updateConfig } = useTournament();
  const [activeSection, setActiveSection] = useState<SectionKey>('hero');
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const backgrounds: SectionsBackgrounds = config.sectionsBackgrounds || {};
  const currentConfig: SectionBackgroundConfig = backgrounds[activeSection] || {
    mode: 'DEFAULT',
    overlayColor: '#000000',
    overlayOpacity: 60,
    overlayBlur: false,
    textColorMode: 'LIGHT',
  };

  const [isSavingDb, setIsSavingDb] = useState(false);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleUpdateCurrent = (updates: Partial<SectionBackgroundConfig>) => {
    let newMode = updates.mode || currentConfig.mode;
    if (!updates.mode && (updates.desktopImage || updates.mobileImage)) {
      newMode = 'IMAGE';
    }

    const updatedSectionConfig: SectionBackgroundConfig = {
      ...currentConfig,
      ...updates,
      mode: newMode,
    };

    const nextBackgrounds: SectionsBackgrounds = {
      ...backgrounds,
      [activeSection]: updatedSectionConfig,
    };

    updateConfig({ sectionsBackgrounds: nextBackgrounds });
    showToast(`Background "${activeMeta.name}" langsung diterapkan & disimpan!`);
  };

  const handleSaveToDatabase = async () => {
    setIsSavingDb(true);
    try {
      await ApiService.updateConfig({ sectionsBackgrounds: config.sectionsBackgrounds });
      showToast('Konfigurasi background berhasil disimpan permanen ke database!');
    } catch (err: any) {
      console.error('Error saving to DB:', err);
      showToast('Gagal simpan ke DB: ' + (err?.message || 'Error'));
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleResetSection = async (secKey: SectionKey) => {
    const secBg = backgrounds[secKey];
    if (secBg?.desktopImage) {
      deleteMediaFromStorage(secBg.desktopImage).catch(() => {});
    }
    if (secBg?.mobileImage) {
      deleteMediaFromStorage(secBg.mobileImage).catch(() => {});
    }

    const nextBackgrounds: SectionsBackgrounds = {
      ...backgrounds,
      [secKey]: {
        mode: 'DEFAULT',
        bgColor: '#020617',
        desktopImage: '',
        mobileImage: '',
        overlayColor: '#000000',
        overlayOpacity: 60,
        overlayBlur: false,
        textColorMode: 'LIGHT',
      },
    };

    updateConfig({ sectionsBackgrounds: nextBackgrounds });
    showToast(`Background section ${secKey} berhasil direset ke warna default.`);
  };

  const handleResetAllSections = async () => {
    if (!window.confirm('Kembalikan semua background section ke warna default sistem? Berkas gambar lama di penyimpanan juga akan dibersihkan.')) return;

    for (const s of SECTIONS_LIST) {
      const secBg = backgrounds[s.key];
      if (secBg?.desktopImage) deleteMediaFromStorage(secBg.desktopImage).catch(() => {});
      if (secBg?.mobileImage) deleteMediaFromStorage(secBg.mobileImage).catch(() => {});
    }

    const resetObj: SectionsBackgrounds = {};
    for (const s of SECTIONS_LIST) {
      resetObj[s.key] = {
        mode: 'DEFAULT',
        bgColor: '#020617',
        desktopImage: '',
        mobileImage: '',
        overlayColor: '#000000',
        overlayOpacity: 60,
        overlayBlur: false,
        textColorMode: 'LIGHT',
      };
    }

    updateConfig({ sectionsBackgrounds: resetObj });
    showToast('Semua background section berhasil direset ke default sistem.');
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'desktop' | 'mobile'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 10MB.');
      return;
    }

    // Delete previous wallpaper if exists in TiDB storage
    const prevUrl = type === 'desktop' ? currentConfig.desktopImage : currentConfig.mobileImage;
    if (prevUrl && prevUrl.includes('/api/media/view/')) {
      deleteMediaFromStorage(prevUrl).catch(() => {});
    }

    try {
      showToast('Sedang menyimpan wallpaper ke TiDB Cloud storage...');
      const uploaded = await uploadToTiDbStorage(file, 'wallpapers');
      if (type === 'desktop') {
        handleUpdateCurrent({ desktopImage: uploaded.url, mode: 'IMAGE' });
      } else {
        handleUpdateCurrent({ mobileImage: uploaded.url, mode: 'IMAGE' });
      }
      showToast('Wallpaper berhasil tersimpan terpusat di TiDB Cloud!');
    } catch (err: any) {
      console.warn('Fallback to client-side compression:', err);
      try {
        if (type === 'desktop') {
          const compressedBase64 = await compressImage(file, 1920, 1080, 0.82);
          handleUpdateCurrent({ desktopImage: compressedBase64, mode: 'IMAGE' });
        } else {
          const compressedBase64 = await compressImage(file, 1080, 1920, 0.82);
          handleUpdateCurrent({ mobileImage: compressedBase64, mode: 'IMAGE' });
        }
      } catch {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const base64 = loadEvt.target?.result as string;
          if (type === 'desktop') {
            handleUpdateCurrent({ desktopImage: base64, mode: 'IMAGE' });
          } else {
            handleUpdateCurrent({ mobileImage: base64, mode: 'IMAGE' });
          }
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = '';
  };

  const activeMeta = SECTIONS_LIST.find((s) => s.key === activeSection) || SECTIONS_LIST[0];

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Palette className="w-3.5 h-3.5" />
              <span>Kustomisasi Background & Tema Landing Page</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight flex items-center space-x-2">
              <span>Pengaturan Background Tiap Section</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Ubah warna bawaan menjadi warna kustom atau pasang gambar latar belakang (Hero Image) dengan 2 model terpisah (Desktop & Mobile responsif) beserta filter Overlay warna dan transparansi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleSaveToDatabase}
              disabled={isSavingDb}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-950/40 border border-emerald-500/50 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              title="Simpan seluruh konfigurasi background ke database MySQL"
            >
              <Save className={`w-3.5 h-3.5 ${isSavingDb ? 'animate-spin' : ''}`} />
              <span>{isSavingDb ? 'Menyimpan...' : 'Simpan ke Database'}</span>
            </button>

            <button
              onClick={handleResetAllSections}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center space-x-2 cursor-pointer"
              title="Kembalikan semua background ke warna default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {saveToast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{saveToast}</span>
          </div>
        )}
      </div>

      {/* SECTION SELECTOR PILLS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {SECTIONS_LIST.map((sec) => {
          const isSelected = activeSection === sec.key;
          const bgState = backgrounds[sec.key];
          const isCustom = bgState?.mode === 'IMAGE' || bgState?.mode === 'COLOR';

          return (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 whitespace-nowrap cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/40 border border-red-500/50'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <span className="text-sm">
                {sec.key === 'hero' ? '⭐' : sec.key === 'liveScore' ? '⚡' : sec.key === 'categories' ? '🏆' : sec.key === 'bracket' ? '📊' : sec.key === 'venue' ? '📍' : sec.key === 'sponsors' ? '🤝' : '📄'}
              </span>
              <span>{sec.name.split(' (')[0]}</span>
              {isCustom && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="Background Kustom Aktif" />
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE SECTION EDITOR CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* CARD TITLE & RESET */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                  {activeMeta.badge}
                </span>
                <h4 className="text-xl font-bold text-white">{activeMeta.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{activeMeta.description}</p>
              </div>

              <button
                onClick={() => handleResetSection(activeSection)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 border border-slate-700 hover:border-red-800 text-[11px] font-bold text-slate-300 hover:text-red-300 transition flex items-center space-x-1.5 cursor-pointer shrink-0"
                title="Hapus gambar atau warna kustom, kembali ke bawaan sistem"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Section Ini</span>
              </button>
            </div>

            {/* 1. MODE SELECTOR */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Pilih Tipe / Mode Background</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                {/* DEFAULT */}
                <button
                  type="button"
                  onClick={() => handleUpdateCurrent({ mode: 'DEFAULT' })}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    currentConfig.mode === 'DEFAULT' || !currentConfig.mode
                      ? 'bg-slate-800 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">🎨</span>
                    {currentConfig.mode === 'DEFAULT' && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs">Default Sistem</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Warna bawaan tema</div>
                  </div>
                </button>

                {/* SOLID COLOR */}
                <button
                  type="button"
                  onClick={() => handleUpdateCurrent({ mode: 'COLOR' })}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    currentConfig.mode === 'COLOR'
                      ? 'bg-slate-800 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">🌈</span>
                    {currentConfig.mode === 'COLOR' && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs">Warna Kustom</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Solid background</div>
                  </div>
                </button>

                {/* HERO IMAGE */}
                <button
                  type="button"
                  onClick={() => handleUpdateCurrent({ mode: 'IMAGE' })}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    currentConfig.mode === 'IMAGE'
                      ? 'bg-slate-800 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">🖼️</span>
                    {currentConfig.mode === 'IMAGE' && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs">Hero Image</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Gambar + Overlay</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. IF MODE DEFAULT */}
            {(!currentConfig.mode || currentConfig.mode === 'DEFAULT') && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Info className="w-4 h-4" />
                  <span>Mode Default Sedang Aktif</span>
                </div>
                <p>
                  Section ini sedang menggunakan tampilan visual default sistem: <br />
                  <span className="font-semibold text-white">{activeMeta.defaultBg}</span>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Pilih <strong className="text-white">"Warna Kustom"</strong> untuk menentukan warna latar belakang solid Anda sendiri, atau <strong className="text-white">"Hero Image"</strong> untuk memasang gambar latar belakang profesional dengan lapisan overlay warna yang dapat disesuaikan.
                </p>
              </div>
            )}

            {/* 3. IF MODE SOLID COLOR */}
            {currentConfig.mode === 'COLOR' && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Atur Warna Latar Belakang</span>
                </label>

                {/* PRESET PALETTES */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-2">Pilihan Warna Cepat:</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_BG_COLORS.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => handleUpdateCurrent({ bgColor: p.hex })}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center space-x-2 transition cursor-pointer ${
                          currentConfig.bgColor === p.hex
                            ? 'bg-slate-800 border-cyan-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* COLOR PICKER & HEX INPUT */}
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="color"
                    value={currentConfig.bgColor || '#020617'}
                    onChange={(e) => handleUpdateCurrent({ bgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-slate-800 border border-slate-700 p-1"
                  />
                  <input
                    type="text"
                    value={currentConfig.bgColor || '#020617'}
                    onChange={(e) => handleUpdateCurrent({ bgColor: e.target.value })}
                    placeholder="#020617"
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs w-36 uppercase focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">Kode warna HEX</span>
                </div>
              </div>
            )}

            {/* 4. IF MODE HERO IMAGE (DESKTOP & MOBILE + OVERLAY) */}
            {currentConfig.mode === 'IMAGE' && (
              <div className="space-y-6">
                
                {/* SAMPLE PRESETS QUICK SELECTOR */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-950/60 to-blue-950/40 border border-red-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Preset Contoh Gambar Cepat (HD Futsal & Arena):</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {SAMPLE_IMAGE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          handleUpdateCurrent({
                            desktopImage: p.desktop,
                            mobileImage: p.mobile,
                            mode: 'IMAGE',
                          })
                        }
                        className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 text-[11px] text-slate-300 hover:text-white transition cursor-pointer text-left truncate"
                        title={p.title}
                      >
                        <span className="block truncate font-semibold">Foto #{idx + 1}</span>
                        <span className="block truncate text-[9px] text-slate-400">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2 MODELS: MODEL 1 DESKTOP & MODEL 2 MOBILE */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      <span>Model 1: Gambar Latar Layar Desktop (Landscape / 16:9)</span>
                    </h5>
                    {currentConfig.desktopImage && (
                      <button
                        type="button"
                        onClick={() => handleUpdateCurrent({ desktopImage: '' })}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus Gambar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {/* FILE UPLOAD */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Upload File dari Komputer (Max 5MB):
                      </label>
                      <label className="flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Pilih Gambar Desktop</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'desktop')}
                        />
                      </label>
                    </div>

                    {/* URL INPUT */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Atau Masukkan Link / URL Gambar:
                      </label>
                      <input
                        type="url"
                        value={currentConfig.desktopImage || ''}
                        onChange={(e) => handleUpdateCurrent({ desktopImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* MODEL 2: MOBILE IMAGE */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>Model 2: Gambar Latar Layar Mobile / HP (Portrait / 9:16)</span>
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        *Opsional: Jika tidak diisi, otomatis menggunakan gambar Desktop yang disesuaikan.
                      </span>
                    </div>
                    {currentConfig.mobileImage && (
                      <button
                        type="button"
                        onClick={() => handleUpdateCurrent({ mobileImage: '' })}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus Gambar Mobile</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {/* FILE UPLOAD MOBILE */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Upload File Khusus Layar HP:
                      </label>
                      <label className="flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer">
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Pilih Gambar Mobile</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'mobile')}
                        />
                      </label>
                    </div>

                    {/* URL INPUT MOBILE */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Link / URL Gambar Mobile:
                      </label>
                      <input
                        type="url"
                        value={currentConfig.mobileImage || ''}
                        onChange={(e) => handleUpdateCurrent({ mobileImage: e.target.value })}
                        placeholder="https://images.unsplash.com/... (Portrait)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* OVERLAY CONFIGURATION */}
                <div className="space-y-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <span>Pengaturan Warna Lapisan Overlay & Transparansi</span>
                    </label>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                      Opacity: {currentConfig.overlayOpacity ?? 60}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Lapisan overlay berfungsi meredam kontras gambar latar agar seluruh teks judul, tombol, dan konten penting tetap terbaca sangat jelas (high readability).
                  </p>

                  {/* PRESET OVERLAY COLORS */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-2">Preset Warna Overlay:</span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_OVERLAY_COLORS.map((oc) => (
                        <button
                          key={oc.hex}
                          type="button"
                          onClick={() => handleUpdateCurrent({ overlayColor: oc.hex })}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center space-x-1.5 transition cursor-pointer ${
                            (currentConfig.overlayColor || '#000000').toLowerCase() === oc.hex.toLowerCase()
                              ? 'bg-slate-800 border-cyan-400 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: oc.hex }}
                          />
                          <span>{oc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CUSTOM OVERLAY COLOR PICKER */}
                  <div className="flex items-center space-x-3 pt-1">
                    <input
                      type="color"
                      value={currentConfig.overlayColor || '#000000'}
                      onChange={(e) => handleUpdateCurrent({ overlayColor: e.target.value })}
                      className="w-9 h-9 rounded-lg cursor-pointer bg-slate-800 border border-slate-700 p-1"
                    />
                    <input
                      type="text"
                      value={currentConfig.overlayColor || '#000000'}
                      onChange={(e) => handleUpdateCurrent({ overlayColor: e.target.value })}
                      placeholder="#000000"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs w-32 uppercase focus:border-cyan-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Pilih warna overlay bebas</span>
                  </div>

                  {/* OPACITY SLIDER */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Transparansi Overlay:</span>
                      <span className="text-white font-bold">{currentConfig.overlayOpacity ?? 60}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentConfig.overlayOpacity ?? 60}
                      onChange={(e) => handleUpdateCurrent({ overlayOpacity: Number(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0% (Gambar Terang Tanpa Filter)</span>
                      <span>50% - 70% (Sangat Direkomendasikan)</span>
                      <span>100% (Solid Tertutup)</span>
                    </div>
                  </div>

                  {/* BLUR & CONTRAST OPTIONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* BACKDROP BLUR */}
                    <label className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!currentConfig.overlayBlur}
                        onChange={(e) => handleUpdateCurrent({ overlayBlur: e.target.checked })}
                        className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300">Aktifkan Efek Blur Halus (Backdrop)</span>
                    </label>

                    {/* TEXT CONTRAST */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 shrink-0">Warna Teks:</span>
                      <select
                        value={currentConfig.textColorMode || 'LIGHT'}
                        onChange={(e) => handleUpdateCurrent({ textColorMode: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs cursor-pointer focus:outline-none focus:border-cyan-500"
                      >
                        <option value="LIGHT">Teks Putih / Terang (Rekomendasi)</option>
                        <option value="DARK">Teks Hitam / Gelap</option>
                        <option value="AUTO">Otomatis Berdasarkan Overlay</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Simulasi Real-time Tampilan</span>
              </div>

              {/* DEVICE TOGGLE */}
              <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('DESKTOP')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                    previewDevice === 'DESKTOP'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('MOBILE')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                    previewDevice === 'MOBILE'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="flex justify-center bg-slate-950 rounded-xl p-3 border border-slate-800/80">
              <div
                className={`transition-all duration-300 relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl ${
                  previewDevice === 'DESKTOP'
                    ? 'w-full h-72'
                    : 'w-[200px] h-[340px] rounded-2xl border-2 border-slate-600'
                }`}
              >
                {/* SIMULATED BACKGROUND */}
                {currentConfig.mode === 'DEFAULT' || !currentConfig.mode ? (
                  <div className="absolute inset-0 bg-slate-950 text-white flex items-center justify-center p-4">
                    <div className="text-center">
                      <span className="text-2xl block mb-2">🎨</span>
                      <span className="text-xs font-bold text-slate-300">Warna Bawaan Sistem</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Mengikuti tema global</span>
                    </div>
                  </div>
                ) : currentConfig.mode === 'COLOR' ? (
                  <div
                    className="absolute inset-0 transition-colors"
                    style={{ backgroundColor: currentConfig.bgColor || '#020617' }}
                  />
                ) : (
                  <>
                    {/* DESKTOP IMAGE */}
                    {previewDevice === 'DESKTOP' && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${
                            currentConfig.desktopImage ||
                            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop'
                          }")`,
                        }}
                      />
                    )}

                    {/* MOBILE IMAGE */}
                    {previewDevice === 'MOBILE' && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${
                            currentConfig.mobileImage ||
                            currentConfig.desktopImage ||
                            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop'
                          }")`,
                        }}
                      />
                    )}

                    {/* SIMULATED OVERLAY */}
                    <div
                      className={`absolute inset-0 ${currentConfig.overlayBlur ? 'backdrop-blur-[1px]' : ''}`}
                      style={{
                        backgroundColor: currentConfig.overlayColor || '#000000',
                        opacity: (currentConfig.overlayOpacity ?? 60) / 100,
                      }}
                    />
                  </>
                )}

                {/* SIMULATED SECTION CONTENT OVERLAY */}
                <div
                  className={`absolute inset-0 z-10 p-4 flex flex-col justify-between ${
                    currentConfig.textColorMode === 'DARK' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-bold text-white uppercase">
                      {activeMeta.badge}
                    </span>
                    <span className="text-[9px] bg-black/40 backdrop-blur px-2 py-0.5 rounded text-slate-200">
                      {previewDevice === 'DESKTOP' ? 'Desktop 16:9' : 'Mobile 9:16'}
                    </span>
                  </div>

                  <div className="text-center my-auto space-y-1">
                    <h6 className="font-heading font-extrabold text-sm sm:text-base uppercase tracking-tight leading-tight drop-shadow-md">
                      {activeMeta.name.split(' (')[0]}
                    </h6>
                    <p className="text-[10px] opacity-80 max-w-[240px] mx-auto line-clamp-2">
                      {activeMeta.description}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <span className="px-3 py-1 rounded-lg bg-red-600 text-[10px] font-bold text-white shadow-md">
                      Contoh Tombol CTA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATUS SUMMARY */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Section Dipilih:</span>
                <span className="text-white font-bold">{activeMeta.name.split(' (')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>Mode Aktif:</span>
                <span className="text-cyan-400 font-bold">
                  {currentConfig.mode === 'IMAGE'
                    ? '🖼️ Hero Image'
                    : currentConfig.mode === 'COLOR'
                    ? '🌈 Warna Kustom'
                    : '🎨 Default Sistem'}
                </span>
              </div>
              {currentConfig.mode === 'IMAGE' && (
                <>
                  <div className="flex justify-between">
                    <span>Gambar Desktop:</span>
                    <span className={currentConfig.desktopImage ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                      {currentConfig.desktopImage ? 'Tersedia' : 'Belum Ada (Pakai Default)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gambar Mobile:</span>
                    <span className={currentConfig.mobileImage ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {currentConfig.mobileImage ? 'Tersedia' : 'Sama dg Desktop'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overlay:</span>
                    <span className="text-white font-mono">
                      {currentConfig.overlayColor || '#000000'} ({currentConfig.overlayOpacity ?? 60}%)
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* DIRECT ACTION BUTTONS */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSaveToDatabase}
                disabled={isSavingDb}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 border border-emerald-500/50 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isSavingDb ? 'animate-spin' : ''}`} />
                <span>{isSavingDb ? 'Menyimpan...' : 'Terapkan & Simpan Permanen'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
