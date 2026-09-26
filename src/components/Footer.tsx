import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { SectionBackground, getSectionTextClass } from './SectionBackground';
import {
  Trophy,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  Shield,
  Heart,
  ChevronRight
} from 'lucide-react';

interface FooterProps {
  onOpenCheckStatus: () => void;
  onOpenRegistration: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCheckStatus,
  onOpenRegistration,
  onOpenAdmin,
}) => {
  const { config, categories } = useTournament();

  const bgConfig = config.sectionsBackgrounds?.footer;
  const isCustomImage = bgConfig?.mode === 'IMAGE';
  const isCustomColor = bgConfig?.mode === 'COLOR';

  return (
    <footer
      className={`relative overflow-hidden border-t border-slate-800 transition-colors duration-300 pt-16 pb-12 ${
        isCustomColor || isCustomImage ? '' : 'bg-slate-950 text-slate-400'
      }`}
      style={isCustomColor && bgConfig.bgColor ? { backgroundColor: bgConfig.bgColor } : undefined}
    >
      {/* CUSTOM SECTION BACKGROUND */}
      <SectionBackground config={bgConfig} />

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${getSectionTextClass(bgConfig, 'text-slate-400')}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* BRAND & ABOUT (2 COLS) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              {config.wabupLogoUrl ? (
                <div className="h-12 w-auto max-w-[56px] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={config.wabupLogoUrl}
                    alt="Logo WabupCup"
                    width="48"
                    height="48"
                    loading="lazy"
                    decoding="async"
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-900/50 shrink-0">
                  <Trophy className="w-5 h-5 text-amber-300" />
                </div>
              )}
              <div className="leading-tight">
                <span className="font-heading text-xl font-bold tracking-wider text-white uppercase block">
                  {config.name || 'WABUP CUP 2026'}
                </span>
                <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase block">
                  {config.tagline || 'Turnamen Akbar Futsal'}
                </span>
              </div>
              {config.panitiaLogoUrl && (
                <div className="pl-3 border-l border-slate-800 flex items-center">
                  <img
                    src={config.panitiaLogoUrl}
                    alt="Logo Panitia"
                    width="44"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    className="max-h-9 max-w-[44px] object-contain opacity-90"
                    title="Penyelenggara Resmi"
                  />
                </div>
              )}
            </div>

            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Ajang kejuaraan futsal memperebutkan Piala Bergilir Wakil Bupati {config.edition || '2026'}{categories.length > 0 ? ` untuk ${categories.length} kategori kompetisi.` : '.'}
            </p>

            <div className="pt-2 text-xs space-y-2 text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{config.venueName}, {config.venueAddress}, {config.venueCity}</span>
              </div>
              
              {/* DYNAMIC COMMITTEE WHATSAPP */}
              {config.committeeContacts && config.committeeContacts.length > 0 ? (
                <div className="space-y-1">
                  {config.committeeContacts.map(c => {
                    const clean = c.phone.replace(/\D/g, '');
                    const formattedWa = clean.startsWith('0') ? `62${clean.slice(1)}` : clean;
                    return (
                      <a
                        key={c.id}
                        href={`https://wa.me/${formattedWa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 hover:text-emerald-400 transition"
                      >
                        <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>WA {c.name} ({c.role}): <strong className="text-emerald-400 font-mono">+{formattedWa}</strong></span>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>WA Panitia: +{config.adminContactPhone}</span>
                </div>
              )}

              {/* DYNAMIC COMMITTEE EMAILS */}
              {config.committeeEmails && config.committeeEmails.length > 0 && (
                <div className="space-y-1 pt-0.5">
                  {config.committeeEmails.map(em => (
                    <a
                      key={em.id}
                      href={`mailto:${em.email}`}
                      className="flex items-center space-x-2 hover:text-blue-400 transition"
                    >
                      <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{em.title}: <strong className="text-blue-400 font-mono">{em.email}</strong></span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-red-400 transition flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>Beranda</span>
                </a>
              </li>
              <li>
                <a href="#kategori" className="hover:text-red-400 transition flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>Kategori & Hadiah</span>
                </a>
              </li>
              <li>
                <a href="#live-jadwal" className="hover:text-red-400 transition flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>Live Score Pertandingan</span>
                </a>
              </li>
              <li>
                <a href="#bagan" className="hover:text-red-400 transition flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>Bagan Knockout Bracket</span>
                </a>
              </li>
              <li>
                <a href="#lokasi" className="hover:text-red-400 transition flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>Lokasi Stadion & GOR</span>
                </a>
              </li>
              <li>
                <a href="#sponsor" className="hover:text-red-400 transition flex items-center space-x-1">
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>Mitra Sponsor</span>
                </a>
              </li>
            </ul>
          </div>

          {/* DOKUMEN & UNDUHAN */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Unduhan Berkas Resmi
            </h4>
            <ul className="space-y-2 text-xs">
              {config.downloadableDocs && config.downloadableDocs.length > 0 ? (
                config.downloadableDocs.map(doc => (
                  <li key={doc.id}>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.fileName}
                      className="hover:text-cyan-400 transition flex items-start space-x-1.5 text-slate-300 font-medium group"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover:translate-y-0.5 transition" />
                      <div>
                        <span className="group-hover:text-cyan-300 transition">{doc.title}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {doc.fileType} • {doc.fileSize}
                        </span>
                      </div>
                    </a>
                  </li>
                ))
              ) : config.formulirTemplateUrl || config.regulasiPdfUrl ? (
                <>
                  {config.formulirTemplateUrl && (
                    <li>
                      <a
                        href={config.formulirTemplateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition flex items-center space-x-1 text-blue-400/90 font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Formulir Pemain (PDF)</span>
                      </a>
                    </li>
                  )}
                  {config.regulasiPdfUrl && (
                    <li>
                      <a
                        href={config.regulasiPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition flex items-center space-x-1 text-blue-400/90 font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Buku Regulasi Kompetisi</span>
                      </a>
                    </li>
                  )}
                  {config.suratPernyataanTemplateUrl && (
                    <li>
                      <a
                        href={config.suratPernyataanTemplateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition flex items-center space-x-1 text-blue-400/90 font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Format Surat Pernyataan</span>
                      </a>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <span className="text-[11px] text-slate-500 italic">
                    Dokumen resmi akan diunggah panitia
                  </span>
                </li>
              )}
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenCheckStatus}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Cek Status Pendaftaran</span>
              </button>
            </div>
          </div>

          {/* ADMIN & SECRETARIAT */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Portal Panitia
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Khusus panitia pelaksana dan operator meja pertandingan untuk verifikasi berkas dan update skor.
            </p>

            <button
              onClick={onOpenAdmin}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-950/60 transition flex items-center justify-center space-x-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Login CMS Admin</span>
            </button>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Panitia Pelaksana Turnamen WabupCup. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1">
              <span>Didukung Penuh Infinity Organizer</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
