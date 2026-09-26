import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SponsorTier } from '../types';
import { SectionBackground, getSectionTextClass } from './SectionBackground';
import {
  Users,
  ExternalLink,
  Handshake,
  Globe,
  Sparkles,
  Award,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

export const SponsorSection: React.FC = () => {
  const { sponsors, config, committeeContacts, isInitialLoading } = useTournament();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const primaryContact = committeeContacts?.find(c => c.isPrimary) || committeeContacts?.[0];
  const waNumber = primaryContact?.phone || config.adminContactPhone || '6281234567890';
  const cleanWaNumber = waNumber.replace(/\D/g, '').startsWith('0')
    ? `62${waNumber.replace(/\D/g, '').slice(1)}`
    : waNumber.replace(/\D/g, '');

  const tierConfig: Record<
    SponsorTier,
    {
      title: string;
      subtitle: string;
      icon: React.ElementType;
      badgeGradient: string;
      cardBorder: string;
      glowGradient: string;
      accentColor: string;
    }
  > = {
    PLATINUM: {
      title: 'Platinum Title Sponsors',
      subtitle: 'Mitra Utama & Sponsor Utama Penyelenggaraan WabupCup 2026',
      icon: Sparkles,
      badgeGradient: 'from-red-600 via-rose-600 to-amber-600 text-white shadow-lg shadow-red-500/20 border-red-400/40',
      cardBorder: 'border-red-500/40 hover:border-red-500 dark:border-red-500/50 dark:hover:border-red-400',
      glowGradient: 'from-red-600/10 via-rose-600/5 to-transparent',
      accentColor: 'text-red-500',
    },
    GOLD: {
      title: 'Gold Official Partners',
      subtitle: 'Sponsor Resmi Kategori & Fasilitas Pertandingan',
      icon: Award,
      badgeGradient: 'from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 border-amber-300/60',
      cardBorder: 'border-amber-400/40 hover:border-amber-400 dark:border-amber-400/40 dark:hover:border-amber-300',
      glowGradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
      accentColor: 'text-amber-500',
    },
    SILVER: {
      title: 'Silver Co-Sponsors',
      subtitle: 'Mitra Pendukung Operasional & Perlengkapan',
      icon: ShieldCheck,
      badgeGradient: 'from-slate-700 via-slate-600 to-slate-800 text-white shadow-sm border-slate-500/40',
      cardBorder: 'border-slate-300 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-700',
      glowGradient: 'from-slate-500/5 to-transparent',
      accentColor: 'text-slate-400',
    },
    OFFICIAL_PARTNER: {
      title: 'Official Media & Health Partners',
      subtitle: 'Mitra Publikasi Siaran, Medis & Hospitality',
      icon: Building2,
      badgeGradient: 'from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 border-blue-400/40',
      cardBorder: 'border-blue-400/40 hover:border-blue-500 dark:border-blue-500/40 dark:hover:border-blue-400',
      glowGradient: 'from-blue-600/10 via-indigo-600/5 to-transparent',
      accentColor: 'text-blue-500',
    },
  };

  const orderedTiers: SponsorTier[] = ['PLATINUM', 'GOLD', 'SILVER', 'OFFICIAL_PARTNER'];

  const bgConfig = config.sectionsBackgrounds?.sponsors;
  const isCustomImage = bgConfig?.mode === 'IMAGE';
  const isCustomColor = bgConfig?.mode === 'COLOR';

  return (
    <section
      id="sponsor"
      className={`py-20 relative overflow-hidden transition-colors duration-300 border-b border-slate-200 dark:border-slate-800/80 ${
        isCustomColor || isCustomImage ? '' : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white'
      }`}
      style={isCustomColor && bgConfig.bgColor ? { backgroundColor: bgConfig.bgColor } : undefined}
    >
      {/* CUSTOM SECTION BACKGROUND */}
      <SectionBackground config={bgConfig} />

      {/* BACKGROUND AMBIENT GLOW (Only in default mode) */}
      {(!bgConfig || bgConfig.mode === 'DEFAULT') && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-red-600/10 via-blue-600/10 to-amber-600/10 blur-3xl pointer-events-none rounded-full" />
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${getSectionTextClass(bgConfig)}`}>
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-500/10 dark:bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Kemitraan & Kolaborasi Resmi</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            SPONSOR & OFFICIAL PARTNER
          </h2>
          
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Apresiasi dan penghormatan tertinggi kepada institusi, korporasi, dan mitra media yang menyatukan semangat dalam mewujudkan pesta olahraga futsal terbesar.
          </p>
        </div>

        {/* TIERS DISPLAY */}
        {isInitialLoading && sponsors.length === 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span>Menyinkronkan daftar mitra & sponsor resmi dari database...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4"
                >
                  <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="py-12 px-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 text-center max-w-xl mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl">
              <Handshake className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-heading font-bold uppercase tracking-wide text-slate-800 dark:text-white">
              Slot Kemitraan & Sponsor Terbuka
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Daftar mitra sponsor resmi akan dipublikasikan secara langsung melalui sistem database turnamen. Hubungi panitia untuk pengajuan proposal sponsorship.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
          {orderedTiers.map(tierKey => {
            const tierInfo = tierConfig[tierKey];
            const tierSponsors = sponsors.filter(s => s.tier === tierKey);
            if (tierSponsors.length === 0) return null;
            const TierIcon = tierInfo.icon;

            return (
              <div key={tierKey} className="space-y-6">
                
                {/* TIER HEADER BADGE & DIVIDER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border bg-gradient-to-r ${tierInfo.badgeGradient}`}
                    >
                      <TierIcon className="w-3.5 h-3.5" />
                      <span>{tierInfo.title}</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
                      {tierInfo.subtitle}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                    {tierSponsors.length} MITRA TERDAFTAR
                  </span>
                </div>

                {/* SPONSOR CARDS GRID */}
                <div
                  className={`grid gap-5 ${
                    tierKey === 'PLATINUM'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : tierKey === 'GOLD'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  }`}
                >
                  {tierSponsors.map(sponsor => {
                    const hasValidImage = sponsor.logoUrl && !imageErrors[sponsor.id];
                    const hasLink = Boolean(sponsor.websiteUrl);

                    return (
                      <div
                        key={sponsor.id}
                        className={`group relative p-5 rounded-2xl bg-white dark:bg-slate-900/90 border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-sm hover:shadow-xl dark:shadow-slate-950/50 ${tierInfo.cardBorder}`}
                      >
                        {/* AMBIENT CARD GLOW ON HOVER */}
                        <div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${tierInfo.glowGradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                        />

                        <div className="relative z-10">
                          {/* LOGO DISPLAY FRAME */}
                          <div
                            className={`w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4 mb-4 overflow-hidden group-hover:border-slate-400 dark:group-hover:border-slate-700 transition ${
                              tierKey === 'PLATINUM' ? 'h-32' : tierKey === 'GOLD' ? 'h-28' : 'h-24'
                            }`}
                          >
                            {hasValidImage ? (
                              <img
                                src={sponsor.logoUrl}
                                alt={`Logo ${sponsor.name}`}
                                width="160"
                                height="80"
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                onError={() => handleImageError(sponsor.id)}
                                className="max-w-full max-h-full w-auto h-auto object-contain object-center filter drop-shadow transition-transform duration-300 group-hover:scale-108"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center space-y-1.5 p-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-blue-700 flex items-center justify-center font-bold text-sm text-white shadow">
                                  {(sponsor.logoText || sponsor.name).slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-heading font-bold text-xs tracking-wider uppercase text-slate-800 dark:text-slate-200 text-center truncate max-w-[140px]">
                                  {sponsor.logoText || sponsor.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* SPONSOR NAME & DETAILS */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                                {sponsor.name}
                              </h4>
                              {tierKey === 'PLATINUM' && (
                                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800">
                                  Platinum
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {sponsor.description || 'Mitra Resmi Penyelenggaraan Turnamen'}
                            </p>
                          </div>
                        </div>

                        {/* BOTTOM ACTION LINK */}
                        <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                          {hasLink ? (
                            <a
                              href={sponsor.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 transition group/link"
                              title={`Kunjungi ${sponsor.websiteUrl}`}
                            >
                              <Globe className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[130px] sm:max-w-[150px]">
                                {sponsor.websiteUrl?.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                              </span>
                              <ArrowUpRight className="w-3 h-3 shrink-0 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>Mitra Terverifikasi</span>
                            </span>
                          )}

                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {sponsor.tier}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* MODERN BECOME A SPONSOR CALLOUT BANNER */}
        <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 border-2 border-red-600/40 text-white p-8 sm:p-10 shadow-2xl shadow-red-950/30 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* BACKGROUND SHAPES */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Peluang Kerjasama Sponsorship 2026</span>
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              TERTARIK MENJADI MITRA RESMI WABUPCUP?
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tingkatkan visibilitas brand Anda di hadapan puluhan ribu suporter  & futsal secara langsung di stadion serta jutaan impresi media sosial dan liputan siaran resmi.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
                `Halo Panitia ${config.name || 'WabupCup 2026'}, perkenankan kami dari perusahaan/instansi ingin mengajukan proposal kerjasama sponsorship turnamen.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-900/50 transition-all flex items-center justify-center space-x-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Handshake className="w-4 h-4" />
              <span>Ajukan Proposal Sponsor via WA</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
