import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SectionBackground, getSectionTextClass } from './SectionBackground';
import {
  MapPin,
  Navigation,
  Phone,
  Mail,
  Shield,
  Car,
  HeartPulse,
  Sparkles,
  Coffee,
  CheckCircle2,
  Toilet
} from 'lucide-react';

export const VenueLocationSection: React.FC = () => {
  const { config } = useTournament();
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldLoadMap) return;
    const element = mapContainerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoadMap]);

 
  const facilities = [
    { icon: Sparkles, title: '1 Lapangan Standar Nasional', desc: '1 Lapangan Futsal Vinyl Standart FIFA' },
    { icon: Shield, title: 'Tribun Kapasitas 3.500+', desc: 'Tribun indoor modern' },
    { icon: HeartPulse, title: 'Tim Medis & Ambulans Siaga', desc: 'Kerjasama resmi RSUD dan STIKES/UNIDSOE banyuwangi' },
    { icon: Car, title: 'Area Parkir Luas & Aman', desc: 'Kapasitas 500 mobil dan 1000 sepeda dijaga petugas keamanan' },
    { icon: Coffee, title: 'Food Court & UMKM Corner', desc: 'Tersedia aneka kuliner dan minuman segar dari UMKM binaan daerah' },
    { icon: Toilet, title: 'Kamar Mandi & Toilet', desc: 'Tersedia kurang lebih 6 Kamar Mandi dan Toilet' },
  ];

  const bgConfig = config.sectionsBackgrounds?.venue;
  const isCustomImage = bgConfig?.mode === 'IMAGE';
  const isCustomColor = bgConfig?.mode === 'COLOR';

  return (
    <section
      id="lokasi"
      className={`py-16 relative overflow-hidden transition-colors duration-300 border-b border-slate-200 dark:border-slate-800 ${
        isCustomColor || isCustomImage ? '' : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white'
      }`}
      style={isCustomColor && bgConfig.bgColor ? { backgroundColor: bgConfig.bgColor } : undefined}
    >
      {/* CUSTOM SECTION BACKGROUND */}
      <SectionBackground config={bgConfig} />

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${getSectionTextClass(bgConfig)}`}>
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Venue Resmi Pelaksanaan</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            LOKASI ARENA & FASILITAS PERTANDINGAN
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Seluruh pertandingan diselenggarakan di kompleks gelanggang olahraga terpadu dengan fasilitas lengkap dan akses strategis.
          </p>
        </div>

        {/* 2-COLUMN LAYOUT: MAP EMBED & DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAP EMBED (7 COLS) */}
          <div
            ref={mapContainerRef}
            className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xl h-[420px] relative"
          >
            {shouldLoadMap ? (
              <iframe
                title="Lokasi WabupCup 2026"
                src={config.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                className="w-full h-full border-0 filter grayscale-[20%] contrast-[105%]"
                loading="lazy"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-300">
                <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-3 shadow-lg shadow-red-950/40">
                  <MapPin className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-base mb-1">{config.venueName}</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  {config.venueAddress}
                </p>
                <button
                  type="button"
                  onClick={() => setShouldLoadMap(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-red-900/30"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Tampilkan Peta Interaktif</span>
                </button>
              </div>
            )}
            
            {/* FLOATING ADDRESS OVERLAY */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 backdrop-blur-md p-4 rounded-xl border border-slate-800 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide block">
                  {config.venueName}
                </span>
                <p className="text-xs text-slate-300">
                  {config.venueAddress}, {config.venueCity}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  config.venueName + ' ' + config.venueAddress
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Buka Petunjuk Arah</span>
              </a>
            </div>
          </div>

          {/* FACILITY & CONTACT INFO (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span>Fasilitas Penunjang Turnamen</span>
              </h3>

              <div className="space-y-3.5">
                {facilities.map((fac, idx) => {
                  const Icon = fac.icon;
                  return (
                    <div key={idx} className="flex items-start space-x-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{fac.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">{fac.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HOTLINE PANITIA */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-900/60 text-white shadow-xl">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">
                Layanan Informasi & Bantuan
              </span>
              <h4 className="text-lg font-bold text-white mb-3">
                Sekretariat Panitia Pelaksana
              </h4>

              <div className="space-y-2 text-xs text-slate-300 mb-4">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Center: <strong className="text-white">+{config.adminContactPhone}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Email: <strong className="text-white">{config.adminContactEmail}</strong></span>
                </div>
              </div>

              <a
                href={`https://wa.me/${config.adminContactPhone}?text=${encodeURIComponent(
                  'Halo Panitia WabupCup 2026, saya ingin menanyakan informasi lokasi dan pelaksanaan turnamen.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chat Panitia via WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
